import { ProductCard } from "@/components/ProductCard";
import { getCatalog } from "@/lib/catalog";

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q = "" } = await searchParams;
  const catalog = await getCatalog();
  const needle = q.trim().toLowerCase();
  const found = needle
    ? catalog.products.filter((product) => product.name.toLowerCase().includes(needle))
    : [];

  return (
    <main>
      <div className="mx-auto max-w-6xl px-5 py-10">
        <h1 className="text-4xl font-black uppercase text-[#12312e]">Buscar</h1>
        <form action="/buscar" className="mt-4">
          <input name="q" defaultValue={q} placeholder="Nombre del producto" className="w-full max-w-md rounded-full border border-[#12312e]/15 bg-white px-4 py-2" />
        </form>
        <p className="mt-4 text-sm text-[#12312e]/60">{needle ? `${found.length} resultados` : "Escribe el nombre de un producto."}</p>
        <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {found.slice(0, 60).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </main>
  );
}
