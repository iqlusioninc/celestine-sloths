# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

Commands
- Install dependencies (prefers npm since package-lock.json is present):
  - npm ci
- Start development server (Next.js):
  - npm run dev
- Build production bundle:
  - npm run build
- Run production server locally after build:
  - npm start
- Lint (Next.js ESLint):
  - npm run lint
  - Auto-fix (where possible): npx next lint --fix
- Format (Prettier):
  - npx prettier --check .
  - npx prettier --write .
- Tests:
  - Not configured in this repo (no test runner or test scripts present).

Environment configuration
- Create a .env.local file (git-ignored). Use env.template as a starting point.
- Keys used by the app (see README.md for context and defaults):
  - NEXT_PUBLIC_NODE_REST_ENDPOINT
  - NEXT_PUBLIC_NODE_RPC_ENDPOINT
  - NEXT_PUBLIC_STARGAZE_GRAPHQL_ENDPOINT (defaults to https://graphql.mainnet.stargaze-apis.com/graphql if unset)
  - NEXT_PUBLIC_WC_PROJECT_ID (WalletConnect)
  - NEXT_PUBLIC_CAPSULE_KEY, NEXT_PUBLIC_CAPSULE_ENV (Leap Capsule social login)
  - Optional/collection-specific values referenced by the UI:
    - NEXT_PUBLIC_STARGAZE_MARKET_CONTRACT
    - NEXT_PUBLIC_BAD_KIDS_COLLECTION_ID

High-level architecture and data flow
- Framework and tooling
  - Next.js 13 (pages/ router) with TypeScript (tsconfig.json)
  - Styling: Tailwind CSS (tailwind.config.js, styles/globals.css) and Chakra UI (for Snapshot UI); custom Text component in components/Text.tsx
  - Linting: next/core-web-vitals (.eslintrc.json). Formatting: .prettierrc
  - next.config.js: reactStrictMode=false, swcMinify, images.unoptimized=true, transpiles Leap Capsule UI packages
- Application composition (pages/_app.tsx)
  - Wraps the app with:
    - WagmiConfig (Ethereum mainnet public client via viem) for the Snapshot flow
    - ApolloProvider client (config/apolloclient.ts) for Stargaze GraphQL
    - Custom Leap UI theme provider (components/ThemeProvider)
    - Cosmos Kit ChainProvider using chain-registry chains/assets and a custom wallet modal (components/ConnectWalletSideCurtain)
  - Chain endpoints for stargaze are taken from chain-registry and can be overridden via NEXT_PUBLIC_NODE_REST_ENDPOINT / NEXT_PUBLIC_NODE_RPC_ENDPOINT
  - WalletConnect config uses NEXT_PUBLIC_WC_PROJECT_ID
- NFT browsing and purchase flow (Home)
  - UI entry: pages/index.tsx renders components/NFTList.tsx
  - Data: queries/tokens.query.ts (getNFTTokensQuery with pagination; getNFTTokenByIDQuery for direct token search)
  - Apollo cache policy merges paginated results (config/apolloclient.ts)
  - Lists tokens for a collection (default from env or BAD_KIDS fallback), supports search by token ID and sort orders
  - Purchase:
    - components/NFTList.tsx constructs a CosmWasm MsgExecuteContract for buy_now (stargazejs), signs via Cosmos Kit offline signer, broadcasts, and toasts status
    - hooks/useBalances.ts fetches balances for ustars and an IBC TIA denom via chain REST; used to decide if the “Get Tokens” modal should open before purchase
- “Get Tokens” modal (Leap Elements)
  - components/ElementsContainer.tsx mounts @leapwallet/elements SwapsModal with WalletClient adapter (config/walletclient.ts)
  - Default destination: STARGAZE_CHAIN_ID with TIA denom
  - Triggered from the header action and purchase pre-checks
- Wallet UX
  - components/Header.tsx renders top navigation with Snapshot link, “Get Tokens”, Follow on X, and Wallet button
  - components/WalletButton.tsx shows connection state and TIA balance (via useBalances)
  - components/ConnectWalletSideCurtain/* provides a curated wallet connect experience for Leap, Keplr, MetaMask (Snap), and Capsule social login
- Snapshot linking flow (pages/snapshot)
  - Ethereum: wagmi for connection, network guard (must be on Ethereum mainnet)
  - Cosmos: Cosmos Kit for autofilling the Stargaze address
  - Signing: utlis/cosmosWallet.ts performs ADR-36 signing of a JSON payload { ethAddress, starsAddress }
  - Server endpoints (Next API routes):
    - pages/api/checkRegistration.ts: checks @vercel/kv for existing registrations (keys stars:*, eth:*)
    - pages/api/saveSignedMessage.ts: verifies ADR-36 via @keplr-wallet/cosmos and persists to @vercel/kv

Repository notes
- Package manager: prefer npm (package-lock.json is present). .yarnrc exists but no yarn.lock in the repo.
- Directory highlights:
  - pages/ (Next pages; includes _app.tsx, index.tsx, snapshot/; API routes under pages/api/)
  - components/ (UI, wallet modal, NFT cards, header, layout, snapshot form controls)
  - hooks/ (balances, NFT media helpers)
  - config/ (Apollo client, theming, wallet client adapter, constants, utils)
  - queries/ (GraphQL queries)
  - public/ (static assets)
  - utlis/ (cosmosWallet.ts; note the folder name)
- There is currently no test setup in this repository.
