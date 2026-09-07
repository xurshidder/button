"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Target = "product" | "hero" | "category" | "campaign";

interface UploadFormProps {
  products: { slug: string; name: string; imageCount: number }[];
  categories: { slug: string; name: string; hasImage: boolean }[];
  campaignSlots: number;
}

type Status =
  | { kind: "idle" }
  | { kind: "uploading"; done: number; total: number }
  | { kind: "error"; message: string }
  | { kind: "done"; count: number };

const TARGETS: { value: Target; label: string; hint: string }[] = [
  {
    value: "product",
    label: "Mahsulot rasmi",
    hint: "4:5 nisbat. Bir nechta rasm birdan yuklash mumkin.",
  },
  {
    value: "hero",
    label: "Bosh sahifa rasmi",
    hint: "Kenglikka cho'zilgan rasm. Chap tomonda matn uchun joy qoldiring.",
  },
  {
    value: "category",
    label: "Kategoriya rasmi",
    hint: "3:4 nisbat, bo'yiga uzunroq.",
  },
  {
    value: "campaign",
    label: "Kolleksiya bloki",
    hint: "1-o'rin — katta rasm. 2–5 — yaqindan olingan detallar.",
  },
];

/**
 * Upload UI for every image on the site.
 *
 * Uploads run one at a time rather than in parallel: this is aimed at a shop
 * manager on a phone over Uzbek mobile data (CLAUDE.md §13), where several
 * simultaneous uploads compete for the same thin uplink and all of them stall.
 * Sequential is slower on paper and far more reliable in practice.
 */
export function UploadForm({
  products,
  categories,
  campaignSlots,
}: UploadFormProps) {
  const router = useRouter();
  const [target, setTarget] = useState<Target>("product");
  const [slug, setSlug] = useState(products[0]?.slug ?? "");
  const [categorySlug, setCategorySlug] = useState(categories[0]?.slug ?? "");
  const [slot, setSlot] = useState(1);
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  /** Only product uploads accept several files; the rest are single slots. */
  const multiple = target === "product";

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const input = event.currentTarget.elements.namedItem(
      "files",
    ) as HTMLInputElement;
    const files = Array.from(input.files ?? []);
    if (files.length === 0) return;

    const queue = multiple ? files : files.slice(0, 1);

    for (const [index, file] of queue.entries()) {
      setStatus({ kind: "uploading", done: index, total: queue.length });

      const body = new FormData();
      body.set("file", file);
      body.set("target", target);
      body.set("slug", target === "category" ? categorySlug : slug);
      body.set("slot", String(slot));

      const response = await fetch("/api/upload", { method: "POST", body });
      if (!response.ok) {
        const { error } = (await response.json().catch(() => ({}))) as {
          error?: string;
        };
        setStatus({ kind: "error", message: error ?? "Yuklashda xatolik" });
        return;
      }
    }

    setStatus({ kind: "done", count: queue.length });
    input.value = "";
    router.refresh();
  }

  const active = TARGETS.find((option) => option.value === target);

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5">
      <fieldset className="flex flex-col gap-2">
        <legend className="text-sm font-semibold text-fg">Qayerga</legend>
        <div className="flex flex-wrap gap-2">
          {TARGETS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setTarget(option.value)}
              aria-pressed={target === option.value}
              className={`px-4 py-2 text-sm font-medium transition ${
                target === option.value
                  ? "bg-brand text-brand-ink"
                  : "border border-border text-fg hover:bg-surface"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </fieldset>

      {target === "product" ? (
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-semibold text-fg">Mahsulot</span>
          <select
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            className="border border-border bg-bg px-3 py-2.5 text-sm outline-none focus:border-brand"
          >
            {products.map((item) => (
              <option key={item.slug} value={item.slug}>
                {item.name} ({item.imageCount})
              </option>
            ))}
          </select>
        </label>
      ) : null}

      {target === "category" ? (
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-semibold text-fg">Kategoriya</span>
          <select
            value={categorySlug}
            onChange={(e) => setCategorySlug(e.target.value)}
            className="border border-border bg-bg px-3 py-2.5 text-sm outline-none focus:border-brand"
          >
            {categories.map((item) => (
              <option key={item.slug} value={item.slug}>
                {item.name} {item.hasImage ? "✓" : "—"}
              </option>
            ))}
          </select>
        </label>
      ) : null}

      {target === "campaign" ? (
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-semibold text-fg">O&apos;rin</span>
          <select
            value={slot}
            onChange={(e) => setSlot(Number(e.target.value))}
            className="border border-border bg-bg px-3 py-2.5 text-sm outline-none focus:border-brand"
          >
            {Array.from({ length: campaignSlots }, (_, i) => i + 1).map((n) => (
              <option key={n} value={n}>
                {n === 1 ? "1 — katta rasm" : `${n} — detal`}
              </option>
            ))}
          </select>
        </label>
      ) : null}

      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-semibold text-fg">Rasm fayllari</span>
        <input
          name="files"
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          multiple={multiple}
          required
          className="border border-border bg-bg px-3 py-2.5 text-sm file:mr-3 file:border-0 file:bg-brand file:px-4 file:py-1.5 file:text-xs file:font-semibold file:text-brand-ink"
        />
        <span className="text-xs text-fg-muted">
          JPG, PNG, WebP yoki AVIF. Eng ko&apos;pi 10 MB. {active?.hint}
        </span>
      </label>

      <button
        type="submit"
        disabled={status.kind === "uploading"}
        className="w-fit bg-brand px-6 py-3 text-sm font-bold text-brand-ink transition hover:bg-brand-hover disabled:opacity-60"
      >
        {status.kind === "uploading"
          ? `Yuklanmoqda… ${status.done + 1}/${status.total}`
          : "Yuklash"}
      </button>

      {status.kind === "error" ? (
        <p role="alert" className="text-sm text-sale">
          {status.message}
        </p>
      ) : null}
      {status.kind === "done" ? (
        <p className="text-sm text-in-stock">
          {status.count} ta rasm yuklandi.
        </p>
      ) : null}
    </form>
  );
}
