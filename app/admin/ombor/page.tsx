import { revalidatePath } from "next/cache";
import Link from "next/link";
import { redirect } from "next/navigation";

import { StockGrid } from "@/components/admin/StockGrid";
import { isAuthenticated } from "@/lib/admin-auth";
import { getStockMatrix, updateStock } from "@/lib/services/admin";

export const dynamic = "force-dynamic";

export default async function AdminStockPage() {
  if (!(await isAuthenticated())) redirect("/admin");

  const { stores, products } = await getStockMatrix();

  /**
   * Server Action: auth → Zod parse → service → revalidate (CLAUDE.md §10).
   *
   * Re-checks authorisation because a Server Action is its own entry point;
   * it cannot assume the page that rendered the form did the checking.
   *
   * NOTE for when per-staff accounts land (§11): a MANAGER is scoped to one
   * branch, so this must then verify the submitted storeId belongs to them.
   * Today the shared login has full access, so there is nothing to scope yet.
   */
  async function save(formData: FormData) {
    "use server";

    if (!(await isAuthenticated())) return { error: "Sessiya tugagan" };

    try {
      await updateStock({
        variantId: String(formData.get("variantId") ?? ""),
        storeId: String(formData.get("storeId") ?? ""),
        quantity: Number(formData.get("quantity")),
      });
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : "Saqlashda xatolik",
      };
    }

    // Per-branch stock is rendered on product pages, which are prerendered.
    revalidatePath("/", "layout");
    return {};
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <div className="flex flex-wrap items-baseline justify-between gap-4">
        <h1 className="text-xl font-bold text-fg">Ombor</h1>
        <nav className="flex gap-4 text-sm">
          <Link
            href="/admin/mahsulotlar"
            className="text-fg-muted underline-offset-4 hover:text-fg hover:underline"
          >
            Mahsulotlar
          </Link>
          <Link
            href="/admin/rasmlar"
            className="text-fg-muted underline-offset-4 hover:text-fg hover:underline"
          >
            Rasmlar
          </Link>
        </nav>
      </div>

      <p className="mt-2 text-sm text-fg-muted">
        Har bir do&apos;kon uchun miqdorni kiriting. Raqamni yozib, boshqa
        joyga bosing — avtomatik saqlanadi.
      </p>

      <div className="mt-6 flex flex-col gap-px bg-border">
        {products.map((product) => (
          <StockGrid
            key={product.id}
            stores={stores}
            product={product}
            action={save}
          />
        ))}
      </div>
    </main>
  );
}
