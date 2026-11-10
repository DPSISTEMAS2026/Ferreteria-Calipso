"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useCart } from "@/components/CartContext";
import { freeShippingFrom, store, todayLabel } from "@/lib/store";

function money(value: number) {
  return `$${Math.round(value).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")}`;
}

export function CartDrawer() {
  const { lines, ready, open, close, subtotal, setQty, remove } = useCart();
  const [mounted, setMounted] = useState(false);
  const free = subtotal >= freeShippingFrom;
  const missing = Math.max(0, freeShippingFrom - subtotal);
  const message = lines.map((line) => `${line.qty} × ${line.name} — ${money(line.price * line.qty)}`).join("\n");
  const shipping = free ? "Envío gratis." : `Retiro en tienda. El envío es gratis desde ${money(freeShippingFrom)}.`;
  const text = encodeURIComponent(`Hola, quiero hacer este pedido en Ferretería Calipso:\n${message}\nTotal ${money(subtotal)}\n${shipping}`);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, close]);

  if (!mounted) return null;

  return createPortal(
    <div className={`fixed inset-0 z-50 ${open ? "" : "pointer-events-none"}`}>
      <button
        type="button"
        aria-label="Cerrar carrito"
        className={`absolute inset-0 bg-black/50 transition-opacity duration-300 motion-reduce:transition-none ${open ? "opacity-100" : "opacity-0"}`}
        onClick={close}
      />
      <aside
        id="carrito-tienda"
        aria-label="Carrito"
        aria-hidden={!open}
        inert={!open}
        className={`absolute right-0 top-0 z-10 flex h-full w-[min(100%,420px)] flex-col bg-white shadow-2xl transition-transform duration-300 ease-out motion-reduce:transition-none ${open ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="flex items-center justify-between border-b border-[#12312e]/10 px-4 py-4">
          <p className="text-sm font-bold">Carrito</p>
          <button type="button" onClick={close} className="text-sm font-bold">Cerrar</button>
        </div>
        {!ready ? <p className="px-4 py-6 text-sm text-[#12312e]/60">Cargando el carrito.</p> : lines.length === 0 ? (
          <div className="px-4 py-6">
            <p>El carrito está vacío.</p>
            <button type="button" onClick={close} className="mt-3 text-sm font-bold text-[#0f6e62]">Seguir mirando</button>
          </div>
        ) : (
          <>
            <ul className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-4">
              {lines.map((line) => (
                <li key={line.slug} className="flex gap-3">
                  <Link href={`/producto/${line.slug}`} className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#f7fbfa]">
                    {line.image ? <img src={line.image} alt="" className="h-full w-full object-contain" /> : <span className="text-lg font-black text-[#0f6e62]">{line.name.slice(0, 1)}</span>}
                  </Link>
                  <div className="min-w-0 flex-1">
                    <Link href={`/producto/${line.slug}`} className="line-clamp-2 text-sm font-bold">{line.name}</Link>
                    <p className="mt-1 text-sm font-black">{money(line.price)}</p>
                    <div className="mt-2 flex items-center gap-3">
                      <div className="flex h-8 items-center rounded-lg border border-[#12312e]/15">
                        <button type="button" onClick={() => setQty(line.slug, line.qty - 1)} className="h-8 w-8 font-bold" aria-label={`Disminuir ${line.name}`}>−</button>
                        <span className="w-6 text-center text-sm font-bold">{line.qty}</span>
                        <button type="button" onClick={() => setQty(line.slug, line.qty + 1)} className="h-8 w-8 font-bold" aria-label={`Aumentar ${line.name}`}>+</button>
                      </div>
                      <button type="button" onClick={() => remove(line.slug)} className="text-sm font-bold text-[#c2410c]">Quitar</button>
                    </div>
                  </div>
                  <p className="text-sm font-black">{money(line.price * line.qty)}</p>
                </li>
              ))}
            </ul>
            <div className="border-t border-[#12312e]/10 px-4 py-4 text-sm">
              <p className="flex justify-between text-base font-black"><span>Total</span><span>{money(subtotal)}</span></p>
              <p className="mt-3 font-bold">{free ? "Envío gratis" : `Te faltan ${money(missing)} para el envío gratis`}</p>
              <p className="mt-1 text-[#12312e]/70">El envío es gratis desde {money(freeShippingFrom)}. Bajo ese monto el pedido se retira en la tienda.</p>
              <div className="mt-3">
                <p className="font-bold">Retiro en tienda</p>
                <a href={store.maps} className="text-[#0f6e62]">{store.address}</a>
                <p>{todayLabel()}</p>
              </div>
              <a href={`${store.whatsapp}?text=${text}`} className="mt-4 inline-flex h-11 w-full items-center justify-center rounded-lg bg-[#0f6e62] text-sm font-bold text-white hover:bg-[#12312e]">
                Enviar pedido por WhatsApp
              </a>
            </div>
          </>
        )}
      </aside>
    </div>,
    document.body,
  );
}
