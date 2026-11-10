"use client";

import { useEffect, useState } from "react";
import { isStoreOpen, store, todayLabel } from "@/lib/store";

export function StoreHero() {
  const [open, setOpen] = useState(false);
  const [label, setLabel] = useState("Revisando horario");

  useEffect(() => {
    const tick = () => {
      setOpen(isStoreOpen());
      setLabel(todayLabel());
    };
    tick();
    const timer = window.setInterval(tick, 30_000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <section className="relative min-h-[68vh] overflow-hidden bg-[#0c3330] text-white">
      <img
        src="/local/abierta.jpg"
        alt={open ? "Portón abierto de Ferretería Calipso" : ""}
        className="absolute inset-0 h-full w-full object-cover object-center"
      />
      <img
        src="/local/cerrada.jpg"
        alt={open ? "" : "Fachada cerrada de Ferretería Calipso"}
        className={`absolute inset-0 h-full w-full object-cover object-center transition-transform duration-[1400ms] ease-in-out motion-reduce:transition-none ${open ? "-translate-y-full" : "translate-y-0"}`}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />
      <div className="relative z-10 mx-auto flex min-h-[68vh] max-w-6xl flex-col justify-end px-5 pb-6">
        <h1 className="text-2xl font-black uppercase leading-none sm:text-4xl">{store.name}</h1>
        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm">
          <span className={`rounded-full px-3 py-1 font-bold ${open ? "bg-[#8ee0c8] text-[#0c3330]" : "bg-white text-[#0c3330]"}`}>
            {open ? "Abierta ahora" : "Cerrada ahora"}
          </span>
          <span className="text-white/90">{label}</span>
          <a className="underline" href={store.phoneHref}>{store.phone}</a>
          <a className="underline" href={store.maps}>{store.address}</a>
        </div>
      </div>
    </section>
  );
}
