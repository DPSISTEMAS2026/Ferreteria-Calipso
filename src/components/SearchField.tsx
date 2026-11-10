"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

export type SearchProduct = {
  name: string;
  slug: string;
  price: number;
  image: string | null;
};

function fold(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

function money(value: number) {
  return `$${Math.round(value).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")}`;
}

export function SearchField({
  id,
  products,
  className,
  layout = "overlay",
  showButton = true,
  buttonClassName = "px-4",
  onPick,
}: {
  id: string;
  products: SearchProduct[];
  className?: string;
  layout?: "overlay" | "inline";
  showButton?: boolean;
  buttonClassName?: string;
  onPick?: () => void;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const seenPath = useRef(pathname);
  const listId = useId();
  const box = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);

  const ready = query.trim().length >= 3;
  const matches = useMemo(() => {
    if (!ready) return [];
    const folded = fold(query.trim());
    const tokens = folded.split(/\s+/).filter(Boolean);
    return products
      .filter((product) => {
        const name = fold(product.name);
        return tokens.every((token) => name.includes(token));
      })
      .sort((a, b) => {
        const rank = (name: string) => {
          const foldedName = fold(name);
          if (foldedName.startsWith(folded)) return 0;
          if (foldedName.split(/\s+/).some((word) => word.startsWith(folded))) return 1;
          return 2;
        };
        return rank(a.name) - rank(b.name) || Number(Boolean(b.image)) - Number(Boolean(a.image)) || a.name.localeCompare(b.name, "es");
      })
      .slice(0, 8);
  }, [products, query, ready]);

  useEffect(() => {
    setActive(0);
  }, [query]);

  useEffect(() => {
    if (seenPath.current === pathname) return;
    seenPath.current = pathname;
    setOpen(false);
    setQuery("");
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const onPointer = (event: PointerEvent) => {
      if (!box.current?.contains(event.target as Node)) setOpen(false);
    };
    window.addEventListener("pointerdown", onPointer);
    return () => window.removeEventListener("pointerdown", onPointer);
  }, [open]);

  const show = open && ready;
  const current = matches.length === 0 ? 0 : Math.min(active, matches.length - 1);

  function choose(slug: string) {
    setOpen(false);
    onPick?.();
    router.push(`/producto/${slug}`);
  }

  return (
    <form action="/buscar" className={className}>
      <div ref={box} className="relative">
        <label htmlFor={id} className="sr-only">Buscar en Calipso</label>
        <div className="flex overflow-hidden rounded-md border border-[#12312e]/20 bg-white">
          <input
            id={id}
            name="q"
            value={query}
            placeholder="Buscar en Calipso"
            autoComplete="off"
            role="combobox"
            aria-expanded={show}
            aria-controls={listId}
            aria-autocomplete="list"
            className="w-full px-3 py-2 text-sm outline-none"
            onChange={(event) => {
              setQuery(event.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            onKeyDown={(event) => {
              if (!show || matches.length === 0) {
                if (event.key === "Escape") setOpen(false);
                return;
              }
              if (event.key === "ArrowDown") {
                event.preventDefault();
                setActive((index) => Math.min(matches.length - 1, index + 1));
              } else if (event.key === "ArrowUp") {
                event.preventDefault();
                setActive((index) => Math.max(0, index - 1));
              } else if (event.key === "Escape") {
                setOpen(false);
              } else if (event.key === "Enter" && matches[current]) {
                event.preventDefault();
                choose(matches[current].slug);
              }
            }}
          />
          {showButton && (
            <button type="submit" onClick={() => { setOpen(false); onPick?.(); }} className={`bg-[#0f6e62] text-sm font-bold text-white ${buttonClassName}`}>
              Buscar
            </button>
          )}
        </div>
        {show && (
          <div id={listId} role={matches.length === 0 ? undefined : "listbox"} className={layout === "overlay" ? "absolute left-0 right-0 top-full z-40 mt-1 overflow-hidden rounded-md border border-[#12312e]/10 bg-white shadow-xl" : "mt-2 overflow-hidden rounded-md border border-[#12312e]/10 bg-white"}>
            {matches.length === 0 ? (
              <p className="px-3 py-3 text-sm text-[#12312e]/70">No hay productos con ese nombre.</p>
            ) : (
              <ul className="max-h-80 overflow-y-auto">
                {matches.map((product, index) => (
                  <li key={product.slug} role="option" aria-selected={index === current}>
                    <Link
                      href={`/producto/${product.slug}`}
                      onClick={() => { setOpen(false); onPick?.(); }}
                      onMouseEnter={() => setActive(index)}
                      className={`flex items-center gap-3 px-3 py-2 ${index === current ? "bg-[#e7f3f0]" : ""}`}
                    >
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded bg-[#f7fbfa]">
                        {product.image ? <img src={product.image} alt="" className="h-full w-full object-contain" /> : <span className="text-sm font-black text-[#0f6e62]">{product.name.slice(0, 1)}</span>}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="line-clamp-2 block text-sm font-medium text-[#12312e]">{product.name}</span>
                        <span className="block text-sm font-black text-[#12312e]">{money(product.price)}</span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
            <Link href={`/buscar?q=${encodeURIComponent(query.trim())}`} onClick={() => { setOpen(false); onPick?.(); }} className="block border-t border-[#12312e]/10 px-3 py-2 text-sm font-bold text-[#0f6e62]">
              Ver todos los resultados
            </Link>
          </div>
        )}
      </div>
    </form>
  );
}
