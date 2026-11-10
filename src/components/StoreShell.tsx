import Link from "next/link";
import { CartDrawer } from "@/components/CartDrawer";
import { CartLink } from "@/components/CartLink";
import { CartProvider } from "@/components/CartContext";
import { MenuButton, SideMenu } from "@/components/CategoryDrop";
import { MenuProvider } from "@/components/MenuContext";
import { SearchField } from "@/components/SearchField";
import { SocialLinks } from "@/components/SocialLinks";
import { StoreFooter } from "@/components/StoreFooter";
import { getCatalog, shelfPrice } from "@/lib/catalog";

export async function StoreShell({ children }: { children: React.ReactNode }) {
  const catalog = await getCatalog();
  const menu = catalog.categoryMenu();
  const searchProducts = catalog.products.map((product) => ({
    name: product.name,
    slug: product.slug,
    price: shelfPrice(product),
    image: product.imageUrl || null,
  }));

  return (
    <CartProvider>
    <MenuProvider menu={menu}>
    <div className="min-h-screen bg-[#f4f7f6]">
      <header className="sticky top-0 z-30 border-b border-[#12312e]/10 bg-white">
        <div className="grid grid-cols-[minmax(8.25rem,1fr)_minmax(6.5rem,2fr)_minmax(8.25rem,1fr)] items-center gap-1.5 px-2 py-2 sm:grid-cols-[1fr_min(36rem,calc(100%-22rem))_1fr] sm:gap-3 sm:px-3 md:px-4 md:py-2.5">
          <div className="flex min-w-0 items-center">
            <MenuButton />
            <div className="flex min-w-0 flex-1 justify-center">
              <Link href="/" aria-label="Ferretería Calipso" className="min-w-0">
                <img src="/marca/logo.png" alt="" className="h-9 w-auto max-w-full object-contain sm:h-12 md:h-14" />
              </Link>
            </div>
          </div>
          <SearchField id="buscar-cabecera" products={searchProducts} buttonClassName="hidden px-4 sm:block" className="w-full min-w-0" />
          <nav className="flex items-center justify-end">
            <CartLink />
            <SocialLinks />
          </nav>
        </div>
      </header>
      <SideMenu products={searchProducts} />
      <CartDrawer />
      <div className="min-w-0">{children}</div>
      <StoreFooter />
    </div>
    </MenuProvider>
    </CartProvider>
  );
}
