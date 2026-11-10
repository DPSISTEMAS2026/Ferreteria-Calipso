import Link from "next/link";

export type RailItem = {
  slug: string;
  name: string;
  price: number;
  compareAt: number | null;
  category: string;
  offer: boolean;
  image?: string | null;
};

function money(value: number) {
  return new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 }).format(value);
}

export function ProductRail({ title, href, items }: { title: string; href?: string; items: RailItem[] }) {
  if (items.length === 0) return null;

  return (
    <section className="py-6">
      <div className="mb-3 flex items-end justify-between gap-3 px-5">
        <h2 className="text-xl font-black uppercase text-[#12312e]">{title}</h2>
        {href && <Link href={href} className="text-sm font-bold text-[#0f6e62]">Ver todo</Link>}
      </div>
      <div className="flex gap-3 overflow-x-auto px-5 pb-2">
        {items.map((item) => (
          <Link
            key={item.slug}
            href={`/producto/${item.slug}`}
            className="w-44 shrink-0 rounded-xl border border-[#12312e]/10 bg-white p-2 transition-transform duration-300 hover:-translate-y-0.5 hover:border-[#0f6e62]"
          >
            <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden rounded-lg bg-[#f7fbfa]">
              {item.image ? <img src={item.image} alt="" className="h-full w-full object-contain" /> : <span className="text-2xl font-black text-[#0f6e62]">{item.name.slice(0, 1)}</span>}
              {item.offer && <span className="absolute left-1.5 top-1.5 rounded-full bg-[#c2410c] px-1.5 py-0.5 text-[10px] font-bold text-white">Oferta</span>}
            </div>
            <p className="mt-2 text-[10px] font-bold uppercase tracking-wide text-[#0f6e62]">{item.category}</p>
            <h3 className="mt-0.5 line-clamp-2 min-h-9 text-xs font-bold leading-snug">{item.name}</h3>
            <p className="mt-1 flex items-baseline gap-1">
              {item.compareAt && <span className="text-[10px] text-[#12312e]/40 line-through">{money(item.compareAt)}</span>}
              <span className="text-sm font-black">{money(item.price)}</span>
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
