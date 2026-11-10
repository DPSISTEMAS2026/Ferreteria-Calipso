import fs from "fs";
import path from "path";
import { cache } from "react";
import { offers } from "./offers";

export type Category = {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
};

export type Axis = "tipo" | "medida" | "marca";

export type Variant = {
  id: string;
  sku: string;
  tipo?: string;
  medida?: string;
  marca: string;
  price: number;
  stock: number | null;
};

export type Product = {
  id: string;
  name: string;
  slug: string;
  categoryId: string;
  summary: string;
  axes: Axis[];
  variants: Variant[];
  supplier: string;
  supplierCode: string;
  salePrice: number;
  note: string | null;
  imageUrl?: string | null;
};

type PublicRow = {
  id: string;
  name: string;
  slug: string;
  categoryId: string;
  salePrice: number;
  note: string | null;
  imageUrl?: string | null;
};

export const axisLabel: Record<Axis, string> = {
  tipo: "Tipo",
  medida: "Medida",
  marca: "Marca",
};

export type MenuNode = {
  name: string;
  slug: string;
  count: number;
  children: MenuNode[];
};

function toProduct(row: PublicRow): Product {
  return {
    ...row,
    summary: "",
    supplier: "",
    supplierCode: "",
    axes: [],
    variants: [
      {
        id: row.id,
        sku: row.id,
        marca: "",
        price: row.salePrice,
        stock: null,
      },
    ],
    note: row.note,
  };
}

export function makeCatalog(categories: Category[], rows: PublicRow[]) {
  const products = rows.map(toProduct);

  function categoryBySlug(slug: string) {
    return categories.find((category) => category.slug === slug) || null;
  }

  function categoryById(id: string) {
    return categories.find((category) => category.id === id) || null;
  }

  function childCategories(parentId: string | null) {
    return categories.filter((category) => category.parentId === parentId);
  }

  function categoryPath(categoryId: string): Category[] {
    const path: Category[] = [];
    let current = categoryById(categoryId);
    while (current) {
      path.unshift(current);
      current = current.parentId ? categoryById(current.parentId) : null;
    }
    return path;
  }

  function descendantIds(categoryId: string): string[] {
    const ids = [categoryId];
    childCategories(categoryId).forEach((child) => ids.push(...descendantIds(child.id)));
    return ids;
  }

  function productsInCategory(categoryId: string) {
    const ids = new Set(descendantIds(categoryId));
    return products.filter((product) => ids.has(product.categoryId));
  }

  function productBySlug(slug: string) {
    return products.find((product) => product.slug === slug) || null;
  }

  function categoryMenu(parentId: string | null = null): MenuNode[] {
    return childCategories(parentId)
      .map((category) => ({
        name: category.name,
        slug: category.slug,
        count: productsInCategory(category.id).length,
        children: categoryMenu(category.id),
      }))
      .filter((node) => node.count > 0);
  }

  return { categories, products, categoryBySlug, categoryById, childCategories, categoryPath, productsInCategory, productBySlug, categoryMenu };
}

function catalogFromDisk() {
  const file = path.join(process.cwd(), "data", "catalog.json");
  const raw = JSON.parse(fs.readFileSync(file, "utf8")) as {
    categories: Category[];
    items: Array<PublicRow & { costNet?: number }>;
  };
  const rows: PublicRow[] = raw.items.map((item) => ({
    id: item.id,
    name: item.name,
    slug: item.slug,
    categoryId: item.categoryId,
    salePrice: item.salePrice,
    note: item.note,
    imageUrl: item.imageUrl || null,
  }));
  return makeCatalog(raw.categories, rows);
}

export const getCatalog = cache(async () => {
  const base = process.env.API_URL || "http://127.0.0.1:3011";
  try {
    const res = await fetch(`${base}/public/catalog`, { cache: "no-store" });
    if (res.ok) {
      const body = (await res.json()) as { categories: Category[]; products: PublicRow[] };
      return makeCatalog(body.categories, body.products);
    }
  } catch {
    // La tienda sigue con el archivo local si la API todavía no está arriba.
  }
  return catalogFromDisk();
});

export function offerFor(slug: string) {
  return offers.find((offer) => offer.slug === slug) || null;
}

export function shelfPrice(product: Pick<Product, "slug" | "salePrice">) {
  return offerFor(product.slug)?.price ?? product.salePrice;
}

export function money(value: number) {
  return new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 }).format(value);
}
