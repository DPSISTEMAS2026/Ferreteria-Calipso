import fs from "fs";
import path from "path";
import { examplePhoto } from "@/lib/photos";

/** Si existe public/productos/{id}.jpg, esa es la foto del producto. */
export function productImage(id: string) {
  const file = path.join(process.cwd(), "public", "productos", `${id}.jpg`);
  return fs.existsSync(file) ? `/productos/${id}.jpg` : null;
}

export function resolveImage(product: { id: string; slug: string; imageUrl?: string | null }, categorySlugs: string[], transform?: string) {
  if (product.imageUrl) return product.imageUrl;
  return productImage(product.id) || examplePhoto([product.slug, ...categorySlugs], transform);
}
