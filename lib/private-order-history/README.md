# Private order history

This directory contains server-only code for the store's customer purchase history.

## Data storage rules

- Never commit customer names, email addresses, order records, PayPal IDs, or payment details to this public repository.
- Never store database credentials or encryption keys in source control.
- Persist purchase records in a private managed database, configured through Vercel environment variables.
- Only mark an order as paid after PayPal confirms a successful capture.
- Use the normalized customer email to count completed purchases and calculate loyalty eligibility.
- Keep discount eligibility and redemption validation on the server; never trust a client-provided discount or price.

## Loyalty rule to implement

After a customer has at least 4 completed purchases on the same calendar day, offer a 45% discount on eligible full-price products priced below €45. Exclude products already discounted. Validate and redeem the offer server-side.

The database provider and connection have not yet been configured, so this directory is documentation only; it does not store purchase data yet.
