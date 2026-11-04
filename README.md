# 🪐 Mars Portfolio — developer portfolio + admin panel

A complete, themeable developer portfolio (Next.js App Router, TypeScript, Tailwind, Framer Motion, a lazy-loaded 3D Mars) with a secure `/admin` panel to edit **everything** without touching code.

> **Hinglish hint:** Yeh poora website database se chalta hai. Aap `/admin` me login karke text, photos, projects, certificates, blog sab badal sakte ho — code ki zaroorat nahi.

## ⚠️ What differs from the original brief (please read)

The project runs on **PostgreSQL + Drizzle ORM** (the stack of this workspace) instead of the Supabase JS SDK:

| Brief | What is built | Why it is equivalent |
| --- | --- | --- |
| Supabase Postgres | **Any PostgreSQL** via `DATABASE_URL` – *including a free Supabase project's database* | Same database, you just use the connection string |
| Supabase Auth, one admin e-mail | Signed HttpOnly cookie session; only `ADMIN_EMAIL` + password/hash can sign in; checked in `proxy.ts` **and** in every server action / API route | No third-party auth needed; rate-limited login |
| RLS policies | Server-only DB access + `database/rls.sql` (enables RLS with no policies on Supabase so the public REST API can't touch your tables) | Public visitors can only read through the app's published-only queries |
| Storage buckets | Files are stored in Postgres (`stored_files`) with the same bucket names (`projects`, `certificates`, `avatars`, `resume`, `blog`, `media`), served by `/api/files/<bucket>/<file>` | Works on Vercel's read-only filesystem; type + size checked by magic bytes |
| `supabase/schema.sql`, `seed.sql` | `database/schema.sql` (one-go SQL) **or** `npm run db:push`; sample data via `npm run seed` (also auto-inserted on first visit to an empty DB) | |
| Magic-link login | Not included (password only) | Keeps the single-admin model simple & safe |
| Font picker in Theme settings | Colours, blur, grain, animations and default mode are editable; fonts are fixed (Syne + DM Sans) | Fonts are optimised at build time by `next/font` |
| `project_images` table | Gallery stored as an ordered array on `projects.gallery` | Simpler drag-and-drop ordering |

---

## 1. Prerequisites

* **Node.js 20+** – https://nodejs.org (check: `node -v`)
* **Git** – https://git-scm.com
* A **PostgreSQL** database. Easiest free option: a **Supabase** project (see step 2). Local Postgres also works.

## 2. Create the database (Supabase – free)

1. Go to https://supabase.com → **New project**. Choose a strong database password and a nearby region (e.g. Mumbai). *(Password save kar lena!)*
2. Open **Project Settings → Database → Connection string → URI**. Copy it and replace `[YOUR-PASSWORD]`. This is your `DATABASE_URL`.
   * For Vercel deployment use the **Transaction pooler** string (port `6543`).
3. Create the tables – choose **one**:
   * **Option A (recommended):** after step 4 run `npm run db:push`.
   * **Option B:** open **SQL Editor → New query**, paste the whole of `database/schema.sql`, press **Run**. Then run `database/rls.sql` the same way (locks the public REST API).
4. Sample content: run `npm run seed` (3 projects, 4 certificates, skills, experience, a blog post, testimonials, Hindi translations…). If you skip it, the first visit to the site seeds an empty database automatically. Replace the sample content from the admin panel.

## 3. The admin user

There is no sign-up. The admin is simply the e-mail + password you put in the environment file:

```
ADMIN_EMAIL=you@example.com
ADMIN_PASSWORD_HASH=scrypt$...   # created for you by `npm run setup`
```

Nobody else can log in, even with a valid account somewhere else.

## 4. Configure and run

```bash
git clone <your-repo-url> portfolio && cd portfolio
npm install
npm run setup     # interactive: checks Node, creates .env.local, hashes your password, validates
npm run db:push   # create tables (skip if you ran schema.sql)
npm run seed      # optional sample data
npm run dev       # http://localhost:3000
```

`npm run setup` copies `.env.example` → `.env.local`. Every variable is explained inside `.env.example`. Minimum required: `DATABASE_URL`, `ADMIN_EMAIL`, `ADMIN_PASSWORD_HASH` (or `ADMIN_PASSWORD`), `AUTH_SECRET`, `NEXT_PUBLIC_SITE_URL`.

Other scripts: `npm run build`, `npm start`, `npm run lint`, `npm run type-check`.

## 5. Using the admin panel

Open **http://localhost:3000/admin** and sign in.

| I want to change… | Go to |
| --- | --- |
| Name, tagline, typewriter roles, pitch | **Hero** |
| Story, photo, specialties, years of experience | **About** |
| SEO title/description, OG image, favicon, résumé PDF, e-mail, GitHub username | **Site & SEO** |
| Colours, glass blur, grain, animations, default theme | **Theme** (live preview while you edit) |
| Show/hide or reorder homepage sections | **Sections** (drag, or switch) |
| Social links | **Social links** |
| Projects & case studies (images, drag-reorder, featured, draft/published) | **Projects** |
| Certificates (image or PDF, issuer, dates, credential ID/URL) | **Certificates** |
| Skills | **Skill categories** then **Skills** |
| Timeline | **Experience**, **Education** |
| Services / Testimonials / "Now" | **Services**, **Testimonials**, **Now** |
| Blog (Markdown + live preview, schedule by future date) | **Blog** |
| Read contact messages, search, CSV export | **Messages** |
| Uploaded files | **Media library** |
| Export / import all content as JSON | **Backup** |

Every content form has a collapsible **हिन्दी translations** block. Empty Hindi fields automatically fall back to English. Changes are visible on the live site immediately.

Public-site extras: **Ctrl/⌘ + K** command palette, EN/हिं switch, light/dark toggle, GitHub stats, privacy-friendly analytics (no cookies; respects Do-Not-Track).

## 6. Deploy on Vercel (free)

1. Push the project to **GitHub** (`.env*` files are git-ignored – good).
2. https://vercel.com → **Add New… → Project** → import the repo (framework: Next.js is auto-detected).
3. **Environment Variables:** add everything from `.env.example` (use your real values; `NEXT_PUBLIC_SITE_URL=https://yourdomain.com`; `DATABASE_URL` = Supabase *pooler* string).
4. Click **Deploy**. Before or after the first deploy, create the tables once from your computer with the production `DATABASE_URL` in `.env.local` (`npm run db:push`).
5. Open `https://<project>.vercel.app/admin`, sign in, and edit.

> Uploaded files live in the database, so redeploys never lose them. Free Supabase DBs are 500 MB – fine for a portfolio.

### Connect your existing custom domain

1. Vercel project → **Settings → Domains → Add** → type `yourdomain.com` and add it. Then add `www.yourdomain.com` too.
2. Vercel shows the DNS records. At your domain registrar (GoDaddy, Namecheap, Hostinger, BigRock…) → DNS settings:
   * **Apex / root (`@`)** → **A record** → `76.76.21.21`
   * **`www`** → **CNAME** → `cname.vercel-dns.com`
   * (Vercel may show project-specific values in the dashboard — if so, use those.)
   * Remove old conflicting A/CNAME records for `@` and `www`.
3. Wait 5–60 minutes for DNS. The domain turns ✅ in Vercel.
4. **SSL:** automatic (Let's Encrypt). Nothing to do.
5. **www redirect:** in Settings → Domains choose which one is primary (e.g. `yourdomain.com`) and set the other to **Redirect to** it (308).
6. Update `NEXT_PUBLIC_SITE_URL` to the final `https://yourdomain.com` and **Redeploy** (so sitemap/OG URLs are right).
7. Optional: submit `https://yourdomain.com/sitemap.xml` to Google Search Console.

## 7. Security notes

* `/admin/*` is protected by `src/proxy.ts`; **every** server action and admin API route verifies the signed session again (`requireAdmin()`), so hiding UI is never the only defence.
* Login: single admin e-mail, scrypt-hashed password, constant-time comparison, rate-limited (5 / 15 min per IP, 10 / hour per e-mail), HttpOnly + SameSite + Secure cookie, 8 h expiry.
* Server actions have Next's built-in Origin check; cookie-authenticated API routes also check `Origin`.
* All admin input is validated with Zod (schemas are derived from the field definitions). Uploads are validated by size **and magic bytes**; SVG/HTML uploads are rejected; files are served with `nosniff` + a sandbox CSP.
* Contact form: Zod validation, honeypot, DB-backed rate limit (5 / hour / IP), optional Cloudflare Turnstile, escaped e-mail HTML. Markdown never renders raw HTML.
* Secrets live only in environment variables. Only `NEXT_PUBLIC_*` values reach the browser.
* Rotate `AUTH_SECRET` to instantly log out every session.

## 8. Common errors & fixes

| Problem | Fix |
| --- | --- |
| `DATABASE_URL is required` | Fill it in `.env.local` and restart `npm run dev`. |
| `relation "hero" does not exist` | Tables not created yet → `npm run db:push`. |
| Can't log in / "Server is not configured" | Set `ADMIN_EMAIL`, a password (or hash) and an `AUTH_SECRET` of 16+ chars, then restart. |
| "Too many attempts" | Wait 15 minutes (rate limit). |
| Supabase connection times out on Vercel | Use the **pooler** URI (port 6543), not the direct 5432 one. |
| Contact e-mails don't arrive | Set `RESEND_API_KEY` + `CONTACT_RECEIVER_EMAIL`. Messages are still saved in **Admin → Messages**. |
| GitHub section says "unavailable" | Check the username in **Site & SEO**; add `GITHUB_TOKEN` if you hit the rate limit. |
| Upload says "Unsupported file type" | Only JPG, PNG, WebP, GIF, AVIF (+ PDF for certificates/résumé) up to 4–10 MB. |
| Domain shows "Invalid configuration" | DNS not propagated yet or old records remain – recheck step "Connect your domain". |
| 3D planet missing | Expected on low-end/reduced-motion devices – a static planet is shown instead. |

## 9. Performance checklist (target Lighthouse 90+)

* The 3D planet loads *after* idle via `dynamic()`, pauses when off-screen, and is skipped on low-memory / reduced-motion / save-data devices.
* `next/image` (AVIF/WebP), `next/font` (2 families, `display: swap`), server components by default; only interactive pieces are client components.
* Blobs animate with `transform` only; grain is a tiny inline SVG.
* Set real alt text for photos you upload and keep images under ~300 KB for best scores.

## Project structure

```
src/app/(public)/…     public site (home, /projects/[slug], /blog, /blog/[slug])
src/app/admin/…        login + panel (dashboard, generic [resource] editor, messages, media, backup)
src/app/api/…          contact, track, files, admin upload/backup/export, health
src/components/{ui,layout,sections,admin}
src/lib/{admin,…}      auth/session, i18n, data access, validators, storage, rate-limit, github
src/db/{schema,seed}   Drizzle schema + sample data
database/              schema.sql + rls.sql
scripts/               setup.mjs, db-push.mjs, seed.ts, placeholder generator
```
