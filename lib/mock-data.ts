/*
 * No `import "server-only"` here on purpose.
 *
 * This module is server-only in practice — it imports `node:fs`, so any
 * attempt to pull it into a client bundle fails at build time regardless. The
 * explicit guard would be redundant, and it actively breaks the seed script,
 * which runs under plain Node where `server-only` throws by design.
 */
import fs from "node:fs";
import path from "node:path";

import type {
  Category,
  Product,
  ProductImage,
  Store,
  Variant,
} from "@/lib/types";

/**
 * Seed catalogue for design review and local development.
 *
 * WHY THIS EXISTS: every screen must work before a single external account is
 * provisioned (CLAUDE.md §22). The shapes here are identical to the Prisma
 * models, so swapping in real queries changes the data source only.
 *
 * The products below are modelled on Button's OWN photography. Prices and
 * stock levels are still plausible placeholders — confirm with the client
 * (CLAUDE.md §17 ask #8).
 *
 * NAMING NOTE: products are named generically by garment, never by a
 * third-party brand. Some photographed items carry visible maker's marks;
 * Button is a reseller and we do not present goods as authorised brand
 * merchandise (CLAUDE.md §1, §19).
 */

const PUBLIC_DIR = path.join(process.cwd(), "public");

/**
 * Auto-discovers photography for a product.
 *
 * Any image dropped into `public/products/<slug>/` is picked up in filename
 * order — no code change needed when the client sends photos. If the folder is
 * missing, the product renders the "photo coming soon" placeholder instead of
 * a broken image, so the site is never in a broken state.
 *
 * Runs at build time on the server (this module is `server-only`).
 */
function imagesFor(slug: string, alt: string): ProductImage[] {
  const dir = path.join(PUBLIC_DIR, "products", slug);
  let files: string[];
  try {
    files = fs
      .readdirSync(dir)
      .filter((f) => /\.(jpe?g|png|webp|avif)$/i.test(f))
      .sort();
  } catch {
    return [];
  }
  return files.map((file, i) => ({
    id: `${slug}-img-${i}`,
    url: `/products/${slug}/${file}`,
    alt,
  }));
}

/* ── Stores ─────────────────────────────────────────────────────────────────
   Real, from Yandex Maps / GoldenPages. The full branch list is still pending
   confirmation from the client (CLAUDE.md §17 ask #5). */
export const stores: Store[] = [
  {
    id: "st-chilonzor",
    name: {
      uz: "Button Chilonzor",
      ru: "Button Чиланзар",
      en: "Button Chilonzor",
    },
    address: {
      uz: "Chilonzor tumani, 16-mavze, 10/1, Andalus savdo markazi, 2-qavat",
      ru: "Чиланзарский район, 16-квартал, 10/1, ТЦ Andalus, 2 этаж",
      en: "Chilonzor district, 16-mavze 10/1, Andalus mall, 2nd floor",
    },
    district: "Chilonzor",
    city: "Toshkent",
    phone: "998946135555",
    hoursOpen: "10:00",
    hoursClose: "23:00",
    yandexMapUrl: "https://yandex.uz/maps/org/button/43328261557/",
  },
  {
    id: "st-mirobod",
    name: { uz: "Button Mirobod", ru: "Button Мирабад", en: "Button Mirobod" },
    address: {
      uz: "Mirobod tumani, Toshkent",
      ru: "Мирабадский район, Ташкент",
      en: "Mirobod district, Tashkent",
    },
    district: "Mirobod",
    city: "Toshkent",
    phone: "998946135555",
    hoursOpen: "10:00",
    hoursClose: "23:00",
  },
  {
    id: "st-beruniy",
    name: { uz: "Button Beruniy", ru: "Button Беруний", en: "Button Beruniy" },
    address: {
      uz: "Beruniy metro bekati yaqinida, Toshkent",
      ru: "Рядом с метро Беруний, Ташкент",
      en: "Near Beruniy metro station, Tashkent",
    },
    district: "Shayxontohur",
    city: "Toshkent",
    phone: "998946135555",
    hoursOpen: "10:00",
    hoursClose: "23:00",
  },
];

/* ── Categories ─────────────────────────────────────────────────────────────
   Deliberately NOT hardcoded as "men's" — the tree must tolerate a women's
   branch later (CLAUDE.md §18). */
