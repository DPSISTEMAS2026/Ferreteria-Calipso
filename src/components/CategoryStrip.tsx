"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { CategoryIcon } from "@/components/CategoryIcon";

type Item = { slug: string; name: string };

function Arrow({ direction, onClick }: { direction: -1 | 1; onClick: () => void }) {
  return (
    <button
      type="button"
      aria-label={direction < 0 ? "Categorías anteriores" : "Categorías siguientes"}
      onClick={onClick}
      className={`absolute top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-[#12312e]/15 bg-white text-[#12312e] shadow-sm ${direction < 0 ? "left-2" : "right-2"}`}
    >
      <svg viewBox="0 0 20 20" className="h-4 w-4" aria-hidden="true">
        <path d={direction < 0 ? "M12 5l-5 5 5 5" : "M8 5l5 5-5 5"} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
}

export function CategoryStrip({ items }: { items: Item[] }) {
  const scroller = useRef<HTMLDivElement>(null);
  const single = useRef<HTMLDivElement>(null);
  const [overflow, setOverflow] = useState(false);
  const [paused, setPaused] = useState(false);
  const pausedRef = useRef(false);
  const drivingUntil = useRef(0);
  const idle = useRef<number | null>(null);

  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  useEffect(() => {
    const box = scroller.current;
    const row = single.current;
    if (!box || !row) return;
    const measure = () => setOverflow(row.scrollWidth > box.clientWidth + 4);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(box);
    observer.observe(row);
    return () => observer.disconnect();
  }, [items]);

  useEffect(() => {
    if (!overflow || paused) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const box = scroller.current;
    const row = single.current;
    if (!box || !row) return;
    let frame = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const loop = row.offsetWidth + 24;
      if (loop > 24) {
        drivingUntil.current = performance.now() + 80;
        box.scrollLeft += 36 * dt;
        if (box.scrollLeft >= loop) box.scrollLeft -= loop;
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [overflow, paused]);

  useEffect(() => () => {
    if (idle.current) window.clearTimeout(idle.current);
  }, []);

  function resume() {
    if (idle.current) window.clearTimeout(idle.current);
    idle.current = null;
    setPaused(false);
  }

  function pauseForManual() {
    setPaused(true);
    if (idle.current) window.clearTimeout(idle.current);
    idle.current = window.setTimeout(() => setPaused(false), 6000);
  }

  useEffect(() => {
    const onPageScroll = () => {
      if (pausedRef.current) resume();
    };
    window.addEventListener("scroll", onPageScroll, { passive: true });
    return () => window.removeEventListener("scroll", onPageScroll);
  }, []);

  function onUserScroll() {
    if (performance.now() < drivingUntil.current) return;
    if (pausedRef.current) resume();
  }

  function step(direction: -1 | 1) {
    const box = scroller.current;
    const row = single.current;
    if (!box || !row) return;
    pauseForManual();
    const first = row.querySelector<HTMLElement>("a");
    const delta = (first?.offsetWidth ?? 96) + 24;
    drivingUntil.current = performance.now() + 500;
    box.scrollBy({ left: direction * delta, behavior: "smooth" });
  }

  function onCategoryClick(event: React.MouseEvent<HTMLAnchorElement>) {
    if (!overflow || pausedRef.current) return;
    event.preventDefault();
    pauseForManual();
  }

  return (
    <section className="relative border-b border-[#12312e]/10 bg-white">
      {overflow && <Arrow direction={-1} onClick={() => step(-1)} />}
      <div
        ref={scroller}
        className="overflow-x-auto px-12 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        onWheel={onUserScroll}
        onTouchMove={onUserScroll}
      >
        <div className={`flex w-max gap-x-6 py-6 ${overflow ? "" : "mx-auto"}`}>
          <div ref={single} className="flex gap-x-6">
            {items.map((category) => (
              <Link key={category.slug} href={`/categoria/${category.slug}`} onClick={onCategoryClick} className="flex w-24 shrink-0 flex-col items-center gap-2 text-center">
                <span className="flex h-16 w-16 items-center justify-center rounded-full border border-[#0f6e62]/30 bg-[#e7f3f0] text-[#0f6e62] transition-transform duration-300 hover:scale-105">
                  <CategoryIcon slug={category.slug} className="h-7 w-7" />
                </span>
                <span className="text-xs font-bold leading-tight text-[#12312e]">{category.name}</span>
              </Link>
            ))}
          </div>
          {overflow && (
            <div className="flex gap-x-6" aria-hidden="true">
              {items.map((category) => (
                <span key={`copia-${category.slug}`} className="flex w-24 shrink-0 flex-col items-center gap-2 text-center">
                  <span className="flex h-16 w-16 items-center justify-center rounded-full border border-[#0f6e62]/30 bg-[#e7f3f0] text-[#0f6e62]">
                    <CategoryIcon slug={category.slug} className="h-7 w-7" />
                  </span>
                  <span className="text-xs font-bold leading-tight text-[#12312e]">{category.name}</span>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
      {overflow && <Arrow direction={1} onClick={() => step(1)} />}
    </section>
  );
}
