import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";

import { UploadForm } from "@/components/admin/UploadForm";
import { endSession, isAuthenticated } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";

/** Never cached: it shows what is currently uploaded. */
export const dynamic = "force-dynamic";

export default async function AdminImagesPage() {
  if (!(await isAuthenticated())) redirect("/admin");

  const [products, hero] = await Promise.all([
    prisma.product.findMany({
      orderBy: { nameUz: "asc" },
      select: {
        slug: true,
        nameUz: true,
        images: { orderBy: { sortOrder: "asc" }, select: { id: true, url: true } },
      },
    }),
    prisma.siteSetting.findUnique({ where: { key: "heroImage" } }),
  ]);

  async function logout() {
    "use server";
    await endSession();
    redirect("/admin");
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <div className="flex items-baseline justify-between gap-4">
        <h1 className="text-xl font-bold text-fg">Rasmlar</h1>
        <form action={logout}>
          <button
            type="submit"
            className="text-sm text-fg-muted underline-offset-4 hover:text-fg hover:underline"
          >
            Chiqish
          </button>
        </form>
      </div>

      <section className="mt-6 rounded-2xl bg-bg p-6">
        <UploadForm
          slugs={products.map((p) => ({
            slug: p.slug,
            name: p.nameUz,
            imageCount: p.images.length,
          }))}
        />
      </section>

      <section className="mt-8">
        <h2 className="text-sm font-semibold text-fg">Bosh sahifa rasmi</h2>
        {hero ? (
          <div className="relative mt-3 aspect-[21/9] w-full overflow-hidden rounded-xl bg-surface">
            <Image
              src={hero.value}
              alt=""
              fill
              sizes="(max-width: 900px) 100vw, 900px"
              className="object-cover"
            />
          </div>
        ) : (
          <p className="mt-2 text-sm text-fg-muted">
            Hali yuklanmagan — hozircha fayldagi rasm ishlatilmoqda.
          </p>
        )}
      </section>

      <section className="mt-10">
        <h2 className="text-sm font-semibold text-fg">Mahsulot rasmlari</h2>
        <ul className="mt-3 divide-y divide-border rounded-xl bg-bg">
          {products.map((product) => (
            <li
              key={product.slug}
              className="flex items-center gap-4 px-4 py-3"
            >
              <div className="relative size-14 shrink-0 overflow-hidden rounded-lg bg-surface">
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
