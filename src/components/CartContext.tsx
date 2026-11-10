"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";

export type CartLine = {
  slug: string;
  name: string;
  price: number;
  image: string | null;
  qty: number;
};

type CartValue = {
  lines: CartLine[];
  ready: boolean;
  open: boolean;
  count: number;
  subtotal: number;
  add: (line: CartLine) => void;
  setQty: (slug: string, qty: number) => void;
  remove: (slug: string) => void;
  toggle: () => void;
  close: () => void;
};

const CartContext = createContext<CartValue | null>(null);
const storageKey = "calipso-carrito";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [lines, setLines] = useState<CartLine[] | null>(null);
  const [open, setOpen] = useState(false);
  const toggle = useCallback(() => setOpen((current) => !current), []);
  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      setLines(raw ? JSON.parse(raw) as CartLine[] : []);
    } catch {
      setLines([]);
    }
  }, []);

  useEffect(() => {
    if (lines === null) return;
    localStorage.setItem(storageKey, JSON.stringify(lines));
  }, [lines]);

  const value = useMemo<CartValue>(() => {
    const current = lines ?? [];
    return {
      lines: current,
      ready: lines !== null,
      open,
      count: current.reduce((total, line) => total + line.qty, 0),
      subtotal: current.reduce((total, line) => total + line.price * line.qty, 0),
      toggle,
      close,
      add(line) {
        setLines((previous) => {
          const list = previous ?? [];
          const found = list.find((item) => item.slug === line.slug);
          if (!found) return [...list, { ...line, qty: Math.min(99, line.qty) }];
          return list.map((item) => item.slug === line.slug ? { ...item, price: line.price, image: line.image, qty: Math.min(99, item.qty + line.qty) } : item);
        });
        setOpen(true);
      },
      setQty(slug, qty) {
        setLines((previous) => (previous ?? []).flatMap((item) => {
          if (item.slug !== slug) return [item];
          if (qty < 1) return [];
          return [{ ...item, qty: Math.min(99, qty) }];
        }));
      },
      remove(slug) {
        setLines((previous) => (previous ?? []).filter((item) => item.slug !== slug));
      },
    };
  }, [lines, open, toggle, close]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const value = useContext(CartContext);
  if (!value) throw new Error("El carrito no está disponible");
  return value;
}
