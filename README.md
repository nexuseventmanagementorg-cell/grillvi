# GRILLVI — BBQ. RICE. KARAHI (Lahore, Pakistan)

A modern, full-stack, responsive restaurant ordering website and management platform for **GRILLVI — BBQ. RICE. KARAHI**, located on Main Grand Trunk Road, near Sunny Pan Shop, Baghbanpura, Lahore, Pakistan.

---

## 🌟 Key Features

### 1. Customer Frontend
- **Homepage**: Hero banner featuring authentic BBQ and Thaal imagery, restaurant brand story, featured chef dishes, Thaal deals, customer review highlights (4.8/5 historical rating from 88 reviews), Google Maps directions, opening hours, and direct WhatsApp ordering.
- **Menu System (`/menu`)**:
  - 10 distinct categories (Starters, Pasta, BBQ Special, Pakistani Corner, BBQ Platter, Thaal Collection, Tandoor, Drinks & Water, Add-ons, Quick Sweet).
  - Real-time search and instant category filter pills.
  - Portion size variants (e.g. Half vs Full, 1L vs 1.5L) and customizable add-ons.
- **Individual Food Detail Pages (`/menu/item/[id]`)**:
  - High-res dish imagery, descriptions, portion selector, add-on selector.
  - **Automatic QR Code Generation**: Download high-resolution PNG or SVG, and printable label with product title and price.
- **Interactive Cart & Drawer (`/cart`)**:
  - Instant quantity controls, line item calculations, persistent localStorage syncing.
- **Checkout & Ordering (`/checkout`)**:
  - Home Delivery vs Takeaway / Self-Pickup toggle.
  - Validation of Pakistani mobile phone formats.
  - Strict server-side recalculation of prices (client-submitted prices are never trusted).
  - Four Pakistan payment methods (Easypaisa, JazzCash, Meezan Bank Transfer, Cash on Delivery).
  - Receipt / payment slip upload support.
- **Live Order Tracking (`/orders/[id]`)**:
  - Live status pipeline: `Order Placed` ➔ `Confirmed` ➔ `Preparing` ➔ `Out for Delivery / Ready for Pickup` ➔ `Completed`.
  - Payment verification badge.
  - One-tap WhatsApp synchronization button with properly URL-encoded order details.
  - Printable official customer receipt and kitchen order ticket (KOT).
- **Customer Reviews (`/reviews`)**:
  - Historical Google rating showcase (4.8/5 from 88 reviews).
  - Customer review submission form with anti-spam moderation.
- **About GRILLVI (`/about`)**:
  - Story of GT Road heritage, live charcoal grill traditions, and the legendary Thaal sharing feasts.
- **Contact & Location (`/contact`)**:
  - Address: Main Grand Trunk Road, near Sunny Pan Shop, Baghbanpura, Lahore.
  - Google Maps Plus Code: `H9JF+8R Lahore, Pakistan`.
  - Embedded Google Map, directions button, click-to-call link, and WhatsApp chat.

---

### 2. Secure Admin Management Suite (`/admin`)

- **Secure Authentication**:
  - Dedicated login at `/admin/login` with brute-force rate limiting.
  - Password hashed using `bcrypt` and session managed via secure `HttpOnly` JWT cookie.
  - Initial admin credentials are configured using `ADMIN_DEFAULT_USER` and `ADMIN_DEFAULT_PASS` environment variables.
  - Secure in-dashboard password update modal.
- **Overview Dashboard**:
  - Total orders, today's orders, pending orders, orders in prep, dispatched, completed, cancelled.
  - Total sales in PKR and best-selling items ranking.
  - Pending payment verification count.
- **Order Management**:
  - Searchable, filterable live orders table.
  - Order status switcher with automated audit logs.
  - One-click payment verification for manual Easypaisa/JazzCash/Bank transfers.
  - Printable Kitchen Order Ticket (KOT) and official receipt.
- **Menu & Price Management**:
  - Instantly update any food price or portion cost. Changes appear on the live website immediately without rebuild.
  - Add new dishes with image upload (stored safely in `/public/uploads/`), portion sizes, add-ons, and categories.
  - Mark dishes as available or sold-out with a single click.
  - Delete or archive menu items.
- **QR Code Hub**:
  - Visual grid of permanent QR codes for every menu item.
  - Filter by category.
  - One-click PNG/SVG download.
  - Printable multi-dish QR sticker sheet for table standees and packaging.
- **Pakistan Payment Configuration**:
  - Configure Easypaisa, JazzCash, and Meezan Bank account titles, numbers, IBAN, and instructions.
  - Unconfigured or disabled transfer methods are hidden at checkout and rejected by the order API.
  - Set default delivery fee, free delivery threshold, and minimum order values.
- **Restaurant Information Management**:
  - Update address, timings, phone, WhatsApp, and top announcement banner text.
- **Review Moderation**:
  - Approve or reject customer-submitted reviews before public display.

---

## 🛠️ Tech Stack

- **Framework**: Next.js 15.1 (App Router) + React 19 + TypeScript
- **Styling**: Tailwind CSS (Custom Luxury Black, Charcoal, Warm Gold, and Burnt Orange palette)
- **Icons**: Lucide React
- **QR Code Engine**: `qrcode` (PNG Buffer & SVG vector generator)
- **Database Architecture**:
  - The current application database uses atomic JSON storage with memory caching in `.data/grillvi_db.json` for local development.
  - Payment settings and admin credentials use Supabase persistence when configured.
  - `supabase/schema.sql` contains the PostgreSQL schema; most application data has not yet been migrated from JSON storage.
- **Security**: `bcryptjs` password hashing, `jsonwebtoken` HttpOnly cookies, rate limiting, and server-side pricing validation.

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```
Before starting the app, set a unique `JWT_SECRET` of at least 32 characters and an `ADMIN_DEFAULT_PASS` of at least 12 characters. Never commit `.env.local`.

### Supabase persistence for Vercel

Payment settings and admin username/password changes need durable storage; Vercel's serverless filesystem cannot provide it. Before allowing those changes on a production deployment:

1. Create a Supabase project and run [`supabase/schema.sql`](./supabase/schema.sql) in its SQL Editor.
2. In the Vercel project settings, add `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` for the production environment. Keep the service-role key server-side only; never use a `NEXT_PUBLIC_` variable for it.
3. Keep `JWT_SECRET`, `ADMIN_DEFAULT_USER`, and `ADMIN_DEFAULT_PASS` set in Vercel, then redeploy.
4. The first admin login initializes the persistent credential record from the configured default credentials. Payment transfers start disabled and blank; configure approved account details in Admin → Payments.

Without Supabase configured, production payment-setting saves and admin credential changes return an error instead of claiming they were saved. Other data—including orders, menu edits, restaurant settings, reviews, and uploaded files—still uses local JSON/filesystem storage and is **not durable on Vercel**; it requires a separate database/object-storage migration.

### 3. Run Automated Tests
```bash
node scripts/verify-grillvi.mjs
```

### 4. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Production Build
```bash
npm run build
npm run start
```

---

## 📍 Restaurant Details

- **Restaurant Name**: GRILLVI
- **Tagline**: BBQ. RICE. KARAHI
- **Phone / WhatsApp**: +92 314 1915087
- **Address**: Main Grand Trunk Road, near Sunny Pan Shop, Baghbanpura, Lahore, 54920, Pakistan
- **Google Maps Location**: H9JF+8R Lahore, Pakistan
- **Currency**: Pakistani Rupees (PKR / Rs)
