"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { RailItem } from "@/components/ProductRail";

export type ShowcaseGroup = {
  slug: string;
  title: string;
  href: string;
  items: RailItem[];
};

function money(value: number) {
  return new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 }).format(value);
}

function nextIndex(current: number, other: number, total: number) {
  if (total < 2) return current;
  let next = (current + 1) % total;
  if (next === other) next = (next + 1) % total;
  return next;
}

function Lane({
  group,
  step,
  glide,
  onEnter,
  onLeave,
}: {
  group: ShowcaseGroup;
  step: number;
  glide: boolean;
  onEnter: () => void;
  onLeave: () => void;
}) {
  const frame = useRef<HTMLDivElement>(null);
  const [slot, setSlot] = useState(172);

  useEffect(() => {
    const box = frame.current;
    if (!box) return;
    const measure = () => {
      const card = box.querySelector<HTMLElement>("[data-vitrina]");
      setSlot((card?.offsetWidth || 160) + 12);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(box);
    return () => observer.disconnect();
  }, [group.slug]);

  return (
    <section className="py-6" onMouseEnter={onEnter} onMouseLeave={onLeave} onFocus={onEnter} onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) onLeave(); }}>
      <div key={group.slug} className="vitrina-entra mb-3 flex items-end justify-between gap-3 px-5">
        <h2 className="text-xl font-black uppercase text-[#12312e]">{group.title}</h2>
        <Link href={group.href} className="text-sm font-bold text-[#0f6e62]">Ver todo</Link>
      </div>
      <div ref={frame} className="overflow-hidden px-5">
        <div className={`flex gap-3 ${glide ? "transition-transform duration-700 ease-out motion-reduce:transition-none" : ""}`} style={{ transform: `translateX(-${step * slot}px)` }}>
          {group.items.map((item) => (
            <Link
              key={item.slug}
              href={`/producto/${item.slug}`}
              data-vitrina=""
              className="w-40 shrink-0 rounded-xl border border-[#12312e]/10 bg-white p-2 hover:border-[#0f6e62]"
            >
              <div className="relative flex h-16 items-center justify-center overflow-hidden rounded-lg bg-[#e7f3f0]">
                {item.image ? <img src={item.image} alt="" className="h-full w-full object-cover" /> : <span className="text-2xl font-black text-[#0f6e62]">{item.name.slice(0, 1)}</span>}
                {item.offer && <span className="absolute left-1.5 top-1.5 rounded-full bg-[#c2410c] px-1.5 py-0.5 text-[10px] font-bold text-white">Oferta</span>}
              </div>
              <p className="mt-2 text-[10px] font-bold uppercase tracking-wide text-[#0f6e62]">{item.category}</p>
              <h3 className="mt-0.5 line-clamp-2 min-h-9 text-xs font-bold leading-snug">{item.name}</h3>
              <p className="mt-1 text-sm font-black">{money(item.price)}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export function ProductShowcase({ groups }: { groups: ShowcaseGroup[] }) {
  const total = groups.length;
  const startB = total > 1 ? Math.ceil(total / 2) % total : 0;
  const [indexA, setIndexA] = useState(0);
  const [indexB, setIndexB] = useState(startB === 0 && total > 1 ? 1 : startB);
  const [stepA, setStepA] = useState(0);
  const [stepB, setStepB] = useState(0);
  const [glideA, setGlideA] = useState(true);
  const [glideB, setGlideB] = useState(true);
  const [hold, setHold] = useState<"a" | "b" | null>(null);
  const live = useRef({ indexA: 0, indexB: startB === 0 && total > 1 ? 1 : startB, stepA: 0, stepB: 0, hold: null as "a" | "b" | null });

  live.current = { indexA, indexB, stepA, stepB, hold };

  useEffect(() => {
    if (total === 0) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    function visibleIn(selector: string) {
      const box = document.querySelector(`${selector} .overflow-hidden`);
      if (!box) return 3;
      return Math.max(1, Math.floor((box.clientWidth + 12) / 172));
    }

    function advance(lane: "a" | "b") {
      const now = live.current;
      if (now.hold === lane) return;
      const index = lane === "a" ? now.indexA : now.indexB;
      const other = lane === "a" ? now.indexB : now.indexA;
      const step = lane === "a" ? now.stepA : now.stepB;
      const count = groups[index]?.items.length ?? 0;
      const room = visibleIn(lane === "a" ? "[data-lane='a']" : "[data-lane='b']");
      const last = Math.max(0, count - room);
      if (step < last) {
        if (lane === "a") setStepA(step + 1);
        else setStepB(step + 1);
        return;
      }
      const following = nextIndex(index, other, total);
      if (lane === "a") {
        setGlideA(false);
        setStepA(0);
        setIndexA(following);
        requestAnimationFrame(() => setGlideA(true));
      } else {
        setGlideB(false);
        setStepB(0);
        setIndexB(following);
        requestAnimationFrame(() => setGlideB(true));
      }
    }

    const first = window.setInterval(() => advance("a"), 2600);
    let second = 0;
    const wait = window.setTimeout(() => {
      second = window.setInterval(() => advance("b"), 2600);
    }, 1300);
    return () => {
      window.clearInterval(first);
      window.clearInterval(second);
      window.clearTimeout(wait);
    };
  }, [groups, total]);

  if (total === 0) return null;
  const left = groups[indexA];
  const right = groups[indexB];
  if (!left) return null;

  return (
    <div>
      <div data-lane="a">
        <Lane group={left} step={stepA} glide={glideA} onEnter={() => setHold("a")} onLeave={() => setHold((current) => current === "a" ? null : current)} />
      </div>
      {right && right.slug !== left.slug && (
        <div data-lane="b">
          <Lane group={right} step={stepB} glide={glideB} onEnter={() => setHold("b")} onLeave={() => setHold((current) => current === "b" ? null : current)} />
        </div>
      )}
    </div>
  );
}
