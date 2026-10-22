# Restaurant Website Template

A responsive restaurant ordering website and management platform. Replace the sample menu and configure the restaurant information in the admin dashboard before publishing.

## Features

- Customer homepage, menu search and category filters, item details, portions, add-ons, cart, and checkout.
- QR codes for menu items and printable labels.
- Order tracking, customer receipts, and kitchen tickets.
- Admin authentication, order and menu management, payment settings, review moderation, and restaurant settings.
- Daily sales reports in the `Asia/Karachi` timezone, including payment and item breakdowns, CSV export, and print.
- Optional Supabase persistence for admin credentials, payment settings, and orders.

## Technology

- Next.js 15 App Router, React 19, and TypeScript
- Tailwind CSS and Lucide icons
- Local JSON storage for development; Supabase persistence for selected production data

## Getting started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy `.env.example` to `.env.local`, then set a unique `JWT_SECRET` (at least 32 characters) and `ADMIN_DEFAULT_PASS` (at least 12 characters). Never commit `.env.local`.

3. Start the development server:

   ```bash
   npm run dev
   ```

   Open the URL printed by Next.js (usually [http://localhost:3000](http://localhost:3000)).

4. Sign in at `/admin/login` and configure the restaurant name, tagline, contact details, address, opening hours, menu, and payment options before publishing.

## Supabase on Vercel

Vercel's serverless filesystem is not durable. To persist admin credentials, payment settings, and orders:

1. Run `supabase/schema.sql` in the Supabase SQL Editor for a new database. For an existing database, also run `supabase/migrations/20261022_grillvi_order_records.sql`.
2. Set `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` in Vercel. Keep the service-role key server-side; do not use a `NEXT_PUBLIC_` variable.
3. Set `JWT_SECRET`, `ADMIN_DEFAULT_USER`, and `ADMIN_DEFAULT_PASS` in Vercel and redeploy.

Menu edits, restaurant settings, reviews, and uploaded files still use local JSON/filesystem storage and are not durable on Vercel. Existing local orders are not imported automatically.

## Checks and production build

```bash
node scripts/verify-grillvi.mjs
npm run build
```

Internal storage names and the migration filename still contain the original project identifier for compatibility.
