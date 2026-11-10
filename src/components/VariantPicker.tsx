"use client";

import { useMemo, useState } from "react";
import type { Axis, Product } from "@/lib/catalog";

const axisLabel: Record<Axis, string> = { tipo: "Tipo", medida: "Medida", marca: "Marca" };

function money(value: number) {
  return new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 }).format(value);
}

export function VariantPicker({ product }: { product: Product }) {
  const [choice, setChoice] = useState<Partial<Record<Axis, string>>>({});
  const options = useMemo(() => {
    const next: Partial<Record<Axis, string[]>> = {};
    product.axes.forEach((axis) => {
      next[axis] = [...new Set(product.variants.map((variant) => variant[axis]).filter(Boolean) as string[])];
    });
    return next;
  }, [product]);
  const match = product.variants.find((variant) =>
    product.axes.every((axis) => !choice[axis] || variant[axis] === choice[axis])
  );
  const exact = product.axes.every((axis) => choice[axis]) ? match : undefined;

  return (
    <div className="mt-6 space-y-4">
      {product.axes.map((axis) => (
        <div key={axis}>
          <p className="text-xs font-bold uppercase tracking-wider text-[#9a6b00]">{axisLabel[axis]}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {options[axis]?.map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setChoice((current) => ({ ...current, [axis]: current[axis] === value ? undefined : value }))}
                className={`rounded-full px-4 py-2 text-sm font-bold ${choice[axis] === value ? "bg-[#142033] text-white" : "bg-white"}`}
              >
                {value}
              </button>
            ))}
          </div>
        </div>
      ))}
      <div className="rounded-2xl bg-white p-4">
        {exact ? (
          <>
            <p className="text-3xl font-black">{money(exact.price)}</p>
            <p className="mt-1 text-sm">{exact.stock === null ? "Stock por contar" : exact.stock > 0 ? `${exact.stock} en tienda` : "Sin stock de esta combinación"} · {exact.sku}</p>
          </>
        ) : (
          <p className="text-sm">Elige {product.axes.map((axis) => axisLabel[axis].toLowerCase()).join(", ")} para ver precio y stock.</p>
        )}
      </div>
    </div>
  );
}
