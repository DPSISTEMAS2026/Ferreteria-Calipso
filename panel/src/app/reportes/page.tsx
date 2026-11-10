"use client";

import { useEffect, useState } from "react";
import { api, authHeaders } from "@/lib/session";
import { money, useAdminCatalog } from "@/lib/use-catalog";

function todayInput() {
  const date = new Date();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

function monthStart() {
  const date = new Date();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${date.getFullYear()}-${month}-01`;
}

type SaleRow = { slug: string; name: string; qty: number; amount: number };

export default function ReportesPage() {
  const { items, categories, error } = useAdminCatalog();
  const [from, setFrom] = useState(monthStart);
  const [to, setTo] = useState(todayInput);
  const [sales, setSales] = useState<{ units: number; amount: number; products: SaleRow[] } | null>(null);
  const names = new Map(categories.map((category) => [category.id, category.name]));
  const rows = [...items.reduce((map, item) => {
    map.set(item.categoryId, (map.get(item.categoryId) ?? 0) + 1);
    return map;
  }, new Map<string, number>()).entries()]
    .map(([id, count]) => ({ name: names.get(id) ?? id, count }))
    .sort((a, b) => b.count - a.count);

  useEffect(() => {
    fetch(`${api}/admin/sales?from=${from}&to=${to}`, { headers: authHeaders() })
      .then((res) => res.json())
      .then((body) => setSales(body))
      .catch(() => setSales({ units: 0, amount: 0, products: [] }));
  }, [from, to]);

  return (
    <main>
      <div className="catalog-head">
        <h1>Reportes</h1>
        <div className="catalog-right date-filter">
          <input type="date" aria-label="Desde" value={from} onChange={(event) => setFrom(event.target.value)} />
          <input type="date" aria-label="Hasta" value={to} onChange={(event) => setTo(event.target.value)} />
        </div>
      </div>
      {error && <p>{error}</p>}
      <div className="sheet">
        <table>
          <thead>
            <tr>
              <th>Producto</th>
              <th>Unidades</th>
              <th>Monto</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Salida del período</td>
              <td><strong>{sales?.units ?? 0}</strong></td>
              <td><strong>{money(sales?.amount ?? 0)}</strong></td>
            </tr>
            {sales?.products.map((row) => (
              <tr key={row.slug}>
                <td>{row.name}</td>
                <td><strong>{row.qty}</strong></td>
                <td><strong>{money(row.amount)}</strong></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="sheet" style={{ marginTop: 16 }}>
        <table>
          <thead>
            <tr>
              <th>Categoría</th>
              <th>Productos</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.name}>
                <td>{row.name}</td>
                <td><strong>{row.count}</strong></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
