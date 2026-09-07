"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

interface UploadFormProps {
  /** Product slugs available to attach photos to. */
  slugs: { slug: string; name: string; imageCount: number }[];
}

type Status =
  | { kind: "idle" }
  | { kind: "uploading"; done: number; total: number }
  | { kind: "error"; message: string }
  | { kind: "done"; count: number };

/**
 * Upload UI for the hero image and product photography.
 *
 * Uploads run one at a time rather than in parallel: this is aimed at a shop
 * manager on a phone over Uzbek mobile data (CLAUDE.md §13), where six
 * simultaneous uploads compete for the same thin uplink and all of them stall.
 * Sequential is slower on paper and far more reliable in practice.
 */
export function UploadForm({ slugs }: UploadFormProps) {
  const router = useRouter();
  const [target, setTarget] = useState<"hero" | "product">("product");
  const [slug, setSlug] = useState(slugs[0]?.slug ?? "");
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const input = event.currentTarget.elements.namedItem(
      "files",
    ) as HTMLInputElement;
    const files = Array.from(input.files ?? []);
    if (files.length === 0) return;

    for (const [index, file] of files.entries()) {
      setStatus({ kind: "uploading", done: index, total: files.length });

      const body = new FormData();
      body.set("file", file);
      body.set("target", target);
      body.set("slug", slug);

      const response = await fetch("/api/upload", { method: "POST", body });
      if (!response.ok) {
        const { error } = (await response.json().catch(() => ({}))) as {
          error?: string;
        };
        setStatus({ kind: "error", message: error ?? "Yuklashda xatolik" });
        return;
      }

      // The hero is a single slot; extra files would just overwrite it.
      if (target === "hero") break;
    }

    setStatus({ kind: "done", count: target === "hero" ? 1 : files.length });
    input.value = "";
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5">
      <fieldset className="flex flex-col gap-2">
        <legend className="text-sm font-semibold text-fg">Qayerga</legend>
        <div className="flex gap-2">
          {(
            [
              ["product", "Mahsulot rasmi"],
              ["hero", "Bosh sahifa rasmi"],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setTarget(value)}
              aria-pressed={target === value}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                target === value
                  ? "bg-brand text-brand-ink"
                  : "border border-border text-fg hover:bg-surface"
              }`}
            >
              {label}
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
            className="rounded-lg border border-border bg-bg px-3 py-2.5 text-sm outline-none focus:border-brand"
          >
            {slugs.map((item) => (
              <option key={item.slug} value={item.slug}>
                {item.name} ({item.imageCount})
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
          multiple={target === "product"}
          required
          className="rounded-lg border border-border bg-bg px-3 py-2.5 text-sm file:mr-3 file:rounded-full file:border-0 file:bg-brand file:px-4 file:py-1.5 file:text-xs file:font-semibold file:text-brand-ink"
        />
        <span className="text-xs text-fg-muted">
          JPG, PNG, WebP yoki AVIF. Eng ko&apos;pi 10 MB. Mahsulot rasmlari
          uchun 4:5 nisbat tavsiya etiladi.
        </span>
      </label>

      <button
        type="submit"
        disabled={status.kind === "uploading"}
        className="rounded-full bg-brand px-6 py-3 text-sm font-bold text-brand-ink transition hover:bg-brand-hover disabled:opacity-60"
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
