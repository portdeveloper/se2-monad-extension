# Scaffold-ETH 2 — Monad Testnet Extension

A `create-eth` extension that pre-configures a fresh Scaffold-ETH 2 (Foundry flavor) project for the **Monad Testnet** (chain ID `10143`).

## What it adds

- `packages/foundry/foundry.toml` — `monadTestnet` RPC endpoint
- `packages/nextjs/utils/monadTestnet.ts` — viem-compatible chain definition
- `packages/nextjs/scaffold.config.ts` — adds `monadTestnet` to `targetNetworks` and wires the import

Network parameters (per [Monad docs](https://docs.monad.xyz/guides/add-monad-to-wallet/testnet)):

| Field          | Value                                |
| -------------- | ------------------------------------ |
| Chain ID       | `10143`                              |
| RPC URL        | `https://testnet-rpc.monad.xyz`      |
| Currency       | `MON` (18 decimals)                  |
| Block Explorer | `https://testnet.monadvision.com`    |

## Usage

```bash
npx create-eth@latest -e YOUR-ORG/se2-monad-extension my-monad-dapp
cd my-monad-dapp
yarn install
```

Then in three terminals:

```bash
yarn chain        # local Anvil (for dev)
yarn deploy       # deploy to local
yarn start        # frontend at http://localhost:3000
```

To deploy to Monad Testnet:

```bash
yarn deploy --network monadTestnet
```

(You'll need MON in your deployer account — get some from the official faucet linked in the Monad docs.)

## Workshop use

This extension pairs with the [Windows setup guide](../se2-workshop-windows-setup) for hosting Scaffold-ETH 2 workshops on Windows machines via WSL2.
