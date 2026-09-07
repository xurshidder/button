import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

import { isAuthenticated } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";
import {
  EXTENSION_FOR,
  MAX_UPLOAD_BYTES,
  sniffImageType,
  uploadObject,
} from "@/lib/storage";

/**
 * Image upload.
 *
 * Order matters here, and it is the order in CLAUDE.md §10: authorise, then
 * validate, then act. Every check runs on the server regardless of what the
 * form allowed, because the form is not the boundary — this route is.
 */
export async function POST(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const form = await request.formData();
  const file = form.get("file");
  const target = String(form.get("target") ?? "");
  const slug = String(form.get("slug") ?? "");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file supplied" }, { status: 400 });
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return NextResponse.json(
      { error: `File is larger than ${MAX_UPLOAD_BYTES / 1024 / 1024} MB` },
      { status: 413 },
    );
  }

  const buffer = await file.arrayBuffer();

  // Trust the bytes, not the filename or the declared Content-Type.
  const mime = sniffImageType(new Uint8Array(buffer.slice(0, 16)));
  if (!mime) {
    return NextResponse.json(
      { error: "Not a JPEG, PNG, WebP or AVIF image" },
      { status: 415 },
    );
  }

  const extension = EXTENSION_FOR[mime];

  try {
    if (target === "hero") {
      // Fixed path: uploading a new hero replaces the old one.
      const url = await uploadObject(`hero/main.${extension}`, buffer, mime);
      await prisma.siteSetting.upsert({
        where: { key: "heroImage" },
        create: { key: "heroImage", value: url },
        update: { value: url },
      });
      revalidatePath("/", "layout");
      return NextResponse.json({ url });
    }

    if (target === "product") {
      const product = await prisma.product.findUnique({ where: { slug } });
      if (!product) {
        return NextResponse.json(
          { error: `No product with slug "${slug}"` },
          { status: 404 },
        );
      }

      const existing = await prisma.productImage.count({
        where: { productId: product.id },
      });
      const url = await uploadObject(
        // Timestamp keeps filenames unique, so a re-upload never silently
        // overwrites a different photo of the same product.
        `products/${slug}/${Date.now()}.${extension}`,
        buffer,
        mime,
      );

      await prisma.productImage.create({
        data: {
          productId: product.id,
          url,
          altUz: product.nameUz,
          sortOrder: existing,
        },
      });

      revalidatePath("/", "layout");
      return NextResponse.json({ url });
    }

    return NextResponse.json(
      { error: "target must be 'hero' or 'product'" },
      { status: 400 },
    );
  } catch (error) {
    // Storage misconfiguration is the likely cause; surface it rather than a
    // generic 500, because the fix is always an env var.
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Upload failed" },
      { status: 500 },
    );
  }
}
