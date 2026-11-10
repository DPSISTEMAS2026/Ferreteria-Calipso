import type { Metadata } from "next";
import { PanelShell } from "@/components/PanelShell";
import "./globals.css";

export const metadata: Metadata = { title: "Panel Calipso" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body>
        <PanelShell>{children}</PanelShell>
      </body>
    </html>
  );
}
