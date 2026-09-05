# CLAUDE.md — Button (button.uz)

Full-stack web app for **Button** — a men's clothing retail chain in Tashkent, Uzbekistan.
This file is the single source of truth for *what we are building and how*. Read it before
writing code. It is a living document — update it when a decision changes.

---

## 1. The business (what we actually learned)

Button is a **men's clothing store chain** (`Erkaklar kiyim do'koni`) operating in Tashkent.

| Fact | Value | Source / confidence |
|---|---|---|
| Instagram | [@button_uz](https://www.instagram.com/button_uz/) | confirmed |
| Telegram | [@button_uzbekistan](https://uz.tgstat.com/en/channel/@button_uzbekistan) | confirmed |
| Facebook | [button.uzbekistan](https://www.facebook.com/button.uzbekistan/) | confirmed |
| Phone | +998 94 613 55 55 | confirmed |
| **Instagram following** | **~920,000** | large — see §1.1 |
| Tagline (IG bio) | **`Sifat • Uslub • Qulay narx`** (Quality · Style · Affordable price) | confirmed — this *is* the brand positioning |
| Link in bio | `0ucfa.mssg.me` (messaging aggregator) | orders already flow through chat |
| Flagship branch | Toshkent, Chilonzor tumani, Chilonzor dahasi, 16-mavze, 10/1 — **2nd floor, Andalus shopping centre** | [Yandex Maps](https://yandex.uz/maps/org/button/43328261557/) |
| Rating | **4.9** from 843 ratings, 211 reviews | Yandex Maps |
| Branches | **≥3** — Chilonzor, Mirobod, near Beruniy metro | verify full list |
| Hours | ~10:00–23:00 daily | sources disagree (22:00 vs 23:00) — **verify** |
| Amenities (Yandex) | accepts **card payments**, **delivery**, pickup, wheelchair access | |
| Domain | **`button.uz` — REGISTERED AND HOSTED, but empty** | see §1.2 |

### 1.1 The following is the story

**~920K Instagram followers** is not a small shop — it is one of the larger clothing audiences
in the country, and it reframes this project. Button does not need us to *find* them customers;
they already have the attention. What they lack is a place to send it. The bio link currently
points at `0ucfa.mssg.me`, a messaging aggregator — every single one of those followers who
wants to know a price has to open a chat and ask a human.

**That is the actual product thesis:** we are not building a shop that hopes for traffic.
We are building the destination for traffic that already exists and is currently being burned
in a DM queue.

**But do not confuse audience size with concurrent load.** Followers ≠ simultaneous visitors —
the realistic peak is far smaller than the follower count suggests, and §21.1 does the
arithmetic. The follower count matters because it means **demand is not the constraint**; it
does not mean we need heavy infrastructure. The reference case for every design and performance
decision is one person: *an Instagram link-in-bio tap on a mid-range Android over mobile data.*

### 1.2 `button.uz` is already theirs — and it's empty

```
button.uz  →  95.46.96.77  (webspace.uz, Uzbek hosting, AlmaLinux + nginx)
HTTP 200, 5 760 bytes, Last-Modified: 2025-03-24
Content: the default "Web Server Test Page" for AlmaLinux
HTTPS: broken — cert is for dns1.webspace.uz, not button.uz
```

Registry data (RDAP, Uzinfocom / cctld.uz):

```
handle       D306723-UZ           status       active
registered   2019-10-04           last change  2024-10-23
expiration   2031-10-07           ← paid ~7 years forward
registrar    Arsenal-D (webname.uz)
registrant   REDACTED FOR PRIVACY ← ownership NOT publicly confirmable
nameservers  dns1–4.webspace.uz   MX  button.uz (mail is configured)
```

Someone bought the domain in 2019, renewed it in 2024 **through 2031**, configured mail, pointed
DNS at Uzbek hosting — and never shipped a site. Search engines still hold an old meta
description: *"Button — Erkaklar va ayollar uchun keng assortimentdagi sifatli kiyimlar va
poyabzallar do'koni."*

**Honest caveat:** the registrant is privacy-redacted, so we **cannot prove** Button owns it.
The circumstantial evidence is strong (an Uzbek-language meta description describing exactly
this business, Uzbek hosting, configured mail, a 7-year renewal). But "button" is a common
English word, so a squatter or an unrelated owner is possible. **Ask the client directly — this
is a one-question conversation, not a research problem.**

### 1.3 Domain options (checked 2026-09-06)

| Domain | Status |
|---|---|
| `button.uz` | **taken** — almost certainly Button's own; confirm with client |
| **`bttn.uz`** | ✅ **available** — matches their own `bttn` logo monogram |
| `buttonuz.com` | ✅ available |
| `buttonstore.uz` | ✅ available |
| `buttonuz.uz` | ✅ available |
| `bttn.com` | taken |

**Recommendation, in order:**
1. **Confirm Button owns `button.uz`.** If they do, this whole question disappears — it is the
   best possible domain and it is already paid for through 2031.
2. If they do *not* own it, **`bttn.uz`** is the strongest fallback: it is short, it is `.uz`
   (which carries local trust that `.com` does not in this market), and it is *literally their
   own logo monogram* — the circular mark reads `bttn`. That is a far better brand fit than
   `buttonuz.com`, which reads like a workaround.
3. `buttonuz.com` is worth registering cheaply as a **defensive redirect** either way, but it
   should not be the primary domain. In Uzbekistan `.uz` outranks `.com` for local credibility.

**Why this matters for the pitch:** they already decided they want a website, already spent the
money, and got stuck. We are not selling them an idea — we are finishing something they
abandoned. Domain, hosting and local infrastructure are already paid for. The broken SSL is a
one-line fix we can offer as a free opener.

Note that old description says **`erkaklar va ayollar`** — men *and* women — plus
**`poyabzallar`** (footwear), while Instagram brands strictly as men's. Resolve in §18.

### Business model

- **Reseller, not a manufacturer.** Button imports ready-made clothing and resells it. There is
  no in-house production, no factory, no seasonal design cycle of their own. Sourcing is
  **mixed and openly stated**: their own posts say the main line is *made in Turkey* and
  described as high quality, while other items (e.g. knitwear) are labelled *Xitoyda ishlab
  chiqarilgan* — made in China. **They are not hiding the origin, so neither do we:** a
  "Made in Turkey / Made in China" line on the product page reads as honesty here, not as a
  weakness. Turkish origin in particular is a *selling point* in this market.
- **They already deliver.** Yandex Maps lists delivery, pickup and card payments; their posts
  advertise delivery across Uzbekistan. This is arranged manually over chat, not through a
  courier API — which is exactly why v1's Telegram hand-off (§3) fits rather than fights the
  existing operation.
- **Not authorised/original brand goods.** Authentic branded clothing in Uzbekistan is sold
  through the brands' own mono-stores and is priced beyond what an average Uzbek household
  spends on clothes. Button sits deliberately below that.
- **Positioning: affordable but noticeably better than the bazaar.** Not luxury. Not cheap.
  The promise is *"good clothes, fair price, real shop you can walk into."*

### What this means for the product

1. **Do NOT design a luxury site.** No huge silent hero videos, no serif-and-whitespace
   editorial minimalism, no "request an appointment". That aesthetic signals *expensive* and
   will actively repel the target customer.
2. **Price is a feature, not something to hide.** The single biggest job of this site — stated
   by the client — is: *let people see what Button sells and what it costs, without physically
   travelling to a mall.* Price must be visible on the listing card, not behind a click.
3. **Sizes and availability matter more than styling.** The customer's real question is
   "do they have this in XL, at the branch near me, for a price I can afford?"
4. **We inherit no brand equity from suppliers.** Product names will be generic
   (`Klassik oq ko'ylak`), not `Zara ...`. Never present goods as authorised brand merchandise
   — that is both a legal risk and a lie.

