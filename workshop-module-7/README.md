# WKT dApp — Workshop Token and Badges

A React + Vite dApp for managing a custom Move-based token (WKT), daily faucet claims, coupon redemptions, peer payments, and NFT workshop badges on IOTA testnet. Includes an admin console for coupon management, auto-badge configuration, and manual badge minting.

## Features

- Wallet connect with auto-connect and custom dark theme via IOTA dApp Kit on testnet.
- WKT fungible token with on-chain TreasuryCap minting.
- Daily claim: 10 WKT per day, enforced per address.
- Coupon claim: 10 WKT per unique coupon, once per user per coupon.
- Peer payments with split-and-transfer from `Coin<WKT>`.
- NFT WorkshopBadge objects (key, store) with image URL and metadata.
- Badge redemption: burn badge to mint 30 WKT, once per address.
- Auto-badge on first outgoing payment if configured.
- Admin panel: add/remove coupons, set auto-badge config, mint badges.
- Robust error parsing for Move abort codes with user-friendly messages.
- Dark UI with Radix Themes, tooltips, and loading states.
- Route-driven flows: dashboard, claim tokens, claim coupon, payments, redeem badge, gallery, admin.

## Tech Stack

- Frontend: React 18, Vite, TypeScript, React Router
- UI: Radix UI Themes, Radix Tooltip, react-icons, custom dark theme
- State/Data: @tanstack/react-query
- Web3: @iota/dapp-kit, @iota/iota-sdk
- Tooling: ESLint, Prettier, pnpm

## Contracts Overview

Module: `token_contract::wkt` (Move)

- Token: `struct WKT has drop {}`
- Badge: `struct WorkshopBadge has key, store { id, recipient, minted_at, workshop_id, url }`
- Faucet (shared object): stores admin, coupon maps, claim tracking, auto-badge config, counters

Entry functions:
- `init`: creates WKT, metadata, Faucet; shares Faucet.
- `add_coupon_code` / `remove_coupon_code`: admin-gated coupon registry updates.
- `transfer_admin`: change Faucet admin.
- `set_auto_badge_config`: set default `workshop_id` and `url` for auto mint on first payment.
- `mint_badge`: admin mints and transfers a WorkshopBadge to a recipient.
- `claim_tokens`: daily 10 WKT, per-day (UTC epoch/86400000) bucket.
- `claim_with_coupon`: validate coupon and per-user usage, mint 10 WKT.
- `redeem_badge`: ensure ownership and one-time redemption per address, mint 30 WKT, delete badge.
- `make_payment`: split coin and transfer; emits PaymentMade; optionally auto-mints badge on first payment if configured.

View utilities:
- `view_claim_status`: emits `ClaimStatus` event for read-only daily-claim check via devInspect.
- `has_redeemed_badge(addr)`: true if address already redeemed.
- `is_valid_coupon_for_user(code, user)`: coupon exists and unused by user.
- `get_badge_count()`: overall minted counter.

Error codes:
- `1 EAlreadyClaimed`, `2 EInvalidCoupon`, `3 ECouponAlreadyUsed`, `4 ENotAdmin`, `5 ENoBadge`, `6 EAlreadyRedeemed`, `7 EInsufficientBalance`.

## Frontend Architecture

Providers (`src/main.tsx`):
- QueryClientProvider for data fetching and caching.
- Iota client + wallet providers with `networkConfig` and custom `darkTheme`.
- Radix Theme (dark) and React Router.

Network config (`src/networkConfig.ts`):
- `getFullnodeUrl("testnet")` and variables:
  - `packageId`: Move package id.
  - `faucetObject`: shared Faucet object id.
- `defaultNetwork="testnet"` in the app root.

Core hook (`src/hooks/useWKTContract.ts`):
- Resolves `packageId` and `faucetObject` from the active network.
- Uses IOTA client + sign-and-execute for on-chain calls.
- Exposes:
  - Account context and client
  - Checks: `checkIsAdmin`, `checkHasClaimed` (devInspect + ClaimStatus event), `checkHasRedeemedBadge`, `checkCouponValidity`
  - Getters: `getWKTBalance` (getCoins), `getWorkshopBadges` (getOwnedObjects), `getAvailableCoupons` (vec_map within Faucet)
  - Actions: `claimTokens`, `claimWithCoupon`, `makePayment`, `redeemBadge`, `addCouponCode`, `removeCouponCode`, `setAutoBadgeConfig`, `mintBadge`

Error handling (`src/utils/errorHandling.ts`):
- Parses Move abort patterns and known phrases into user-facing messages + suggestions:
  - Already claimed, invalid coupon, coupon already used, not admin, no badge, already redeemed, insufficient balance, network/gas/cancelled.

