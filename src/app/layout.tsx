import type { Metadata } from "next";
import { Barlow_Condensed, DM_Sans } from "next/font/google";
import { StoreShell } from "@/components/StoreShell";
import "./globals.css";

const sans = DM_Sans({ subsets: ["latin"], variable: "--font-sans" });
const display = Barlow_Condensed({ subsets: ["latin"], weight: ["600", "700"], variable: "--font-display" });

export const metadata: Metadata = {
  title: "Ferretería Calipso",
  description: "Herramientas, fijaciones y materiales en Lourdes 884, Villa Alemana.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body className={`${sans.variable} ${display.variable} bg-[#f4f7f6] font-sans text-[#12312e] antialiased`}>
        <StoreShell>{children}</StoreShell>
      </body>
    </html>
  );
}
