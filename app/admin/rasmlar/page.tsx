import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";

import { UploadForm } from "@/components/admin/UploadForm";
import { endSession, isAuthenticated } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";
import {
  CAMPAIGN_SLOTS,
  getCampaignImageUrls,
  getHeroImageUrl,
} from "@/lib/services/media";

/** Never cached: it shows what is currently uploaded. */
export const dynamic = "force-dynamic";

/** Small labelled preview frame. */
function Slot({
  label,
  src,
  ratio,
}: {
  label: string;
  src?: string;
  ratio: string;
}) {
  return (
    <div>
      <div className={`relative ${ratio} w-full overflow-hidden bg-surface`}>
        {src ? (
          <Image src={src} alt="" fill sizes="220px" className="object-cover" />
        ) : (
          <div className="flex size-full items-center justify-center text-[11px] text-fg-disabled">
            yo&apos;q
          </div>
        )}
      </div>
      <p className="mt-1.5 text-xs text-fg-muted">{label}</p>
    </div>
  );
}

export default async function AdminImagesPage() {
  if (!(await isAuthenticated())) redirect("/admin");

  const [products, categories, hero, campaign] = await Promise.all([
    prisma.product.findMany({
      orderBy: { nameUz: "asc" },
      select: {
        slug: true,
        nameUz: true,
        images: { orderBy: { sortOrder: "asc" }, select: { url: true } },
      },
    }),
    prisma.category.findMany({
      orderBy: { sortOrder: "asc" },
      select: { slug: true, nameUz: true, imageUrl: true },
    }),
    getHeroImageUrl(),
    getCampaignImageUrls(),
  ]);

  async function logout() {
    "use server";
    await endSession();
    redirect("/admin");
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <div className="flex flex-wrap items-baseline justify-between gap-4">
        <h1 className="text-xl font-bold text-fg">Rasmlar</h1>
        <nav className="flex gap-4 text-sm">
          <Link
            href="/admin/mahsulotlar"
            className="text-fg-muted underline-offset-4 hover:text-fg hover:underline"
          >
            Mahsulotlar
          </Link>
          <Link
            href="/admin/ombor"
            className="text-fg-muted underline-offset-4 hover:text-fg hover:underline"
          >
            Ombor
          </Link>
          <form action={logout}>
            <button
              type="submit"
              className="text-fg-muted underline-offset-4 hover:text-fg hover:underline"
            >
              Chiqish
            </button>
          </form>
        </nav>
      </div>

      <p className="mt-2 text-sm text-fg-muted">
        Saytdagi barcha rasmlarni shu yerdan almashtirish mumkin.
      </p>

      <section className="mt-6 bg-bg p-6">
        <UploadForm
          products={products.map((p) => ({
            slug: p.slug,
            name: p.nameUz,
            imageCount: p.images.length,
          }))}
          categories={categories.map((c) => ({
            slug: c.slug,
            name: c.nameUz,
            hasImage: Boolean(c.imageUrl),
          }))}
          campaignSlots={CAMPAIGN_SLOTS}
        />
      </section>

      <section className="mt-10">
        <h2 className="text-sm font-semibold text-fg">Bosh sahifa</h2>
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
          <Slot label="Bosh rasm" src={hero} ratio="aspect-[16/9]" />
          {campaign.map((src, i) => (
            <Slot
              key={i}
              label={i === 0 ? "Kolleksiya 1 (katta)" : `Kolleksiya ${i + 1}`}
              src={src}
              ratio={i === 0 ? "aspect-[4/5]" : "aspect-square"}
            />
          ))}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-sm font-semibold text-fg">Kategoriyalar</h2>
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {categories.map((category) => (
            <Slot
              key={category.slug}
              label={category.nameUz}
              src={category.imageUrl ?? undefined}
              ratio="aspect-[3/4]"
            />
          ))}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-sm font-semibold text-fg">Mahsulotlar</h2>
        <ul className="mt-3 divide-y divide-border bg-bg">
          {products.map((product) => (
            <li key={product.slug} className="flex items-center gap-4 px-4 py-3">
              <div className="relative size-14 shrink-0 overflow-hidden bg-surface">
                {product.images[0] ? (
                  <Image
                    src={product.images[0].url}
                    alt=""
                    fill
                    sizes="56px"
                    className="object-cover"
                  />
                ) : null}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm text-fg">{product.nameUz}</p>
                <p className="text-xs text-fg-muted">
                  {product.images.length > 0
                    ? `${product.images.length} ta rasm`
                    : "Rasm yo'q"}
                </p>
              </div>
              <Link
                href={`/uz/mahsulot/${product.slug}`}
                target="_blank"
                className="shrink-0 text-xs text-fg-muted underline-offset-4 hover:text-fg hover:underline"
              >
                Ko&apos;rish
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
