"use client";

import { useEffect, useRef } from "react";
import { fechaCamara, fechaCorta } from "@/lib/fechas";
import type { ObservacionConFoto } from "@/lib/tipos";
import { FotoObra } from "./FotoObra";

export function Camara({
  fotos,
  fecha,
  onElegirFecha,
}: {
  fotos: ObservacionConFoto[];
  fecha: string;
  onElegirFecha: (fecha: string) => void;
}) {
  const actual = fotos.find((foto) => foto.fecha === fecha) ?? fotos.at(-1);
  const tira = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const activo = tira.current?.querySelector('[aria-pressed="true"]');
    if (activo instanceof HTMLElement && tira.current) {
      tira.current.scrollLeft = Math.max(0, activo.offsetLeft - 8);
    }
  }, [fecha]);

  if (!actual) return null;

  return (
    <section className="flex min-w-0 flex-col gap-3">
      <div>
        <p className="font-mono text-xs tracking-[0.16em] text-pendiente">OBSERVADO</p>
        <h2 className="font-display text-4xl font-bold uppercase leading-none">Cámara de obra</h2>
      </div>
      <figure className="bg-card p-2 shadow-[0_16px_40px_rgba(28,25,21,0.08)]">
        <div className="relative aspect-[16/10] overflow-hidden bg-soil">
          <FotoObra obs={actual} />
          <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-black/75 px-2 py-1 font-mono text-xs text-stamp">
            <span>CAM 04</span>
            <span>{fechaCamara(actual.fecha)}</span>
            <span>{actual.foto.startsWith("https://") ? "FOTO" : "OBRA"}</span>
          </div>
        </div>
        <figcaption className="flex flex-col gap-2 px-2 py-3">
          <p className="text-lg leading-snug">{actual.descripcion}</p>
          <p className="font-mono text-xs text-pendiente">
            Se ve: {actual.elementos_visibles.join(" · ")}
          </p>
          <p className="text-sm">{actual.cambios_vs_foto_anterior}</p>
          {actual.limitaciones && <p className="text-sm">{actual.limitaciones}</p>}
          {!actual.hay_actividad_visible && <p className="text-sm">En esta foto no se ve actividad.</p>}
        </figcaption>
      </figure>
      <ul ref={tira} className="flex min-w-0 gap-2 overflow-x-auto pb-1">
        {fotos.map((foto) => {
          const activa = foto.fecha === actual.fecha;
          return (
            <li key={foto.fecha}>
              <button
                type="button"
                aria-pressed={activa}
                onClick={() => onElegirFecha(foto.fecha)}
                className="w-16 shrink-0"
              >
                <span
                  className={`block h-14 overflow-hidden border-2 bg-soil ${
                    activa ? "border-sodium" : "border-transparent"
                  }`}
                >
                  <FotoObra obs={foto} />
                </span>
                <span className="mt-1 block text-center font-mono text-xs">{fechaCorta(foto.fecha)}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
