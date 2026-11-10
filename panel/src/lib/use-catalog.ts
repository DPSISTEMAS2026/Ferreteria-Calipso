"use client";

import { useEffect, useState } from "react";
import { api, authHeaders, clearSession } from "@/lib/session";

export type Item = {
  id: string;
  supplier: string;
  supplierCode: string;
  name: string;
  slug: string;
  categoryId: string;
  costNet: number;
  costWithTax: number;
  priceF2: number;
  priceF3: number;
  priceF4: number;
  salePrice: number;
  saleFactor: string;
  saleChosen: boolean;
  note: string | null;
  imageUrl?: string | null;
};

export type Category = { id: string; name: string; slug: string; parentId: string | null };

function bounce(res: Response) {
  if (res.status === 401 && typeof window !== "undefined") {
    clearSession();
    window.location.href = "/login";
  }
  return res;
}

export function useAdminCatalog() {
  const [items, setItems] = useState<Item[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState("");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    fetch(`${api}/admin/catalog`, { headers: authHeaders() })
      .then(bounce)
      .then((res) => {
        if (!res.ok) throw new Error("La API no respondió");
        return res.json();
      })
      .then((body) => {
        setItems(body.items);
        setCategories(body.categories);
      })
      .catch(() => setError("No pude leer el catálogo desde la API."))
      .finally(() => setReady(true));
  }, []);

  function merge(saved: Item[]) {
    const bySlug = new Map(saved.map((item) => [item.slug, item]));
    setItems((current) => current.map((item) => (bySlug.has(item.slug) ? { ...item, ...bySlug.get(item.slug) } : item)));
  }

  async function savePrice(slug: string, salePrice: number) {
    const res = bounce(await fetch(`${api}/admin/price`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ slug, salePrice }),
    }));
    if (!res.ok) throw new Error("No pude guardar el precio");
    const body = await res.json();
    merge([body.item]);
  }

  async function saveFactor(slugs: string[], factor: "2" | "3" | "4") {
    const res = bounce(await fetch(`${api}/admin/factor`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ slugs, factor }),
    }));
    if (!res.ok) throw new Error("No pude aplicar el factor");
    const body = await res.json();
    merge(body.items);
  }

  return { items, categories, error, ready, savePrice, saveFactor };
}

export function money(value: number) {
  return new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 }).format(value);
}
