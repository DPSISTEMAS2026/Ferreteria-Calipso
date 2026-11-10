import { CategoryStrip } from "@/components/CategoryStrip";
import type { HomeProduct } from "@/components/HomeBlocks";
import { HomeReel } from "@/components/HomeReel";
import { StoreVisit } from "@/components/StoreVisit";
import { StoreHero } from "@/components/StoreHero";
import { getCatalog, offerFor, shelfPrice, type Product } from "@/lib/catalog";
import { offers } from "@/lib/offers";

function sample<T>(list: T[], max: number) {
  if (list.length <= max) return list;
  const picked: T[] = [];
  const used = new Set<number>();
  for (let index = 0; index < max; index += 1) {
    let at = Math.round((index * (list.length - 1)) / (max - 1));
    while (used.has(at) && at < list.length - 1) at += 1;
    used.add(at);
    picked.push(list[at]);
  }
  return picked;
}

function hasPhoto(product: Product) {
  return Boolean(product.imageUrl);
}

function tile(catalog: Awaited<ReturnType<typeof getCatalog>>, product: Product): HomeProduct {
  const offer = offerFor(product.slug);
  return {
    slug: product.slug,
    name: product.name,
    price: shelfPrice(product),
    compareAt: offer?.compareAt ?? null,
    category: catalog.categoryById(product.categoryId)?.name || "",
    image: product.imageUrl || "",
  };
}

export default async function HomePage() {
  const catalog = await getCatalog();
  const mothers = catalog.childCategories(null).filter((category) => catalog.productsInCategory(category.id).length > 0);
  const featured = offers
    .map((offer) => catalog.productBySlug(offer.slug))
    .filter((product): product is Product => product !== null && hasPhoto(product))
    .map((product) => tile(catalog, product));
  const sections = mothers
    .map((category) => ({
      slug: category.slug,
      title: category.name,
      href: `/categoria/${category.slug}`,
      items: sample(catalog.productsInCategory(category.id).filter(hasPhoto), 12).map((product) => tile(catalog, product)),
    }))
    .filter((section) => section.items.length > 0);

  const reel = [
    ...(featured.length > 0
      ? [{
          slug: "ofertas",
          title: "Ofertas",
          href: `/producto/${featured[0].slug}`,
          count: featured.length,
          items: featured,
        }]
      : []),
    ...sections.map((section) => ({
      ...section,
      count: catalog.productsInCategory(mothers.find((category) => category.slug === section.slug)?.id || "").length,
    })),
  ];

  return (
    <main>
      <CategoryStrip items={mothers.map((category) => ({ slug: category.slug, name: category.name }))} />
      <StoreHero />
      <HomeReel sections={reel} />
      <StoreVisit products={catalog.products.map((product) => ({ name: product.name, slug: product.slug, price: shelfPrice(product) }))} />
    </main>
  );
}
