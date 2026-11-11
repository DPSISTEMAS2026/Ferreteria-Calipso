import { store, todayLabel } from "@/lib/store";

export function StoreFooter() {
  return (
    <footer className="bg-[#12312e] text-white">
      <div className="mx-auto flex max-w-6xl flex-wrap items-start justify-between gap-6 px-4 py-8 text-sm">
        <div>
          <strong className="block text-xl uppercase tracking-wide">Ferretería Calipso</strong>
          <p className="mt-2 text-white/80">{store.address}</p>
          <p className="text-white/80">{todayLabel()}</p>
        </div>
        <div className="flex flex-col gap-2 font-semibold">
          <a href={store.phoneHref}>{store.phone}</a>
          <a href={store.whatsapp} target="_blank" rel="noreferrer">WhatsApp</a>
          <a href={store.instagram} target="_blank" rel="noreferrer">Instagram</a>
        </div>
      </div>
      <p className="border-t border-white/10 px-4 py-4 text-center text-xs text-white/70">
        Sitio desarrollado por DP Sistemas y Automatizaciones SpA{" "}
        <a href="https://dpsistemas.cl" className="font-semibold text-white underline" target="_blank" rel="noreferrer">dpsistemas.cl</a>
      </p>
    </footer>
  );
}
