"use client";

import Image from "next/image";
import { useState, useTransition } from "react";

import { formatSoum } from "@/lib/format";

export interface AdminProduct {
  id: string;
  slug: string;
  sku: string;
  name: string;
  category: string;
  basePrice: number;
  oldPrice: number | null;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  isFeatured: boolean;
  imageUrl?: string;
  variantCount: number;
}

interface ProductRowProps {
  product: AdminProduct;
  action: (formData: FormData) => Promise<{ error?: string } | void>;
}

const STATUS_LABEL: Record<AdminProduct["status"], string> = {
  DRAFT: "Qoralama",
  PUBLISHED: "Sotuvda",
  ARCHIVED: "Arxivda",
};

/**
 * One editable product row.
 *
 * Saves only on submit rather than on every keystroke: a price is a
 * consequential field, and autosaving one mid-typing would briefly publish
 * "6" for "690000". The row shows a dirty state so it is obvious what has not
 * been saved yet.
 */
export function ProductRow({ product, action }: ProductRowProps) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [dirty, setDirty] = useState(false);

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setError(null);
    startTransition(async () => {
      const result = await action(formData);
      if (result && "error" in result && result.error) {
        setError(result.error);
        return;
      }
      setDirty(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    });
  }

  return (
    <form
      onSubmit={onSubmit}
      onChange={() => {
        setDirty(true);
        setSaved(false);
      }}
      className="flex flex-col gap-3 bg-bg p-4 sm:flex-row sm:items-center sm:gap-4"
    >
      <input type="hidden" name="id" value={product.id} />

      <div className="flex min-w-0 flex-1 items-center gap-3">
        <div className="relative size-12 shrink-0 overflow-hidden bg-surface">
          {product.imageUrl ? (
            <Image
              src={product.imageUrl}
              alt=""
              fill
              sizes="48px"
              className="object-cover"
            />
          ) : null}
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-fg">
            {product.name}
          </p>
          <p className="truncate text-xs text-fg-muted">
            {product.sku} · {product.category} · {product.variantCount} variant
          </p>
        </div>
      </div>

      <label className="flex items-center gap-2">
        <span className="w-16 shrink-0 text-xs text-fg-muted sm:sr-only">
          Narx
        </span>
        <input
          name="basePrice"
          type="number"
          min={0}
          step={1000}
          defaultValue={product.basePrice}
          required
          className="tabular w-32 border border-border bg-bg px-2.5 py-2 text-sm outline-none focus:border-brand"
        />
      </label>

      <label className="flex items-center gap-2">
        <span className="w-16 shrink-0 text-xs text-fg-muted sm:sr-only">
          Eski narx
        </span>
        <input
          name="oldPrice"
          type="number"
          min={0}
          step={1000}
          defaultValue={product.oldPrice ?? ""}
          placeholder="—"
          className="tabular w-32 border border-border bg-bg px-2.5 py-2 text-sm outline-none focus:border-brand"
        />
      </label>

      <select
        name="status"
        defaultValue={product.status}
        className="border border-border bg-bg px-2.5 py-2 text-sm outline-none focus:border-brand"
      >
        {(Object.keys(STATUS_LABEL) as AdminProduct["status"][]).map((value) => (
          <option key={value} value={value}>
            {STATUS_LABEL[value]}
          </option>
        ))}
      </select>

      <label className="flex items-center gap-2 text-xs text-fg-muted">
        <input
          name="isFeatured"
          type="checkbox"
          defaultChecked={product.isFeatured}
          className="size-4 accent-[var(--brand)]"
        />
        Bosh sahifada
      </label>

      <div className="flex items-center gap-2">
        <button
          type="submit"
          disabled={pending || !dirty}
          className="shrink-0 border border-fg px-4 py-2 text-xs font-bold text-fg transition hover:bg-fg hover:text-bg disabled:border-border disabled:text-fg-disabled disabled:hover:bg-transparent"
        >
          {pending ? "…" : "Saqlash"}
        </button>
        {saved ? (
          <span className="text-xs text-in-stock">Saqlandi</span>
        ) : null}
      </div>

      {error ? (
        <p role="alert" className="text-xs text-sale sm:w-full">
          {error}
        </p>
      ) : (
        <p className="tabular text-xs text-fg-muted sm:hidden">
          {formatSoum(product.basePrice)} so&apos;m
        </p>
      )}
    </form>
  );
}