export const categories: Category[] = [
  {
    id: "c-outerwear",
    slug: "ust-kiyim",
    name: { uz: "Ustki kiyim", ru: "Верхняя одежда", en: "Outerwear" },
    sortOrder: 1,
  },
  {
    id: "c-shirts",
    slug: "koylaklar",
    name: { uz: "Ko'ylaklar", ru: "Рубашки", en: "Shirts" },
    sortOrder: 2,
  },
  {
    id: "c-knitwear",
    slug: "trikotaj",
    name: { uz: "Sviter va trikotaj", ru: "Свитеры и трикотаж", en: "Knitwear" },
    sortOrder: 3,
  },
  {
    id: "c-trousers",
    slug: "shimlar",
    name: { uz: "Shimlar", ru: "Брюки", en: "Trousers" },
    sortOrder: 4,
  },
  {
    id: "c-jeans",
    slug: "jinsilar",
    name: { uz: "Jinsilar", ru: "Джинсы", en: "Jeans" },
    sortOrder: 5,
  },
  {
    id: "c-shoes",
    slug: "poyabzallar",
    name: { uz: "Poyabzallar", ru: "Обувь", en: "Shoes" },
    sortOrder: 6,
  },
  {
    id: "c-bags",
    slug: "sumkalar",
    name: { uz: "Sumkalar", ru: "Сумки", en: "Bags" },
    sortOrder: 7,
  },
  {
    id: "c-accessories",
    slug: "aksessuarlar",
    name: { uz: "Aksessuarlar", ru: "Аксессуары", en: "Accessories" },
    sortOrder: 8,
  },
];

const TURKEY = { uz: "Turkiya", ru: "Турция", en: "Turkey" };
const CHINA = { uz: "Xitoy", ru: "Китай", en: "China" };

/** Builds size variants of one colour, distributing stock across branches. */
function variants(
  idPrefix: string,
  color: { name: Record<"uz" | "ru" | "en", string>; hex: string },
  sizes: string[],
  quantities: number[],
): Variant[] {
  return sizes.map((size, i) => ({
    id: `${idPrefix}-${size}`,
    colorName: color.name,
    colorHex: color.hex,
    size,
    stock: [
      { storeId: "st-chilonzor", quantity: quantities[i] ?? 0 },
      { storeId: "st-mirobod", quantity: Math.max(0, (quantities[i] ?? 0) - 2) },
      { storeId: "st-beruniy", quantity: Math.max(0, (quantities[i] ?? 0) - 3) },
    ],
  }));
}

const BLACK = { name: { uz: "Qora", ru: "Чёрный", en: "Black" }, hex: "#1A1A1A" };
const NAVY = { name: { uz: "To'q ko'k", ru: "Тёмно-синий", en: "Navy" }, hex: "#1E3A5F" };
const BROWN = { name: { uz: "Jigarrang", ru: "Коричневый", en: "Brown" }, hex: "#8B5E45" };
const TEAL = { name: { uz: "To'q yashil", ru: "Тёмно-зелёный", en: "Teal" }, hex: "#1F4F4A" };
const WHITE = { name: { uz: "Oq", ru: "Белый", en: "White" }, hex: "#FFFFFF" };

