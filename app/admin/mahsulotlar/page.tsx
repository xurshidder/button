import { revalidatePath } from "next/cache";
import Link from "next/link";
import { redirect } from "next/navigation";

import { ProductRow } from "@/components/admin/ProductRow";
import { isAuthenticated } from "@/lib/admin-auth";
import { getProductsForAdmin, updateProduct } from "@/lib/services/admin";

/** Always fresh: it shows what is currently in the database. */
export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  if (!(await isAuthenticated())) redirect("/admin");

  const products = await getProductsForAdmin();

  /**
   * Server Action: auth check → Zod parse → service → revalidate
   * (CLAUDE.md §10). The auth check is repeated here rather than trusted from
   * the page render — a Server Action is its own entry point and can be
   * invoked directly, so it must not assume the page guarded it.
   */
  async function save(formData: FormData) {
    "use server";

    if (!(await isAuthenticated())) return { error: "Sessiya tugagan" };

    const rawOld = String(formData.get("oldPrice") ?? "").trim();

    try {
      await updateProduct({
        id: String(formData.get("id") ?? ""),
        basePrice: Number(formData.get("basePrice")),
        oldPrice: rawOld === "" ? null : Number(rawOld),
        status: String(formData.get("status") ?? "DRAFT"),
        isFeatured: formData.get("isFeatured") === "on",
      });
    } catch (error) {
      // Zod messages are already written for staff, in Uzbek.
      const message =
        error instanceof Error ? error.message : "Saqlashda xatolik";
      try {
        const parsed: unknown = JSON.parse(message);
        if (Array.isArray(parsed) && parsed[0]?.message) {
          return { error: String(parsed[0].message) };
        }
      } catch {
        /* Not a Zod error payload — fall through to the raw message. */
      }
      return { error: message };
    }

    // The storefront is prerendered, so an edit means nothing until its cache
    // is dropped (CLAUDE.md §21.2).
    revalidatePath("/", "layout");
    return {};
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <div className="flex flex-wrap items-baseline justify-between gap-4">
        <h1 className="text-xl font-bold text-fg">Mahsulotlar</h1>
        <nav className="flex gap-4 text-sm">
          <Link
            href="/admin/rasmlar"
            className="text-fg-muted underline-offset-4 hover:text-fg hover:underline"
          >
            Rasmlar
          </Link>
          <Link
            href="/admin/ombor"
            className="text-fg-muted underline-offset-4 hover:text-fg hover:underline"
          >
            Ombor
          </Link>
        </nav>
      </div>

      <p className="mt-2 text-sm text-fg-muted">
        Narx, holat va bosh sahifada ko&apos;rsatishni o&apos;zgartiring.
        O&apos;zgarishlar saytda darhol ko&apos;rinadi.
      </p>

      <div className="mt-6 flex flex-col gap-px bg-border">
        {products.map((product) => (
          <ProductRow
            key={product.id}
            action={save}
            product={{
              id: product.id,
              slug: product.slug,
              sku: product.sku,
              name: product.nameUz,
              category: product.category.nameUz,
              basePrice: product.basePrice,
              oldPrice: product.oldPrice,
              status: product.status,
              isFeatured: product.isFeatured,
              imageUrl: product.images[0]?.url,
              variantCount: product._count.variants,
            }}
          />
        ))}
      </div>
    </main>
  );
}