Types (`src/types/index.ts`):
- `WorkshopBadge`, `TokenBalance`, `CouponStatus`.

Theme (`src/theme/darkTheme.ts`):
- Custom ThemeVars for wallet modals and components.

## UI Pages and Components

- Home: aggregates account summary with `DashboardSummary`, `ActionTabs`, and `OwnedObjects`.
- DashboardSummary: address preview, total balance, badges count, daily-claim and badge-redemption statuses.
- ActionTabs:
  - Tokens & Payments: Claim Daily, Claim with Coupon, Make Payment.
  - Badges & Rewards: Redeem Badge, View Gallery.
- OwnedObjects: displays total WKT balance and earned badges with cards and quick links.
- ClaimTokens: pre-checks daily status and triggers claim.
- ClaimCoupon: validates coupon per user then claims.
- RedeemBadge: select an owned badge and redeem 30 WKT; handles already-redeemed or no-badge states.
- BadgeGallery: grid of badges with hover CTA to redeem.
- AdminPanel:
  - Coupons: add/remove codes; lists active codes.
  - Badge Config: set auto-badge `workshop_id` and `url`.
  - Mint Badge: manually mint to a recipient.

Molecules:
- Button: lightweight styled wrapper over Radix Button.
- Loading: subtle pulsing loader with aria-live.
- Tooltip: animated Radix tooltip with gradient.

## Prerequisites

- Node 18+ and pnpm
- IOTA-compatible wallet on testnet
- Deployed Move package on testnet:
  - `packageId` of the deployment
  - `faucetObject` (shared object id from `init`)
- Faucet initialized and shared; admin is deployer unless changed by `transfer_admin`.

## Getting Started

1) Install
```bash 
pnpm install
```


2) Configure network
- Edit `src/networkConfig.ts` and set:
  - `packageId: 0x...`
  - `faucetObject: 0x...`
- Ensure these match the actual testnet/devnet deployment.

3) Run
```bash
pnpm run dev
```

- Open the local URL, connect a wallet, and ensure network is testnet.

## Common Flows

- Daily claim:
  - Go to “Claim Daily Tokens”, execute once per UTC day per address.
- Coupon claim:
  - Enter an admin-provided code in “Claim with Coupon”; each code is once per user.
- Payments:
  - From “Make Payment”, select a `Coin<WKT>` and amount; on first outgoing payment, if auto-badge configured, a badge is minted to the sender.
- Redeem badge:
  - From “Redeem Badge”, choose an owned badge and redeem for 30 WKT; one redemption per address.
- Admin:
  - Coupons: add/remove codes.
  - Auto badge: set `workshop_id` and `url` for first-payment auto-mint.
  - Mint badge: mint a badge to any recipient with an image URL.

## Deployment Notes

- Record the shared Faucet id (`faucetObject`) after running `init`.
- Admin-only functions enforce admin via on-chain asserts.
- For network changes (e.g., testnet→devnet), update `networkConfig` and rebuild.
- Balance queries use coin type string: ``${packageId}::wkt::WKT`` in `getCoins`.

## Error Handling

- Known aborts → user messages:
  - EAlreadyClaimed: faucet limit reached today.
  - EInvalidCoupon: code not registered.
  - ECouponAlreadyUsed: user already used that code.
  - ENotAdmin: caller not Faucet admin.
  - ENoBadge: badge not owned by caller.
  - EAlreadyRedeemed: address already redeemed once.
  - EInsufficientBalance: payment amount exceeds coin balance.
- Additional UX handling for network, gas, or user-cancelled transactions.

## Scripts
```
{
"dev": "vite",
"build": "tsc && vite build",
"lint": "eslint .",
"preview": "vite preview",
"format": "prettier -w ."
}
```


## Directory Structure (Key Files)

```
.
├── src
│ ├── main.tsx # Providers and Router
│ ├── App.tsx # Routes
│ ├── networkConfig.ts # packageId & Faucet ID per network
│ ├── hooks/useWKTContract.ts # Blockchain interactions
│ ├── utils/errorHandling.ts # Move error mapping
│ ├── theme/darkTheme.ts # Wallet/theme overrides
│ ├── types/index.ts # Shared types
│ └── components # Pages and atoms/molecules
```


## Accessibility and UX

- Actions have clear labels, tooltips, and disabled states when unavailable.
- Loading states with `aria-live` for assistive technologies.
- Success and error messaging with icons and color contrast.

## Security Considerations

- Admin gating via on-chain checks; UI checks are convenience only.
- Keep admin keys secure; admin equals Faucet-stored address.
- Coupon codes are plain strings; use sufficiently random tokens.
- Badge image URLs should be trusted and reviewed by admins.


## Acknowledgements

Built with IOTA dApp Kit, Move smart contracts, Radix UI, and the React ecosystem.
