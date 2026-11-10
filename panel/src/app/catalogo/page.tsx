"use client";

import { useEffect, useMemo, useState } from "react";
import { api, authHeaders } from "@/lib/session";
import { money, useAdminCatalog, type Item } from "@/lib/use-catalog";

const PAGE = 20;
type Factor = "2" | "3" | "4";

function pagePair(current: number, total: number) {
  if (total <= 1) return [1];
  if (current >= total) return [total - 1, total];
  return [current, current + 1];
}

function priceFor(item: Item, factor: Factor) {
  if (factor === "2") return item.priceF2;
  if (factor === "3") return item.priceF3;
  return item.priceF4;
}

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

function factorPrices(item: Item, factor: Factor) {
  const times = Number(factor);
  return {
    sin: Math.round(item.costNet * times),
    con: priceFor(item, factor),
  };
}

export default function CatalogoPage() {
  const { items, categories, error, savePrice } = useAdminCatalog();
  const [query, setQuery] = useState("");
  const [supplier, setSupplier] = useState("todos");
  const [mother, setMother] = useState("todas");
  const [child, setChild] = useState("todas");
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<Item | null>(null);
  const [tab, setTab] = useState<"precio" | "info" | "ventas">("precio");
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState("");
  const [saveError, setSaveError] = useState("");
  const [from, setFrom] = useState(monthStart);
  const [to, setTo] = useState(todayInput);
  const [movement, setMovement] = useState<{ units: number; amount: number; rows: { at: string; qty: number; amount: number }[] } | null>(null);

  const mothers = categories.filter((category) => !category.parentId).sort((a, b) => a.name.localeCompare(b.name, "es"));
  const children = categories.filter((category) => category.parentId === mother).sort((a, b) => a.name.localeCompare(b.name, "es"));
  const names = useMemo(() => new Map(categories.map((category) => [category.id, category.name])), [categories]);
  const suppliers = [...new Set(items.map((item) => item.supplier))].sort((a, b) => a.localeCompare(b, "es"));

  const allowed = useMemo(() => {
    if (child !== "todas") return new Set([child]);
    if (mother === "todas") return null;
    return new Set([mother, ...categories.filter((category) => category.parentId === mother).map((category) => category.id)]);
  }, [categories, child, mother]);

  const needle = query.trim().toLowerCase();
  const visible = items.filter((item) => {
    if (allowed && !allowed.has(item.categoryId)) return false;
    if (supplier !== "todos" && item.supplier !== supplier) return false;
    if (needle && !`${item.name} ${item.supplierCode}`.toLowerCase().includes(needle)) return false;
    return true;
  });
  const pages = Math.max(1, Math.ceil(visible.length / PAGE));
  const current = Math.min(page, pages);
  const rows = visible.slice((current - 1) * PAGE, current * PAGE);
  const numbers = pagePair(current, pages);

  useEffect(() => {
    if (!editing) return;
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") setEditing(null); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [editing]);

  function openEditor(item: Item) {
    setEditing(item);
    setTab("precio");
    setDraft(String(item.salePrice));
    setSaveError("");
    setMovement(null);
  }

  useEffect(() => {
    if (!editing || tab !== "ventas") return;
    const slug = editing.slug;
    fetch(`${api}/admin/sales?slug=${encodeURIComponent(slug)}&from=${from}&to=${to}`, { headers: authHeaders() })
      .then((res) => res.json())
      .then((body) => setMovement(body))
      .catch(() => setMovement({ units: 0, amount: 0, rows: [] }));
  }, [editing, tab, from, to]);

  async function commit(item: Item, price: number) {
    if (!Number.isFinite(price) || price < 1) {
      setSaveError("El precio tiene que ser un monto.");
      return;
    }
    setBusy(item.slug);
    setSaveError("");
    try {
      await savePrice(item.slug, Math.round(price));
      setEditing(null);
    } catch {
      setSaveError("No pude guardar el precio.");
    } finally {
      setBusy("");
    }
  }

  return (
    <main>
      <div className="catalog-head">
        <h1>Catálogo</h1>
        <div className="catalog-right">
          <input value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} placeholder="Buscar" aria-label="Buscar producto o código" />
          <Pager current={current} pages={pages} numbers={numbers} onPage={setPage} />
          <select aria-label="Categoría" value={mother} onChange={(event) => { setMother(event.target.value); setChild("todas"); setPage(1); }}>
            <option value="todas">Categorías</option>
            {mothers.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
          </select>
          {children.length > 0 && (
            <select aria-label="Subcategoría" value={child} onChange={(event) => { setChild(event.target.value); setPage(1); }}>
              <option value="todas">Subcategorías</option>
              {children.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
            </select>
          )}
          <select aria-label="Proveedor" value={supplier} onChange={(event) => { setSupplier(event.target.value); setPage(1); }}>
            <option value="todos">Proveedores</option>
            {suppliers.map((name) => <option key={name}>{name}</option>)}
          </select>
        </div>
      </div>
      {error && <p>{error}</p>}
      {saveError && <p>{saveError}</p>}
      <div className="sheet">
        <table>
          <thead>
            <tr>
              <th>Producto</th>
              <th>Costo neto</th>
              <th>Precio</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((item) => (
              <tr key={item.slug}>
                <td>
                  <button type="button" className="name-button" onClick={() => openEditor(item)}>{item.name}</button>
                  <div className="muted">{names.get(item.categoryId)} · {item.supplier} · {item.supplierCode}</div>
                </td>
                <td className="buy">
                  <strong>{money(item.costNet)}</strong>
                  <span className="muted">Con IVA {money(item.costWithTax)}</span>
                </td>
                <td>
                  <div className="price-cell">
                    <strong>{money(item.salePrice)}</strong>
                    <button type="button" className="edit" aria-label={`Editar ${item.name}`} onClick={() => openEditor(item)}>Editar</button>
                  </div>
                </td>
              </tr>
            ))}
            {rows.length === 0 && <tr><td colSpan={3}>No hay productos con estos filtros.</td></tr>}
          </tbody>
        </table>
      </div>
      {editing && (
        <div className="modal-veil" onClick={() => setEditing(null)}>
          <div className="modal product-modal" onClick={(event) => event.stopPropagation()}>
            <div className="modal-photo">
              {editing.imageUrl ? <img src={editing.imageUrl} alt="" /> : <span>Foto por cargar</span>}
            </div>
            <h2>{editing.name}</h2>
            <div className="tabs">
              <button type="button" className={tab === "precio" ? "is-on" : ""} onClick={() => setTab("precio")}>Precio</button>
              <button type="button" className={tab === "info" ? "is-on" : ""} onClick={() => setTab("info")}>Información</button>
              <button type="button" className={tab === "ventas" ? "is-on" : ""} onClick={() => setTab("ventas")}>Ventas</button>
            </div>
            {tab === "precio" && (
              <form onSubmit={(event) => {
                event.preventDefault();
                commit(editing, Number(draft.replace(/\./g, "").replace(",", ".")));
              }}>
                <label>
                  Valor
                  <input inputMode="numeric" aria-label="Valor" value={draft} onChange={(event) => setDraft(event.target.value)} />
                </label>
                <div className="factor-grid">
                  {(["2", "3", "4"] as Factor[]).map((factor) => {
                    const prices = factorPrices(editing, factor);
                    const typed = Number(draft.replace(/\./g, "").replace(",", "."));
                    return (
                      <div key={factor}>
                        <strong>F{factor}</strong>
                        <button type="button" className={typed === prices.sin ? "is-on" : ""} onClick={() => setDraft(String(prices.sin))}>
                          <span>Sin IVA</span>
                          {money(prices.sin)}
                        </button>
                        <button type="button" className={typed === prices.con ? "is-on" : ""} onClick={() => setDraft(String(prices.con))}>
                          <span>Con IVA</span>
                          {money(prices.con)}
                        </button>
                      </div>
                    );
                  })}
                </div>
                {saveError && <p>{saveError}</p>}
                <div className="modal-actions">
                  <button type="button" onClick={() => setEditing(null)}>Cerrar</button>
                  <button type="submit" className="save" disabled={busy === editing.slug}>Guardar</button>
                </div>
              </form>
            )}
            {tab === "info" && (
              <dl className="info-list">
                <div><dt>Categoría</dt><dd>{names.get(editing.categoryId)}</dd></div>
                <div><dt>Proveedor</dt><dd>{editing.supplier}</dd></div>
                <div><dt>Código</dt><dd>{editing.supplierCode}</dd></div>
                <div><dt>Costo neto</dt><dd>{money(editing.costNet)}</dd></div>
                <div><dt>Con IVA</dt><dd>{money(editing.costWithTax)}</dd></div>
                <div><dt>F2</dt><dd>{money(editing.priceF2)}</dd></div>
                <div><dt>F3</dt><dd>{money(editing.priceF3)}</dd></div>
                <div><dt>F4</dt><dd>{money(editing.priceF4)}</dd></div>
                {editing.note && <div><dt>Nota</dt><dd>{editing.note}</dd></div>}
              </dl>
            )}
            {tab === "ventas" && (
              <div className="sales-tab">
                <div className="date-filter">
                  <input type="date" aria-label="Desde" value={from} onChange={(event) => setFrom(event.target.value)} />
                  <input type="date" aria-label="Hasta" value={to} onChange={(event) => setTo(event.target.value)} />
                </div>
                <p className="ticket-total"><span>{movement?.units ?? 0} unidades</span><strong>{money(movement?.amount ?? 0)}</strong></p>
                {(movement?.rows.length ?? 0) === 0 && <p className="muted">Sin salida en estas fechas</p>}
                {movement?.rows.map((row) => (
                  <div key={row.at} className="sale-row">
                    <span>{new Date(row.at).toLocaleString("es-CL", { dateStyle: "short", timeStyle: "short" })}</span>
                    <span>{row.qty}</span>
                    <strong>{money(row.amount)}</strong>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}

function Pager({ current, pages, numbers, onPage }: { current: number; pages: number; numbers: number[]; onPage: (page: number) => void }) {
  return (
    <div className="pager">
      <button type="button" aria-label="Página anterior" disabled={current === 1} onClick={() => onPage(current - 1)}>‹</button>
      {numbers.map((number) => (
        <button key={number} type="button" className={number === current ? "is-on" : ""} onClick={() => onPage(number)}>{number}</button>
      ))}
      <button type="button" aria-label="Página siguiente" disabled={current === pages} onClick={() => onPage(current + 1)}>›</button>
    </div>
  );
}
