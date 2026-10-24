import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Suspense } from "react";
import { Arimo, Inter } from "next/font/google";
import { connection } from "next/server";
import { Shell } from "@/components/Shell";
import { listarObservaciones } from "@/lib/store";
import "./globals.css";

const inter = Inter({
  subsets: ["latin", "latin-ext"],
  variable: "--font-inter",
});

const arimo = Arimo({
  subsets: ["latin", "latin-ext"],
  weight: ["700"],
  variable: "--font-arimo",
});

export const metadata: Metadata = {
  title: {
    default: "Blind Spot · Cómo viene mi obra",
    template: "%s · Blind Spot",
  },
  description: "Seguimiento de una inversión en pozo. Los datos de esta demo son ficticios.",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0c0c0c" },
  ],
};

async function Marco({ children }: { children: ReactNode }) {
  await connection();
  const fotos = await listarObservaciones();
  return <Shell fotos={fotos}>{children}</Shell>;
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es" className={`${inter.variable} ${arimo.variable} h-full antialiased`}>
      <body className="min-h-full bg-bg font-sans text-fg">
        <a
          href="#contenido"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-fg focus:px-3 focus:py-2 focus:text-bg"
        >
          Saltar al contenido
        </a>
        <Suspense fallback={<p className="px-8 py-8 text-sm text-muted">Cargando la obra…</p>}>
          <Marco>{children}</Marco>
        </Suspense>
      </body>
    </html>
  );
}
