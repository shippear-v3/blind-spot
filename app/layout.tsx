import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Big_Shoulders_Stencil, IBM_Plex_Mono, Source_Sans_3 } from "next/font/google";
import "./globals.css";

const display = Big_Shoulders_Stencil({
  subsets: ["latin", "latin-ext"],
  weight: ["700", "800"],
  variable: "--font-display-face",
});

const body = Source_Sans_3({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "600", "700"],
  variable: "--font-body-face",
});

const mono = IBM_Plex_Mono({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500"],
  variable: "--font-mono-face",
});

export const metadata: Metadata = {
  title: {
    default: "Cómo viene mi obra",
    template: "%s · Torre Ejemplo",
  },
  description: "Seguimiento de una inversión en pozo. Los datos de esta demo son ficticios.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="es"
      className={`${display.variable} ${body.variable} ${mono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-galvanized font-sans text-ink">
        <a
          href="#contenido"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:bg-sodium focus:px-3 focus:py-2 focus:text-soil"
        >
          Saltar al contenido
        </a>
        {children}
      </body>
    </html>
  );
}
