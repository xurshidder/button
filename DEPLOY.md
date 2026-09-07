# Deploying Button

The code is ready to deploy. What remains is account setup, which only a human
can do — Claude cannot create accounts, accept terms, or own infrastructure
(CLAUDE.md §22).

---

## Before you start: rotate the database password

The Supabase database password was exposed in a chat transcript during
development. **Reset it before the site is public**, not after.

Supabase → **Settings → Database → Reset database password**. Generate a new
one, save it in a password manager, and update `DATABASE_URL` and `DIRECT_URL`
in `.env.local` — both contain it. Use the new value in Vercel too.

While there, roll the `sb_secret_…` key: Settings → **API Keys**.

---

## 1. Create the Vercel project

1. [vercel.com](https://vercel.com) → sign in **with GitHub**
2. **Add New → Project** → import `xurshidder/button`
3. Framework preset: **Next.js** (detected automatically)
4. **Do not deploy yet** — add the environment variables first, or the build
   fails at the migration step with no database to reach

Leave the build command alone. `package.json` defines `vercel-build`, which
Vercel prefers over `build`, and it runs migrations before building:

```
prisma generate && prisma migrate deploy && next build
```

`migrate deploy` applies pending migrations without prompting and never resets
data — unlike `migrate dev`, which must never run against production.

## 2. Environment variables

Vercel → project → **Settings → Environment Variables**. Copy each value from
`.env.local`, with two changes noted below.

| Variable | Notes |
|---|---|
| `DATABASE_URL` | POOLED string, port **6543** |
| `DIRECT_URL` | DIRECT string, port **5432** |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://<ref>.supabase.co` — **no trailing `/rest/v1/`** |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | `sb_publishable_…` |
| `SUPABASE_SECRET_KEY` | `sb_secret_…` — server-only, never prefix with `NEXT_PUBLIC_` |
| `SUPABASE_STORAGE_BUCKET` | `products` |
| `ADMIN_PASSWORD` | **choose a new one for production** |
| `AUTH_SECRET` | generate a fresh one: `openssl rand -base64 32` |
| `NEXT_PUBLIC_SITE_URL` | the real URL — see below |

Apply them to **Production, Preview and Development**.

**Two that must differ from local:**

- `NEXT_PUBLIC_SITE_URL` — this goes into the Telegram order message. Leave it
  as `localhost` and every customer sends Button a link nobody can open.
- `ADMIN_PASSWORD` and `AUTH_SECRET` — a development password should never be
  the production one, and both have appeared in this project's chat history.

## 3. Deploy

**Deploy**. First build takes a few minutes; later ones are faster.

You get `button-web-<something>.vercel.app`. Open it on a phone — that is the
device that matters (CLAUDE.md §9).

## 4. Check it worked

- [ ] Homepage loads, hero image present
- [ ] `/uz/katalog` lists products — proves the pooled database connection works
- [ ] A product page shows per-branch stock
- [ ] `/admin` login works with the **new** password
- [ ] Upload an image through `/admin` and confirm it appears on the site
- [ ] Switch language; the path is preserved
- [ ] Telegram order button opens a message with a **real** URL, not localhost

---

## Afterwards

**Code changes**: push to `main` → Vercel rebuilds and deploys. Every branch
gets its own preview URL, so a change can be seen on a real phone before it
reaches production. Every deploy is retained; rolling back is one click.

**Content changes** (prices, stock, images): through `/admin`, live in seconds.
No deploy, no developer.

**Schema changes**: `pnpm db:migrate` locally to create the migration, commit
it, push. `vercel-build` applies it. Migrations must be backward-compatible —
expand, migrate, then contract — so that rolling code back does not strand the
schema (CLAUDE.md §21.5).

## Custom domain

`button.uz` is registered and hosted at webspace.uz, but ownership is not
publicly confirmable (CLAUDE.md §1.2). **Ask Button before planning around it.**

If they own it: point DNS at Vercel, or put Cloudflare in front for edge
caching — Tashkent to Frankfurt is a real distance and a CDN is what makes the
difference on a mid-range phone. Its HTTPS is currently broken (the certificate
belongs to `dns1.webspace.uz`), which moving DNS also fixes.

If they do not: `bttn.uz` is free and matches their own logo monogram (§1.3).

## Still outstanding

- Product photography — the largest quality lever, and not fixable in code
- Per-staff admin accounts with roles (§11); today it is one shared password
- Confirm the branch list, opening hours, and whether the range is men only
