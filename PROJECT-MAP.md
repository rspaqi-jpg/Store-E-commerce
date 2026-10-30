# Heinzefilter.de / Store-E-commerce — Project Map

This repository is the shop project. Do not mix it with Albabook or Gjakova Taksi.

## Source of truth and working rules

- The repository is `rspaqi-jpg/Store-E-commerce`.
- The production working branch is `main`.
- Before risky edits, create or refresh a dated backup branch.
- Never delete or overwrite files just because their names look duplicated. Check how the app routes to them first.
- Make a change in the correct source file, then inspect the diff and build/deployment result.
- Do not put credentials, PayPal secrets, passwords, or private customer data in source files or commits.

## Application structure

This is a Next.js app. The `package.json` scripts use `next dev`, `next build --webpack`, and `next start`.

| Path | Purpose |
|---|---|
| `app/page.tsx` | Main Next.js homepage route (`/`). Start here for changes to the main app homepage. |
| `app/layout.tsx` | Shared app layout and document shell. |
| `app/globals.css` | Global styling. |
| `app/Locale.tsx` | Language/locale content and translations. Check before changing multilingual text. |
| `app/StoreCheckout.tsx` | Store checkout UI. |
| `app/LiveVisitors.tsx` | Live visitor/presence UI. |
| `app/produkte-ohne-rabatt/page.tsx` | Route for products without discounts. |
| `app/api/paypal/create-order/route.ts` | PayPal order creation endpoint. |
| `app/api/paypal/capture-order/route.ts` | PayPal payment capture endpoint. |
| `app/api/paypal/client-config/route.ts` and `app/api/paypal/config/route.ts` | PayPal client configuration endpoints. Inspect before changing payment setup. |
| `app/api/products/route.ts` | Product API route. |
| `app/api/presence/route.ts` | Visitor presence API route. |
| `public/impressum.html` | Public legal notice page. |
| `public/retoure.html` | Public returns page. |
| `public/versandinformationen.html` | Public shipping information page. |
| `public/storefront.html` | Static storefront HTML file, separate from the Next.js homepage source. |
| `index.html` | Root-level legacy/static HTML file. Do not assume it controls the deployed Next.js homepage. |
| `versandinformationen.html` | Root-level shipping HTML copy; compare with the public copy before editing either. |

## Important duplicate-looking files

- `app/page.tsx`, root `index.html`, and `public/storefront.html` are three separate files. They are not automatically synchronized.
- `public/versandinformationen.html` and root `versandinformationen.html` currently have matching blob content, but do not assume they will remain identical.
- For the deployed homepage, follow the Next.js routing setup and Vercel project configuration; the package scripts indicate Next.js is the app framework. Verify the live route before deciding whether a legacy HTML file is still used.
- Do not delete any of these files without confirming references, routing, and deployment behavior.

## Current shop delivery-text decision

The approved delivery estimate is normally **2–4 business days**, and **5–7 business days during holidays or exceptional circumstances**. Keep the German, English, and Dutch versions consistent wherever this notice appears, including the legal notice and About Us content as agreed.

## Backup point

A backup branch was created from the `main` commit on 2026-10-30:

`backup/2026-10-30-before-further-changes`

Use it as a recovery point if a later edit breaks the shop. It is a Git branch snapshot, not a separate live deployment.

## Before every shop change

1. Confirm the repository is `rspaqi-jpg/Store-E-commerce`.
2. Confirm the target branch and current commit.
3. Identify the actual route/source file; do not choose by filename alone.
4. Preserve unrelated files and payment configuration.
5. Review the exact changed files.
6. Run the build/check where available and verify the Vercel deployment before calling the work complete.
