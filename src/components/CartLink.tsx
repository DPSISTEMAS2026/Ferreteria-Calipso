"use client";

import { useCart } from "@/components/CartContext";
import { useMenu } from "@/components/MenuContext";

export function CartLink() {
  const { count, open, toggle } = useCart();
  const menu = useMenu();

  return (
    <button
      type="button"
      aria-label={count > 0 ? `Carrito, ${count} productos` : "Carrito"}
      aria-expanded={open}
      aria-controls="carrito-tienda"
      onClick={() => {
        menu.close();
        toggle();
      }}
      className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-[#12312e] hover:bg-[#e7f3f0] sm:h-12 sm:w-12"
    >
      <svg viewBox="0 0 24 24" className="h-6 w-6 sm:h-7 sm:w-7" aria-hidden="true">
        <path fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" d="M6 7h12l-1 12H7L6 7z" />
        <path fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" d="M9 7a3 3 0 0 1 6 0" />
      </svg>
      {count > 0 && <span className="absolute right-1 top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#c2410c] px-1 text-[11px] font-bold text-white">{count}</span>}
    </button>
  );
}
