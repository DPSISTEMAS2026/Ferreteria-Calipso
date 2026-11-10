"use client";

import Link from "next/link";
import { useAdminCatalog } from "@/lib/use-catalog";

export default function ResumenPage() {
  const { items, categories, error, ready } = useAdminCatalog();
  const suppliers = new Set(items.map((item) => item.supplier).filter(Boolean));
  const mothers = categories.filter((category) => !category.parentId);

  return (
    <main>
      <h1>Resumen</h1>
      {error && <p>{error}</p>}
      <div className="cards">
        <Link href="/catalogo"><strong>{ready ? items.length : "—"}</strong><span>Productos en catálogo</span></Link>
        <Link href="/proveedores"><strong>{ready ? suppliers.size : "—"}</strong><span>Proveedores</span></Link>
        <Link href="/reportes"><strong>{ready ? mothers.length : "—"}</strong><span>Categorías madre</span></Link>
      </div>
      <div className="cards">
        <Link href="/caja"><strong>Caja</strong><span>Punto de venta</span></Link>
        <Link href="/inventarios"><strong>Stock</strong><span>Inventarios</span></Link>
        <Link href="/compras"><strong>Pedidos</strong><span>Compras</span></Link>
        <Link href="/catalogo"><strong>Vitrina</strong><span>F2, F3 y F4</span></Link>
      </div>
    </main>
  );
}
