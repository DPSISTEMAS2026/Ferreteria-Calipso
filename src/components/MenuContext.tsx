"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import type { MenuNode } from "@/components/CategoryMenu";

type MenuState = {
  menu: MenuNode[];
  open: boolean;
  toggle: () => void;
  close: () => void;
};

const MenuContext = createContext<MenuState | null>(null);

export function MenuProvider({ menu, children }: { menu: MenuNode[]; children: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const toggle = useCallback(() => setOpen((current) => !current), []);
  const close = useCallback(() => setOpen(false), []);

  return (
    <MenuContext.Provider value={{ menu, open, toggle, close }}>
      {children}
    </MenuContext.Provider>
  );
}

export function useMenu() {
  const value = useContext(MenuContext);
  if (!value) throw new Error("El menú está fuera de la tienda");
  return value;
}
