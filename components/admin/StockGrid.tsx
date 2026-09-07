"use client";

import { useState, useTransition } from "react";

interface Variant {
  id: string;
  size: string;
  colorNameUz: string;
  stock: { storeId: string; quantity: number }[];
}

interface StockGridProps {
  stores: { id: string; nameUz: string }[];
  product: { id: string; nameUz: string; variants: Variant[] };
  action: (formData: FormData) => Promise<{ error?: string } | void>;
}

/**
 * One cell of the branch × variant stock matrix.
 *
 * Saves on blur rather than behind a button. This screen is used by a manager
 * standing in the shop counting garments on a phone (CLAUDE.md §13) — a save
 * button per cell would mean dozens of taps, and one save button for the whole
 * grid would lose everything on a dropped connection. Blur is the moment the
 * number is finished.
 */
function StockCell({
  variantId,
  storeId,
  initial,
  action,
}: {
  variantId: string;
  storeId: string;
  initial: number;
  action: StockGridProps["action"];
}) {
  const [value, setValue] = useState(String(initial));
  const [saved, setSaved] = useState(initial);
  const [pending, startTransition] = useTransition();
  const [failed, setFailed] = useState(false);

  function commit() {
    const quantity = Number(value);
    if (!Number.isInteger(quantity) || quantity < 0) {
      setValue(String(saved));
      return;
    }
    if (quantity === saved) return;

    const formData = new FormData();
    formData.set("variantId", variantId);
    formData.set("storeId", storeId);
    formData.set("quantity", String(quantity));

    startTransition(async () => {
      const result = await action(formData);
      if (result && "error" in result && result.error) {
        // Put the old number back rather than leaving a value on screen that
        // is not in the database.
        setFailed(true);
        setValue(String(saved));
        setTimeout(() => setFailed(false), 2500);
        return;
      }
      setSaved(quantity);
    });
  }

  return (
    <input
      type="number"
      min={0}
      inputMode="numeric"
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === "Enter") e.currentTarget.blur();
      }}
      disabled={pending}
      aria-label="Miqdor"
      className={`tabular w-full min-w-14 border bg-bg px-2 py-2.5 text-center text-sm outline-none transition-colors focus:border-brand ${
        failed
          ? "border-sale"
          : Number(value) === 0
            ? "border-border text-fg-disabled"
            : "border-border text-fg"
      }`}
    />
  );
}

export function StockGrid({ stores, product, action }: StockGridProps) {
  if (product.variants.length === 0) return null;

  return (
    <section className="bg-bg p-4">
      <h2 className="text-sm font-bold text-fg">{product.nameUz}</h2>

      <div className="mt-3 overflow-x-auto">
        <table className="w-full min-w-[420px] border-collapse text-sm">
          <thead>
            <tr>
              <th className="border-b border-border py-2 pr-3 text-left text-xs font-medium uppercase tracking-[0.06em] text-fg-muted">
                Variant
              </th>
              {stores.map((store) => (
                <th
                  key={store.id}
                  className="border-b border-border px-1.5 py-2 text-center text-xs font-medium uppercase tracking-[0.06em] text-fg-muted"
                >
                  {store.nameUz.replace(/^Button\s+/, "")}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {product.variants.map((variant) => (
              <tr key={variant.id}>
                <td className="whitespace-nowrap border-b border-border py-1.5 pr-3 text-fg">
                  <span className="tabular font-medium">{variant.size}</span>
                  <span className="ml-2 text-xs text-fg-muted">
                    {variant.colorNameUz}
                  </span>
                </td>
                {stores.map((store) => (
                  <td
                    key={store.id}
                    className="border-b border-border px-1.5 py-1.5"
                  >
                    <StockCell
                      variantId={variant.id}
                      storeId={store.id}
                      initial={
                        variant.stock.find((s) => s.storeId === store.id)
                          ?.quantity ?? 0
                      }
                      action={action}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
