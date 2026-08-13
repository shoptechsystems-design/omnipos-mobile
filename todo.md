# Project TODO

- [x] Configure OmniPOS branding, app name, theme tokens, and generated launcher assets
- [x] Define shared contract types for auth, tenant, catalog, customers, sales, and inventory
- [x] Configure portal tRPC client against https://omnipos-hjcb6uyk.manus.space/api/trpc with cookie/session support
- [x] Build sign-in and session restoration flow using auth.login and auth.me
- [x] Build tenant context loading and role-aware account surface
- [x] Build Sell catalog with search, category filtering, barcode entry, stock states, and cart
- [x] Build cart review and checkout form using pos.checkout
- [x] Build checkout success state with order number, change due, and loyalty points
- [x] Build Orders list and order detail using sales.list
- [x] Build Customers directory, search, tier display, and create-customer flow
- [x] Build Inventory list, low-stock states, and stock adjustment flow
- [x] Add targeted query invalidation after portal mutations for cross-surface sync
- [x] Add error, empty, loading, retry, and session-expired states
- [x] Add deterministic tests for contract mapping and cart/checkout calculations
- [x] Run typecheck, lint, tests, and visual/runtime verification
- [ ] Save final checkpoint and document known validation limits
- [x] Fix preview sign-in submission, portal authentication response handling, and session routing
- [x] Add deterministic sign-in regression coverage for success, invalid credentials, and network failure states
