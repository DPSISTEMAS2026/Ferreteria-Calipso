import Link from "next/link";
import { notFound } from "next/navigation";
import { CategoryExplorer, type CatalogGroup, type CatalogItem } from "@/components/CategoryExplorer";
import { brandOf } from "@/lib/brands";
import { getCatalog, offerFor, shelfPrice, type Product } from "@/lib/catalog";

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const catalog = await getCatalog();
  const category = catalog.categoryBySlug(slug);
  if (!category) notFound();
  const path = catalog.categoryPath(category.id);
  const children = catalog.childCategories(category.id).filter((child) => catalog.productsInCategory(child.id).length > 0);
  const parent = category.parentId ? catalog.categoryById(category.parentId) : null;
  const siblings = parent ? catalog.childCategories(parent.id).filter((child) => catalog.productsInCategory(child.id).length > 0) : [];
  const groups = (children.length > 0 ? children : siblings).map((child) => groupOf(catalog, child));
  const items = catalog.productsInCategory(category.id).map((product) => itemOf(catalog, product));

  return (
    <main>
      <div className="mx-auto max-w-7xl px-3 py-5 sm:px-5 sm:py-8">
        <p className="mb-5 text-sm text-[#12312e]/60">
          <Link href="/">Inicio</Link>
          {path.map((item) => (
            <span key={item.id}>
              {" / "}
              {item.id === category.id ? item.name : <Link href={`/categoria/${item.slug}`}>{item.name}</Link>}
            </span>
          ))}
        </p>
        <h1 className="mb-5 text-3xl font-black uppercase text-[#12312e]">{category.name}</h1>
        <CategoryExplorer current={category.slug} groups={groups} items={items} filterGroups={children.length > 0} />
      </div>
    </main>
  );
}

function groupOf(catalog: Awaited<ReturnType<typeof getCatalog>>, category: { id: string; slug: string; name: string }): CatalogGroup {
  const products = catalog.productsInCategory(category.id);
  return {
    slug: category.slug,
    name: category.name,
    count: products.length,
    image: products.find((product) => product.imageUrl)?.imageUrl || null,
  };
}

function itemOf(catalog: Awaited<ReturnType<typeof getCatalog>>, product: Product): CatalogItem {
  const offer = offerFor(product.slug);
  const category = catalog.categoryById(product.categoryId);
  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    price: shelfPrice(product),
    compareAt: offer?.compareAt ?? null,
    image: product.imageUrl || null,
    note: product.note,
    brand: brandOf(product.name),
    categoryName: category?.name || "",
    categorySlug: category?.slug || "",
  };
}