---

## 2. Market & competitor analysis

### Terra Pro — [terrapro.uz](https://terrapro.uz/) — *the benchmark*

The closest and strongest local comparison: an Uzbek men's-clothing chain that **did** build
a real e-commerce site.

- **Scale:** ~35 stores — 18 in Tashkent alone (Samarqand Darvoza, Next, Park In Mall, Magic
  City, Compass, Mega Planet, Poytaxt, Parus, Vega, Atlas, High Town, Golden Life…) plus
  Samarkand, Fergana, Andijan, Bukhara, Namangan, Nukus, Kokand, Karshi, Navoi, Termez,
  Jizzakh, Angren. [Store locator](https://terrapro.uz/shop/uzbekistan/)
- **Languages:** RU + UZ only. **No English.**
- **Structure:** Men / Women / Children → ~40 subcategories (ko'ylak, futbolka & polo, sviter,
  kurtka, shim, jinsi, shorti, ust kiyim, palto, kamar, sumka, sharf, bosh kiyim, ko'zoynak…)
- **Currency:** so'm, integer, no decimals.
- **Retail mechanics they run:** `1+1=3` promo; loyalty programme with 3% cashback rising to
  7% after 5,000,000 so'm of purchases.
- **Support:** phone + email, Mon–Sat 09:00–18:00. Human, local, not a chatbot.
- **Footer:** careers, store list, FAQ, privacy, delivery terms, blog.
- **Account features:** personal account, wishlist, cart.

**Takeaways we copy:** deep category tree, integer so'm prices, store-locator as a first-class
page, wishlist, phone-first support, UZ+RU.

**Takeaways we improve on:** add **English** (Terra Pro has none — free differentiation for
tourists, expats and diaspora); make **per-branch stock** visible (nobody local does this well);
be far faster on mobile.

### JUST — [just2010.uz](https://just2010.uz/uz/) — *the most advanced local competitor*

**Correction:** an earlier draft of this document said JUST had no web presence. That was wrong
— it searched `just.uz`. Their real site is **`just2010.uz`**, and it is the most complete
clothing e-commerce operation we have found in Uzbekistan.

**What they run:**
- **Full transactional e-commerce** — accounts, order tracking, cart, delivery, returns,
  public offer (oferta), privacy policy.
- **Native mobile apps** on both Google Play and the App Store. Nobody else local has this.
- **Men's *and* women's** (`Erkaklar` / `Ayollar`), deep category tree: shim, jogger, anorak,
  vetrovka, kurtka, palto, pidjak, polo, hoodie, shorts, footwear, accessories.
- **Gift cards**, prominently merchandised. Promotions up to 70% off.
- Stores incl. Mega Planet (Tashkent), Atlas (Qarshi, Samarqand), Media Park.
  Yakkasaroy office, +998 55 506 88 00.

**Their stack and visual language** (fingerprinted 2026-09-06):

| | |
|---|---|
| CMS | **Bitrix** (PHP) + Vue components |
| Type | **Montserrat** (300/400/500/700), Cyrillic subset — geometric sans |
| Palette | near-black `#232526` / `#0B0B0B`, light grey `#F5F5F5`, accent **`#7000FF` — vivid purple** |
| Homepage | category tiles carried by product photography |
| Languages | **UZ + RU only — again, no English** |
| HTML weight | **407 KB** on the homepage |
| Caching | **`Cache-Control: no-store, no-cache, must-revalidate`** |

**What we take from JUST** (this is the reference the client likes):
neutral near-black + light-grey palette so **photography carries the page**; category tiles with
real imagery instead of text links; a geometric sans; gift cards as a merchandising idea;
mobile apps as a v3 ambition.

**Where we beat them — and it is not subtle:**
1. **Speed.** 407 KB of HTML served with `no-store` means *every* visit is a full uncached
   round trip to a Bitrix backend. Our pages are prerendered static HTML on a CDN. On a
   mid-range Android over Uzbek mobile data this is the single most visible difference a
   customer will feel.
2. **English.** Neither JUST nor Terra Pro has it.
3. **Per-branch stock.** Nobody local shows it.

> ⚠ **Palette collision:** JUST's accent is purple (`#7000FF`) and Button's brand is purple
> (`#4A1082`). Button's is much deeper and less electric, but we must not end up looking like a
> JUST clone. Differentiate through **layout density, typography and photography treatment** —
> and keep purple restricted to identity and the primary CTA (§20), never as a background wash.

### Wider context

- **Ubuy.uz**, **Shoptextile.uz**, **Outlas.uz** — generic/marketplace-style catalogues, weak
  design, poor mobile.
- **Uzum Market** dominates general marketplace commerce. Button will not out-marketplace
  Uzum. Button's advantage is **being a real shop with a real address and a curated, trusted
  selection** — the site must lean on that, not fight a marketplace on breadth.

### The gap Button fills

> Uzbek men's clothing chains either have **no site at all** (JUST, Button) or a
> **Russian-first site with no stock transparency** (Terra Pro).
> A fast, trilingual, mobile-first catalogue that shows *price + size + which branch has it*
> is genuinely unoccupied ground.

---

## 3. Locked product decisions

These four are **decided**. Do not re-litigate them in code review; propose a change here first.

| # | Decision | Rationale |
|---|---|---|
| 1 | **v1 = catalogue + order via Telegram/phone.** No cart, no online payment, no courier. | Matches how Button already sells. Ships fast. Critically: **no money moves online, so we avoid merchant contracts, PCI scope, and mandatory fiscal receipts entirely** (see §14). |
| 2 | **Next.js 15 (App Router) + PostgreSQL + Prisma + Tailwind.** | SEO is the whole point — people must *find* these clothes on Google/Yandex. SSR/SSG is non-negotiable, which rules out a plain SPA. One language, one deploy. |
| 3 | **Custom admin panel, Uzbek-first UI.** | Staff are non-technical and Uzbek-speaking. A CMS in English is a wall. Also gives us the real backend surface: auth, roles, uploads, validation. |
| 4 | **Real project — intended to be pitched to and run by Button.** | Everything external gets a real plan *and* a mock adapter, so the app runs fully before the client signs anything. |

### v1 explicitly does NOT include

Cart · online payment (Payme/Click/Uzum) · courier/delivery integration · fiscal receipt /
OFD integration · customer accounts with passwords · returns/refunds flow · reviews & ratings ·
loyalty/cashback · mobile app. Each is a *v2+* item in §16 — build v1 so none of them require
a rewrite.

---

## 4. How the whole thing fits together

```
                        BROWSER (mobile-first, ~75% of UZ traffic)
                                     │
                          Next.js App Router (SSR / ISR)
                                     │
        ┌────────────────────────────┼────────────────────────────┐
        │                            │                            │
   Server Components          Route Handlers               Server Actions
   (read catalogue,           /api/*  (revalidate,         (admin mutations:
    render HTML on            sitemap, og-image,            create/update product,
    the server)               health, webhooks)             stock, upload)
        │                            │                            │
        └────────────────────────────┼────────────────────────────┘
                                     │
                          Service layer  (lib/services/*)
                     business rules, no HTTP, no React, testable
                                     │
                          Prisma Client  (lib/db.ts)
                                     │
                             PostgreSQL (Neon / Supabase)
                                     │
        ┌────────────────────────────┴────────────────────────────┐
   Object storage (S3-compatible)                        Cache & ISR
   original + WebP/AVIF derivatives                      Next data cache, tags
```

**The rule that keeps this clean:** React components never touch Prisma directly, and the
service layer never imports React or `next/*`. Every DB access goes
`component → service → prisma`. This is what makes the code testable and what lets v2 expose
the same services over a public REST API for a mobile app without touching business logic.

---

## 5. Tech stack

| Layer | Choice | Why |
|---|---|---|
| Framework | **Next.js 16.3.4, App Router, TypeScript strict** (React 19.2.8) | SSR for SEO, RSC for fast catalogue reads, one deployable |
| Styling | **Tailwind CSS v4** + **shadcn/ui** | fast, consistent, no CSS bikeshedding |
| DB | **PostgreSQL 16** | relational catalogue with variants/stock; JSONB where useful |
| ORM | **Prisma** | typed schema, migrations, good DX |
| i18n | **native App Router dictionaries** + `proxy.ts` | no extra dependency; see §8 |
| Auth | **Auth.js (NextAuth) v5**, credentials provider, admin only | v1 has no customer accounts |
| Images | **next/image** + S3-compatible storage | AVIF/WebP, correct sizing on 3G |
| Forms/validation | **react-hook-form + Zod** | one Zod schema shared client + server |
| Search | Postgres `tsvector` + `pg_trgm` | avoids a whole extra service; enough for ~2k SKUs |
| Analytics | **Plausible** (or Yandex.Metrica) | Yandex still matters in UZ |
| Errors | **Sentry** | |
| Hosting | **Vercel** (app) + **Neon** (DB) | see §15 for the .uz caveat |
| Testing | **Vitest** (unit) + **Playwright** (e2e) | |
| Lint/format | **ESLint + Prettier**, strict TS, no `any` | |

**Node 24 (installed). pnpm 12. No `any`. No unchecked `!` non-null assertions.**

### Next.js 16 — things that differ from older knowledge
Verified against the bundled docs in `node_modules/next/dist/docs/`. **Read those docs, not
memory, before writing framework code** — `AGENTS.md` says the same and is regenerated by
`next dev`.

- **`middleware.ts` no longer exists — it is `proxy.ts`**, exporting `export function proxy()`.
- **`params` and `searchParams` are async.** Always `const { locale } = await params`.
- **`PageProps<'/[locale]'>` and `LayoutProps<'/[locale]'>` are global TS helpers** — use them
  instead of hand-written prop types.
- **`next/root-params`** exposes root dynamic segments (our `locale`) to any Server Component or
  server utility without prop drilling. Not available in Client Components, Server Actions or
  Route Handlers.
- **Turbopack is the default** for `next dev` and `next build`.
- Minimum Node 20.9; browser targets Chrome/Edge/Firefox 111+, Safari 16.4+.

---

## 6. Repository layout

```
button-web/
├── CLAUDE.md
├── app/
│   ├── [locale]/                 # uz | ru | en
│   │   ├── page.tsx              # home
│   │   ├── katalog/              # all products + filters
│   │   │   ├── page.tsx
│   │   │   └── [category]/page.tsx
│   │   ├── mahsulot/[slug]/page.tsx   # product detail
│   │   ├── dokonlar/page.tsx     # store locator
│   │   ├── biz-haqimizda/page.tsx
│   │   ├── aloqa/page.tsx
│   │   └── saralangan/page.tsx   # wishlist (localStorage)
│   ├── admin/                    # NOT locale-prefixed; uz UI, ru fallback
│   │   ├── layout.tsx            # auth guard
│   │   ├── mahsulotlar/
│   │   ├── ombor/                # stock per branch
│   │   ├── dokonlar/
│   │   └── sozlamalar/
│   ├── api/
│   │   ├── health/route.ts
│   │   ├── revalidate/route.ts
│   │   └── upload/route.ts
│   ├── sitemap.ts
│   ├── robots.ts
│   └── opengraph-image.tsx
├── components/
│   ├── ui/                       # shadcn primitives
│   ├── product/                  # ProductCard, Gallery, SizePicker, StockBadge
│   ├── catalog/                  # FilterSidebar, SortSelect, Pagination
│   └── layout/                   # Header, Nav, Footer, LocaleSwitcher
├── lib/
│   ├── db.ts                     # Prisma singleton
│   ├── services/                 # products, stock, stores, search, orders(v2)
│   ├── validation/               # Zod schemas (shared client+server)
│   ├── auth.ts
│   ├── telegram.ts               # deep-link builder
│   └── format.ts                 # money, phone, dates
├── messages/  { uz.json, ru.json, en.json }
├── prisma/    { schema.prisma, migrations/, seed.ts }
├── public/
└── tests/     { unit/, e2e/ }
```

---

## 7. Data model

Modelled on how a **reseller** works: one *Product* (a style), many *Variants*
(colour × size = the thing that actually has a price and a stock count), stock counted
**per branch**.

```prisma
model Product {
  id          String   @id @default(cuid())
  slug        String   @unique          // "klassik-oq-koylak"
  sku         String   @unique          // internal article
  nameUz      String
  nameRu      String
  nameEn      String
  descUz      String?  @db.Text
  descRu      String?  @db.Text
  descEn      String?  @db.Text
  categoryId  String
  category    Category @relation(fields: [categoryId], references: [id])
  basePrice   Int                        // UZS, integer, NEVER float
  oldPrice    Int?                       // for discount display
  material    String?                    // "100% paxta"
  careNotes   String?
  status      ProductStatus @default(DRAFT)
  isFeatured  Boolean  @default(false)
  variants    Variant[]
  images      ProductImage[]
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([categoryId, status])
  @@index([status, createdAt])
}

enum ProductStatus { DRAFT PUBLISHED ARCHIVED }

model Variant {
  id            String  @id @default(cuid())
  productId     String
  product       Product @relation(fields: [productId], references: [id], onDelete: Cascade)
  colorName     String              // "Oq"
  colorHex      String              // "#FFFFFF" — for swatches
  size          String              // S M L XL XXL | 42 44 46 | 30/32
  priceOverride Int?                // rare: XXL costs more
  stock         StockLevel[]

  @@unique([productId, colorName, size])
}

model StockLevel {
  id        String  @id @default(cuid())
  variantId String
  variant   Variant @relation(fields: [variantId], references: [id], onDelete: Cascade)
  storeId   String
  store     Store   @relation(fields: [storeId], references: [id])
  quantity  Int     @default(0)

  @@unique([variantId, storeId])
}

model Store {
  id           String  @id @default(cuid())
  nameUz       String
  addressUz    String
  addressRu    String
  district     String            // "Chilonzor"
  city         String  @default("Toshkent")
  phone        String
  lat          Float?
  lng          Float?
  hoursOpen    String  @default("10:00")
  hoursClose   String  @default("23:00")   // VERIFY with client
  yandexMapUrl String?
  isActive     Boolean @default(true)
  stock        StockLevel[]
}

model Category {
  id        String @id @default(cuid())
  slug      String @unique
  nameUz    String
  nameRu    String
  nameEn    String
  parentId  String?
  parent    Category?  @relation("Tree", fields: [parentId], references: [id])
  children  Category[] @relation("Tree")
  sortOrder Int    @default(0)
  products  Product[]
}

model ProductImage {
  id        String  @id @default(cuid())
  productId String
  product   Product @relation(fields: [productId], references: [id], onDelete: Cascade)
  url       String
  blurHash  String?
  altUz     String?
  colorName String?          // ties image to a colour variant
  sortOrder Int     @default(0)
}

model AdminUser {
  id           String @id @default(cuid())
  phone        String @unique        // Uzbek staff think in phone numbers, not emails
  name         String
  passwordHash String
  role         Role   @default(MANAGER)
  storeId      String?               // MANAGER is scoped to one branch
  isActive     Boolean @default(true)
  lastLoginAt  DateTime?
}

enum Role { OWNER ADMIN MANAGER }

model AuditLog {                    // who changed what — non-negotiable for a real shop
  id        String   @id @default(cuid())
  actorId   String
  action    String                  // "product.update"
  entity    String
  entityId  String
  diff      Json
  createdAt DateTime @default(now())

  @@index([entity, entityId])
}

model ProductView {                 // what people look at but don't buy = buying signal
  id        String   @id @default(cuid())
  productId String
  locale    String
  createdAt DateTime @default(now())

  @@index([productId, createdAt])
}
```

### Hard rules

- **Money is `Int` in so'm. Never `Float`, never `Decimal`, never cents.** UZS has no
  practical subunit. `289000` renders as `289 000 so'm`.
- **Translated fields are explicit columns** (`nameUz`/`nameRu`/`nameEn`), not a JSON blob —
  we want them indexable and validatable. `uz` is required; `ru`/`en` fall back to `uz`.
- **Stock is per (variant, branch).** A product page must be able to say *"Chilonzorda bor,
  Novzada yo'q."* This is our main differentiator over Terra Pro.
- Deleting a product **archives** it (`ARCHIVED`), never a hard delete — URLs stay alive.

---

## 8. Internationalisation

**Three locales, in this priority order: `uz` (default) → `ru` → `en`.**

- Routes are locale-prefixed: `/uz/katalog`, `/ru/katalog`, `/en/catalog`.
- `uz` = **Uzbek Latin**. Pick one apostrophe character for `o'`/`g'` and use it everywhere;
  use plain ASCII `'` in URL slugs. Cyrillic Uzbek is *not* in scope.
- `ru` matters commercially — a large share of Tashkent shoppers browse in Russian, and Terra
  Pro is Russian-first. Do not treat `ru` as a second-class translation.
- `en` is our differentiator (Terra Pro has none). Lower traffic, still cheap to keep.
- **Implementation is native to the App Router — no i18n library.** `proxy.ts` detects the
  locale and redirects unprefixed paths; every route lives under `app/[locale]/`; dictionaries
  are lazily imported JSON resolved server-side by `getDictionary()`. Because dictionaries load
  in Server Components, **translation files cost zero client bundle bytes** — which is the whole
  reason to do it this way given the JS budget in §9.
- All UI strings live in `messages/*.json`. **No hardcoded user-facing strings in components.**
- Product content is translated in the DB, not in message files.
- `hreflang` alternates on every page; locale switcher preserves the current path.
- Numbers/dates use the locale, but **prices always render as so'm with a space thousands
  separator**: `1 290 000 so'm`.

---

## 9. Frontend

### Pages (v1)

| Route | Rendering | Notes |
|---|---|---|
| `/` | ISR 1h | hero, new arrivals, categories, branch strip, Instagram feed |
| `/katalog` | SSR | all products, filters, sort, pagination |
| `/katalog/[category]` | ISR + on-demand revalidate | category landing, SEO copy block |
| `/mahsulot/[slug]` | ISR + on-demand revalidate | gallery, sizes, per-branch stock, order CTA |
| `/dokonlar` | static | map + list, click-to-call, Yandex Maps links |
| `/biz-haqimizda`, `/aloqa` | static | |
| `/saralangan` | client | wishlist from `localStorage` — **no account needed in v1** |

### The product page is the whole product

Everything else exists to get someone here. It must show, above the fold on a phone:
photo · name · **price** · sizes with unavailable ones visibly disabled · a stock line per
branch · the order button.

### Ordering (v1 mechanic)

```ts
// lib/telegram.ts
buildOrderLink({ product, variant, locale })
// → https://t.me/button_uzbekistan?text=<pre-filled: name, SKU, size, colour, price, URL>
```

Two CTAs, always: **`Telegramda buyurtma`** (primary) and **`+998 94 613 55 55`**
(`tel:` link, secondary). Log the click as a conversion event — that number is the proof the
site works when we report back to the client.

### Non-negotiable frontend constraints

- **Mobile-first.** Design at 360px, then scale up. ~75% of Uzbek e-commerce traffic is mobile.
- **Assume a slow 4G connection on a mid-range Android.** Budget: **< 200 KB JS** on the
  product page, LCP **< 2.5s** on Slow 4G.
- Product images: AVIF/WebP, responsive `sizes`, `blurHash` placeholder, lazy below fold.
- Server Components by default. `"use client"` only for genuine interactivity (gallery,
  filters, wishlist, locale switcher).
- Keyboard accessible, visible focus rings, real `<button>`/`<a>`, alt text on every product
  image, WCAG AA contrast.

---

## 10. Backend & API

**v1 has no public REST API.** Reads happen in Server Components; writes happen through
Server Actions. Route handlers exist only for things that must be HTTP:
`/api/health`, `/api/revalidate`, `/api/upload`, `sitemap.ts`, `robots.ts`.

Design v2 in from the start by keeping all logic in `lib/services/*` — when a mobile app or a
partner needs JSON, we add thin `/api/v1/*` handlers that call the same services.

### Service layer contract

- Pure TypeScript. No `next/*`, no React, no `Request`/`Response`.
- Takes plain args, returns plain data or throws a typed `AppError`.
- Every input validated with Zod **at the boundary** (Server Action / route handler), never
  trusting the client.
- Unit-testable against a test database with no HTTP layer.

### Server Actions rules

Every mutating action: `auth check → Zod parse → service call → audit log → revalidateTag`.
Never accept a price, role, or `storeId` from the client without re-checking authorisation.

---

## 11. Auth & permissions

v1 authenticates **staff only**. Customers are anonymous.

| Role | Can |
|---|---|
| `OWNER` | everything, incl. creating admins and changing prices |
| `ADMIN` | products, categories, stock at any branch, stores |
| `MANAGER` | stock **at their own branch only**; may not change prices or publish products |

- Login by **phone + password** (staff don't reliably have work email). bcrypt/argon2 hashes.
- HTTP-only, `Secure`, `SameSite=Lax` session cookies. Short session, sliding refresh.
- **Authorisation is enforced server-side in the service layer**, not by hiding buttons.
  A `MANAGER` posting a `storeId` they don't own must get a 403.
- Rate-limit login (per phone and per IP). Lock after repeated failures.
- Every write goes to `AuditLog`. In a retail business with staff turnover, "who dropped the
  price to 1000 so'm" is a question that *will* get asked.

---

## 12. Media pipeline

Button's photos come from Instagram-style shoots — inconsistent lighting, mixed aspect ratios.

1. Admin uploads via `/api/upload` → validated (mime, max 10 MB, magic-byte check — not just
   the extension) → stored in S3-compatible storage under `products/{productId}/{uuid}.{ext}`.
2. Generate AVIF + WebP derivatives at 320/640/960/1280 and a `blurHash`.
3. Store only the key in Postgres; serve through a CDN.
4. **Enforce a single aspect ratio (4:5 portrait) with a crop tool in the admin.** Mixed ratios
   are the number-one thing that makes a catalogue look amateur.

---

## 13. Admin panel

Lives at `/admin`, **not** locale-prefixed. **UI in Uzbek**, Russian fallback. Never English.

Screens: Dashboard (today's views, low-stock alerts) · Products (list, filter, bulk publish) ·
Product editor (3 language tabs, variant matrix, image upload + crop) · Stock (branch × variant
grid, fast keyboard entry) · Stores · Users (OWNER only) · Audit log.

**Design it for a phone.** A shop manager updates stock standing in the store, on their
phone, not at a desk. The stock grid must be usable with a thumb.

Every destructive action needs an explicit confirm naming the thing being deleted.

---

## 14. Legal & compliance (Uzbekistan) — read before touching money

> **The key insight behind decision #1:** because v1 takes **no payment online**, we are
> outside the fiscal-receipt regime. The moment we add a checkout, all of the below becomes
> mandatory and blocking. Do not add a "quick cart" without re-reading this section.

- **Online fiscal receipt (ChEK / OFD)** is *mandatory* for every online sale in Uzbekistan and
  must be transmitted in real time to the Tax Committee via the Soliq API. Not optional, not
  deferrable. ([Payze OFD docs](https://docs.payze.io/docs/uzbekistan-fiscalization-ofd),
  [Tax Committee notice](https://one.uz/en/news/uzbekistan/29126-tax-committee-online-cash-register-usage-is-mandatory.html))
- **Payment providers:** Click (~45% of online payments, 1–2%), Payme (~1–1.5%), Uzum Bank
  (~0.8–1.5%). Most cards are **UZCARD/HUMO**, not Visa/Mastercard. Aggregators (Multicard,
  Octobank, Paynet) give one integration for several. Onboarding takes days-to-weeks and needs
  a registered legal entity. ([OneDev](https://onedev.uz/en/blog/how-to-accept-online-payments-in-uzbekistan-click-payme-uzum-and-cards), [Sayt.uz](https://sayt.uz/en/blog/uzcard-humo-tolov-integratsiya))
- **Entity:** YT (4% of turnover) or MChJ (12% VAT, exempt under 1 bln UZS). Registration via
  my.gov.uz, ~5–7 working days. IT Park residency can zero income tax.
- **Consumer law:** 14-day return right on most goods — needs a real returns page and process
  before we sell online.
- **Required public pages once we transact:** Public offer (`Ommaviy oferta`), privacy policy,
  delivery terms, returns policy — in Uzbek and Russian.
- **Domain:** ✅ **`button.uz` is already registered and hosted** on webspace.uz (95.46.96.77).
  No acquisition needed. **Its HTTPS is currently broken** — the certificate belongs to
  `dns1.webspace.uz`. Fixing it (Let's Encrypt on the existing host, or moving DNS to
  Cloudflare) is step one and costs nothing.
- **Delivery (v2):** Yandex Delivery has an API and does Tashkent in 2–4h (~15–35k UZS);
  Uzbek Post for regions (1–3 days); Express24 as an alternative.

---

## 15. Hosting, deployment, operations

| Environment | URL | DB | Deploy trigger |
|---|---|---|---|
| local | `localhost:3000` | Docker Postgres | `pnpm dev` |
| preview | auto per-PR | Neon branch | push to any branch |
| production | `button.uz` | Neon main | merge to `main` |

- **App on Vercel**, **DB on Neon** (or Supabase). Choose the region closest to Central Asia
  and put **Cloudflare** in front for edge caching — Tashkent → Frankfurt latency is real and
  a CDN is what makes the difference on a mid-range phone.
- **Caveat to raise with the client:** some Uzbek buyers expect local hosting for a `.uz`
  business. If required, the whole stack is portable to a VPS (Docker Compose: Next.js +
  Postgres + Caddy) — this is exactly why we avoided Vercel-only primitives.

### CI/CD (GitHub Actions)

`typecheck → lint → unit tests → build → e2e (Playwright) → deploy`.
Migrations run via `prisma migrate deploy` as a release step, **never** `db push` in production.
`main` is protected; no direct pushes.

### Operations

- **Backups: Neon PITR + a nightly `pg_dump` to object storage. Test a restore before launch —
  an untested backup is not a backup.**
- Uptime check on `/api/health`; alert to a Telegram group (that's where the team lives).
- Sentry for errors, Plausible or Yandex.Metrica for traffic.
- Weekly report to the client: views, top products, order-button clicks, zero-result searches.
  Zero-result searches are free merchandising intelligence — they tell Button what to import.

### Security baseline

CSP + HSTS + `X-Content-Type-Options` · Zod on every input · Prisma (no raw SQL string
interpolation) · rate limits on login, upload and search · secrets only in env vars, never
committed · dependabot on · no PII beyond staff phone numbers in v1.

---

## 16. Roadmap

**v1 — Catalogue (this build).** Trilingual catalogue, filters, product pages with per-branch
stock, store locator, wishlist, Telegram/phone ordering, admin panel, SEO, analytics.
*Success = order-button clicks and organic traffic from people who never would have found the shop.*

**v2 — Transact.** Cart + checkout, Payme/Click/Uzum, **ChEK/OFD fiscal integration (blocking)**,
Yandex Delivery, customer accounts + order history, oferta/returns pages.

**v3 — Grow.** Loyalty/cashback (Terra Pro has it, customers will expect it), reviews, size
recommendation from returns data, Telegram bot mirroring the catalogue, restock notifications,
maybe a mobile app on the v2 REST API.

---

## 17. What we need from Button (client asks)

Blocking, in order:

1. **Logo — vector file.** ✅ A raster version has been supplied and the purple is in use, but
   we still need the **SVG/AI/PDF** for a crisp wordmark and favicon at every size, plus the
   **exact brand hex** if a brand guide exists (ours is currently eyeballed — §20).
2. **Confirm Button owns `button.uz`** (§1.2). Registrant is privacy-redacted; one question to
   the client settles it and decides the whole domain plan (§1.3).
3. **Access to the `button.uz` hosting/DNS** (webspace.uz control panel), assuming #2 confirms
   they own it. The domain and hosting are already paid for — we need credentials, not a purchase.
4. **Product photography.** The single biggest quality lever, and the one thing we cannot fix
   in code. It is what makes just2010.uz look good (§2), and no amount of front-end work
   substitutes for it. Instagram reel stills will not carry a catalogue. Ask for: consistent
   background, 4:5 ratio, 3–5 shots per item, one worn shot.
5. **Confirm the full branch list** — exact addresses, phones, hours per branch. Three are known
   (Chilonzor/Andalus, Mirobod, Beruniy); there may be more.
6. **Confirm opening hours** (22:00 or 23:00 — sources disagree).
7. **Confirm the range**: men only, or men + women + footwear? The old `button.uz` meta
   description says both; Instagram says men's. JUST and Terra Pro both run men + women.
8. **Initial catalogue data** — 50–100 items with names, categories, prices, sizes, stock.
9. **Decide who owns the admin account** and who updates stock daily. *A catalogue that shows
   items the shop no longer has is worse than no catalogue.* This is an operational commitment,
   not a technical one — get it in writing.

---

## 18. Open questions

- Exactly how many branches, and does stock actually differ between them? (If not, per-branch
  stock collapses to a simple "in stock" and the schema still works unchanged.)
- **Men's only, or men + women?** The indexed `button.uz` description says *erkaklar va ayollar*
  and includes *poyabzallar* (footwear); Instagram brands strictly as men's. Yandex lists
  sneakers, oxfords, loafers, hoodies, jeans, shirts, bags. Build the category tree to tolerate
  a women's branch from day one — do not hardcode "men" into routes or copy.
- Children's line — ever?
- Typical price band? Needed to calibrate the design so it reads *affordable*, not *cheap*.
- Who currently answers the DMs, and how many per day? That volume is the baseline the site
  has to relieve, and the number that proves ROI.
- Is there an existing POS/1C system holding inventory that we could sync with instead of
  manual entry?
- Wholesale (`optom`) alongside retail?

---

## 19. Working conventions for Claude in this repo

- **Uzbek is the default language of the product.** When adding a user-facing string, write
  `uz` first, then `ru`, then `en`. Never ship an English-only string to the storefront.
- **Never hardcode a user-facing string in a component.** It goes in `messages/*.json`.
- **Never put a price in a `Float`.** Integers of so'm, always.
- **Never call Prisma from a React component.** Go through `lib/services/*`.
- **Never trust client input.** Zod-parse at every server boundary; re-check authorisation
  server-side even when the UI already hides the control.
- **Never hard-delete a product.** Archive it.
- **Do not add luxury-brand visual language.** If a design choice makes the site feel
  expensive, it is wrong for this business (see §1).
- **Do not present goods as authorised brand merchandise.**
- When a decision in §3 or §7 would need to change, update this file in the same commit.
- Match the surrounding code's style; strict TypeScript; no `any`.

---

## 20. Design system & brand

> **Status: logo received. Brand is deep purple.** ⚠ `--brand` is currently matched **by eye**
> from the supplied image — **sample the exact value from the source file** once the vector
> lands in the repo. Raw hex values must never appear outside `globals.css`.

### The logo
- **Deep purple** ground with a **white lowercase `button` wordmark** in a geometric rounded
  sans (circular bowls, single-storey `t`). Poppins 600 is the interim match; replace with the
  real vector.
- A **circular `bttn` monogram** — `bt` over `tn` — knocked out in purple on a white disc.
  This is the **favicon and app icon**, and it is the reason `bttn.uz` is such a good fallback
  domain (§1.3).
- Working value: `--brand: #4a1082`. White on it measures **~12:1 — passes WCAG AAA**, so the
  primary CTA can safely be solid purple with white text.

### Using the purple without looking cheap
Purple is a strong, saturated identity colour and it is easy to overuse. It carries **identity
and the primary action** — the wordmark, the primary CTA, the active state, focus rings. It is
**not** a background wash and **not** a stock-status colour. Everything else stays neutral so
the product photography is what carries the page. A purple-flooded layout would fight the
clothes, which are the actual product.

### First impression is a feature
The reference moment is: *someone taps the link in a 920K-follower Instagram bio, on a
mid-range Android, on mobile data, and decides in about two seconds whether this is a real shop.*
Everything below serves that moment. This is why the JS budget in §9 is a hard constraint and
not an aspiration — a beautiful page that arrives late has already lost.

### Token architecture

```css
/* app/globals.css — the ONLY place raw colour values are allowed to exist */
:root {
  /* ── Brand: Button purple, from the logo ─────────────────────── */
  --brand:          #4A1082;   /* ⚠ eyeballed — resample from the vector */
  --brand-ink:      #FFFFFF;   /* on --brand: ~12:1, passes AAA */
  --brand-hover:    #3B0C68;   /* darker purple for hover/active */
  --brand-muted:    #F4F0F9;   /* faint purple tint for surfaces */

  /* ── Neutrals: independent of brand, do not change with it ───── */
  --bg:             #FFFFFF;
  --surface:        #FAFAFA;
  --border:         #E5E5E5;
  --fg:             #171717;
  --fg-muted:       #6B7280;

  /* ── Semantic: fixed meanings, never used decoratively ───────── */
  --in-stock:       #16A34A;
  --low-stock:      #D97706;
  --out-of-stock:   #9CA3AF;
  --sale:           #DC2626;
}
```

**Rules**
- Components reference tokens only (`bg-brand`, `text-fg-muted`), never hex.
- `--brand` is for **identity and the primary CTA**. It is *not* the stock-status colour, *not*
  the sale colour, *not* the error colour. If the logo turns out to be green or red, semantic
  colours stay as they are — this separation is why.
- **Contrast is checked, not assumed.** Whatever colour arrives, `--brand-ink` on `--brand`
  must pass WCAG AA (4.5:1). If the brand colour is light, the ink flips to near-black.
- Dark mode is **out of scope for v1**. The tokens are structured to allow it later; do not
  build it now.

### Visual direction (from §1 — affordable, not luxury)

| Do | Don't |
|---|---|
| Dense product grids — 2 columns on mobile, 4 on desktop | Sparse one-item-per-screen editorial layouts |
| Price large, bold, always visible on the card | Price hidden behind a hover or a click |
| Clear system-ish sans (Inter / Geist), high legibility | Thin display serifs, wide letter-spacing |
| Real photos of real stock, filling their frame | Moody crops, faces-only, heavy grain |
| Obvious tappable buttons, ≥44px targets | Ghost buttons, tiny outlined "Discover" links |
| Generous but efficient whitespace | Whitespace as a status symbol |
| Radius 8px, subtle borders, minimal shadow | Sharp 0px brutalism *or* heavy glassmorphism |

The mental benchmark is a **fast, trustworthy local retailer** — closer to Uniqlo or Sinsay in
information density than to a fashion house. `Sifat • Uslub • Qulay narx` is their own line;
the design should make all three legible at a glance.

### Typography
- One family, three weights (400/500/700). Latin + **Cyrillic subset required** for `ru`.
- Verify the chosen face renders `o'` / `g'` and Cyrillic correctly before committing to it.
- Price uses **tabular numerals** so grids don't jitter: `font-variant-numeric: tabular-nums`.

### Components to build first (in this order)
`ProductCard` → `ProductGrid` → `PriceTag` → `StockBadge` → `SizePicker` → `Header/Nav` →
`LocaleSwitcher` → `Footer`. The card is the atom of the whole site; get it right before
anything else, and review it at 360px width first.

---

## 21. Scale, resilience, security & recovery

### 21.1 The load profile is spiky, not steady

Button's traffic will not arrive as a smooth daily curve. It arrives as **Instagram spikes**: a
story or post goes out and the bio link gets tapped in a burst. But **a large follower count
does not mean a large simultaneous audience**, and it is worth doing the arithmetic rather than
designing for a number that feels impressive:

```
920 000 followers
→ a story realistically reaches   5–10%   ≈  45 000 – 90 000 views
→ link-sticker tap rate is        1–3%    ≈     500 –  2 700 taps
→ spread over the hours the story is live, not one instant
⇒ realistic PEAK CONCURRENCY: low hundreds. Occasionally ~1 000.
```

> **Design target: comfortably serve a few thousand visitors in the hour after a post, with
> peak concurrency in the low hundreds — on a small budget and with no manual intervention.**

That is a **modest** load for a static-first site. State it plainly rather than inflating it:
the risk here is not that the servers melt, it is that we **over-engineer for a spike that never
comes** and spend the budget in the wrong place. The correct investment is speed on a mid-range
Android over mobile data, and photography — not capacity.

The good news is that the architecture below is not a scaling concession; it is just the normal
way to build this, and it happens to have a ceiling far above what Button will actually hit.
It costs nothing extra. Three consequences still hold:
1. **The catalogue must be servable without touching the database.** Static/ISR HTML at the CDN
   edge means a spike is absorbed by Cloudflare, not by Postgres.
2. **The database is the scarce resource, not the app.** App instances scale horizontally and
   cheaply; Postgres connections do not.
3. **Cache-miss stampedes are the real risk.** 20k simultaneous requests for a *cold* page all
   miss at once and hit the origin together.

### 21.2 Scaling strategy, in priority order

**1 — Cache at the edge (does 95% of the work).**
Product and category pages are ISR with on-demand revalidation. A spike hits Cloudflare and
Vercel's edge cache, and the origin serves each page approximately once per revalidation window.
Set `stale-while-revalidate` so a stale page is served instantly while it refreshes in the
background — **never make a user wait for a rebuild.**

**2 — Never invalidate the whole cache at once.**
Use **tag-based revalidation** (`revalidateTag('product:<id>')`), not a blanket purge. An admin
editing one price must not cold-start the entire catalogue. This is the single easiest way to
turn an ordinary spike into an outage — treat a global purge as a production incident.

**3 — Pool database connections.**
Serverless functions each want their own connection and will exhaust Postgres in minutes under
load. **Non-negotiable:** connect through a pooler (Neon's built-in pooler / Supabase Supavisor
/ PgBouncer in transaction mode). Prisma must use the *pooled* URL at runtime and the *direct*
URL only for migrations. Keep both as separate env vars (`DATABASE_URL`, `DIRECT_URL`).

**4 — Keep queries boring and indexed.**
No N+1 in the catalogue path. The listing query touches `Product` + one image + a price, nothing
more. Indexes already declared in §7. Paginate with **keyset/cursor pagination**, never
`OFFSET` on deep pages. Load per-branch stock **only on the product page**, never per card in a
grid.

**5 — Images are the actual bandwidth.**
A clothing catalogue is ~90% image bytes. Serve AVIF/WebP at correct sizes from the CDN, never
from the origin. This is where the money and the speed both live.

**6 — Autoscaling / load balancing.** Vercel does this natively; at Button's real volume
(§21.1) we will not come close to the limits. On a VPS fallback, run 2+ app containers behind
Caddy/nginx with health checks — that is the "load balancer", and its real value is
**zero-downtime deploys**, not capacity. **Do not build a custom load balancer**, and do not add
a load-balancing tier before a measurement demands one.

**7 — Shed load gracefully.** Rate-limit writes and search (§21.3). Under genuine overload,
serving a slightly stale catalogue is correct; showing an error page to an Instagram visitor is
not. **Degrade, don't fail.**

### 21.3 Security baseline (supersedes the short list in §15)

| Area | Control |
|---|---|
| Transport | HTTPS enforced, HSTS, TLS 1.2+. **Fix the broken `button.uz` cert first (§1.2).** |
| Headers | CSP (no `unsafe-inline` in prod), `X-Content-Type-Options: nosniff`, `Referrer-Policy`, `X-Frame-Options: DENY`, `Permissions-Policy` |
| Input | **Zod-parse at every server boundary.** Never trust the client — re-validate even when the UI already constrains the value. |
| Injection | Prisma parameterised queries only. **No raw SQL string interpolation, ever.** |
| AuthN | argon2/bcrypt password hashes, HTTP-only + `Secure` + `SameSite=Lax` cookies, short sessions |
| AuthZ | Enforced **server-side in the service layer** (§11). Hiding a button is not access control. |
| Rate limits | Login (per phone **and** per IP), upload, search, and any Server Action. Progressive lockout on repeated auth failure. |
| Uploads | Verify **magic bytes**, not the file extension. Cap at 10 MB. Store outside the webroot, serve from CDN. Never execute uploaded content. |
| Secrets | Env vars only. **Never committed.** Rotate on staff departure. `.env*` in `.gitignore` from commit #1. |
| Dependencies | Dependabot on; `pnpm audit` in CI |
| Admin surface | `/admin` `noindex`; consider IP allowlist or a second factor before launch |
| Data minimisation | v1 stores **no customer PII** — no accounts, no addresses, no card data. The wishlist is `localStorage` only. This is a deliberate risk reduction: *the safest customer database is the one you don't have.* |
| PCI | **Out of scope in v1 by design** — we never touch card data (§3, §14). |
| Bots | Cloudflare bot protection; CAPTCHA only on abuse, never on browsing |

### 21.4 Observability — know it broke before the client calls

- **Errors: Sentry.** Server + client, source maps uploaded on deploy, release tagging so we can
  tie a spike in errors to the deploy that caused it. Alert on new issue types and error-rate
  jumps.
- **Uptime: an external check on `/api/health`** every minute from outside our own
  infrastructure (UptimeRobot / Better Stack). `/api/health` must verify the **database round
  trip**, not just return 200 — a health check that can't fail is decoration.
- **Alerts go to a Telegram group.** That is where this team actually lives; email will be
  ignored. Page on: site down, error rate spike, DB connection saturation, failed deploy.
- **Web vitals**: track real-user LCP/INP from Uzbek mobile networks. Synthetic scores from a
  fast connection will flatter us and hide the actual experience.
- **Business metrics** (weekly, to the client): sessions, top products, order-button clicks,
  zero-result searches, low-stock items.

### 21.5 Availability & disaster recovery

**Stated targets — write these down so they can be tested:**

| Metric | Target |
|---|---|
| Uptime | 99.5% (≈3.6h/month) — honest for this budget; don't promise four nines |
| **RPO** (max data loss) | **≤ 24h** via nightly dump; ≤ 5 min with PITR |
| **RTO** (max time to restore) | **≤ 1h** |

- **Backups:** managed PITR (Neon/Supabase) **plus** an independent nightly `pg_dump` to object
  storage in a *different* provider. Two mechanisms, because "the provider had it" is not a plan
  when the provider is the thing that failed.
- **Test a restore before launch, and quarterly after.** An untested backup is not a backup —
  this is the most commonly skipped step and the one that ends companies.
- **Uploaded images are separate state.** They live in object storage, not Postgres — back them
  up too, with versioning enabled. A DB restore alone leaves a catalogue of broken images.
- **Rollback:** immutable deploys, previous build promotable in one click. Migrations must be
  **backward-compatible** (expand → migrate → contract) so a code rollback doesn't strand the
  schema. Never write a destructive migration that a rollback cannot survive.
- **Runbook** (keep in `/docs/runbook.md`): site down · DB unreachable · spike overload ·
  bad deploy · lost admin credentials · defaced/incorrect content. Written in plain steps, so
  it works at 2am, and so it works for someone who is not the person who built this.

### 21.6 What we deliberately do NOT build

Kubernetes · a custom load balancer · multi-region active-active · a microservice split ·
a self-hosted logging stack. Each is real engineering that this business does not need at this
size, and each would consume the budget that should go into photography, speed and the admin
panel. **Revisit only when a measured limit is actually hit** — and record the measurement here
when it is.

---

## 22. Accounts & credentials (what only the human can do)

Claude cannot create accounts, accept terms, enter payment details, or hold ownership of a
company's infrastructure. The user creates these and shares access; Claude wires them up.
**Track status here as things get connected.**

| # | Service | Who | Status | What's needed |
|---|---|---|---|---|
| 1 | **GitHub repo** | user creates, invites Claude/CLI | ☐ | Empty **private** repo named `button-web`. No README/.gitignore/licence — the local repo already has commits. Then give the HTTPS URL. |
| 2 | **Postgres — Supabase** *(decided)* | user creates | ☐ | One project covers #2 and #3. Provide **pooled** `DATABASE_URL` (Supavisor, transaction mode) + **direct** `DIRECT_URL`. The pooled URL is not optional — see §21.2. |
| 3 | **Object storage — Supabase Storage** *(decided)* | user creates | ☐ | Bucket + keys from the same project as #2. |
| 4 | **Sentry** | user creates | ☐ | Free tier is fine. Provide DSN + auth token for source maps. |
| 5 | **Analytics** (Plausible / Yandex.Metrica) | user creates | ☐ | Site ID / counter ID. |
| 6 | **Vercel** | user creates | ☐ | Connect to the GitHub repo; import env vars. |
| 7 | **Cloudflare** | user | ☐ | Add `button.uz`, proxy DNS, fix TLS. **Needs registrar access — client-dependent.** |
| 8 | **`button.uz` hosting/DNS** | **client (Button)** | ☐ | webspace.uz control panel. Blocking for launch, not for development. |
| 9 | **Uptime monitor** | user creates | ☐ | Point at `/api/health`; alert into a Telegram group. |
| 10 | **Telegram alert group + bot** | user creates | ☐ | Bot token + chat ID. |

**Rules for handling these:**
- Secrets go in `.env.local` (gitignored) and in the host's env var UI. **Never in the repo, never
  pasted into `CLAUDE.md`, never in a commit message.**
- `.env.example` is committed with **key names only and no values** — it documents what is
  required without leaking anything.
- Nothing here blocks development: the app is built against seed data with mock adapters, so
  every screen works before a single external account exists.

---

*Last updated: 2026-09-06. Sources: [Terra Pro](https://terrapro.uz/), [Terra Pro stores](https://terrapro.uz/shop/uzbekistan/), [Button on GoldenPages](https://www.goldenpages.uz/en/company/?Id=98927), [@button_uz](https://www.instagram.com/button_uz/), [Button Telegram](https://uz.tgstat.com/en/channel/@button_uzbekistan), [101digital UZ e-commerce guide](https://101digital.uz/en/blog/how-to-open-online-store-uzbekistan-2026/), [OneDev payments](https://onedev.uz/en/blog/how-to-accept-online-payments-in-uzbekistan-click-payme-uzum-and-cards), [Payze OFD](https://docs.payze.io/docs/uzbekistan-fiscalization-ofd).*
