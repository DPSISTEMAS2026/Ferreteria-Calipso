"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { CategoryIcon } from "@/components/CategoryIcon";
import type { HomeProduct } from "@/components/HomeBlocks";

export type ReelSection = {
  slug: string;
  title: string;
  href: string;
  count: number;
  items: HomeProduct[];
};

const STEP = 5600;

function money(value: number) {
  return `$${Math.round(value).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")}`;
}

function shuffle<T>(list: T[]) {
  const copy = [...list];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swap]] = [copy[swap], copy[index]];
  }
  return copy;
}

function ProductCard({ item, lead }: { item: HomeProduct; lead?: boolean }) {
  return (
    <Link href={`/producto/${item.slug}`} className="group flex min-w-0 flex-col overflow-hidden rounded-2xl border border-[#12312e]/10 bg-white">
      <div className={`flex items-center justify-center bg-[#f7fbfa] ${lead ? "aspect-[16/10]" : "aspect-[4/3]"}`}>
        <img src={item.image} alt="" className="h-full w-full object-contain p-3 transition duration-300 group-hover:scale-105 motion-reduce:transition-none" />
      </div>
      <div className={lead ? "px-3 py-3" : "px-2.5 py-2"}>
        <p className="truncate text-[10px] font-bold uppercase tracking-wide text-[#0f6e62]">{item.category}</p>
        <h3 className={`mt-0.5 font-bold leading-snug text-[#12312e] ${lead ? "line-clamp-2 text-base" : "line-clamp-2 text-xs"}`}>{item.name}</h3>
        <p className={`mt-1 font-black text-[#12312e] ${lead ? "text-xl" : "text-sm"}`}>{money(item.price)}</p>
      </div>
    </Link>
  );
}

export function HomeReel({ sections }: { sections: ReelSection[] }) {
  const source = useRef(sections);
  const deckRef = useRef(sections);
  const held = useRef(false);
  const holdTimer = useRef(0);
  const [deck, setDeck] = useState(sections);
  const [index, setIndex] = useState(0);
  const [shown, setShown] = useState(sections[0] ?? null);
  const [leaving, setLeaving] = useState(false);
  const [wide, setWide] = useState(false);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const next = shuffle(source.current.map((section) => ({
      ...section,
      items: shuffle(section.items.filter((item) => item.image)),
    })).filter((section) => section.items.length > 0));
    deckRef.current = next;
    setDeck(next);
    setIndex(next.length === 0 ? 0 : Math.floor(Math.random() * next.length));
  }, []);

  useEffect(() => {
    const query = window.matchMedia("(min-width: 768px)");
    const apply = () => setWide(query.matches);
    apply();
    query.addEventListener("change", apply);
    return () => query.removeEventListener("change", apply);
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => {
      if (held.current || document.hidden) return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const count = deckRef.current.length;
      if (count < 2) return;
      setIndex((current) => {
        let next = Math.floor(Math.random() * count);
        if (next === current) next = (current + 1) % count;
        return next;
      });
    }, STEP);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const next = deck[index] ?? deck[0];
    if (!next) return;
    if (!shown || next.slug === shown.slug) {
      setShown(next);
      setLeaving(false);
      return;
    }
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setShown(next);
      setLeaving(false);
      return;
    }
    setLeaving(true);
    const timer = window.setTimeout(() => {
      setShown(next);
      setLeaving(false);
    }, 240);
    return () => window.clearTimeout(timer);
  }, [deck, index, shown]);

  function choose(next: number) {
    if (next === index) return;
    setIndex(next);
    held.current = true;
    setPaused(true);
    window.clearTimeout(holdTimer.current);
    holdTimer.current = window.setTimeout(() => {
      held.current = false;
      setPaused(false);
    }, 12000);
  }

  const current = shown ?? deck[index] ?? deck[0];
  if (!current) return null;
  const [lead, ...rest] = current.items;
  const offsets = wide ? [-3, -2, -1, 0, 1, 2, 3] : [-2, -1, 0, 1, 2];

  return (
    <section className="overflow-hidden bg-white px-3 py-5 sm:px-6 sm:py-8">
      <div className="mx-auto max-w-6xl">
        <div className="flex items-end justify-center gap-2 sm:gap-3" aria-label="Secciones">
          {offsets.map((offset) => {
            const at = (index + offset + deck.length) % deck.length;
            const section = deck[at];
            const active = offset === 0;
            const size = active ? "h-14 w-14" : Math.abs(offset) === 1 ? "h-11 w-11" : "h-9 w-9 opacity-45";
            return (
              <button
                key={`${section.slug}-${offset}`}
                type="button"
                aria-label={section.title}
                aria-current={active ? "true" : undefined}
                onClick={() => choose(at)}
                className={`relative flex shrink-0 items-center justify-center rounded-full border bg-[#f4faf8] text-[#0f6e62] transition-all duration-500 ease-out motion-reduce:transition-none ${size} ${active ? "border-[#0f6e62] bg-[#e7f3f0]" : "border-transparent"}`}
              >
                {active && !paused && (
                  <svg viewBox="0 0 44 44" className="pointer-events-none absolute -inset-1 h-[calc(100%+8px)] w-[calc(100%+8px)] -rotate-90" aria-hidden="true">
                    <circle cx="22" cy="22" r="18" fill="none" stroke="#0f6e62" strokeWidth="2" className="anillo-giro" />
                  </svg>
                )}
                <CategoryIcon slug={section.slug} className={active ? "h-6 w-6" : "h-5 w-5"} />
              </button>
            );
          })}
        </div>

        <div key={current.slug} className={`${leaving ? "vitrina-sale" : "vitrina-entra"} mt-5`}>
          <div className="mb-3 flex items-end justify-between gap-3">
            <div className="min-w-0">
              <h2 className="truncate text-2xl font-black uppercase text-[#12312e]">{current.title}</h2>
              <p className="text-sm text-[#12312e]/60">{current.count === 1 ? "1 producto" : `${current.count} productos`}</p>
            </div>
            <Link href={current.href} className="shrink-0 rounded-full bg-[#0f6e62] px-4 py-2 text-sm font-bold text-white">
              {current.slug === "ofertas" ? "Ver oferta" : "Ver todo"}
            </Link>
          </div>
          <div className="grid gap-3 md:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
            {lead && <ProductCard item={lead} lead />}
            {rest.length > 0 && (
              <div className="grid grid-cols-2 gap-3">
                {rest.slice(0, 4).map((item) => <ProductCard key={item.slug} item={item} />)}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
