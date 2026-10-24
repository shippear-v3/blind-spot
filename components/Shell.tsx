import Link from "next/link";
import type { ReactNode } from "react";
import { SiteHeader } from "./SiteHeader";

export function Shell({ children }: { children: ReactNode }) {
  return (
    <>
      <SiteHeader />
      <main id="contenido" className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 py-6">
        {children}
      </main>
      <footer className="border-t border-line px-4 py-4 text-center font-mono text-xs text-pendiente">
        Obra, constructora y fotos de demo son ficticios. No es asesoramiento legal ni financiero.{" "}
        <Link href="/cargar" className="underline">
          Cargar foto
        </Link>
      </footer>
    </>
  );
}
