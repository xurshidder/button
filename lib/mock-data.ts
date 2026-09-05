import type { Category, Product, Store, Variant } from "@/lib/types";

/**
 * Seed catalogue for design review and local development.
 *
 * WHY THIS EXISTS: every screen must work before a single external account is
 * provisioned (CLAUDE.md §22). The shapes here are identical to the Prisma
 * models, so swapping in real queries changes the data source only.
 *
 * ⚠ PLACEHOLDER CONTENT. Product names and prices are plausible for this market
 * but are NOT Button's real catalogue — see client ask #7 in CLAUDE.md §17.
 * Store data below IS real and publicly sourced.
 */

/* ── Stores ─────────────────────────────────────────────────────────────────
   Real, from Yandex Maps / GoldenPages. The full branch list is still pending
   confirmation from the client (CLAUDE.md §17 ask #3). */
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
   Modelled on Terra Pro's tree (CLAUDE.md §2), trimmed to what Button visibly
   sells. Deliberately NOT hardcoded as "men's" — the tree must tolerate a
   women's branch later (CLAUDE.md §18). */
export const categories: Category[] = [
  {
    id: "c-shirts",
    slug: "koylaklar",
    name: { uz: "Ko'ylaklar", ru: "Рубашки", en: "Shirts" },
    sortOrder: 1,
  },
  {
    id: "c-tshirts",
    slug: "futbolkalar",
    name: { uz: "Futbolka va polo", ru: "Футболки и поло", en: "T-shirts & polo" },
    sortOrder: 2,
  },
  {
    id: "c-trousers",
    slug: "shimlar",
    name: { uz: "Shimlar", ru: "Брюки", en: "Trousers" },
    sortOrder: 3,
  },
  {
    id: "c-jeans",
    slug: "jinsilar",
    name: { uz: "Jinsilar", ru: "Джинсы", en: "Jeans" },
    sortOrder: 4,
  },
  {
    id: "c-outerwear",
    slug: "ust-kiyim",
    name: { uz: "Ustki kiyim", ru: "Верхняя одежда", en: "Outerwear" },
    sortOrder: 5,
  },
  {
    id: "c-knitwear",
    slug: "trikotaj",
    name: { uz: "Sviter va trikotaj", ru: "Свитеры и трикотаж", en: "Knitwear" },
    sortOrder: 6,
  },
  {
    id: "c-shoes",
    slug: "poyabzallar",
    name: { uz: "Poyabzallar", ru: "Обувь", en: "Shoes" },
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

const WHITE = { name: { uz: "Oq", ru: "Белый", en: "White" }, hex: "#FFFFFF" };
const BLACK = { name: { uz: "Qora", ru: "Чёрный", en: "Black" }, hex: "#1A1A1A" };
const NAVY = { name: { uz: "To'q ko'k", ru: "Тёмно-синий", en: "Navy" }, hex: "#1E3A5F" };
const BEIGE = { name: { uz: "Bej", ru: "Бежевый", en: "Beige" }, hex: "#D6C7B0" };
const GREY = { name: { uz: "Kulrang", ru: "Серый", en: "Grey" }, hex: "#8A8A8A" };

export const products: Product[] = [
  {
    id: "p-1",
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
    isFeatured: true,
    variants: [
      ...variants("p1-w", WHITE, ["S", "M", "L", "XL"], [6, 9, 7, 4]),
      ...variants("p1-b", NAVY, ["M", "L", "XL"], [3, 5, 2]),
    ],
    images: [],
  },
  {
    id: "p-2",
    slug: "oversize-futbolka",
    sku: "BTN-TS-014",
    name: {
      uz: "Oversize futbolka",
      ru: "Футболка оверсайз",
      en: "Oversize t-shirt",
    },
    description: {
      uz: "Zich trikotajdan tikilgan, shaklini yo'qotmaydigan erkin bichimli futbolka.",
      ru: "Плотный трикотаж, свободный крой, держит форму после стирки.",
      en: "Heavyweight jersey with a relaxed cut that holds its shape.",
    },
    categoryId: "c-tshirts",
    basePrice: 139000,
    oldPrice: 179000,
    material: { uz: "95% paxta, 5% elastan", ru: "95% хлопок, 5% эластан", en: "95% cotton, 5% elastane" },
    origin: CHINA,
    status: "PUBLISHED",
    isFeatured: true,
    variants: [
      ...variants("p2-b", BLACK, ["S", "M", "L", "XL", "XXL"], [10, 14, 12, 8, 5]),
      ...variants("p2-w", WHITE, ["M", "L", "XL"], [7, 9, 6]),
    ],
    images: [],
  },
  {
    id: "p-3",
    slug: "toq-kok-jinsi-shim",
    sku: "BTN-JN-032",
    name: {
      uz: "To'q ko'k jinsi shim",
      ru: "Тёмно-синие джинсы",
      en: "Dark blue jeans",
    },
    description: {
      uz: "To'g'ri bichimli, o'rta belli klassik jinsi shim.",
      ru: "Прямой крой, средняя посадка — классические джинсы.",
      en: "Straight cut, mid-rise — a classic pair of jeans.",
    },
    categoryId: "c-jeans",
    basePrice: 379000,
    material: { uz: "98% paxta, 2% elastan", ru: "98% хлопок, 2% эластан", en: "98% cotton, 2% elastane" },
    origin: TURKEY,
    status: "PUBLISHED",
    isFeatured: true,
    variants: [...variants("p3-n", NAVY, ["30", "32", "34", "36"], [5, 8, 6, 3])],
    images: [],
  },
  {
    id: "p-4",
    slug: "bej-vetrovka",
    sku: "BTN-OW-007",
    name: {
      uz: "Bej vetrovka",
      ru: "Бежевая ветровка",
      en: "Beige windbreaker",
    },
    description: {
      uz: "Yengil, shamol o'tkazmaydigan, kuz va bahor uchun ideal.",
      ru: "Лёгкая, ветронепроницаемая — идеально для осени и весны.",
      en: "Light and wind-resistant — ideal for spring and autumn.",
    },
    categoryId: "c-outerwear",
    basePrice: 690000,
    oldPrice: 850000,
    material: { uz: "100% poliester", ru: "100% полиэстер", en: "100% polyester" },
    origin: TURKEY,
    status: "PUBLISHED",
    isFeatured: true,
    variants: [...variants("p4-be", BEIGE, ["M", "L", "XL"], [2, 3, 1])],
    images: [],
  },
  {
    id: "p-5",
    slug: "kulrang-sviter",
    sku: "BTN-KN-021",
    name: {
      uz: "Kulrang sviter",
      ru: "Серый свитер",
      en: "Grey sweater",
    },
    description: {
      uz: "Yumshoq trikotaj, sovuq kunlar uchun qulay va issiq.",
      ru: "Мягкий трикотаж, тёплый и комфортный в холодные дни.",
      en: "Soft knit — warm and comfortable on cold days.",
    },
    categoryId: "c-knitwear",
    basePrice: 259000,
    material: { uz: "70% akril, 30% jun", ru: "70% акрил, 30% шерсть", en: "70% acrylic, 30% wool" },
    origin: CHINA,
    status: "PUBLISHED",
    isFeatured: false,
    variants: [...variants("p5-g", GREY, ["M", "L", "XL"], [4, 6, 3])],
    images: [],
  },
  {
    id: "p-6",
    slug: "klassik-charm-tufli",
    sku: "BTN-SO-003",
    name: {
      uz: "Klassik charm tufli",
      ru: "Классические кожаные туфли",
      en: "Classic leather oxfords",
    },
    description: {
      uz: "Tabiiy charmdan, rasmiy tadbirlar va kundalik ish uchun.",
      ru: "Натуральная кожа — для работы и торжественных случаев.",
      en: "Genuine leather — for the office and formal occasions.",
    },
    categoryId: "c-shoes",
    basePrice: 590000,
    material: { uz: "Tabiiy charm", ru: "Натуральная кожа", en: "Genuine leather" },
    origin: TURKEY,
    status: "PUBLISHED",
    isFeatured: false,
    variants: [...variants("p6-bl", BLACK, ["40", "41", "42", "43", "44"], [2, 4, 5, 3, 1])],
    images: [],
  },
  {
    id: "p-7",
    slug: "qora-klassik-shim",
    sku: "BTN-TR-018",
    name: {
      uz: "Qora klassik shim",
      ru: "Чёрные классические брюки",
      en: "Black dress trousers",
    },
    description: {
      uz: "Ofis uchun mos, bejirim bichimli klassik shim.",
      ru: "Аккуратный крой, подходит для офиса.",
      en: "Neatly cut trousers suited to the office.",
    },
    categoryId: "c-trousers",
    basePrice: 319000,
    material: { uz: "65% poliester, 35% viskoza", ru: "65% полиэстер, 35% вискоза", en: "65% polyester, 35% viscose" },
    origin: TURKEY,
    status: "PUBLISHED",
    isFeatured: false,
    variants: [...variants("p7-bl", BLACK, ["46", "48", "50", "52"], [3, 5, 4, 2])],
    images: [],
  },
  {
    id: "p-8",
    slug: "charm-kamar",
    sku: "BTN-AC-045",
    name: { uz: "Charm kamar", ru: "Кожаный ремень", en: "Leather belt" },
    description: {
      uz: "Klassik to'qali, tabiiy charm kamar.",
      ru: "Натуральная кожа, классическая пряжка.",
      en: "Genuine leather with a classic buckle.",
    },
    categoryId: "c-accessories",
    basePrice: 119000,
    material: { uz: "Tabiiy charm", ru: "Натуральная кожа", en: "Genuine leather" },
    origin: CHINA,
    status: "PUBLISHED",
    isFeatured: false,
    // Deliberately out of stock everywhere, so the OUT_OF_STOCK state is
    // visible during design review.
    variants: [...variants("p8-bl", BLACK, ["105", "110", "115"], [0, 0, 0])],
    images: [],
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

export function getCategoryById(id: string): Category | undefined {
  return categories.find((c) => c.id === id);
}

export function getStoreById(id: string): Store | undefined {
  return stores.find((s) => s.id === id);
}
