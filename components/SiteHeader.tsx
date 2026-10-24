"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { proyecto } from "@/lib/datos";
import { fechaLarga } from "@/lib/fechas";

const LINKS = [
  { href: "/", label: "Mi inversión" },
  { href: "/chat", label: "Preguntale a tu obra" },
  { href: "/antes-de-invertir", label: "Antes de invertir" },
];

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="bg-soil text-card">
      <div className="hazard h-2" />
      <div className="mx-auto flex max-w-6xl flex-col gap-5 px-4 py-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-mono text-xs tracking-[0.18em] text-stamp">
            {pathname.startsWith("/cargar") ? "CARGA DE OBRA" : "INVERSIÓN EN POZO"}
          </p>
          <Link href="/" className="mt-1 inline-block">
            <h1 className="font-display text-5xl font-extrabold uppercase leading-none tracking-tight sm:text-6xl">
              {proyecto.obra}
            </h1>
          </Link>
          <p className="mt-2 text-sm text-card/80">
            {proyecto.unidad} · {proyecto.direccion}
          </p>
          <p className="text-sm text-card/80">{proyecto.constructora}</p>
        </div>
        <dl className="grid grid-cols-2 gap-4 font-mono text-xs sm:text-right">
          <div>
            <dt className="text-stamp">Entrega prometida</dt>
            <dd className="mt-1 text-base text-card">{fechaLarga(proyecto.entrega_prometida)}</dd>
          </div>
          <div>
            <dt className="text-stamp">Día de seguimiento</dt>
            <dd className="mt-1 text-base text-card">{fechaLarga(proyecto.fecha_demo)}</dd>
          </div>
        </dl>
      </div>
      <nav aria-label="Secciones" className="border-t border-white/10">
        <ul className="mx-auto flex max-w-6xl flex-wrap px-2">
          {LINKS.map((link) => {
            const activo = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  aria-current={activo ? "page" : undefined}
                  className={`inline-flex min-h-11 items-center px-3 text-sm ${
                    activo ? "bg-white/10 text-stamp" : "text-card/80"
                  }`}
                >
                  {link.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </header>
  );
}
