"use client";

import { Children, useEffect, useRef, useState } from "react";
import { CategoryIcon } from "@/components/CategoryIcon";

export type HomeMark = {
  id: string;
  label: string;
  slug?: string;
};

export function HomeSnap({ items, children }: { items: HomeMark[]; children: React.ReactNode }) {
  const faces = Children.toArray(children);
  const [index, setIndex] = useState(0);
  const [tilt, setTilt] = useState(0);
  const [shown, setShown] = useState(false);
  const stage = useRef<HTMLDivElement>(null);
  const indexRef = useRef(0);
  const lock = useRef(0);
  const count = faces.length;

  useEffect(() => {
    indexRef.current = index;
  }, [index]);

  useEffect(() => {
    const node = stage.current;
    if (!node) return;

    const engaged = () => {
      const rect = node.getBoundingClientRect();
      return rect.top < 96 && rect.bottom > window.innerHeight * 0.62;
    };

    const place = () => setShown(node.getBoundingClientRect().top < window.innerHeight * 0.78);

    const turn = (direction: 1 | -1) => {
      const next = indexRef.current + direction;
      if (next < 0 || next >= count) return false;
      if (performance.now() < lock.current) return true;
      lock.current = performance.now() + 740;
      indexRef.current = next;
      setIndex(next);
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return true;
      setTilt(direction * 16);
      window.setTimeout(() => setTilt(0), 280);
      return true;
    };

    const onWheel = (event: WheelEvent) => {
      if (Math.abs(event.deltaX) > Math.abs(event.deltaY)) return;
      if (!engaged()) return;
      const direction = event.deltaY > 0 ? 1 : -1;
      if (!turn(direction as 1 | -1)) return;
      event.preventDefault();
    };

    let startY = 0;
    const onTouchStart = (event: TouchEvent) => {
      startY = event.touches[0]?.clientY ?? 0;
    };
    const onTouchMove = (event: TouchEvent) => {
      if (!engaged()) return;
      const y = event.touches[0]?.clientY ?? startY;
      const direction = startY - y > 0 ? 1 : -1;
      const next = indexRef.current + direction;
      if (next < 0 || next >= count) return;
      event.preventDefault();
    };
    const onTouchEnd = (event: TouchEvent) => {
      if (!engaged()) return;
      const y = event.changedTouches[0]?.clientY ?? startY;
      const delta = startY - y;
      if (Math.abs(delta) < 48) return;
      turn(delta > 0 ? 1 : -1);
    };

    place();
    window.addEventListener("scroll", place, { passive: true });
    node.addEventListener("wheel", onWheel, { passive: false });
    node.addEventListener("touchstart", onTouchStart, { passive: true });
    node.addEventListener("touchmove", onTouchMove, { passive: false });
    node.addEventListener("touchend", onTouchEnd);
    return () => {
      window.removeEventListener("scroll", place);
      node.removeEventListener("wheel", onWheel);
      node.removeEventListener("touchstart", onTouchStart);
      node.removeEventListener("touchmove", onTouchMove);
      node.removeEventListener("touchend", onTouchEnd);
    };
  }, [count]);

  function go(id: string) {
    const next = items.findIndex((item) => item.id === id);
    if (next < 0) return;
    indexRef.current = next;
    lock.current = performance.now() + 740;
    setIndex(next);
    setTilt(0);
    stage.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }

  const active = items[index]?.id ?? "";

  return (
    <>
      <nav
        aria-label="Secciones de la portada"
        aria-hidden={!shown}
        inert={!shown}
        className={`fixed inset-x-0 bottom-0 z-20 flex gap-2 overflow-x-auto border-t border-[#12312e]/10 bg-white/95 px-3 py-2 shadow-lg transition-opacity duration-300 md:inset-x-auto md:bottom-4 md:left-2 md:top-28 md:w-40 md:flex-col md:overflow-y-auto md:rounded-2xl md:border md:py-2 ${shown ? "opacity-100" : "pointer-events-none opacity-0"}`}
      >
        {items.map((item, itemIndex) => {
          const current = item.id === active;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => go(item.id)}
              aria-current={current ? "true" : undefined}
              className={`flex shrink-0 items-center gap-2 rounded-full px-2 py-1.5 text-left text-xs font-bold md:rounded-xl md:px-2 md:py-2 ${current ? "bg-[#e7f3f0] text-[#0f6e62]" : "text-[#12312e]/75 hover:bg-[#f4faf8]"}`}
            >
              <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${current ? "bg-[#0f6e62] text-white" : "bg-[#f4f7f6] text-[#0f6e62]"}`}>
                {item.slug ? <CategoryIcon slug={item.slug} className="h-4 w-4" /> : <span>{item.label.slice(0, 1)}</span>}
              </span>
              <span className="truncate pr-1 md:pr-0">{item.label}</span>
              <span className="sr-only">{itemIndex + 1}</span>
            </button>
          );
        })}
      </nav>
      <div ref={stage} className="tombola relative h-[calc(100svh-8.75rem)] overflow-hidden md:h-[calc(100svh-4.75rem)]">
        <div className="tombola-scene" style={{ transform: `rotateX(${tilt}deg)` }}>
          <div className="tombola-reel" style={{ transform: `translateY(${index * -100}%)` }}>
            {faces.map((face, faceIndex) => (
              <div key={items[faceIndex]?.id ?? faceIndex} id={items[faceIndex]?.id} className="tombola-face" aria-hidden={faceIndex !== index}>
                {face}
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
