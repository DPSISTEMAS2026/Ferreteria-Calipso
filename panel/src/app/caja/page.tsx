"use client";

import { useEffect, useMemo, useState } from "react";
import { api, authHeaders } from "@/lib/session";
import { money, useAdminCatalog, type Item } from "@/lib/use-catalog";

type Line = { slug: string; name: string; price: number; qty: number };
type Method = "efectivo" | "debito" | "credito";
type Shift = { id: string; userName: string; openingFloat: number; openedAt: string };

export default function CajaPage() {
  const { items, categories, error } = useAdminCatalog();
  const [shift, setShift] = useState<Shift | null>(null);
  const [ready, setReady] = useState(false);
  const [opening, setOpening] = useState("0");
  const [counted, setCounted] = useState("");
  const [closing, setClosing] = useState(false);
  const [query, setQuery] = useState("");
  const [mother, setMother] = useState("todas");
  const [child, setChild] = useState("todas");
  const [lines, setLines] = useState<Line[]>([]);
  const [method, setMethod] = useState<Method>("efectivo");
  const [cash, setCash] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const mothers = categories.filter((category) => !category.parentId).sort((a, b) => a.name.localeCompare(b.name, "es"));
  const children = categories.filter((category) => category.parentId === mother).sort((a, b) => a.name.localeCompare(b.name, "es"));

  useEffect(() => {
    fetch(`${api}/admin/shift`, { headers: authHeaders() })
      .then((res) => res.json())
      .then((body) => setShift(body.shift))
      .finally(() => setReady(true));
  }, []);

  const allowed = useMemo(() => {
    if (child !== "todas") return new Set([child]);
    if (mother === "todas") return null;
    return new Set([mother, ...categories.filter((category) => category.parentId === mother).map((category) => category.id)]);
  }, [categories, child, mother]);

  const needle = query.trim().toLowerCase();
  const products = items.filter((item) => {
    if (allowed && !allowed.has(item.categoryId)) return false;
    if (needle && !`${item.name} ${item.supplierCode}`.toLowerCase().includes(needle)) return false;
    return true;
  }).sort((a, b) => Number(Boolean(b.imageUrl)) - Number(Boolean(a.imageUrl)) || a.name.localeCompare(b.name, "es"));

  const total = lines.reduce((sum, line) => sum + line.price * line.qty, 0);
  const received = Math.round(Number(cash.replace(/\./g, "")));
  const change = method === "efectivo" && Number.isFinite(received) ? received - total : 0;

  function add(item: Item) {
    setNotice("");
    setLines((current) => {
      const found = current.find((line) => line.slug === item.slug);
      if (found) return current.map((line) => line.slug === item.slug ? { ...line, qty: Math.min(99, line.qty + 1) } : line);
      return [...current, { slug: item.slug, name: item.name, price: item.salePrice, qty: 1 }];
    });
  }

  function qty(slug: string, next: number) {
    setLines((current) => current.flatMap((line) => {
      if (line.slug !== slug) return [line];
      if (next < 1) return [];
      return [{ ...line, qty: Math.min(99, next) }];
    }));
  }

  async function openShift() {
    setBusy(true);
    setNotice("");
    try {
      const res = await fetch(`${api}/admin/shift`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ float: Number(opening) }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || "No pude abrir la caja");
      setShift(body.shift);
    } catch (err) {
      setNotice(err instanceof Error ? err.message : "No pude abrir la caja");
    } finally {
      setBusy(false);
    }
  }

  async function closeShift() {
    setBusy(true);
    setNotice("");
    try {
      const res = await fetch(`${api}/admin/shift/close`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ counted: Number(counted) }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || "No pude cerrar la caja");
      setShift(null);
      setLines([]);
      setClosing(false);
      setCounted("");
      setNotice("Caja cerrada");
    } catch (err) {
      setNotice(err instanceof Error ? err.message : "No pude cerrar la caja");
    } finally {
      setBusy(false);
    }
  }

  async function charge() {
    setBusy(true);
    setNotice("");
    try {
      const res = await fetch(`${api}/admin/sale`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({
          lines: lines.map((line) => ({ slug: line.slug, qty: line.qty })),
          method,
          cashReceived: method === "efectivo" ? received : undefined,
        }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || "No pude cobrar");
      setLines([]);
      setCash("");
      setNotice(`Venta lista · ${money(body.sale.total)}`);
    } catch (err) {
      setNotice(err instanceof Error ? err.message : "No pude cobrar");
    } finally {
      setBusy(false);
    }
  }

  if (!ready) return <main><h1>Caja</h1></main>;

  return (
    <main className="pos">
      <section>
        <div className="pos-board">
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar en el catálogo" aria-label="Buscar producto" />
          <div className="pos-cats">
            <button type="button" className={mother === "todas" ? "is-on" : ""} onClick={() => { setMother("todas"); setChild("todas"); }}>Todas</button>
            {mothers.map((category) => (
              <button key={category.id} type="button" className={mother === category.id ? "is-on" : ""} onClick={() => { setMother(category.id); setChild("todas"); }}>{category.name}</button>
            ))}
          </div>
          {children.length > 0 && (
            <div className="pos-cats">
              <button type="button" className={child === "todas" ? "is-on" : ""} onClick={() => setChild("todas")}>Todas</button>
              {children.map((category) => (
                <button key={category.id} type="button" className={child === category.id ? "is-on" : ""} onClick={() => setChild(category.id)}>{category.name}</button>
              ))}
            </div>
          )}
        </div>
        {!shift && (
          <form className="shift-card" onSubmit={(event) => { event.preventDefault(); openShift(); }}>
            <label>
              Monto inicial
              <input inputMode="numeric" value={opening} onChange={(event) => setOpening(event.target.value)} />
            </label>
            <button type="submit" className="save" disabled={busy}>Abrir caja</button>
          </form>
        )}
        {error && <p>{error}</p>}
        <div className="pos-grid">
          {products.map((item) => (
            <button key={item.slug} type="button" className="pos-card" onClick={() => add(item)}>
              {item.imageUrl ? <img src={item.imageUrl} alt="" /> : <span className="ph">Foto por cargar</span>}
              <strong>{item.name}</strong>
              <span className="price">{money(item.salePrice)}</span>
            </button>
          ))}
        </div>
      </section>
      <aside className="ticket">
        <div className="ticket-head">
          <h2>Venta</h2>
          {shift && <button type="button" onClick={() => setClosing(true)}>Cerrar caja</button>}
        </div>
        {lines.length === 0 && <p className="muted">Sin productos</p>}
        {lines.map((line) => (
          <div key={line.slug} className="ticket-line">
            <strong>{line.name}</strong>
            <div>
              <button type="button" onClick={() => qty(line.slug, line.qty - 1)}>-</button>
              <span>{line.qty}</span>
              <button type="button" onClick={() => qty(line.slug, line.qty + 1)}>+</button>
              <b>{money(line.price * line.qty)}</b>
            </div>
          </div>
        ))}
        <p className="ticket-total"><span>Total</span><strong>{money(total)}</strong></p>
        <div className="pay-methods">
          {(["efectivo", "debito", "credito"] as Method[]).map((value) => (
            <button key={value} type="button" className={method === value ? "is-on" : ""} onClick={() => setMethod(value)}>
              {value === "efectivo" ? "Efectivo" : value === "debito" ? "Débito" : "Crédito"}
            </button>
          ))}
        </div>
        {method === "efectivo" && (
          <label>
            Recibido
            <input inputMode="numeric" value={cash} onChange={(event) => setCash(event.target.value)} />
            {cash !== "" && <span className="muted">Vuelto {money(Math.max(0, change))}</span>}
          </label>
        )}
        <button type="button" className="save" disabled={busy || !shift || lines.length === 0} onClick={charge}>Cobrar</button>
        {notice && <p>{notice}</p>}
      </aside>
      {closing && (
        <div className="modal-veil" onClick={() => setClosing(false)}>
          <form className="modal" onClick={(event) => event.stopPropagation()} onSubmit={(event) => { event.preventDefault(); closeShift(); }}>
            <h2>Cerrar caja</h2>
            <label>
              Efectivo contado
              <input inputMode="numeric" value={counted} onChange={(event) => setCounted(event.target.value)} />
            </label>
            <div className="modal-actions">
              <button type="button" onClick={() => setClosing(false)}>Volver</button>
              <button type="submit" className="save" disabled={busy}>Cerrar</button>
            </div>
          </form>
        </div>
      )}
    </main>
  );
}
