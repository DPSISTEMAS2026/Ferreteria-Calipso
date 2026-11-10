"use client";

import Link from "next/link";
import { useCart } from "@/components/CartContext";
import { freeShippingFrom, store, todayLabel } from "@/lib/store";

function money(value: number) {
  const body = Math.round(value).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `$${body}`;
}

export default function CartPage() {
  const { lines, ready, subtotal, setQty, remove } = useCart();
  const free = subtotal >= freeShippingFrom;
  const missing = Math.max(0, freeShippingFrom - subtotal);
  const message = lines.map((line) => `${line.qty} × ${line.name} — ${money(line.price * line.qty)}`).join("\n");
  const shipping = free ? "Envío gratis." : `Retiro en tienda. El envío es gratis desde ${money(freeShippingFrom)}.`;
  const text = encodeURIComponent(`Hola, quiero hacer este pedido en Ferretería Calipso:\n${message}\nTotal ${money(subtotal)}\n${shipping}`);

  return (
    <main>
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-5">
        <h1 className="text-3xl font-black uppercase text-[#12312e]">Carrito</h1>
        {!ready ? <p className="mt-6 text-sm text-[#12312e]/60">Cargando el carrito.</p> : lines.length === 0 ? (
          <div className="mt-6 rounded-2xl bg-white p-6">
            <p>El carrito está vacío.</p>
            <Link href="/" className="mt-3 inline-block text-sm font-bold text-[#0f6e62]">Volver a la tienda</Link>
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            <ul className="space-y-3">
              {lines.map((line) => (
                <li key={line.slug} className="flex gap-3 rounded-2xl border border-[#12312e]/10 bg-white p-3">
                  <Link href={`/producto/${line.slug}`} className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#f7fbfa]">
                    {line.image ? <img src={line.image} alt="" className="h-full w-full object-contain" /> : <span className="text-2xl font-black text-[#0f6e62]">{line.name.slice(0, 1)}</span>}
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

            <section className="rounded-2xl border border-[#12312e]/10 bg-white p-4 text-sm">
              <p className="flex justify-between text-base font-black"><span>Total</span><span>{money(subtotal)}</span></p>
              <p className="mt-3 font-bold">{free ? "Envío gratis" : `Te faltan ${money(missing)} para el envío gratis`}</p>
              <p className="mt-1 text-[#12312e]/70">El envío es gratis desde {money(freeShippingFrom)}. Bajo ese monto el pedido se retira en la tienda.</p>
              <div className="mt-4">
                <p className="font-bold">Retiro en tienda</p>
                <a href={store.maps} className="text-[#0f6e62]">{store.address}</a>
                <p>{todayLabel()}</p>
              </div>
            </section>

            <a href={`${store.whatsapp}?text=${text}`} className="inline-flex h-11 w-full items-center justify-center rounded-lg bg-[#0f6e62] text-sm font-bold text-white hover:bg-[#12312e]">
              Enviar pedido por WhatsApp
            </a>
          </div>
        )}
      </div>
    </main>
  );
}
