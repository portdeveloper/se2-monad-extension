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
yarn monad:setup     # one-time: creates a `monad-deployer` keystore, funds it
yarn deploy:monad    # deploys with that keystore; no password prompt
```

`monad:setup` writes a `.deployer-password` file (chmod 0600, gitignored)
holding the keystore password (`monad`); `deploy:monad` reads it via
`ETH_PASSWORD` so the deploy stays non-interactive. This is testnet-only —
never reuse the `monad-deployer` keystore on mainnet.

## Workshop use

This extension pairs with the [Windows setup guide](../se2-workshop-windows-setup) for hosting Scaffold-ETH 2 workshops on Windows machines via WSL2.

A roomful of attendees behind one NAT will normally hit the public faucet's per-IP rate limit. `monad:setup` recognizes two env vars to work around that:

| Env var | Default | Purpose |
| --- | --- | --- |
| `MONAD_FAUCET_URL` | `https://agents.devnads.com/v1/faucet` | Override the faucet endpoint (e.g. a workshop-only deployment). |
| `MONAD_FAUCET_TOKEN` | _(unset)_ | Sent as `X-Workshop-Token`. The server (`agentfaucet`) is configured with `WORKSHOP_TOKENS=...`; presenting a matching token skips per-IP and per-ASN limits while keeping per-address and the daily budget cap. |

Workshop attendee one-liner:

```bash
MONAD_FAUCET_TOKEN=event2026 yarn monad:setup
```

Rotate the token per event. The daily budget on the server bounds the worst-case drain even if the token leaks.
