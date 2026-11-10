"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CategoryIcon } from "@/components/CategoryIcon";
import { SearchField, type SearchProduct } from "@/components/SearchField";

export type MenuNode = {
  name: string;
  slug: string;
  count: number;
  children: MenuNode[];
};

function Chevron({ open }: { open: boolean }) {
  return (
    <svg viewBox="0 0 20 20" className={`h-4 w-4 transition-transform ${open ? "rotate-90" : ""}`} aria-hidden="true">
      <path d="M7 5l6 5-6 5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function CategoryMenu({ menu, products, onNavigate, searchId }: { menu: MenuNode[]; products: SearchProduct[]; onNavigate?: () => void; searchId: string }) {
  const pathname = usePathname();
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    const current = menu.find((node) => pathname.startsWith(`/categoria/${node.slug}`) || node.children.some((child) => pathname.startsWith(`/categoria/${child.slug}`)));
    if (current) setExpanded(current.slug);
  }, [pathname, menu]);

  return (
    <div>
      <p className="px-4 pt-4 text-sm font-bold text-[#12312e]">Categorías</p>
      <SearchField id={searchId} products={products} layout="inline" buttonClassName="px-3" onPick={onNavigate} className="px-4 py-3" />
      <ul className="pb-6">
        {menu.map((node) => {
          const active = pathname.startsWith(`/categoria/${node.slug}`);
          return (
            <li key={node.slug}>
              <div className={`flex items-center ${active ? "bg-[#e7f3f0]" : "hover:bg-[#f4faf8]"}`}>
                <Link href={`/categoria/${node.slug}`} onClick={onNavigate} className="flex flex-1 items-center gap-3 px-4 py-2.5 text-sm font-medium text-[#12312e]">
                  <CategoryIcon slug={node.slug} className="h-5 w-5 text-[#0f6e62]" />
                  {node.name}
                </Link>
                {node.children.length > 0 && (
                  <button
                    type="button"
                    aria-expanded={expanded === node.slug}
                    aria-label={`Abrir ${node.name}`}
                    onClick={() => setExpanded((current) => (current === node.slug ? null : node.slug))}
                    className="px-3 py-2.5 text-[#12312e]/70"
                  >
                    <Chevron open={expanded === node.slug} />
                  </button>
                )}
              </div>
              {node.children.length > 0 && (
                <div className={`grid transition-[grid-template-rows] duration-300 ease-out motion-reduce:transition-none ${expanded === node.slug ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
                  <ul className="overflow-hidden bg-[#f7fbfa]">
                    {node.children.map((child) => (
                      <li key={child.slug}>
                        <Link
                          href={`/categoria/${child.slug}`}
                          onClick={onNavigate}
                          className={`flex items-center gap-2 py-2 pl-8 pr-4 text-sm ${pathname.startsWith(`/categoria/${child.slug}`) ? "font-bold text-[#0f6e62]" : "text-[#12312e]/80"}`}
                        >
                          <CategoryIcon slug={child.slug} className="h-4 w-4" />
                          {child.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
