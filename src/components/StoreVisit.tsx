"use client";

import { useMemo, useState, type FormEvent } from "react";
import { store } from "@/lib/store";

type QuoteProduct = { name: string; slug: string; price: number };

function fold(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

function money(value: number) {
  return `$${Math.round(value).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")}`;
}

export function StoreVisit({ products }: { products: QuoteProduct[] }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [picked, setPicked] = useState<QuoteProduct | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [note, setNote] = useState("");
  const needle = fold(query.trim());
  const matches = useMemo(() => {
    if (needle.length < 3 || picked) return [];
    return products
      .filter((product) => fold(product.name).includes(needle))
      .slice(0, 6);
  }, [needle, picked, products]);

  const box = [
    store.longitude - 0.01,
    store.latitude - 0.008,
    store.longitude + 0.01,
    store.latitude + 0.008,
  ].join(",");
  const map = `https://www.openstreetmap.org/export/embed.html?bbox=${box}&layer=mapnik&marker=${store.latitude},${store.longitude}`;

  function send(event: FormEvent) {
    event.preventDefault();
    if (!picked || name.trim().length < 2) return;
    const text = [
      "Hola, quiero cotizar:",
      picked.name,
      `Precio de vitrina ${money(picked.price)}`,
      `Nombre: ${name.trim()}`,
      phone.trim() ? `Teléfono: ${phone.trim()}` : "",
      note.trim() ? note.trim() : "",
    ].filter(Boolean).join("\n");
    window.open(`${store.whatsapp}?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
  }

  return (
    <section className="mx-auto grid max-w-6xl items-start gap-4 px-4 py-10 md:grid-cols-2">
      <div className="relative h-80 overflow-hidden rounded-3xl bg-white shadow-sm md:h-[32rem]">
        <iframe title="Mapa de Ferretería Calipso" src={map} className="h-full w-full border-0" loading="lazy" />
        <button
          type="button"
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-full rounded-full bg-[#12312e] px-4 py-2 text-sm font-bold text-white shadow-lg"
          onClick={() => setOpen((value) => !value)}
        >
          Ferretería Calipso
        </button>
        {open && (
          <div className="absolute bottom-4 left-4 right-4 flex gap-2 rounded-2xl bg-white p-3 shadow-lg">
            <a className="flex-1 rounded-full bg-[#0f6e62] px-3 py-2 text-center text-sm font-bold text-white" href={store.maps} target="_blank" rel="noreferrer">Google Maps</a>
            <a className="flex-1 rounded-full border border-[#12312e] px-3 py-2 text-center text-sm font-bold" href={store.waze} target="_blank" rel="noreferrer">Waze</a>
          </div>
        )}
      </div>
      <form className="rounded-3xl bg-white p-5 shadow-sm" onSubmit={send}>
        <h2 className="text-3xl uppercase tracking-wide">Cotizar</h2>
        <div className="relative mt-4">
          <label className="block text-sm font-semibold">
            Producto
            <input
              className="mt-1 w-full rounded-2xl border border-[#d5ddd9] px-3 py-2"
              value={picked ? picked.name : query}
              placeholder="Escribe el producto"
              aria-label="Buscar producto para cotizar"
              onChange={(event) => {
                setPicked(null);
                setQuery(event.target.value);
              }}
            />
          </label>
          {matches.length > 0 && (
            <ul className="absolute left-0 right-0 top-full z-20 mt-2 max-h-64 overflow-auto rounded-2xl border border-[#e2e8e0] bg-white shadow-xl">
              {matches.map((product) => (
                <li key={product.slug}>
                  <button
                    type="button"
                    className="flex w-full items-center justify-between gap-3 px-3 py-2 text-left hover:bg-[#f4f7f6]"
                    onClick={() => { setPicked(product); setQuery(product.name); }}
                  >
                    <span>{product.name}</span>
                    <strong>{money(product.price)}</strong>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        <label className="mt-3 block text-sm font-semibold">
          Nombre
          <input className="mt-1 w-full rounded-2xl border border-[#d5ddd9] px-3 py-2" value={name} onChange={(event) => setName(event.target.value)} required />
        </label>
        <label className="mt-3 block text-sm font-semibold">
          Teléfono
          <input className="mt-1 w-full rounded-2xl border border-[#d5ddd9] px-3 py-2" value={phone} inputMode="tel" onChange={(event) => setPhone(event.target.value)} />
        </label>
        <label className="mt-3 block text-sm font-semibold">
          Comentario
          <textarea className="mt-1 h-20 w-full rounded-2xl border border-[#d5ddd9] px-3 py-2" value={note} onChange={(event) => setNote(event.target.value)} />
        </label>
        <button type="submit" className="mt-4 rounded-full bg-[#0f6e62] px-5 py-2 font-bold text-white" disabled={!picked}>Enviar cotización</button>
      </form>
    </section>
  );
}
