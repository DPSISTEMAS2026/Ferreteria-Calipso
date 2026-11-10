"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { api, authHeaders, clearSession, readSession, type PanelUser } from "@/lib/session";

const modules = [
  { href: "/", label: "Resumen", icon: "resumen" },
  { href: "/catalogo", label: "Catálogo", icon: "catalogo" },
  { href: "/caja", label: "Caja", icon: "caja" },
  { href: "/inventarios", label: "Inventarios", icon: "inventarios" },
  { href: "/compras", label: "Compras", icon: "compras" },
  { href: "/reportes", label: "Reportes", icon: "reportes" },
  { href: "/proveedores", label: "Proveedores", icon: "proveedores" },
  { href: "/personal", label: "Personal", icon: "personal" },
];

const cajaModules = new Set(["/caja", "/catalogo"]);

function Icon({ name }: { name: string }) {
  const common = {
    viewBox: "0 0 24 24",
    width: 20,
    height: 20,
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };
  if (name === "resumen") {
    return (
      <svg {...common}>
        <rect x="3" y="3" width="7" height="9" rx="1" />
        <rect x="14" y="3" width="7" height="5" rx="1" />
        <rect x="14" y="12" width="7" height="9" rx="1" />
        <rect x="3" y="16" width="7" height="5" rx="1" />
      </svg>
    );
  }
  if (name === "catalogo") {
    return (
      <svg {...common}>
        <path d="M21 8l-9-5-9 5 9 5 9-5z" />
        <path d="M3 8v8l9 5 9-5V8" />
        <path d="M12 13v8" />
      </svg>
    );
  }
  if (name === "caja") {
    return (
      <svg {...common}>
        <rect x="3" y="6" width="18" height="13" rx="2" />
        <path d="M3 10h18M8 6V4h8v2M9 15h6" />
      </svg>
    );
  }
  if (name === "inventarios") {
    return (
      <svg {...common}>
        <rect x="8" y="2" width="8" height="4" rx="1" />
        <path d="M8 4H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-2" />
        <path d="M9 12h6M9 16h6" />
      </svg>
    );
  }
  if (name === "compras") {
    return (
      <svg {...common}>
        <circle cx="9" cy="20" r="1" />
        <circle cx="18" cy="20" r="1" />
        <path d="M3 4h2l2.4 11.2a2 2 0 0 0 2 1.6h7.8a2 2 0 0 0 2-1.5L21 8H7" />
      </svg>
    );
  }
  if (name === "reportes") {
    return (
      <svg {...common}>
        <path d="M4 19V5M4 19h16" />
        <path d="M8 16v-5M12 16V8M16 16v-3" />
      </svg>
    );
  }
  if (name === "proveedores") {
    return (
      <svg {...common}>
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="3" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a3 3 0 0 1 0 5.75" />
      </svg>
    );
  }
  if (name === "personal") {
    return (
      <svg {...common}>
        <circle cx="12" cy="8" r="3" />
        <path d="M5 20v-1a5 5 0 0 1 5-5h4a5 5 0 0 1 5 5v1" />
      </svg>
    );
  }
  if (name === "tienda") {
    return (
      <svg {...common}>
        <path d="M3 9l1.5-5h15L21 9" />
        <path d="M4 9h16v11H4z" />
        <path d="M9 20v-6h6v6" />
      </svg>
    );
  }
  if (name === "cerrar") {
    return (
      <svg {...common}>
        <path d="M6 6l12 12M18 6L6 18" />
      </svg>
    );
  }
  if (name === "salir") {
    return (
      <svg {...common}>
        <path d="M9 6H5v12h4M10 12h9M16 8l4 4-4 4" />
      </svg>
    );
  }
  if (name === "plegar") {
    return (
      <svg {...common}>
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <path d="M9 3v18M14 9l-3 3 3 3" />
      </svg>
    );
  }
  if (name === "desplegar") {
    return (
      <svg {...common}>
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <path d="M9 3v18M13 9l3 3-3 3" />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}

export function PanelShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [user, setUser] = useState<PanelUser | null>(null);
  const [ready, setReady] = useState(false);
  const iconsOnly = collapsed && !open;
  const visible = modules.filter((item) => user?.role === "dueno" || cajaModules.has(item.href));

  useEffect(() => {
    const saved = readSession();
    if (!saved) {
      setReady(true);
      return;
    }
    fetch(`${api}/admin/session`, { headers: authHeaders() })
      .then((res) => {
        if (!res.ok) throw new Error("sesion");
        return res.json();
      })
      .then((body) => setUser(body.user))
      .catch(() => clearSession())
      .finally(() => setReady(true));
  }, []);

  useEffect(() => {
    if (!ready || pathname === "/login") return;
    const saved = readSession();
    if (!saved) {
      router.replace("/login");
      return;
    }
    if (!user) setUser(saved.user);
  }, [ready, user, pathname, router]);

  useEffect(() => {
    if (!user || user.role === "dueno" || pathname === "/login") return;
    if (!cajaModules.has(pathname)) router.replace("/caja");
  }, [user, pathname, router]);

  async function logout() {
    await fetch(`${api}/admin/logout`, { method: "POST", headers: authHeaders() }).catch(() => null);
    clearSession();
    setUser(null);
    router.replace("/login");
  }

  if (pathname === "/login") return <>{children}</>;
  if (!ready || !user) return <div className="login-wait">Entrando</div>;

  return (
    <div className={`panel ${iconsOnly ? "is-collapsed" : ""}`}>
      <button type="button" className="panel-burger" aria-label={open ? "Cerrar módulos" : "Abrir módulos"} onClick={() => setOpen((value) => !value)}>
        <Icon name={open ? "cerrar" : "menu"} />
      </button>
      {open && <button type="button" className="panel-veil" aria-label="Cerrar módulos" onClick={() => setOpen(false)} />}
      <aside className={`panel-side ${open ? "is-on" : ""}`}>
        <div className="panel-brand">
          <Link href="/" className="panel-logo" onClick={() => setOpen(false)}>
            <img src="/marca/logo.png" alt="Ferretería Calipso" />
          </Link>
          <button
            type="button"
            className="panel-fold"
            title={collapsed ? "Expandir sidebar" : "Colapsar sidebar"}
            aria-label={collapsed ? "Expandir sidebar" : "Colapsar sidebar"}
            onClick={() => setCollapsed((value) => !value)}
          >
            <Icon name={collapsed ? "desplegar" : "plegar"} />
          </button>
        </div>
        <nav aria-label="Módulos">
          {visible.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                title={iconsOnly ? item.label : undefined}
                onClick={() => setOpen(false)}
              >
                <Icon name={item.icon} />
                {!iconsOnly && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>
        <div className="panel-foot">
          <a href="http://localhost:3010" title={iconsOnly ? "Ver la tienda" : undefined}>
            <Icon name="tienda" />
            {!iconsOnly && <span>Ver la tienda</span>}
          </a>
          <button type="button" title={iconsOnly ? "Salir" : undefined} onClick={logout}>
            <Icon name="salir" />
            {!iconsOnly && <span>Salir</span>}
          </button>
        </div>
      </aside>
      <div className="panel-main">{children}</div>
    </div>
  );
}
