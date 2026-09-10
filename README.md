# Button — button.uz

Men's clothing retail chain in Tashkent. Trilingual catalogue (Uzbek, Russian,
English) with per-branch stock, ordering through Telegram, and an Uzbek-language
admin panel.

**Live:** https://buttonuz.vercel.app

---

## What it is

Button has roughly 920,000 Instagram followers and no website. Every one of
those followers who wants to know a price has to open a chat and ask a person.
This is the destination for traffic that already exists.

v1 is a **catalogue, not a shop**: prices, sizes and which branch has the item,
with a "Telegramda buyurtma" button that hands the conversation to Telegram
pre-filled. No cart, no online payment — which also keeps the project outside
Uzbekistan's mandatory fiscal-receipt regime until it is actually needed.

The reasoning behind every decision here lives in **[CLAUDE.md](CLAUDE.md)** —
business analysis, competitor research, the data model, scaling, security.
Read that before changing anything structural.

## Running it

```bash
pnpm install
cp .env.example .env.local     # then fill in the values
pnpm db:seed                   # optional: load the sample catalogue
pnpm dev                       # http://localhost:3000
```

`.env.local` is read **once at startup**. Editing it while the dev server runs
does nothing — restart. If Ctrl+C leaves a process behind and the old page keeps
loading:

```powershell
Get-Process node | Stop-Process -Force
```

## Scripts

| Command | Does |
|---|---|
| `pnpm dev` | Development server |
| `pnpm build` | Production build |
| `pnpm typecheck` | `tsc --noEmit` |
| `pnpm lint` | ESLint |
| `pnpm db:check` | Connects over the pooled URL and prints row counts |
| `pnpm db:seed` | Loads the sample catalogue (re-runnable; upserts) |
| `pnpm db:migrate` | Creates and applies a migration locally |
| `pnpm db:studio` | Browse the database in a GUI |

## Stack

Next.js 16 (App Router) · TypeScript · Tailwind v4 · PostgreSQL on Supabase ·
Prisma 7 · Supabase Storage · Vercel

Pages prerender to static HTML, which is what lets an Instagram traffic spike be
served from the CDN instead of the database.

## Layout

```
app/[locale]/       storefront — uz | ru | en
app/admin/          admin panel (not locale-prefixed, Uzbek UI)
app/api/upload/     image upload
lib/services/       ALL database access goes through here
lib/db.ts           Prisma client — POOLED connection
prisma/             schema, migrations, seed
messages/           uz.json · ru.json · en.json — every UI string
```

**The rule that keeps this clean:** React components never call Prisma
directly. Every read goes `component → lib/services/* → lib/db`.

## Two things that will bite you

**Pooled vs direct connections.** `lib/db.ts` uses the **pooled** URL (port
6543) because that is the path every request takes. `prisma.config.ts` uses the
**direct** URL (port 5432) because migrations run DDL, which a transaction
pooler cannot. Swap them and everything works locally, then falls over under
load. Prisma 7 removed `directUrl` from the schema, which is why this lives in
two files.

**Environment variables are per-environment.** `.env.local` is for development
and never leaves your machine. Vercel has its own copy under Settings →
Environments. Changing one does not change the other.

## Admin panel

`/admin` — password in `ADMIN_PASSWORD`.

- **Mahsulotlar** — prices, discounts, published state, homepage placement
- **Ombor** — stock per branch, saves as you leave each field
- **Rasmlar** — every image on the site: hero, campaign block, category tiles,
  product photos

Content edits go live in seconds without a deploy. That is the point: a
catalogue showing items the shop no longer has is worse than no catalogue, so
staff have to be able to maintain it without a developer.

Today it is a single shared password. Per-staff accounts with roles and an audit
trail are specified in CLAUDE.md §11 and should land before Button's own staff
use it.

## Deploying

Push to `main` and Vercel builds and deploys. Full checklist, including
environment variables and the custom-domain steps, is in
**[DEPLOY.md](DEPLOY.md)**.

## Still needed from the client

Product photography is the largest quality lever and cannot be fixed in code.
The rest — confirming the branch list, opening hours, whether the range is men
only, and whether Button owns `button.uz` — is listed in CLAUDE.md §17.
