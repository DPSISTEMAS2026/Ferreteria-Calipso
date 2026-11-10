"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { CategoryMenu } from "@/components/CategoryMenu";
import { useCart } from "@/components/CartContext";
import { useMenu } from "@/components/MenuContext";
import type { SearchProduct } from "@/components/SearchField";

export function SideMenu({ products }: { products: SearchProduct[] }) {
  const { menu, open, close } = useMenu();
  const [mounted, setMounted] = useState(false);

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
        aria-label="Cerrar menú"
        className={`absolute inset-0 bg-black/50 transition-opacity duration-300 motion-reduce:transition-none ${open ? "opacity-100" : "opacity-0"}`}
        onClick={close}
      />
      <nav
        id="menu-tienda"
        aria-label="Categorías"
        aria-hidden={!open}
        inert={!open}
        className={`relative z-10 flex h-full w-[min(100%,320px)] flex-col overflow-y-auto bg-white shadow-2xl transition-transform duration-300 ease-out motion-reduce:transition-none ${open ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex items-center justify-between px-4 pt-4">
          <p className="text-sm font-bold">Menú</p>
          <button type="button" onClick={close} className="text-sm font-bold">Cerrar</button>
        </div>
        <CategoryMenu menu={menu} products={products} searchId="menu-lateral" onNavigate={close} />
      </nav>
    </div>,
    document.body,
  );
}

export function MenuButton() {
  const { open, toggle } = useMenu();
  const cart = useCart();
  return (
    <button
      type="button"
      className="inline-flex h-11 shrink-0 items-center gap-2 rounded-md border border-[#12312e]/15 px-2.5 text-sm font-bold text-[#12312e] sm:px-3"
      aria-expanded={open}
      aria-controls="menu-tienda"
      onClick={() => {
        cart.close();
        toggle();
      }}
    >
      <svg viewBox="0 0 20 20" className="h-5 w-5" aria-hidden="true">
        <path d="M3 5h14M3 10h14M3 15h14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
      <span className="max-sm:sr-only">Menú</span>
    </button>
  );
}