export const products: Product[] = [
  {
    id: "p-bomber-black",
    slug: "qora-bomber-kurtka",
    sku: "BTN-OW-101",
    name: {
      uz: "Qora bomber kurtka",
      ru: "Чёрная куртка-бомбер",
      en: "Black bomber jacket",
    },
    description: {
      uz: "Tik yoqali, ko'krak cho'ntakli bomber kurtka. Kuz va bahor uchun yengil va shamol o'tkazmaydi.",
      ru: "Бомбер со стойкой и накладными карманами. Лёгкий и ветронепроницаемый — для осени и весны.",
      en: "Stand-collar bomber with chest pockets. Light and wind-resistant for spring and autumn.",
    },
    categoryId: "c-outerwear",
    basePrice: 690000,
    material: { uz: "100% poliester", ru: "100% полиэстер", en: "100% polyester" },
    origin: TURKEY,
    status: "PUBLISHED",
    isFeatured: true,
    variants: [...variants("bb", BLACK, ["M", "L", "XL", "XXL"], [6, 8, 5, 3])],
    images: imagesFor("qora-bomber-kurtka", "Qora bomber kurtka"),
  },
  {
    id: "p-suede-brown",
    slug: "jigarrang-zamsh-kurtka",
    sku: "BTN-OW-102",
    name: {
      uz: "Jigarrang zamsh kurtka",
      ru: "Коричневая замшевая куртка",
      en: "Brown suede jacket",
    },
    description: {
      uz: "Yumshoq zamsh, ichi issiq astarli. Klassik va kundalik uslubga mos.",
      ru: "Мягкая замша с тёплой подкладкой. Подходит и к классике, и к повседневному стилю.",
      en: "Soft suede with a warm lining. Works with both smart and casual outfits.",
    },
    categoryId: "c-outerwear",
    basePrice: 890000,
    oldPrice: 1090000,
    material: { uz: "Sun'iy zamsh", ru: "Искусственная замша", en: "Faux suede" },
    origin: TURKEY,
    status: "PUBLISHED",
    isFeatured: true,
    variants: [...variants("sb", BROWN, ["M", "L", "XL"], [4, 6, 2])],
    images: imagesFor("jigarrang-zamsh-kurtka", "Jigarrang zamsh kurtka"),
  },
  {
    id: "p-leather-teal",
    slug: "yashil-charm-kurtka",
    sku: "BTN-OW-103",
    name: {
      uz: "To'q yashil charm kurtka",
      ru: "Тёмно-зелёная кожаная куртка",
      en: "Teal leather jacket",
    },
    description: {
      uz: "Yoqali charm kurtka, noodatiy to'q yashil rangda. Trikotaj manjetlar bilan.",
      ru: "Кожаная куртка с воротником в необычном тёмно-зелёном цвете. Трикотажные манжеты.",
      en: "Collared leather jacket in an unusual deep teal, with ribbed cuffs.",
    },
    categoryId: "c-outerwear",
    basePrice: 1290000,
    material: { uz: "Tabiiy charm", ru: "Натуральная кожа", en: "Genuine leather" },
    origin: TURKEY,
    status: "PUBLISHED",
    isFeatured: true,
    variants: [...variants("lt", TEAL, ["M", "L", "XL"], [2, 3, 1])],
    images: imagesFor("yashil-charm-kurtka", "To'q yashil charm kurtka"),
  },
  {
    id: "p-bag-black",
    slug: "qora-charm-sumka",
    sku: "BTN-BG-201",
    name: {
      uz: "Qora charm noutbuk sumkasi",
      ru: "Чёрная кожаная сумка для ноутбука",
      en: "Black leather laptop bag",
    },
    description: {
      uz: "Timsoh naqshli charm sumka. Noutbuk uchun alohida bo'lma va yelka tasmasi bilan.",
      ru: "Сумка из кожи с фактурой крокодила. Отделение для ноутбука и наплечный ремень.",
      en: "Croc-textured leather bag with a padded laptop compartment and shoulder strap.",
    },
    categoryId: "c-bags",
    basePrice: 450000,
    material: { uz: "Sun'iy charm", ru: "Искусственная кожа", en: "Faux leather" },
    origin: CHINA,
    status: "PUBLISHED",
    isFeatured: true,
    variants: [...variants("bgb", BLACK, ["STD"], [9])],
    images: imagesFor("qora-charm-sumka", "Qora charm noutbuk sumkasi"),
  },
  {
    id: "p-bag-navy",
    slug: "kok-charm-sumka",
    sku: "BTN-BG-202",
    name: {
      uz: "To'q ko'k charm noutbuk sumkasi",
      ru: "Тёмно-синяя кожаная сумка для ноутбука",
      en: "Navy leather laptop bag",
    },
    description: {
      uz: "Qora modelning to'q ko'k varianti. Bir xil o'lcham va bo'lmalar.",
      ru: "Тёмно-синий вариант чёрной модели. Те же размеры и отделения.",
      en: "The navy version of the black model — same size and compartments.",
    },
    categoryId: "c-bags",
    basePrice: 450000,
    material: { uz: "Sun'iy charm", ru: "Искусственная кожа", en: "Faux leather" },
    origin: CHINA,
    status: "PUBLISHED",
    isFeatured: true,
    variants: [...variants("bgn", NAVY, ["STD"], [5])],
    images: imagesFor("kok-charm-sumka", "To'q ko'k charm noutbuk sumkasi"),
  },
  {
    id: "p-sneakers-white",
    slug: "oq-krossovka",
    sku: "BTN-SO-301",
    name: {
      uz: "Oq charm krossovka",
      ru: "Белые кожаные кроссовки",
      en: "White leather sneakers",
    },
    description: {
      uz: "Sodda oq krossovka — deyarli har qanday kiyimga mos keladi.",
      ru: "Простые белые кроссовки — сочетаются практически с чем угодно.",
      en: "Clean white sneakers that go with almost anything.",
    },
    categoryId: "c-shoes",
    basePrice: 590000,
    material: { uz: "Charm va tekstil", ru: "Кожа и текстиль", en: "Leather and textile" },
    origin: CHINA,
    status: "PUBLISHED",
    isFeatured: true,
    variants: [
      ...variants("sw", WHITE, ["40", "41", "42", "43", "44"], [3, 5, 6, 4, 2]),
    ],
    images: imagesFor("oq-krossovka", "Oq charm krossovka"),
  },
  {
    id: "p-watch",
    slug: "qol-soati",
    sku: "BTN-AC-401",
    name: {
      uz: "Ko'k tasmali qo'l soati",
      ru: "Часы с синим ремешком",
      en: "Blue-strap wristwatch",
    },
    description: {
      uz: "Charm tasmali, oq siferblatli klassik qo'l soati.",
      ru: "Классические часы с кожаным ремешком и белым циферблатом.",
      en: "Classic wristwatch with a leather strap and white dial.",
    },
    categoryId: "c-accessories",
    basePrice: 320000,
    material: { uz: "Po'lat va charm", ru: "Сталь и кожа", en: "Steel and leather" },
    origin: CHINA,
    status: "PUBLISHED",
    isFeatured: false,
    variants: [...variants("wt", NAVY, ["STD"], [4])],
    images: imagesFor("qol-soati", "Ko'k tasmali qo'l soati"),
  },
  {
    id: "p-shirt-white",
    slug: "klassik-oq-koylak",
    sku: "BTN-SH-001",
    name: {
      uz: "Klassik oq ko'ylak",
      ru: "Классическая белая рубашка",
      en: "Classic white shirt",
    },
    description: {
      uz: "Kundalik va rasmiy kiyinish uchun mos, nafas oluvchi paxta ko'ylak.",
      ru: "Дышащая хлопковая рубашка, подходит и для работы, и на каждый день.",
      en: "Breathable cotton shirt that works for both office and everyday wear.",
    },
    categoryId: "c-shirts",
    basePrice: 289000,
    material: { uz: "100% paxta", ru: "100% хлопок", en: "100% cotton" },
    origin: TURKEY,
    status: "PUBLISHED",
    isFeatured: false,
    // No photo yet — demonstrates the placeholder state stays presentable.
    variants: [...variants("sh", WHITE, ["S", "M", "L", "XL"], [6, 9, 7, 4])],
    images: imagesFor("klassik-oq-koylak", "Klassik oq ko'ylak"),
  },
];

