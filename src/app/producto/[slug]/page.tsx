import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductAsk } from "@/components/ProductAsk";
import { brandOf } from "@/lib/brands";
import { getCatalog, money, offerFor, shelfPrice } from "@/lib/catalog";
import { productImage } from "@/lib/product-image";
import { freeShippingFrom, store, todayLabel } from "@/lib/store";

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const catalog = await getCatalog();
  const product = catalog.productBySlug(slug);
  if (!product) notFound();
  const category = catalog.categoryById(product.categoryId);
  const path = category ? catalog.categoryPath(category.id) : [];
  const offer = offerFor(product.slug);
  const price = shelfPrice(product);
  const brand = brandOf(product.name);
  const image = product.imageUrl || productImage(product.id);
  const discount = offer && offer.compareAt > price ? Math.round((1 - price / offer.compareAt) * 100) : 0;

  return (
    <main>
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-5">
        <p className="text-sm text-[#12312e]/60">
          <Link href="/">Inicio</Link>
          {path.map((item) => (
            <span key={item.id}>
              {" / "}
              <Link href={`/categoria/${item.slug}`}>{item.name}</Link>
            </span>
          ))}
        </p>

        <div className="mt-5 grid items-start gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(280px,0.85fr)]">
          <div className="flex gap-3">
            <div className="hidden w-16 shrink-0 sm:block">
              <div className="overflow-hidden rounded-lg border border-[#0f6e62] bg-white p-1">
                {image ? (
                  <img src={image} alt="" className="aspect-square w-full object-contain" />
                ) : (
                  <span className="flex aspect-square items-center justify-center text-lg font-black text-[#0f6e62]">{product.name.slice(0, 1)}</span>
                )}
              </div>
            </div>
            <div className="flex min-h-80 flex-1 items-center justify-center rounded-2xl bg-white p-6">
              {image ? (
                <img src={image} alt={product.name} className="max-h-[32rem] w-full object-contain" />
              ) : (
                <div className="text-center">
                  <span className="text-7xl font-black text-[#0f6e62]">{product.name.slice(0, 1)}</span>
                  <p className="mt-3 text-sm font-bold uppercase tracking-wider text-[#0f6e62]/70">Foto por cargar</p>
                </div>
              )}
            </div>
          </div>

          <div>
            {brand && <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#0f6e62]">{brand}</p>}
            <h1 className="mt-1 text-2xl font-black uppercase leading-tight text-[#12312e] sm:text-3xl">{product.name}</h1>
            <p className="mt-5 text-3xl font-black text-[#12312e] sm:text-4xl">{money(price)}</p>
            {offer && (
              <p className="mt-1 flex items-center gap-2">
                <span className="text-lg text-[#12312e]/45 line-through">{money(offer.compareAt)}</span>
                {discount > 0 && <span className="rounded bg-[#c2410c] px-1.5 py-0.5 text-xs font-bold text-white">-{discount}%</span>}
              </p>
            )}
            {product.note && <p className="mt-3 text-sm font-bold text-[#12312e]">{product.note}</p>}

            <ProductAsk slug={product.slug} name={product.name} price={price} image={image} />

            <ul className="mt-6 space-y-2 text-sm text-[#12312e]">
              <li><span className="font-bold">Categoría:</span> {path.map((item) => item.name).join(" / ") || "General"}</li>
              {brand && <li><span className="font-bold">Marca:</span> {brand}</li>}
            </ul>

            <div className="mt-6 space-y-3 rounded-2xl border border-[#12312e]/10 bg-white p-4 text-sm text-[#12312e]">
              <div>
                <p className="font-bold">Retiro en tienda</p>
                <a href={store.maps} className="text-[#0f6e62]">{store.address}</a>
                <p>{todayLabel()}</p>
              </div>
              <p>Envío gratis en compras desde {money(freeShippingFrom).trim()}.</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
