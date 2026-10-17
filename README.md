# HECA — Luxury Contemporary Fashion & Archive

HECA is a luxury contemporary e-commerce and editorial archive web application built with **Next.js 16.3.0 (App Router + Turbopack)**, **React 19**, **Tailwind CSS v4**, **TypeScript 5**, and **Supabase**. It features real-time catalog management, 6 international and domestic marketplace channels, direct PayPal REST API v2 checkout, server-side admin authentication with rate-limiting, dynamic SEO with individual product archive routes, and bespoke high-fashion aesthetic layouts.

- **Production Live URL**: [https://heca-official.vercel.app](https://heca-official.vercel.app)
- **Supabase Project ID**: `xrzdcqnezhcezitolkuu`

---

## 1. Local Setup & Quickstart

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

# Run production build or dev server
npm run build
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the storefront, or [http://localhost:3000/admin](http://localhost:3000/admin) for the management dashboard.

---

## 2. Environment Variables Configuration

Copy `.env.example` to `.env.local` and configure your credentials:

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

### Obtaining Credentials:
1. **Supabase Keys**:
   - Access [Supabase Dashboard](https://supabase.com/dashboard) $\rightarrow$ Project Settings $\rightarrow$ API.
   - Copy Project URL, `anon` public key, and `service_role` secret key.
   - **Crucial**: `SUPABASE_SERVICE_ROLE_KEY` must be configured in Vercel Project Settings for server mutations (creating/editing products).
2. **PayPal Credentials**:
   - See Section 3 below.

---

## 3. Obtaining PayPal Credentials & Business Account Requirements

To enable live payments and checkout orders:

1. **PayPal Business Account**: A verified PayPal Business account is required by PayPal to capture transactions via REST API v2.
2. **Access Developer Portal**: Navigate to the [PayPal Developer Dashboard](https://developer.paypal.com/dashboard/).
3. **Create Application**:
   - Go to **Apps & Credentials**.
   - Switch between **Sandbox** (for testing) or **Live** (for production).
   - Click **Create App**, name it `HECA Storefront`, and associate it with your Business Account.
4. **Configure Credentials**:
   - Copy the **Client ID** into `PAYPAL_CLIENT_ID`.
   - Copy the **Secret** into `PAYPAL_CLIENT_SECRET`.
   - Set `PAYPAL_MODE` to `sandbox` or `live`.

---

## 4. Supabase Database Migrations

Database migration files are located in `supabase/migrations/` and must be applied in sequential order:

1. **`001_heca_products_full_schema.sql`**
   - Base catalog schema with categories, sizing, and media support.
2. **`002_heca_settings_and_slides.sql`**
   - Tables for `heca_hero_slides` and `heca_settings` (store links, currency, shipping).
3. **`003_heca_orders.sql`**
   - Table `heca_orders` tracking PayPal transactions, customer details, and shipping.
4. **`004_heca_admins.sql`**
   - Administrative table `heca_admins` for access authorization.
5. **`005_rls_lockdown.sql`**
   - Complete Row Level Security (RLS) enforcement; locks orders and limits mutations strictly to server role.
6. **`006_marketplace_channels.sql`**
   - Adds Etsy, Amazon, and Alibaba product channels and global fallback links.
7. **`007_storage_heca_media.sql`**
   - Creates the public storage bucket `heca-media` with RLS policies for admin uploads.
8. **`008_drop_public_read_admins.sql`**
   - Removes public select permissions on `heca_admins` to protect admin emails.
9. **`009_login_rate_limit.sql`**
   - Database-backed rate limiting table and atomic RPC functions (`register_login_attempt`, `clear_login_attempt`) for serverless environments.

### Applying Migrations via CLI:
```bash
npx supabase db query --linked --project-ref xrzdcqnezhcezitolkuu -f supabase/migrations/001_heca_products_full_schema.sql
npx supabase db query --linked --project-ref xrzdcqnezhcezitolkuu -f supabase/migrations/002_heca_settings_and_slides.sql
npx supabase db query --linked --project-ref xrzdcqnezhcezitolkuu -f supabase/migrations/003_heca_orders.sql
npx supabase db query --linked --project-ref xrzdcqnezhcezitolkuu -f supabase/migrations/004_heca_admins.sql
npx supabase db query --linked --project-ref xrzdcqnezhcezitolkuu -f supabase/migrations/005_rls_lockdown.sql
npx supabase db query --linked --project-ref xrzdcqnezhcezitolkuu -f supabase/migrations/006_marketplace_channels.sql
npx supabase db query --linked --project-ref xrzdcqnezhcezitolkuu -f supabase/migrations/007_storage_heca_media.sql
npx supabase db query --linked --project-ref xrzdcqnezhcezitolkuu -f supabase/migrations/008_drop_public_read_admins.sql
npx supabase db query --linked --project-ref xrzdcqnezhcezitolkuu -f supabase/migrations/009_login_rate_limit.sql
```

---

## 5. Catalog Seeding

The seeder script (`scripts/seed.ts`) supports loading external datasets:

```bash
# Seed products from a JSON file (safe upsert)
npx tsx scripts/seed.ts path/to/products.json

# Hard reset: clear existing products and seed from file
npx tsx scripts/seed.ts path/to/products.json --reset
```

> **Warning**: Running with `--reset` permanently clears all products in `heca_products`.

---

## 6. Admin Authentication & Management

- **Portal URL**: `/admin/login`
- **Admin Account**: `admin@heca.com`
- **Password**: Provided securely and separately during client handover.
- **Security Protections**:
  - Exact password authentication (no loose fallback).
  - Rate limiting: max 5 failed attempts per IP within a 15-minute window (`429 Too Many Requests`).
  - Session stored as an `HttpOnly`, `SameSite=Lax` secure cookie (`heca_admin_session`).
  - Next.js 16 `src/proxy.ts` verifies session integrity prior to granting `/admin` access.

---

## 7. Architecture & System Workflows

### A. 6 Marketplace Channels
The platform integrates 6 domestic and international purchasing channels across Quick View modals, Product Detail pages, and fallback links:
1. **Shopee** (`#EE4D2D`)
2. **Tokopedia** (`#42B549`)
3. **TikTok Shop** (`#000000`)
4. **Etsy** (`#F1641E`)
5. **Amazon** (`#FF9900`)
6. **Alibaba** (`#FF6A00`)

Each product can define specific URLs per channel, falling back automatically to the official brand links configured in `heca_settings`.

### B. PayPal Direct Server-Side Checkout Flow
1. **Config Request**: Client fetches public parameters via `GET /api/paypal/config`.
2. **Order Creation**: Client calls `POST /api/paypal/create-order` $\rightarrow$ server validates product in database, records order in `heca_orders`, requests PayPal REST API v2 order, returns PayPal Order ID.
3. **Capture**: On client approval, calls `POST /api/paypal/capture-order` $\rightarrow$ server triggers capture on PayPal, updates `heca_orders` status to `CAPTURED`, records shipping information.

### C. Storage & Media Upload
- Images uploaded in `/admin` are saved into Supabase Storage bucket `heca-media`.
- Verified admin fallback route `/api/admin/upload` ensures reliable server-authenticated multipart file uploads.

---

## 8. Catatan Teknis & Keterbatasan

### Rate Limiting
Rate limiting login disimpan di tabel Supabase (`login_attempts`) via fungsi RPC
agar berlaku lintas instance serverless. Limit: **5 percobaan / 15 menit per IP**.
Bila pengecekan rate limit gagal, sistem **fail-open** (tidak mengunci user) agar
admin tidak terkunci karena masalah koneksi database.

### Content-Security-Policy
CSP mengizinkan: `self`, Unsplash, Supabase (storage & API), Google Fonts, PayPal SDK.
Bila nanti menambah domain CDN lain (mis. Cloudinary), tambahkan di `next.config.ts`.

### Env yang WAJIB diisi di Vercel
| Key | Wajib | Sumber |
|---|---|---|
| `SUPABASE_SERVICE_ROLE_KEY` | Ya | Supabase → Settings → API |
| `PAYPAL_CLIENT_ID` | Ya* | PayPal Developer Dashboard |
| `PAYPAL_CLIENT_SECRET` | Ya* | PayPal Developer Dashboard |
| `PAYPAL_MODE` | Ya* | `sandbox` atau `live` |
| `NEXT_PUBLIC_SITE_URL` | Ya | `https://heca-official.vercel.app` |

\* Tanpa ini, checkout PayPal tidak aktif (endpoint mengembalikan 503).

### Yang TIDAK bisa dikerjakan tanpa akses user
- Mengisi env var di Vercel
- Mengubah password admin
- Menghapus akun `auth.users` pihak ketiga

---

## 9. Brand & Style Guidelines

- **Background**: `#EBE6DF`
- **Primary**: `#111111`
- **Accent**: `#C2B8AD`
- **Highlight / Sale**: `#D6001C`
- **Typography**: Bodoni Moda (Editorial Headings) & Inter (Body / Controls)
- **Official Client Care**: `care@heca.com`
