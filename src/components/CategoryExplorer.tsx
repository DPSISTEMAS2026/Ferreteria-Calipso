"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { CategoryIcon } from "@/components/CategoryIcon";

export type CatalogGroup = {
  slug: string;
  name: string;
  count: number;
  image: string | null;
};

export type CatalogItem = {
  id: string;
  slug: string;
  name: string;
  price: number;
  compareAt: number | null;
  image: string | null;
  note: string | null;
  brand: string | null;
  categoryName: string;
  categorySlug: string;
};

const pageSize = 12;

function money(value: number) {
  const body = Math.round(value).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `$${body}`;
}

function pageWindow(current: number, total: number) {
  const wanted = [1, total, current - 1, current, current + 1].filter((number, index, list) => number >= 1 && number <= total && list.indexOf(number) === index);
  return wanted.sort((a, b) => a - b);
}

function pesos(value: string) {
  const digits = value.replace(/\D/g, "");
  if (!digits) return null;
  return Number(digits);
}

export function CategoryExplorer({
  current,
  groups,
  items,
  filterGroups,
}: {
  current: string;
  groups: CatalogGroup[];
  items: CatalogItem[];
  filterGroups: boolean;
}) {
  const [query, setQuery] = useState("");
  const [low, setLow] = useState("");
  const [high, setHigh] = useState("");
  const [picked, setPicked] = useState<string[]>([]);
  const [brandQuery, setBrandQuery] = useState("");
  const [brandsOn, setBrandsOn] = useState<string[]>([]);
  const [brandsOpen, setBrandsOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [sort, setSort] = useState("recomendados");
  const [page, setPage] = useState(1);

  const brands = useMemo(() => {
    const counts = new Map<string, number>();
    items.forEach((item) => {
      if (item.brand) counts.set(item.brand, (counts.get(item.brand) || 0) + 1);
    });
    return [...counts.entries()].sort((a, b) => a[0].localeCompare(b[0], "es"));
  }, [items]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const min = pesos(low);
    const max = pesos(high);
    const list = items.filter((item) => {
      if (needle && !item.name.toLowerCase().includes(needle)) return false;
      if (picked.length > 0 && !picked.includes(item.categorySlug)) return false;
      if (brandsOn.length > 0 && (!item.brand || !brandsOn.includes(item.brand))) return false;
      if (min !== null && item.price < min) return false;
      if (max !== null && item.price > max) return false;
      return true;
    });
    const sorted = [...list];
    sorted.sort((a, b) => {
      const photo = Number(Boolean(b.image)) - Number(Boolean(a.image));
      if (photo) return photo;
      if (sort === "menor") return a.price - b.price;
      if (sort === "mayor") return b.price - a.price;
      if (sort === "nombre") return a.name.localeCompare(b.name, "es");
      return 0;
    });
    return sorted;
  }, [brandsOn, high, items, low, picked, query, sort]);

  const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, pages);
  const visible = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);
  const visibleBrands = brands.filter(([name]) => name.toLowerCase().includes(brandQuery.trim().toLowerCase()));
  const dirty = Boolean(query || low || high || picked.length || brandsOn.length || sort !== "recomendados");

  function resetPage() {
    setPage(1);
  }

  function toggleGroup(slug: string) {
    setPicked((currentGroups) => currentGroups.includes(slug) ? currentGroups.filter((item) => item !== slug) : [...currentGroups, slug]);
    resetPage();
  }

  function clearFilters() {
    setQuery("");
    setLow("");
    setHigh("");
    setPicked([]);
    setBrandQuery("");
    setBrandsOn([]);
    setSort("recomendados");
    resetPage();
  }

  return (
    <div>
      {groups.length > 0 && (
        <div className="grid grid-cols-3 gap-2 sm:gap-3 lg:grid-cols-4">
          {groups.map((group) => (
            <Link
              key={group.slug}
              href={`/categoria/${group.slug}`}
              className={`min-w-0 rounded-2xl border bg-white px-2 py-3 text-center sm:px-3 sm:py-4 ${group.slug === current ? "border-[#0f6e62] ring-2 ring-[#0f6e62]/25" : "border-[#12312e]/10 hover:border-[#0f6e62]"}`}
            >
              <span className="mx-auto flex h-16 items-center justify-center sm:h-24">
                {group.image ? (
                  <img src={group.image} alt="" className="max-h-16 max-w-full object-contain sm:max-h-24" />
                ) : (
                  <CategoryIcon slug={group.slug} className="h-8 w-8 text-[#0f6e62] sm:h-10 sm:w-10" />
                )}
              </span>
              <span className="mt-2 line-clamp-2 block text-xs font-bold leading-tight text-[#12312e] sm:text-sm">{group.name}</span>
              <span className="mt-1 block text-[11px] text-[#12312e]/55 sm:text-xs">{group.count} productos</span>
            </Link>
          ))}
        </div>
      )}

      <div className="mt-5 flex flex-col lg:grid lg:grid-cols-[250px_1fr] lg:items-start lg:gap-x-6">
        <div className="order-1 mb-4 flex items-center gap-2 lg:col-start-2 lg:row-start-1">
          <p className="shrink-0 text-sm font-bold text-[#12312e]">{filtered.length} productos</p>
          <button
            type="button"
            onClick={() => setFiltersOpen((open) => !open)}
            aria-expanded={filtersOpen}
            className="shrink-0 rounded-full border border-[#12312e]/15 bg-white px-3 py-2 text-sm font-bold text-[#12312e] lg:hidden"
          >
            {filtersOpen ? "Ocultar filtros" : "Filtrar"}
            {dirty ? " · activos" : ""}
          </button>
          <label className="ml-auto min-w-0 text-sm font-bold text-[#12312e]">
            <span className="sr-only">Ordenar por</span>
            <select
              value={sort}
              onChange={(event) => { setSort(event.target.value); resetPage(); }}
              className="w-full max-w-[11rem] rounded-full border border-[#12312e]/15 bg-white px-3 py-2 text-sm font-medium"
            >
              <option value="recomendados">Recomendados</option>
              <option value="menor">Precio: menor a mayor</option>
              <option value="mayor">Precio: mayor a menor</option>
              <option value="nombre">Nombre</option>
            </select>
          </label>
        </div>
        <aside className={`${filtersOpen ? "order-2 mb-4" : "hidden"} rounded-2xl border border-[#12312e]/10 bg-white p-4 lg:sticky lg:top-24 lg:col-start-1 lg:row-span-2 lg:row-start-1 lg:mb-0 lg:block`}>
          <p className="text-sm text-[#12312e]/60">Resultados ({filtered.length})</p>
          <label className="mt-4 block text-sm font-bold text-[#12312e]">
            Buscar
            <input
              value={query}
              onChange={(event) => { setQuery(event.target.value); resetPage(); }}
              placeholder="Nombre del producto"
              className="mt-2 w-full rounded-full border border-[#12312e]/15 px-4 py-2 text-sm font-medium"
            />
          </label>

          {filterGroups && groups.length > 0 && (
            <fieldset className="mt-5">
              <legend className="text-sm font-bold text-[#12312e]">Subcategoría</legend>
              <div className="mt-2 space-y-2">
                {groups.map((group) => (
                  <label key={group.slug} className="flex items-start gap-2 text-sm text-[#12312e]">
                    <input
                      type="checkbox"
                      checked={picked.includes(group.slug)}
                      onChange={() => toggleGroup(group.slug)}
                      className="mt-1"
                    />
                    <span>{group.name} · {group.count}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          )}

          {brands.length > 0 && (
            <fieldset className="mt-5">
              <legend className="w-full">
                <button type="button" onClick={() => setBrandsOpen((open) => !open)} className="flex w-full items-center justify-between text-sm font-bold text-[#12312e]" aria-expanded={brandsOpen}>
                  Marca
                  <span aria-hidden="true">{brandsOpen ? "▴" : "▾"}</span>
                </button>
              </legend>
              {brandsOpen && (
                <div className="mt-2">
                  <input
                    value={brandQuery}
                    onChange={(event) => setBrandQuery(event.target.value)}
                    placeholder="Buscar..."
                    aria-label="Buscar marca"
                    className="w-full rounded-md border border-[#12312e]/15 px-3 py-1.5 text-sm"
                  />
                  <div className="mt-2 max-h-52 space-y-1.5 overflow-y-auto pr-1">
                    {visibleBrands.length === 0 && <p className="text-sm text-[#12312e]/55">Sin coincidencias</p>}
                    {visibleBrands.map(([name]) => (
                      <label key={name} className="flex items-center gap-2 text-sm text-[#12312e]">
                        <input
                          type="checkbox"
                          checked={brandsOn.includes(name)}
                          onChange={() => {
                            setBrandsOn((currentBrands) => currentBrands.includes(name) ? currentBrands.filter((item) => item !== name) : [...currentBrands, name]);
                            resetPage();
                          }}
                        />
                        <span>{name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </fieldset>
          )}

          <fieldset className="mt-5">
            <legend className="text-sm font-bold text-[#12312e]">Precio en tienda</legend>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <input
                inputMode="numeric"
                value={low}
                onChange={(event) => { setLow(event.target.value); resetPage(); }}
                placeholder="Desde"
                aria-label="Precio desde"
                className="rounded-xl border border-[#12312e]/15 px-3 py-2 text-sm"
              />
              <input
                inputMode="numeric"
                value={high}
                onChange={(event) => { setHigh(event.target.value); resetPage(); }}
                placeholder="Hasta"
                aria-label="Precio hasta"
                className="rounded-xl border border-[#12312e]/15 px-3 py-2 text-sm"
              />
            </div>
          </fieldset>

          {dirty && (
            <button type="button" onClick={clearFilters} className="mt-5 text-sm font-bold text-[#0f6e62]">
              Limpiar filtros
            </button>
          )}
        </aside>

        <section className="order-3 lg:col-start-2 lg:row-start-2">
          {visible.length === 0 ? (
            <p className="rounded-2xl bg-white p-6 text-sm text-[#12312e]/70">Ningún producto coincide con esos filtros.</p>
          ) : (
            <div className="grid grid-cols-2 gap-3 xl:grid-cols-3">
              {visible.map((item) => (
                <Link key={item.id} href={`/producto/${item.slug}`} className="flex flex-col rounded-2xl border border-[#12312e]/10 bg-white p-3 hover:border-[#0f6e62]">
                  <span className="relative flex aspect-square items-center justify-center overflow-hidden rounded-xl bg-[#f7fbfa]">
                    {item.image ? (
                      <img src={item.image} alt="" className="h-full w-full object-contain" />
                    ) : (
                      <span className="text-4xl font-black text-[#0f6e62]">{item.name.slice(0, 1)}</span>
                    )}
                    {item.compareAt && <span className="absolute left-2 top-2 rounded-full bg-[#c2410c] px-2 py-0.5 text-[11px] font-bold text-white">Oferta</span>}
                  </span>
                  <p className="mt-3 text-[10px] font-bold uppercase tracking-wide text-[#0f6e62]">{item.brand ? `${item.categoryName} · ${item.brand}` : item.categoryName}</p>
                  <h3 className="mt-1 line-clamp-2 min-h-10 text-sm font-bold leading-snug text-[#12312e]">{item.name}</h3>
                  {item.note && <p className="mt-1 truncate text-xs text-[#12312e]/55">{item.note}</p>}
                  <p className="mt-auto flex items-baseline gap-2 pt-3">
                    {item.compareAt && <span className="text-xs text-[#12312e]/40 line-through">{money(item.compareAt)}</span>}
                    <span className="text-lg font-black text-[#12312e]">{money(item.price)}</span>
                  </p>
                </Link>
              ))}
            </div>
          )}

          {pages > 1 && (
            <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
              <button type="button" onClick={() => setPage(Math.max(1, safePage - 1))} disabled={safePage === 1} className="h-9 rounded-full bg-white px-3 text-sm font-bold disabled:opacity-40">Anterior</button>
              {pageWindow(safePage, pages).map((number, index, list) => (
                <span key={number} className="flex items-center gap-2">
                  {index > 0 && number - list[index - 1] > 1 && <span className="text-[#12312e]/40">…</span>}
                  <button
                    type="button"
                    onClick={() => setPage(number)}
                    className={`h-9 min-w-9 rounded-full px-3 text-sm font-bold ${number === safePage ? "bg-[#12312e] text-white" : "bg-white text-[#12312e]"}`}
                  >
                    {number}
                  </button>
                </span>
              ))}
              <button type="button" onClick={() => setPage(Math.min(pages, safePage + 1))} disabled={safePage === pages} className="h-9 rounded-full bg-white px-3 text-sm font-bold disabled:opacity-40">Siguiente</button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
