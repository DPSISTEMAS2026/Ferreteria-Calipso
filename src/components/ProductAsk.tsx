"use client";

import { useState } from "react";
import { useCart } from "@/components/CartContext";
import { useMenu } from "@/components/MenuContext";

export function ProductAsk({
  slug,
  name,
  price,
  image,
}: {
  slug: string;
  name: string;
  price: number;
  image: string | null;
}) {
  const { add } = useCart();
  const menu = useMenu();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  return (
    <div className="mt-6">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex h-11 items-center rounded-lg border border-[#12312e]/15 bg-white">
          <button type="button" onClick={() => setQty((current) => Math.max(1, current - 1))} className="h-11 w-10 text-lg font-bold text-[#12312e]" aria-label="Disminuir cantidad">−</button>
          <span className="w-8 text-center text-sm font-bold">{qty}</span>
          <button type="button" onClick={() => setQty((current) => Math.min(99, current + 1))} className="h-11 w-10 text-lg font-bold text-[#12312e]" aria-label="Aumentar cantidad">+</button>
        </div>
        <button
          type="button"
          onClick={() => {
            menu.close();
            add({ slug, name, price, image, qty });
            setAdded(true);
          }}
          className="inline-flex h-11 flex-1 items-center justify-center rounded-lg bg-[#0f6e62] px-5 text-sm font-bold text-white hover:bg-[#12312e]"
        >
          Agregar al carrito
        </button>
      </div>
      {added && <p className="mt-3 text-sm font-bold text-[#0f6e62]">Agregado al carrito</p>}
    </div>
  );
}
