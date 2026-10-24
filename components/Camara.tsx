"use client";

import { useEffect, useRef, useState } from "react";
import { proyecto } from "@/lib/datos";
import { fechaCamara, fechaCorta } from "@/lib/fechas";
import type { ObservacionConFoto } from "@/lib/tipos";
import { EscenaObra } from "./EscenaObra";

type Previa = { url: string; nombre: string };

export function Camara({
  fotos,
  fecha,
  seleccion,
  onElegirFecha,
}: {
  fotos: ObservacionConFoto[];
  fecha: string;
  seleccion: number;
  onElegirFecha: (fecha: string) => void;
}) {
  const actual = fotos.find((foto) => foto.fecha === fecha) ?? fotos.at(-1);
  const [previa, setPrevia] = useState<Previa | null>(null);
  const previaRef = useRef<Previa | null>(null);
  const tira = useRef<HTMLUListElement>(null);
  const seleccionInicial = useRef(seleccion);

  useEffect(() => {
    return () => {
      if (previaRef.current) URL.revokeObjectURL(previaRef.current.url);
    };
  }, []);

  useEffect(() => {
    const activo = tira.current?.querySelector('[aria-pressed="true"]');
    if (activo instanceof HTMLElement && tira.current) {
      tira.current.scrollLeft = Math.max(0, activo.offsetLeft - 8);
    }
  }, [fecha, previa]);

  useEffect(() => {
    if (seleccionInicial.current === seleccion) return;
    seleccionInicial.current = seleccion;
    if (!previaRef.current) return;
    URL.revokeObjectURL(previaRef.current.url);
    previaRef.current = null;
    setPrevia(null);
  }, [seleccion]);

  function guardarPrevia(siguiente: Previa | null) {
    if (previaRef.current) URL.revokeObjectURL(previaRef.current.url);
    previaRef.current = siguiente;
    setPrevia(siguiente);
  }

  if (!actual) return null;

  function elegir(archivo: File | undefined) {
    if (!archivo || !archivo.type.startsWith("image/")) return;
    guardarPrevia({ url: URL.createObjectURL(archivo), nombre: archivo.name });
  }

  function soltarPrevia() {
    guardarPrevia(null);
  }

  return (
    <section className="flex min-w-0 flex-col gap-3">
      <div>
        <p className="font-mono text-xs tracking-[0.16em] text-pendiente">OBSERVADO</p>
        <h2 className="font-display text-4xl font-bold uppercase leading-none">Cámara de obra</h2>
      </div>
      <figure className="bg-card p-2 shadow-[0_16px_40px_rgba(28,25,21,0.08)]">
        <div className="relative aspect-[16/10] overflow-hidden bg-soil">
          {previa ? (
            <div
              role="img"
              aria-label="Foto elegida, sin analizar"
              className="h-full w-full bg-contain bg-center bg-no-repeat"
              style={{ backgroundImage: `url(${previa.url})` }}
            />
          ) : (
            <EscenaObra obs={actual} />
          )}
          <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-black/75 px-2 py-1 font-mono text-xs text-stamp">
            <span>CAM 04</span>
            <span>{fechaCamara(previa ? proyecto.fecha_demo : actual.fecha)}</span>
            <span>{previa ? "SIN ANALIZAR" : "ESQUEMA"}</span>
          </div>
        </div>
        <figcaption className="flex flex-col gap-2 px-2 py-3">
          {previa ? (
            <>
              <p className="text-lg leading-snug">
                {previa.nombre} quedó en la cámara. Todavía no hay observación: el agente no está conectado.
              </p>
              <button type="button" onClick={soltarPrevia} className="self-start text-sm underline">
                Volver a la última foto de la obra
              </button>
            </>
          ) : (
            <>
              <p className="text-lg leading-snug">{actual.descripcion}</p>
              <p className="font-mono text-xs text-pendiente">
                Se ve: {actual.elementos_visibles.join(" · ")}
              </p>
              <p className="text-sm">{actual.cambios_vs_foto_anterior}</p>
              {actual.confianza !== "alta" && (
                <p className="font-mono text-xs text-atraso">Confianza {actual.confianza}</p>
              )}
              {actual.limitaciones && <p className="text-sm">{actual.limitaciones}</p>}
              {!actual.hay_actividad_visible && (
                <p className="text-sm">En esta foto no se ve actividad.</p>
              )}
            </>
          )}
        </figcaption>
      </figure>
      <ul ref={tira} className="flex min-w-0 gap-2 overflow-x-auto pb-1 lg:grid lg:grid-cols-8 lg:overflow-visible">
        {fotos.map((foto) => {
          const activa = !previa && foto.fecha === actual.fecha;
          return (
            <li key={foto.fecha}>
              <button
                type="button"
                aria-pressed={activa}
                onClick={() => {
                  soltarPrevia();
                  onElegirFecha(foto.fecha);
                }}
                className="w-16 shrink-0 lg:w-full"
              >
                <span
                  className={`block h-14 overflow-hidden border-2 bg-soil ${
                    activa ? "border-sodium" : "border-transparent"
                  }`}
                >
                  <EscenaObra obs={foto} />
                </span>
                <span className="mt-1 block text-center font-mono text-xs">{fechaCorta(foto.fecha)}</span>
              </button>
            </li>
          );
        })}
      </ul>
      <div className="flex flex-col items-start gap-2">
        <label className="inline-flex min-h-11 cursor-pointer items-center bg-soil px-4 text-sm font-semibold text-card">
          <input
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={(event) => {
              elegir(event.target.files?.[0]);
              event.target.value = "";
            }}
          />
          Subir foto de hoy
        </label>
        <p className="font-mono text-xs text-pendiente">
          En la maqueta la foto se ve acá. El análisis entra con el agente.
        </p>
      </div>
    </section>
  );
}
