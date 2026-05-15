// Creates a dedicated Foundry keystore for Monad Testnet deploys and tries to
// fund it from the workshop faucet, so a fresh user can run `yarn deploy:monad`
// without first generating a key, getting MON, and wiring it up.
//
// Idempotent: rerunning when the keystore already exists just re-prints the
// info you need (address + password + commands).
import { spawnSync } from "child_process";
import { existsSync } from "fs";
import { join } from "path";
import { homedir } from "os";

const KEYSTORE_NAME = "monad-deployer";
const KEYSTORE_PASSWORD = "monad";
const FAUCET_URL = "https://agents.devnads.com/v1/faucet";
const MONAD_TESTNET_CHAIN_ID = 10143;
const EXPLORER_TX = "https://testnet.monadexplorer.com/tx";
const FALLBACK_FAUCET_PAGE = "https://setup.devnads.com";

const keystorePath = join(homedir(), ".foundry", "keystores", KEYSTORE_NAME);

function divider() {
  console.log("─".repeat(60));
}

function ensureCast() {
  const probe = spawnSync("cast", ["--version"], { encoding: "utf-8" });
  if (probe.status !== 0) {
    console.error("\n❌ `cast` not found on PATH. Install Foundry first:");
    console.error("   curl -L https://foundry.paradigm.xyz | bash && foundryup\n");
    process.exit(1);
  }
}

function deriveAddress() {
  const res = spawnSync(
    "cast",
    [
      "wallet",
      "address",
      "--account",
      KEYSTORE_NAME,
      "--password",
      KEYSTORE_PASSWORD,
    ],
    { encoding: "utf-8" },
  );
  if (res.status !== 0) {
    return null;
  }
  const match = res.stdout.match(/0x[a-fA-F0-9]{40}/);
  return match ? match[0] : null;
}

function createKeystore() {
  const newResult = spawnSync("cast", ["wallet", "new"], { encoding: "utf-8" });
  if (newResult.status !== 0) {
    console.error("\n❌ `cast wallet new` failed:");
    console.error(newResult.stderr || newResult.error);
    process.exit(1);
  }
  const address = newResult.stdout.match(/Address:\s*(0x[a-fA-F0-9]{40})/)?.[1];
  const privateKey = newResult.stdout.match(
    /Private key:\s*(0x[a-fA-F0-9]{64})/,
  )?.[1];
  if (!address || !privateKey) {
    console.error("\n❌ Could not parse `cast wallet new` output:");
    console.error(newResult.stdout);
    process.exit(1);
  }

  const importResult = spawnSync(
    "cast",
    [
      "wallet",
      "import",
      KEYSTORE_NAME,
      "--private-key",
      privateKey,
      "--unsafe-password",
      KEYSTORE_PASSWORD,
    ],
    { encoding: "utf-8" },
  );
  if (importResult.status !== 0) {
    console.error("\n❌ `cast wallet import` failed:");
    console.error(importResult.stderr || importResult.error);
    process.exit(1);
  }

  return address;
}

async function fundFromFaucet(address) {
  console.log(`\nRequesting MON from the faucet…`);
  try {
    const res = await fetch(FAUCET_URL, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        chainId: MONAD_TESTNET_CHAIN_ID,
        address,
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok && data?.txHash) {
      console.log(`✓ MON dripped.`);
      console.log(`  tx: ${EXPLORER_TX}/${data.txHash}`);
      return;
    }
    const reason = data?.error || `HTTP ${res.status}`;
    console.warn(`⚠ Faucet declined: ${reason}`);
  } catch (err) {
    console.warn(`⚠ Faucet call failed: ${err.message ?? err}`);
  }
  console.warn(
    `  Drop the address above into the faucet at ${FALLBACK_FAUCET_PAGE}`,
  );
  console.warn(`  to fund it manually, then re-try the deploy.`);
}

function printDeployHint() {
  console.log(`\nDeploy your contracts to Monad Testnet with:`);
  console.log(`  yarn deploy:monad`);
  console.log(`  (when prompted for the keystore password, enter: ${KEYSTORE_PASSWORD})`);
}

async function main() {
  ensureCast();

  console.log("");
  divider();
  console.log(" Monad Testnet deploy setup");
  divider();

  if (existsSync(keystorePath)) {
    const address = deriveAddress();
    console.log(`\n✓ Keystore '${KEYSTORE_NAME}' already exists.`);
    if (address) {
      console.log(`  Address:  ${address}`);
    } else {
      console.log(`  (Could not read its address with the default password.)`);
    }
    console.log(`  Password: ${KEYSTORE_PASSWORD}`);
    console.log(
      `\nIf this wallet is unfunded, paste its address into the faucet at`,
    );
    console.log(`${FALLBACK_FAUCET_PAGE}.`);
    printDeployHint();
    console.log("");
    return;
  }

  const address = createKeystore();
  console.log(`\n✓ Created keystore '${KEYSTORE_NAME}'.`);
  console.log(`  Address:  ${address}`);
  console.log(`  Password: ${KEYSTORE_PASSWORD}  (testnet only — never reuse on mainnet)`);

  await fundFromFaucet(address);
  printDeployHint();
  console.log("");
}

main();
