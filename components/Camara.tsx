"use client";

import { useEffect, useRef, useState } from "react";
import { Upload } from "lucide-react";
import { proyecto } from "@/lib/datos";
import { fechaCorta, fechaLarga } from "@/lib/fechas";
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
    <section className="flex min-w-0 flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold">Cámara de obra</h2>
          <p className="text-sm text-muted">Lo que se observa en cada foto.</p>
        </div>
        <label className="inline-flex h-8 cursor-pointer items-center gap-2 rounded-md border border-line bg-surface px-3 text-sm font-medium hover:bg-subtle focus-within:outline-2 focus-within:outline-fg">
          <input
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={(event) => {
              elegir(event.target.files?.[0]);
              event.target.value = "";
            }}
          />
          <Upload className="size-4" aria-hidden="true" />
          Subir foto
        </label>
      </div>

      <figure className="overflow-hidden rounded-xl border border-line bg-surface">
        <div className="relative aspect-[16/10] overflow-hidden bg-black">
          {previa ? (
            <div
              role="img"
              aria-label="Foto elegida, sin analizar"
              className="h-full w-full bg-contain bg-center bg-no-repeat"
              style={{ backgroundImage: `url(${previa.url})` }}
            />
          ) : (
            <div className="h-full w-full grayscale">
              <EscenaObra obs={actual} />
            </div>
          )}
          <div className="absolute inset-x-3 bottom-3 flex items-center justify-between gap-2 text-xs font-medium text-white tabular-nums">
            <span className="rounded bg-black/60 px-2 py-1 backdrop-blur">CAM 04</span>
            <span className="rounded bg-black/60 px-2 py-1 backdrop-blur">
              {fechaLarga(previa ? proyecto.fecha_demo : actual.fecha)}
              {previa ? " · Sin analizar" : ""}
            </span>
          </div>
        </div>
        <figcaption className="flex flex-col gap-3 p-4 sm:p-5">
          {previa ? (
            <>
              <p className="text-sm leading-relaxed">
                {previa.nombre} quedó en la cámara. Todavía no hay observación: el agente no está conectado.
              </p>
              <button
                type="button"
                onClick={soltarPrevia}
                className="self-start text-sm font-medium underline underline-offset-4"
              >
                Volver a la última foto de la obra
              </button>
            </>
          ) : (
            <>
              <p className="text-pretty leading-relaxed">{actual.descripcion}</p>
              <p className="text-sm text-muted">{actual.cambios_vs_foto_anterior}</p>
              <ul className="flex flex-wrap gap-1.5" aria-label="Elementos visibles">
                {actual.elementos_visibles.map((el) => (
                  <li key={el} className="rounded-full border border-line px-2.5 py-0.5 text-xs text-muted">
                    {el}
                  </li>
                ))}
              </ul>
              {(actual.confianza !== "alta" || actual.limitaciones || !actual.hay_actividad_visible) && (
                <div className="flex flex-col gap-1 border-t border-line pt-3 text-sm">
                  {actual.confianza !== "alta" && (
                    <p className="font-medium text-atraso">Confianza {actual.confianza} en esta lectura</p>
                  )}
                  {actual.limitaciones && <p className="text-muted">{actual.limitaciones}</p>}
                  {!actual.hay_actividad_visible && (
                    <p className="text-muted">En esta foto no se ve actividad.</p>
                  )}
                </div>
              )}
            </>
          )}
        </figcaption>
      </figure>

      <ul ref={tira} className="flex min-w-0 gap-2 overflow-x-auto pb-1 sm:grid sm:grid-cols-8 sm:overflow-visible">
        {fotos.map((foto) => {
          const activa = !previa && foto.fecha === actual.fecha;
          return (
            <li key={foto.fecha}>
              <button
                type="button"
                aria-pressed={activa}
                aria-label={`Ver foto del ${fechaLarga(foto.fecha)}`}
                onClick={() => {
                  soltarPrevia();
                  onElegirFecha(foto.fecha);
                }}
                className="group w-16 shrink-0 sm:w-full"
              >
                <span
                  className={`block aspect-[4/3] overflow-hidden rounded-md grayscale transition-opacity ${
                    activa ? "ring-2 ring-fg ring-offset-2 ring-offset-bg" : "opacity-60 group-hover:opacity-100"
                  }`}
                >
                  <EscenaObra obs={foto} />
                </span>
                <span
                  className={`mt-1.5 block text-center text-xs tabular-nums ${activa ? "font-medium" : "text-muted"}`}
                >
                  {fechaCorta(foto.fecha)}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
