import path from "node:path";

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { config as loadEnv } from "dotenv";

loadEnv({ path: path.join(process.cwd(), ".env.local"), quiet: true });

import { categories, products, stores } from "../lib/mock-data";

/**
 * Seeds the catalogue.
 *
 * Uses the DIRECT connection: seeding is a bulk write from one process, so it
 * gains nothing from the pooler and avoids competing with it.
 *
 * Every write is an upsert keyed on a stable natural key (slug, sku, or the
 * variant's product+colour+size). That makes the script safe to re-run — it
 * updates in place rather than duplicating, so it can be used to push catalogue
 * corrections, not just to initialise an empty database.
 */
const prisma = new PrismaClient({
  // Prisma 7 supplies the runtime connection through a driver adapter.
  adapter: new PrismaPg({ connectionString: process.env.DIRECT_URL }),
});

/** Store ids in the seed data are slugs like "st-chilonzor"; map to real ids. */
const storeIdByKey = new Map<string, string>();

async function seedStores() {
  for (const [i, store] of stores.entries()) {
    const record = await prisma.store.upsert({
      // The seed's own id doubles as the natural key.
      where: { id: store.id },
      create: {
        id: store.id,
        nameUz: store.name.uz,
        nameRu: store.name.ru,
        nameEn: store.name.en,
        addressUz: store.address.uz,
        addressRu: store.address.ru,
        addressEn: store.address.en,
        district: store.district,
        city: store.city,
        phone: store.phone,
        hoursOpen: store.hoursOpen,
        hoursClose: store.hoursClose,
        yandexMapUrl: store.yandexMapUrl,
        sortOrder: i,
      },
      update: {
        nameUz: store.name.uz,
        nameRu: store.name.ru,
        nameEn: store.name.en,
        addressUz: store.address.uz,
        addressRu: store.address.ru,
        addressEn: store.address.en,
        district: store.district,
        city: store.city,
        phone: store.phone,
        hoursOpen: store.hoursOpen,
        hoursClose: store.hoursClose,
        yandexMapUrl: store.yandexMapUrl,
        sortOrder: i,
      },
    });
    storeIdByKey.set(store.id, record.id);
  }
  console.log(`stores      : ${stores.length}`);
}

const categoryIdByKey = new Map<string, string>();

async function seedCategories() {
  for (const category of categories) {
    const record = await prisma.category.upsert({
      where: { slug: category.slug },
      create: {
        slug: category.slug,
        nameUz: category.name.uz,
        nameRu: category.name.ru,
        nameEn: category.name.en,
        sortOrder: category.sortOrder,
      },
      update: {
        nameUz: category.name.uz,
        nameRu: category.name.ru,
        nameEn: category.name.en,
        sortOrder: category.sortOrder,
      },
    });
    categoryIdByKey.set(category.id, record.id);
  }
  console.log(`categories  : ${categories.length}`);
}

async function seedProducts() {
  let variantCount = 0;
  let stockCount = 0;
  let imageCount = 0;

  for (const product of products) {
    const categoryId = categoryIdByKey.get(product.categoryId);
    if (!categoryId) {
      throw new Error(
        `Product ${product.slug} references unknown category ${product.categoryId}`,
      );
    }

    const fields = {
      sku: product.sku,
      nameUz: product.name.uz,
      nameRu: product.name.ru,
      nameEn: product.name.en,
      descUz: product.description?.uz,
      descRu: product.description?.ru,
      descEn: product.description?.en,
      categoryId,
      basePrice: product.basePrice,
      oldPrice: product.oldPrice,
      materialUz: product.material?.uz,
      materialRu: product.material?.ru,
      materialEn: product.material?.en,
      originUz: product.origin?.uz,
      originRu: product.origin?.ru,
      originEn: product.origin?.en,
      status: product.status,
      isFeatured: product.isFeatured,
    };

    const record = await prisma.product.upsert({
      where: { slug: product.slug },
      create: { slug: product.slug, ...fields },
      update: fields,
    });

    for (const variant of product.variants) {
      const variantRecord = await prisma.variant.upsert({
        where: {
          productId_colorNameUz_size: {
            productId: record.id,
            colorNameUz: variant.colorName.uz,
            size: variant.size,
          },
        },
        create: {
          productId: record.id,
          colorNameUz: variant.colorName.uz,
          colorNameRu: variant.colorName.ru,
          colorNameEn: variant.colorName.en,
          colorHex: variant.colorHex,
          size: variant.size,
          priceOverride: variant.priceOverride,
        },
        update: {
          colorNameRu: variant.colorName.ru,
          colorNameEn: variant.colorName.en,
          colorHex: variant.colorHex,
          priceOverride: variant.priceOverride,
        },
      });
      variantCount += 1;

      for (const level of variant.stock) {
        const storeId = storeIdByKey.get(level.storeId);
        if (!storeId) continue;

        await prisma.stockLevel.upsert({
          where: {
            variantId_storeId: { variantId: variantRecord.id, storeId },
          },
          create: {
            variantId: variantRecord.id,
            storeId,
            quantity: level.quantity,
          },
          update: { quantity: level.quantity },
        });
        stockCount += 1;
      }
    }

    /*
     * Images are replaced wholesale rather than upserted: they are discovered
     * from the filesystem, so the folder is the source of truth and a deleted
     * file should disappear from the database too.
     */
    await prisma.productImage.deleteMany({ where: { productId: record.id } });
    if (product.images.length > 0) {
      await prisma.productImage.createMany({
        data: product.images.map((image, i) => ({
          productId: record.id,
          url: image.url,
          altUz: image.alt,
          colorName: image.colorName,
          sortOrder: i,
        })),
      });
      imageCount += product.images.length;
    }
  }

  console.log(`products    : ${products.length}`);
  console.log(`variants    : ${variantCount}`);
  console.log(`stock rows  : ${stockCount}`);
  console.log(`images      : ${imageCount}`);
}

async function main() {
  console.log("seeding Button catalogue…\n");
  await seedStores();
  await seedCategories();
  await seedProducts();
  console.log("\ndone.");
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
