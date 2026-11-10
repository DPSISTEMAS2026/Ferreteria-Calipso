const paths: Record<string, string> = {
  gasfiteria: "M4 14h6l2-6h8M8 14v4M14 8v10",
  "fittings-y-canerias": "M4 8h6v8H4zM10 12h6M16 8v8",
  griferia: "M6 16V8a4 4 0 0 1 8 0v2M10 16h8",
  gas: "M12 3c2 3 4 5 4 8a4 4 0 1 1-8 0c0-3 2-5 4-8z",
  electricidad: "M11 2L5 12h6l-1 8 7-12h-6l0-6z",
  fijaciones: "M8 3h4v6l3 2v2H5v-2l3-2V3zM10 13v7",
  quincalleria: "M7 10V7a3 3 0 0 1 6 0v3M6 10h8v8H6z",
  herramientas: "M14 4a3 3 0 0 0-4 4L4 14l2 2 6-6a3 3 0 0 0 4-4l-2 2-2-2 2-2z",
  pinturas: "M5 13c2 4 8 4 10 0V5H5v8zM8 5V3h4v2",
  "pinturas-y-quimicos": "M8 3h4v6l3 8H5l3-8V3z",
  "adhesivos-y-cintas": "M4 8h12v6H4zM8 8V5h4v3",
  lijas: "M6 4h10l2 14H4L6 4zM8 8h6",
  construccion: "M3 17h14M5 17V9l5-4 5 4v8M9 17v-4h2v4",
  "aseo-y-hogar": "M8 14c0-4 2-6 4-9 2 3 4 5 4 9a4 4 0 1 1-8 0z",
  jardin: "M12 19V9M12 11c-3-1-5-4-5-7 4 0 6 2 5 7zM12 13c3-1 6-1 8 2-4 1-6 0-8-2z",
  seguridad: "M12 3l7 3v5c0 4-3 7-7 8-4-1-7-4-7-8V6l7-3z",
  soldadura: "M12 3c2 3 5 5 5 9a5 5 0 1 1-10 0c0-4 3-6 5-9z",
  ofertas: "M12 3l2.2 6.2H21l-5.2 4 2 6.3L12 16.2 6.2 19.5l2-6.3L3 9.2h6.8L12 3z",
};

export function CategoryIcon({ slug, className = "h-5 w-5" }: { slug: string; className?: string }) {
  const d = paths[slug] || "M5 5h10v10H5z";
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path d={d} fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
