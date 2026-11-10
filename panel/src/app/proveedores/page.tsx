"use client";

import { useAdminCatalog } from "@/lib/use-catalog";

export default function ProveedoresPage() {
  const { items, error, ready } = useAdminCatalog();
  const rows = [...items.reduce((map, item) => {
    const current = map.get(item.supplier) ?? { name: item.supplier, count: 0 };
    current.count += 1;
    map.set(item.supplier, current);
    return map;
  }, new Map<string, { name: string; count: number }>()).values()].sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, "es"));

  return (
    <main>
      <h1>Proveedores</h1>
      {error && <p>{error}</p>}
      <div className="sheet">
        <table>
          <thead>
            <tr>
              <th>Proveedor</th>
              <th>Productos</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.name}>
                <td><strong>{row.name}</strong></td>
                <td>{row.count}</td>
              </tr>
            ))}
            {ready && rows.length === 0 && (
              <tr><td colSpan={2}>Sin proveedores en el catálogo.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
