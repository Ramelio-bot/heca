# HECA — Luxury Contemporary Fashion & Archive

HECA is a luxury contemporary e-commerce and editorial archive web application built with **Next.js 16.3.0 (App Router + Turbopack)**, **React 19**, **Tailwind CSS v4**, **TypeScript 5**, and **Supabase**. It features real-time catalog management, direct PayPal REST API v2 checkout, server-side admin authentication, dynamic SEO with individual product archive routes, and bespoke high-fashion aesthetic layouts.

- **Production Live URL**: [https://heca-official.vercel.app](https://heca-official.vercel.app)
- **Supabase Project ID**: `xrzdcqnezhcezitolkuu`

---

## 1. Tech Stack & Design System

- **Framework**: Next.js 16.3.0 (App Router + Turbopack) & React 19
- **Styling**: Tailwind CSS v4
- **Database & Auth**: Supabase PostgreSQL + Supabase Auth (Row Level Security fully locked down)
- **Routing & Proxy**: Next.js 16 `src/proxy.ts` (migrated from deprecated `middleware.ts`)
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
git clone https://github.com/Ramelio-bot/heca.git
cd heca

# Install dependencies
npm install

# Copy environment template
cp .env.example .env.local

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the storefront.

---

## 3. Environment Variables Configuration

Copy `.env.example` to `.env.local` and configure your credentials:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://xrzdcqnezhcezitolkuu.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...

# PayPal Configuration (REST API v2)
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_client_secret
PAYPAL_MODE=sandbox # or 'live'

# Site Configuration
NEXT_PUBLIC_SITE_URL=https://heca-official.vercel.app
```

> **Security Note**: `PAYPAL_CLIENT_SECRET` and `SUPABASE_SERVICE_ROLE_KEY` must **never** be prefixed with `NEXT_PUBLIC_` and are only accessed within server-side route handlers.

---

## 4. Obtaining PayPal Credentials & Business Account Requirements

To enable live payments and checkout orders:

1. **PayPal Business Account**: A valid PayPal Business account is required by PayPal to capture transactions via REST API v2.
2. **Access Developer Portal**: Navigate to the [PayPal Developer Dashboard](https://developer.paypal.com/dashboard/).
3. **Create Application**:
   - Go to **Apps & Credentials**.
   - Switch between **Sandbox** (for testing) or **Live** (for production).
   - Click **Create App**, name it `HECA Storefront`, and select your Business Account.
4. **Copy Credentials**:
   - Copy the **Client ID** into `PAYPAL_CLIENT_ID`.
   - Copy the **Secret** into `PAYPAL_CLIENT_SECRET`.
   - Set `PAYPAL_MODE` to `sandbox` or `live`.

---

## 5. Supabase Database Migrations

Database migration files are located in `supabase/migrations/` and must be applied in strict numerical order:

1. **`001_heca_products_full_schema.sql`**
   - Extends `heca_products` with: `sizes`, `is_new`, `discount_percent`, `hover_image`, `description`, `material`, `care_instructions`, `shopee_url`, `tokopedia_url`, `tiktok_url`, `video_url`, `size_guide_url`, `sort_order`, `updated_at`.
   - Adds performance indices on `category` and `sort_order`.
2. **`002_heca_settings_and_slides.sql`**
   - Creates `heca_hero_slides` and `heca_settings` tables.
   - Migrates hero slides and marketplace social links from browser `localStorage` to database persistence.
3. **`003_heca_orders.sql`**
   - Creates `heca_orders` table (`id`, `paypal_order_id`, `product_id`, `product_name`, `size`, `unit_price`, `currency`, `qty`, `subtotal`, `shipping`, `total`, `status`, `customer_email`, `customer_name`, `shipping_address`, timestamps).
   - Inserts initial configurations into `heca_settings`: `fx_rate: 15500` and `shipping_usd: 15`.
4. **`004_heca_admins.sql`**
   - Creates `heca_admins` table for administrative privilege verification.
   - Configures the root administrator user (`admin@heca.com`).
5. **`005_rls_lockdown.sql`**
   - Enables Row Level Security (RLS) on all tables (`heca_products`, `heca_hero_slides`, `heca_settings`, `heca_orders`, `heca_admins`).
   - Restricts public access to strictly read-only (`SELECT`) for products, slides, and settings.
   - Completely locks `heca_orders` from public anon read/write (mutations allowed exclusively via server-side service role key).

### Executing Migrations
```bash
npx supabase db query --linked --project-ref xrzdcqnezhcezitolkuu -f supabase/migrations/001_heca_products_full_schema.sql
npx supabase db query --linked --project-ref xrzdcqnezhcezitolkuu -f supabase/migrations/002_heca_settings_and_slides.sql
npx supabase db query --linked --project-ref xrzdcqnezhcezitolkuu -f supabase/migrations/003_heca_orders.sql
npx supabase db query --linked --project-ref xrzdcqnezhcezitolkuu -f supabase/migrations/004_heca_admins.sql
npx supabase db query --linked --project-ref xrzdcqnezhcezitolkuu -f supabase/migrations/005_rls_lockdown.sql
```

---

## 6. Catalog Seeding (50 Curated Luxury Products)

HECA features an idempotent seeding script that updates or adds the 50 curated items without deleting custom or manual products:

```bash
# Default mode: safe idempotent upsert (leaves manual products intact)
npx tsx scripts/seed.ts

# Optional hard reset mode: completely clears and re-seeds from mock data
npx tsx scripts/seed.ts --reset
```

---

## 7. Architecture & System Workflows

### A. PayPal Direct Server-Side Checkout Flow
1. **Config Request**: Client requests PayPal public parameters via `GET /api/paypal/config` (receives only `clientId`, `currency`, and `mode`).
2. **Order Creation**: Client clicks PayPal button $\rightarrow$ calls `POST /api/paypal/create-order` with `{ productId, size, qty }`.
   - The server validates product existence and computes real price and shipping strictly from the database.
   - Logs order as `CREATED` in `heca_orders` via `getSupabaseAdmin()`.
   - Acquires cached OAuth2 bearer token from PayPal API v2 (`/v1/oauth2/token`).
   - Calls PayPal `POST /v2/checkout/orders` with `intent: CAPTURE`.
   - Returns PayPal Order ID to client.
3. **Capture**: On buyer approval in PayPal modal, client triggers `POST /api/paypal/capture-order` with `{ orderId }`.
   - Server verifies order match in `heca_orders`.
   - Invokes PayPal `POST /v2/checkout/orders/{id}/capture`.
   - Updates order status to `CAPTURED`, records customer email, name, and shipping address.
   - Returns confirmation and displays luxury confirmation state to buyer.
4. **Webhook Support**: `POST /api/paypal/webhook` handles asynchronous capture events (`PAYMENT.CAPTURE.COMPLETED`).

### B. Admin Security & Middleware
- **Protected Routes**: `/admin` and `/admin/*` are intercepted by Next.js 16 `src/proxy.ts` (verifies actual Supabase Auth tokens).
- **Authentication**: `POST /api/admin/login` verifies credentials against Supabase Auth and `heca_admins`. Sets an `HttpOnly`, `SameSite=Lax` session cookie (`heca_admin_session`).
- **Data Protection**: Write endpoints (`/api/products`, `/api/products/bulk-delete`, `/api/products/reorder`, `/api/slides`, `/api/settings`) verify the admin session server-side, returning `401 Unauthorized` for unauthorized requests.
- **Root Admin**: `admin@heca.com` / `Heca9901!`

### C. Dedicated Product Pages & SEO
- Individual product pages live at `/product/[id]` with static site generation (`generateStaticParams`) and rich JSON-LD schema (`Product` schema with pricing and availability).
- Dynamic sitemap at `/sitemap.xml` indexing all individual product archive URLs.
- Standard compliant `/robots.txt`.

---

## 8. Vercel Deployment

1. Push to GitHub `main`:
   ```bash
   git push origin main
   ```
2. In the [Vercel Dashboard](https://vercel.com):
   - Link project repository.
   - Under **Project Settings** $\rightarrow$ **Environment Variables**, configure:
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - `SUPABASE_SERVICE_ROLE_KEY`
     - `PAYPAL_CLIENT_ID`
     - `PAYPAL_CLIENT_SECRET`
     - `PAYPAL_MODE` (`live` or `sandbox`)
     - `NEXT_PUBLIC_SITE_URL` (`https://heca-official.vercel.app`)
3. Deploy or redeploy.

---

## 9. Security Audit Note

> **Audit Notice**: In historical commit `6283e02`, the metadata files `supabase/.temp/cli-latest` and `supabase/.temp/linked-project.json` were briefly tracked before being removed and added to `.gitignore`. While these files contain no passwords or private API keys (only the project ref `xrzdcqnezhcezitolkuu` and organization IDs), if public visibility of project references is a concern, users can rotate the project ref or keep the repository private.
