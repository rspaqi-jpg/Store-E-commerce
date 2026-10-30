# Loyalty discounts — implementation plan

## Status
**Prepared in source control; not active yet.** No database is connected and no customer purchase history is being stored. Do not enable the offer in checkout until persistent storage and server-side validation are implemented.

## Agreed business rules
- Identify a customer by their normalized email address.
- Count completed, PayPal-confirmed orders only.
- Use a rolling 24-hour window.
- Once the customer has completed at least 4 qualifying purchases in that 24-hour window, make a 45% loyalty offer available.
- The offer applies only to products with a regular price strictly below €45.00.
- Exclude products already on sale / already discounted.
- Calculate the discount and validate redemption on the server. Never trust a price, discount percentage, eligibility flag, or coupon amount sent by the browser.
- Count orders, not item quantities.
- Do not store card data, PayPal credentials, or customer purchase records in this public GitHub repository.

## Product eligibility
The current PayPal create-order route has a hard-coded product list. Before launch, reconcile that list with the storefront's canonical catalogue and add an explicit server-owned regular-price and sale-status field. A product is eligible only when it is not already discounted and its regular price is less than €45.00.

Do not infer discount status from a client-submitted cart.

## Planned architecture
1. At checkout creation, validate product IDs, quantities, prices, customer email, and any loyalty redemption on the server.
2. Persist a pending checkout record in a private database keyed by the PayPal order ID. Store normalized email, product IDs, quantities, server-calculated totals, and creation time.
3. On PayPal capture, fetch/verify the PayPal order and capture details; only a confirmed COMPLETED capture can become a paid purchase.
4. Mark the pending record paid exactly once (idempotent capture handling). Verify the captured currency and amount against the server-created order.
5. Query paid qualifying orders for that normalized email within the previous 24 hours.
6. When the threshold is reached, issue a short-lived, single-use loyalty redemption token. Bind it to the customer and eligible product/order context.
7. Revalidate the token, eligibility, expiry, and remaining use at the next checkout; record redemption atomically to prevent double use.
8. Show the offer in the storefront only when the server says the customer is eligible. Do not expose order history to other customers or public endpoints.

## Database preparation
- Use a private managed PostgreSQL database when the owner is ready to purchase/connect a plan.
- Keep the connection string in Vercel environment variables only (server-side; never NEXT_PUBLIC_*).
- Suggested tables: orders, order_items, loyalty_redemptions.
- Add unique constraints for PayPal order IDs and redemption tokens; index normalized customer email and paid timestamp.
- Use a transaction for paid-order finalization and redemption so retries cannot create duplicate purchases or reuse a discount.

## Important current limitations
- The current app/api/paypal/create-order/route.ts validates the customer email but does not persist it with the PayPal order.
- The current app/api/paypal/capture-order/route.ts confirms capture status but does not persist paid orders.
- Therefore purchase counting, eligibility, and the 45% offer cannot work reliably yet.
- Do not put real customer emails, names, addresses, PayPal order IDs, or payment data in this repository.

## Launch checklist
- [ ] Choose and connect private PostgreSQL when budget allows.
- [ ] Add server-only database client and schema/migrations.
- [ ] Reconcile storefront and server product catalogue, including sale flags.
- [ ] Persist pending PayPal order metadata.
- [ ] Verify PayPal capture details and make finalization idempotent.
- [ ] Implement rolling-24-hour qualifying-order count.
- [ ] Implement secure one-time 45% redemption for eligible items under €45.
- [ ] Add customer-facing offer/popup and checkout application.
- [ ] Test duplicate capture, cancelled checkout, expired token, already-discounted items, €45 boundary, and multiple tabs/devices.
