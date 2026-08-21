# AutoMarket — used-car dealership + admin dashboard

Next.js 14 (App Router, TypeScript) · Tailwind · Supabase (Postgres + Auth + Storage) · deployed to **Cloudflare Pages** via `@cloudflare/next-on-pages`.

- **Public**: browse cars, filter/search, view car & auction detail, submit inquiries/offers. No login.
- **Admin** (`/admin-9f3k2`): single owner account. Manage cars, auctions, and leads. Session-based Supabase Auth + middleware guard + login rate limiting.

---

## 1. Local setup

```bash
npm install
cp .env.local.example .env.local   # then fill in the values (see §2)
npm run dev                        # http://localhost:3000
```

> **Windows note:** `npm run dev` and `npm run build` work fine on Windows. The
> **Cloudflare adapter** (`npm run pages:build`) needs `bash` + the Vercel CLI and
> is unreliable on native Windows — but you never need to run it locally: the
> Cloudflare Pages build runs on Linux in CI. If you *want* a local preview, run
> it under **WSL** (`wsl`), or just push and let Cloudflare build.

---

## 2. Supabase setup (exact steps)

1. Create a project at [supabase.com](https://supabase.com) → **New project**. Pick a region close to your buyers, set a strong DB password.
2. **Run the schema.** Dashboard → **SQL Editor** → New query → paste all of
   [`supabase/schema.sql`](supabase/schema.sql) → **Run**. This creates the
   `cars`, `auctions`, `offers`, `login_attempts` tables, enums, indexes, RLS
   policies, and the `submit_auction_offer()` function.
3. **Create the storage bucket + policies.** New query → paste
   [`supabase/storage.sql`](supabase/storage.sql) → **Run**. This creates the
   public-read `car-images` bucket (5 MB / image limit, image MIME types only).
4. **Run the migrations.** New query → paste each file in
   [`supabase/migrations/`](supabase/migrations) in numeric order → **Run**.
   They are additive and safe to re-run:
   - `002_car_attributes.sql` — body type, drivetrain, Euro norm, engine,
     seats, consignment / home-delivery flags, equipment (`features`).
   - `003_car_color.sql` — paint colour.

   Skipping one leaves the admin car form unable to save (the column it posts
   would not exist yet).
5. **Create the single admin user.** Dashboard → **Authentication → Users → Add
   user → Create new user**. Enter the owner's email + a strong password, and
   tick **Auto Confirm User** (so no email verification is needed). There is no
   public sign-up — this is the only account.
   Set that same address as the server-only `ADMIN_EMAIL` environment variable.
   Under **Authentication → Sign In / Providers**, turn **off** "Allow new
   users to sign up" so no one can self-register through the API.
6. **Grab the API keys.** Dashboard → **Project Settings → API**:
   - `Project URL`  → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon` `public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` `secret` key → `SUPABASE_SERVICE_ROLE_KEY` (**server-only**, never expose)
7. **Configure password-recovery URLs.** Under **Authentication → URL
   Configuration**, set **Site URL** to the production origin and add the exact
   redirect URL `https://your-domain/admin-9f3k2/reset-password`. The default
   reset template already links through `{{ .ConfirmationURL }}`.
8. **Seed sample data** (5 cars + 2 auctions, with placeholder photos uploaded
   to Storage). With `.env.local` filled in:
   ```bash
   npm run seed
   ```

### Environment variables

| Variable | Where | Public? |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase API | yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase API | yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase API | **no — secret** |
| `ADMIN_EMAIL` | sole Supabase Auth admin address | **no — secret** |
| `NEXT_PUBLIC_SITE_URL` | your final domain (for OG/canonical URLs) | yes |
| `NEXT_PUBLIC_ADMIN_PATH` | obscure admin path, must match the `app/` folder | yes |
| `NEXT_PUBLIC_CF_IMAGE_RESIZING` | `true` once Cloudflare Image Resizing is on | yes |

---

## 3. Deploy to Cloudflare Pages (exact steps)

### 3a. Push to GitHub
```bash
git init && git add . && git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/<you>/<repo>.git
git push -u origin main
```

### 3b. Connect the repo to Cloudflare Pages
1. Cloudflare dashboard → **Workers & Pages → Create → Pages → Connect to Git**.
2. Authorize GitHub and pick the repo.
3. **Build settings:**
   - **Framework preset:** `Next.js` — then override the build command:
   - **Build command:** `npx @cloudflare/next-on-pages@1`
   - **Build output directory:** `.vercel/output/static`
4. **Compatibility flags:** Settings → **Functions → Compatibility flags** → add
   `nodejs_compat` for **both** Production and Preview. (Also in `wrangler.toml`.)
5. Save. Every push to `main` now auto-builds and deploys; PRs get preview URLs.

### 3c. Environment variables in Cloudflare
Pages project → **Settings → Environment variables** → add each variable from the
table above for **Production** (and Preview if you want previews to work):
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
  `SUPABASE_SERVICE_ROLE_KEY`, `ADMIN_EMAIL`,
  `NEXT_PUBLIC_SITE_URL` (your real domain),
  `NEXT_PUBLIC_ADMIN_PATH`, `NEXT_PUBLIC_CF_IMAGE_RESIZING`.
- Mark `SUPABASE_SERVICE_ROLE_KEY` and `ADMIN_EMAIL` as **Encrypted**.
- Re-deploy after adding vars (Deployments → Retry deployment) so they take effect.

### 3d. Custom domain
1. Pages project → **Custom domains → Set up a custom domain** → enter your domain.
2. If the domain is already on Cloudflare, the CNAME is added automatically.
   Otherwise follow the shown DNS instructions at your registrar.
3. Update `NEXT_PUBLIC_SITE_URL` to `https://yourdomain` and redeploy.

### 3e. (Optional) Enable image optimization
`next/image` uses a custom Cloudflare loader ([`lib/cloudflare-image-loader.ts`](lib/cloudflare-image-loader.ts)).
Until you enable resizing it serves raw Supabase URLs (works, just unoptimized).
To turn on real resizing: your zone → **Speed → Optimization → Image Resizing → On**,
then set `NEXT_PUBLIC_CF_IMAGE_RESIZING=true` and redeploy.

---

## 4. Cloudflare runtime notes (what was done differently vs. Vercel)

- **Edge runtime everywhere.** Every route declares `export const runtime = "edge"`;
  the Node.js serverless runtime is not available on Cloudflare.
- **No `next/image` default optimizer.** Replaced with a Cloudflare Image Resizing
  loader (with a raw-URL fallback).
- **Login rate limiting** uses a Postgres table, not an in-memory map (Workers
  isolates don't share memory).
- **`nodejs_compat`** flag is set so Supabase's client works on the Workers runtime.

## 5. Security model

- Admin path is obscure **but** the real gate is Supabase Auth: `middleware.ts`
  redirects unauthenticated `/admin-*` requests; `requireAdmin()` re-verifies the
  session (`getUser()`) before any admin data is fetched.
- **RLS** on every table: anon can read the car/auction catalogue and *insert*
  offers, but can never *read* offers (leads stay private) or write catalogue data.
- Auction offers go through a `SECURITY DEFINER` DB function that validates status,
  end time, and starting price and bumps the highest offer atomically.
- Login is rate-limited (8 tries / 15 min per IP+email) and validated server-side.

## 6. Not built (future phases)

- **Live competitive bidding** across concurrent users. Current auctions are
  *offer submission*. To make it real-time: add Supabase Realtime subscriptions on
  `auctions`/`offers` and server-side bid validation. Flagged in
  [`app/(public)/actions.ts`](app/(public)/actions.ts).
- Full `ro` / `hu` translations (strings are stubbed and fall back to English).

## 7. Heads-up on tooling versions

- `@cloudflare/next-on-pages` is pinned to `1.13.5` (its newer patches require
  Next ≥ 14.3, which doesn't exist in the 14.2 line). Cloudflare now **recommends
  migrating to the OpenNext Cloudflare adapter** (`opennextjs-cloudflare`). If you
  later upgrade to Next 15, switch to OpenNext — no application-code changes are
  needed, only the build command + `wrangler` config.
- `next` is pinned to `14.2.35` (latest 14.2 patch) to clear the Dec-2025 advisory.

## Scripts

| Command | What |
|---|---|
| `npm run dev` | Local dev server |
| `npm run build` | Standard Next build (validates the app) |
| `npm run seed` | Insert 5 cars + 2 auctions + placeholder images |
| `npm run pages:build` | Cloudflare adapter build (Linux/WSL) |
| `npm run preview` | Local Cloudflare preview (Linux/WSL) |
