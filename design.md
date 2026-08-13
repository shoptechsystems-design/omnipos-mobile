# OmniPOS Mobile Interface Design

## Product Direction

OmniPOS Mobile is a portrait-first, one-handed point-of-sale companion for shop staff. The experience follows mainstream iOS interaction patterns: a white-led surface, strong hierarchy, large touch targets, concise forms, bottom tab navigation, and confirmation sheets for consequential actions. The visual language uses navy for authority and primary actions, teal for active states and money-related emphasis, and soft slate surfaces for grouping.

## Screen List

| Screen | Primary content and functionality |
|---|---|
| Sign In | Email and password fields, tenant-aware sign-in action, validation states, and session restoration through the portal's `auth.login` and `auth.me` routes. |
| Sell | Product search/barcode entry, category filters, two-column product cards, stock badges, add-to-cart controls, tenant/business switch context, and a persistent cart summary. Uses `catalog.products`, `catalog.categories`, and `tenant.context`. |
| Cart / Review Order | Cart line items, quantity controls, price summary, optional discount and tax fields, customer assignment, payment method selection, amount received, and checkout submission. Uses `customers.list` and `pos.checkout`. |
| Checkout Result | Order number, total, change due, loyalty points earned, success feedback, and actions to start a new sale or view order history. |
| Orders | Date-filterable sales history list with order number, timestamp, total, payment method, customer, and drill-down details. Uses `sales.list`. |
| Order Detail | Completed sale items, totals, payment information, customer information, and a repeat-sale shortcut where appropriate. |
| Customers | Searchable customer directory, loyalty points, total spend, and customer tier. Uses `customers.list` and `customerGroups.list`. |
| Add Customer | Native form sheet for name, email, phone, and group selection. Uses `customers.create`. |
| Inventory | Product stock list, low-stock alerts, SKU, category, and current quantity. Uses `inventory.list`. |
| Adjust Stock | Product selection, signed adjustment quantity, reason field, and confirmation. Uses `inventory.adjust`; access should be visually and functionally limited to inventory-capable roles. |
| More / Account | Current user, tenant/business name, staff role, currency, sync status, and sign-out action. Uses `auth.me`, `tenant.context`, and the existing session lifecycle. |

## Key User Flows

### Sign-in and tenant restoration

1. The user opens the app and the client calls `auth.me`.
2. If a session exists, the app loads `tenant.context` and routes to Sell.
3. If no session exists, the user enters email and password and submits `auth.login`.
4. The client refreshes `auth.me` and `tenant.context`, then loads the Sell catalog.

### Create a sale

1. The user searches products or enters a barcode.
2. The user taps a product card to add one unit to the cart; repeated taps increment quantity.
3. The user opens the persistent cart summary and reviews line items.
4. The user optionally attaches a customer, selects payment method, and enters amount received.
5. The app sends the exact `pos.checkout` payload with item IDs, quantities, prices, customer ID, payment method, amount received, discount, and tax.
6. On success, the app presents the order number, total, change due, and loyalty points earned, then invalidates catalog, inventory, and sales queries so the portal and mobile UI converge on the new state.

### Customer creation during checkout

1. The user opens customer selection from the review order screen.
2. The user searches existing customers or taps Add Customer.
3. The user completes the form and submits `customers.create`.
4. The newly created customer is selected automatically and the user returns to checkout.

### Inventory adjustment

1. An authorized user opens Inventory and selects a product.
2. The user enters a signed stock adjustment and an auditable reason.
3. The app confirms the action, calls `inventory.adjust`, and refreshes inventory and catalog data.

## Color Choices

| Token | Value | Usage |
|---|---|---|
| Background | `#F8FAFC` | Main screen background and subtle section contrast |
| Surface | `#FFFFFF` | Cards, sheets, input fields, and tab bar |
| Primary navy | `#0F172A` | Main buttons, headings, and high-confidence actions |
| Teal accent | `#0F766E` | Prices, selected tabs, stock-success badges, and active controls |
| Teal light | `#CCFBF1` | Selected states and positive summary surfaces |
| Slate text | `#475569` | Supporting copy, metadata, and SKU labels |
| Border | `#E2E8F0` | Dividers, card outlines, and input boundaries |
| Warning amber | `#D97706` | Low-stock alerts and attention states |
| Error red | `#DC2626` | Validation and failed request states |

## Component and Interaction Rules

All screens use safe-area-aware containers. Lists use virtualized list patterns, cards provide visible pressed feedback, and primary actions use light haptics where available. Money is formatted in PKR with two decimal places. Network states include loading, empty, retry, and session-expired variants rather than placeholder business data. Every portal mutation is followed by targeted query invalidation to keep mobile state aligned with the existing web portal.
