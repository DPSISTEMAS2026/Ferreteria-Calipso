import Link from "next/link";
import { getCatalog, money, offerFor, shelfPrice, type Product } from "@/lib/catalog";
import { resolveImage } from "@/lib/product-image";

export async function ProductCard({ product }: { product: Product }) {
  const catalog = await getCatalog();
  const offer = offerFor(product.slug);
  const price = shelfPrice(product);
  const category = catalog.categoryById(product.categoryId);
  const image = resolveImage(product, catalog.categoryPath(product.categoryId).map((item) => item.slug).reverse());

  return (
    <Link href={`/producto/${product.slug}`} className="flex gap-3 rounded-xl border border-[#12312e]/10 bg-white p-2 hover:border-[#0f6e62]">
      <div className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-[#e7f3f0]">
        {image ? (
          <img src={image} alt="" className="h-full w-full rounded-lg object-cover" />
        ) : (
          <span className="text-xl font-black text-[#0f6e62]">{product.name.slice(0, 1)}</span>
        )}
        {offer && <span className="absolute -left-1 -top-1 rounded-full bg-[#c2410c] px-1.5 py-0.5 text-[10px] font-bold text-white">Oferta</span>}
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-wider text-[#0f6e62]">{category?.name}</p>
        <h3 className="line-clamp-2 text-sm font-bold leading-snug text-[#12312e]">{product.name}</h3>
        <p className="mt-1 flex items-baseline gap-2">
          {offer && <span className="text-xs text-[#12312e]/45 line-through">{money(offer.compareAt)}</span>}
          <span className="text-sm font-black">{money(price)}</span>
        </p>
      </div>
    </Link>
  );
}
