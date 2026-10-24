"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Building2, ListChecks, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { MarcaLogo, Logotipo } from "./Logo";

const LINKS: { href: string; label: string; icono: LucideIcon }[] = [
  { href: "/", label: "Obra", icono: Building2 },
  { href: "/antes-de-invertir", label: "Checklist", icono: ListChecks },
];

const BASE =
  "flex h-10 w-full items-center gap-3 rounded-md px-2.5 text-sm transition-colors";

export function Sidebar({ expandido, onAlternar }: { expandido: boolean; onAlternar: () => void }) {
  const pathname = usePathname();
  const etiqueta = expandido ? "truncate" : "sr-only";

  return (
    <>
      {expandido && (
        <div
          className="fixed inset-0 z-30 bg-black/40 md:hidden"
          aria-hidden="true"
          onClick={onAlternar}
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex flex-col overflow-hidden border-r border-line bg-surface transition-[width] duration-200 ${
          expandido ? "w-56" : "w-14"
        }`}
      >
        <div className="flex h-14 shrink-0 items-center border-b border-line px-2">
          <button
            type="button"
            onClick={onAlternar}
            aria-expanded={expandido}
            aria-label={expandido ? "Blind Spot, contraer menú" : "Blind Spot, expandir menú"}
            title={expandido ? "Contraer menú" : "Expandir menú"}
            className="flex h-10 w-full min-w-0 items-center gap-3 rounded-md px-1 hover:bg-subtle"
          >
            <MarcaLogo className="size-8 shrink-0" />
            {expandido && <Logotipo className="truncate" />}
          </button>
        </div>

        <nav aria-label="Secciones" className="flex-1 p-2">
          <ul className="flex flex-col gap-1">
            {LINKS.map(({ href, label, icono: Icono }) => {
              const activo = href === "/" ? pathname === "/" : pathname.startsWith(href);
              return (
                <li key={href}>
                  <Link
                    href={href}
                    title={expandido ? undefined : label}
                    aria-current={activo ? "page" : undefined}
                    className={`${BASE} ${
                      activo
                        ? "bg-marron-bg font-medium text-marron shadow-[inset_2px_0_0_var(--marron)]"
                        : "text-fg/75 hover:bg-subtle hover:text-fg"
                    }`}
                  >
                    <Icono className="size-5 shrink-0" aria-hidden="true" />
                    <span className={etiqueta}>{label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="border-t border-line p-2">
          <button
            type="button"
            onClick={onAlternar}
            aria-expanded={expandido}
            title={expandido ? undefined : "Expandir menú"}
            className={`${BASE} text-fg/75 hover:bg-subtle hover:text-fg`}
          >
            {expandido ? (
              <PanelLeftClose className="size-5 shrink-0" aria-hidden="true" />
            ) : (
              <PanelLeftOpen className="size-5 shrink-0" aria-hidden="true" />
            )}
            <span className={etiqueta}>{expandido ? "Contraer" : "Expandir menú"}</span>
          </button>
        </div>
      </aside>
    </>
  );
}