export function getFeaturedProducts(): Product[] {
  return products.filter((p) => p.status === "PUBLISHED" && p.isFeatured);
}

export function getPublishedProducts(): Product[] {
  return products.filter((p) => p.status === "PUBLISHED");
}

export function getProductBySlug(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug && p.status !== "ARCHIVED");
}

/**
 * Catalogue search and filtering.
 *
 * Matches across all three locales plus the SKU, so a Russian-speaking customer
 * browsing the Uzbek site still finds things, and staff can look up an article
 * number directly. Diacritic-insensitive on the apostrophes Uzbek Latin uses —
 * nobody types `o'` consistently.
 *
 * This is the in-memory stand-in for the Postgres `tsvector` search described
 * in CLAUDE.md §5. Same inputs, same outputs; only the implementation changes.
 */
function normalise(value: string): string {
  return value
    .toLowerCase()
    .replace(/[''`ʻʼ]/g, "")
    .trim();
}

export function searchProducts({
  query,
  categorySlug,
  saleOnly,
}: {
  query?: string;
  categorySlug?: string;
  saleOnly?: boolean;
}): Product[] {
  let result = getPublishedProducts();

  if (categorySlug) {
    const category = categories.find((c) => c.slug === categorySlug);
    if (!category) return [];
    result = result.filter((p) => p.categoryId === category.id);
  }

  // "On sale" is derived, not a flag: an item is discounted when it has an
  // oldPrice above the current price. One less thing for staff to keep in sync.
  if (saleOnly) {
    result = result.filter((p) => p.oldPrice && p.oldPrice > p.basePrice);
  }

  const q = query ? normalise(query) : "";
  if (!q) return result;

  return result.filter((product) => {
    const haystack = [
      ...Object.values(product.name),
      ...Object.values(product.description ?? {}),
      product.sku,
    ]
      .map(normalise)
      .join(" ");
    // Every whitespace-separated term must appear somewhere.
    return q.split(/\s+/).every((term) => haystack.includes(term));
  });
}

export function getCategoryBySlug(slug: string): Category | undefined {
  return categories.find((c) => c.slug === slug);
}

export function getCategoryById(id: string): Category | undefined {
  return categories.find((c) => c.id === id);
}

export function getStoreById(id: string): Store | undefined {
  return stores.find((s) => s.id === id);
}
