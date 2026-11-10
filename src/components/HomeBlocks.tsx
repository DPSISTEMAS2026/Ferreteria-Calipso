import Link from "next/link";
import { CategoryIcon } from "@/components/CategoryIcon";

export type HomeProduct = {
  slug: string;
  name: string;
  price: number;
  compareAt: number | null;
  category: string;
  image: string;
};

export type HomeDepartment = {
  slug: string;
  name: string;
  count: number;
  image: string | null;
};

export type HomeSection = {
  slug: string;
  title: string;
  href: string;
  count: number;
  items: HomeProduct[];
};

function money(value: number) {
  return `$${Math.round(value).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")}`;
}

function discount(item: HomeProduct) {
  if (!item.compareAt || item.compareAt <= item.price) return null;
  return Math.round((1 - item.price / item.compareAt) * 100);
}

function ProductFace({ item, large }: { item: HomeProduct; large?: boolean }) {
  const off = discount(item);
  return (
    <Link
      href={`/producto/${item.slug}`}
      className={`group flex h-full flex-col rounded-2xl border border-[#12312e]/10 bg-white p-3 transition duration-300 hover:-translate-y-1 hover:border-[#0f6e62] hover:shadow-lg motion-reduce:transition-none ${large ? "sm:flex-row sm:items-center sm:gap-4 sm:p-4" : ""}`}
    >
      <div className={`relative flex items-center justify-center overflow-hidden rounded-xl bg-[#f7fbfa] ${large ? "aspect-[16/10] sm:aspect-square sm:w-1/2" : "aspect-[4/3] sm:aspect-square"}`}>
        <img src={item.image} alt="" className="h-full w-full object-contain transition duration-300 group-hover:scale-105 motion-reduce:transition-none" />
        {off !== null && <span className="absolute left-2 top-2 rounded-full bg-[#c2410c] px-2 py-1 text-xs font-bold text-white">−{off}%</span>}
      </div>
      <div className={large ? "mt-3 sm:mt-0 sm:flex-1" : "mt-3"}>
        <p className="text-xs font-bold uppercase tracking-wide text-[#0f6e62]">{item.category}</p>
        <h3 className={`mt-1 font-bold leading-snug ${large ? "line-clamp-2 text-lg sm:line-clamp-3 sm:text-xl" : "line-clamp-2 min-h-10 text-sm"}`}>{item.name}</h3>
        <p className="mt-2 flex flex-wrap items-baseline gap-2">
          <span className={`font-black text-[#12312e] ${large ? "text-2xl" : "text-lg"}`}>{money(item.price)}</span>
          {item.compareAt && <span className="text-sm text-[#12312e]/40 line-through">{money(item.compareAt)}</span>}
        </p>
      </div>
    </Link>
  );
}

export function HomeDepartments({ items }: { items: HomeDepartment[] }) {
  if (items.length === 0) return null;
  return (
    <section className="bg-white px-3 py-4 sm:px-6 sm:py-8">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-xl font-black uppercase text-[#12312e] sm:text-2xl">Entra a una sección</h2>
        <p className="mt-1 text-sm text-[#12312e]/70">Elige por dónde empezar a mirar.</p>
        <div className="mt-3 grid grid-cols-3 gap-2 sm:mt-5 sm:gap-3 lg:grid-cols-4">
          {items.map((item) => (
            <Link key={item.slug} href={`/categoria/${item.slug}`} className="group min-w-0 overflow-hidden rounded-2xl border border-[#12312e]/10 bg-[#f7fbfa] transition duration-300 hover:-translate-y-1 hover:border-[#0f6e62] hover:shadow-lg motion-reduce:transition-none">
              <div className="flex aspect-[4/3] items-center justify-center p-2 sm:p-3">
                {item.image ? <img src={item.image} alt="" className="h-full w-full object-contain transition duration-300 group-hover:scale-105 motion-reduce:transition-none" /> : <CategoryIcon slug={item.slug} className="h-8 w-8 text-[#0f6e62] sm:h-12 sm:w-12" />}
              </div>
              <div className="flex items-end justify-between gap-1 bg-white px-2 py-2 sm:gap-2 sm:px-3 sm:py-3">
                <div className="min-w-0">
                  <h3 className="line-clamp-2 text-[11px] font-black leading-tight text-[#12312e] sm:text-sm">{item.name}</h3>
                  <p className="text-[10px] text-[#12312e]/60 sm:text-xs">{item.count} productos</p>
                </div>
                <CategoryIcon slug={item.slug} className="h-4 w-4 shrink-0 text-[#0f6e62] sm:h-5 sm:w-5" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export function HomeOffer({ items }: { items: HomeProduct[] }) {
  if (items.length === 0) return null;
  const [lead, ...rest] = items;
  return (
    <section className="px-3 py-4 sm:px-6 sm:py-8">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-2xl font-black uppercase text-[#12312e]">Ofertas</h2>
        <div className={`mt-4 grid gap-3 ${rest.length > 0 ? "lg:grid-cols-2" : ""}`}>
          <ProductFace item={lead} large />
          {rest.map((item) => <ProductFace key={item.slug} item={item} large />)}
        </div>
      </div>
    </section>
  );
}

export function HomeShelf({ section, featured }: { section: HomeSection; featured: boolean }) {
  const [lead, ...rest] = section.items;
  return (
    <section className={featured ? "bg-white px-3 py-4 sm:px-6 sm:py-8" : "px-3 py-4 sm:px-6 sm:py-8"}>
      <div className="mx-auto max-w-6xl">
        <div className="mb-4 flex items-end justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#e7f3f0] text-[#0f6e62]">
              <CategoryIcon slug={section.slug} className="h-6 w-6" />
            </span>
            <div>
              <h2 className="text-2xl font-black uppercase text-[#12312e]">{section.title}</h2>
              <p className="text-sm text-[#12312e]/60">{section.count} productos</p>
            </div>
          </div>
          <Link href={section.href} className="shrink-0 rounded-full bg-[#0f6e62] px-4 py-2 text-sm font-bold text-white hover:bg-[#12312e]">Ver todo</Link>
        </div>
        {featured && lead ? (
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <div className="col-span-2">
              <ProductFace item={lead} large />
            </div>
            {rest.slice(0, 4).map((item, index) => (
              <div key={item.slug} className={index >= 2 ? "hidden min-w-0 sm:block" : "min-w-0"}>
                <ProductFace item={item} />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {section.items.slice(0, 4).map((item) => (
              <div key={item.slug} className="min-w-0">
                <ProductFace item={item} />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
