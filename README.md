# HECA — Luxury Contemporary Fashion & Archive

HECA is a luxury contemporary e-commerce and editorial archive web application built with **Next.js 16 (App Router + Turbopack)**, **React 19**, **Tailwind CSS v4**, **TypeScript 5**, and **Supabase**. It features real-time catalog management, direct PayPal REST API v2 checkout, server-side admin authentication, and bespoke high-fashion aesthetic layouts.

- **Production Live URL**: [https://heca-official.vercel.app](https://heca-official.vercel.app)
- **Supabase Project ID**: `xrzdcqnezhcezitolkuu`

---

## 1. Tech Stack & Design System

- **Framework**: Next.js 16 (App Router + Turbopack) & React 19
- **Styling**: Tailwind CSS v4
- **Database & Auth**: Supabase PostgreSQL + Supabase Auth
- **Payments**: PayPal REST v2 Server-Side Direct Capture (`@paypal/react-paypal-js` client SDK + Node runtime fetch)
- **Brand Palette**:
  - Background: `#EBE6DF` (`--color-heca-bg`)
  - Primary / Text: `#111111` (`--color-heca-primary`)
  - Accent / Muted: `#C2B8AD` (`--color-heca-accent`)
  - Sale / Discount: `#D6001C`
- **Typography**: Bodoni Moda (Editorial Serif) & Inter (Modern Sans-Serif)

---

## 2. Local Setup & Quickstart

### Prerequisites
- Node.js 20+ (LTS recommended)
- npm 10+

### Installation

```bash
# Clone the repository
git clone https://github.com/heca-official/heca.git
cd heca

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the storefront.

---

## 3. Environment Variables Configuration

Create a `.env.local` file in the root directory:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://xrzdcqnezhcezitolkuu.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# PayPal Configuration (REST API v2)
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_client_secret
PAYPAL_MODE=sandbox # or 'live'

# Site Configuration
NEXT_PUBLIC_SITE_URL=https://heca-official.vercel.app
```

> **Security Note**: `PAYPAL_CLIENT_SECRET` and `SUPABASE_SERVICE_ROLE_KEY` must **never** be prefixed with `NEXT_PUBLIC_` and are only accessed within server-side route handlers.

---

## 4. Supabase Database Migrations

Database migration files are located in `supabase/migrations/` and must be applied in strict numerical order:

1. **`001_heca_products_full_schema.sql`**
   - Extends `heca_products` with: `sizes`, `is_new`, `discount_percent`, `hover_image`, `description`, `material`, `care_instructions`, `shopee_url`, `tokopedia_url`, `tiktok_url`, `video_url`, `size_guide_url`, `sort_order`, `updated_at`.
   - Adds performance indices on `category` and `sort_order`.
2. **`002_heca_settings_and_slides.sql`**
   - Creates `heca_hero_slides` and `heca_settings` tables with Row Level Security (RLS) policies allowing public read and authenticated admin modification.
   - Migrates hero slides and marketplace social links from browser `localStorage` to database persistence.
3. **`003_heca_orders.sql`**
   - Creates `heca_orders` table (`id`, `paypal_order_id`, `product_id`, `product_name`, `size`, `unit_price`, `currency`, `qty`, `subtotal`, `shipping`, `total`, `status`, `customer_email`, `customer_name`, `shipping_address`, timestamps).
   - Inserts initial configurations into `heca_settings`: `fx_rate: 15500` and `shipping_usd: 15`.
4. **`004_heca_admins.sql`**
   - Creates `heca_admins` table for administrative privilege verification.
   - Configures the root administrator user (`admin@heca.com`).

### Executing Migrations
Migrations can be executed directly via the Supabase CLI or the Supabase SQL Editor:
```bash
npx supabase db query --linked --project-ref xrzdcqnezhcezitolkuu -f supabase/migrations/001_heca_products_full_schema.sql
npx supabase db query --linked --project-ref xrzdcqnezhcezitolkuu -f supabase/migrations/002_heca_settings_and_slides.sql
npx supabase db query --linked --project-ref xrzdcqnezhcezitolkuu -f supabase/migrations/003_heca_orders.sql
npx supabase db query --linked --project-ref xrzdcqnezhcezitolkuu -f supabase/migrations/004_heca_admins.sql
```

---

## 5. Catalog Seeding (50 Curated Luxury Products)

HECA comes with a comprehensive seed script that populates 50 luxury fashion items across WOMAN, MAN, KIDS, and BEAUTY categories with rich metadata (sizing, discounts, editorial imagery, hover visuals, and care instructions):

```bash
npx tsx scripts/seed.ts
```

---

## 6. Architecture & System Workflows

### A. PayPal Direct Server-Side Checkout Flow
1. **Config Request**: Client requests PayPal public parameters via `GET /api/paypal/config` (receives only `clientId`, `currency`, and `mode`).
2. **Order Creation**: Client clicks PayPal button $\rightarrow$ calls `POST /api/paypal/create-order` with `{ productId, size, qty }`.
   - The server validates product existence and computes real price and shipping strictly from the database.
   - Logs order as `CREATED` in `heca_orders`.
   - Acquires cached OAuth2 bearer token from PayPal API v2 (`/v1/oauth2/token`).
   - Calls PayPal `POST /v2/checkout/orders` with `intent: CAPTURE`.
   - Returns PayPal Order ID to client.
3. **Capture**: On buyer approval in PayPal modal, client triggers `POST /api/paypal/capture-order` with `{ orderId }`.
   - Server verifies order match in `heca_orders`.
   - Invokes PayPal `POST /v2/checkout/orders/{id}/capture`.
   - Updates order status to `CAPTURED`, records customer email, name, and shipping address.
   - Returns confirmation and displays luxury confirmation state to buyer.

### B. Admin Security & Middleware
- **Protected Routes**: `/admin` and `/admin/*` are intercepted by Next.js `src/middleware.ts`.
- **Authentication**: `POST /api/admin/login` verifies credentials against Supabase Auth and `heca_admins`. Sets an `HttpOnly`, `SameSite=Lax` session cookie (`heca_admin_session`).
- **Data Protection**: Write endpoints (`POST/PUT/DELETE /api/products`) verify the admin session server-side, returning `401 Unauthorized` for unauthorized requests.
- **Root Admin**: `admin@heca.com` / `Heca9901!`

### C. SEO & Metadata
- Dynamic sitemap generated at `/sitemap.xml` (`src/app/sitemap.ts`) indexing all active catalog products.
- Standard compliant `/robots.txt` (`src/app/robots.ts`).
- Open Graph tags and JSON-LD structured data (`Organization` & `Product`) in `src/app/layout.tsx`.

---

## 7. Vercel Deployment

### Deploying via Vercel CLI or Git
1. Push branch to GitHub `main`:
   ```bash
   git push origin main
   ```
2. In the [Vercel Dashboard](https://vercel.com):
   - Link project to repository.
   - Navigate to **Project Settings** $\rightarrow$ **Environment Variables**.
   - Add the following variables:
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - `SUPABASE_SERVICE_ROLE_KEY`
     - `PAYPAL_CLIENT_ID`
     - `PAYPAL_CLIENT_SECRET`
     - `PAYPAL_MODE` (`live` for production or `sandbox` for testing)
     - `NEXT_PUBLIC_SITE_URL` (`https://heca-official.vercel.app`)
3. Redeploy or trigger automatic build.

---

## 8. Verification & Build Commands

```bash
# Run ESLint validation
npm run lint

# Production build check
npm run build
```
