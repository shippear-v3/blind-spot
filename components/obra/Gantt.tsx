"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { diaDeSemana, duracion, estadoTarea, ESTADO_TAREA, sumarDias } from "@/lib/cronograma";
import { diasEntre } from "@/lib/fechas";
import type { Tarea } from "@/lib/tipos";

const MESES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

const ZOOM = {
  dias: { etiqueta: "Días", px: 22 },
  semanas: { etiqueta: "Semanas", px: 8 },
  meses: { etiqueta: "Meses", px: 3 },
} as const;

type Zoom = keyof typeof ZOOM;

const COLUMNA = 232;
const MARGEN_ETIQUETA = 200;

function rango(tareas: Tarea[]) {
  const inicio = tareas.reduce((min, t) => (t.inicio < min ? t.inicio : min), tareas[0].inicio);
  const fin = tareas.reduce((max, t) => (t.fin > max ? t.fin : max), tareas[0].fin);
  const desde = `${inicio.slice(0, 8)}01`;
  const [anio, mes] = fin.split("-").map(Number);
  const hasta = new Date(Date.UTC(anio, mes, 0)).toISOString().slice(0, 10);
  const total = diasEntre(desde, hasta) + 1;
  const dias = Array.from({ length: total }, (_, i) => sumarDias(desde, i));
  return { desde, dias };
}

export function Gantt({
  tareas,
  hoy,
  seleccion,
  onElegir,
}: {
  tareas: Tarea[];
  hoy: string;
  seleccion: string;
  onElegir: (id: string) => void;
}) {
  const [zoom, setZoom] = useState<Zoom>("semanas");
  const scroll = useRef<HTMLDivElement>(null);
  const { desde, dias } = useMemo(() => rango(tareas), [tareas]);
  const px = ZOOM[zoom].px;
  const ancho = dias.length * px + MARGEN_ETIQUETA;
  const x = (iso: string) => diasEntre(desde, iso) * px;
  const xHoy = x(hoy) + px / 2;

  const meses = useMemo(() => {
    const grupos: { clave: string; etiqueta: string; dias: number; inicio: string }[] = [];
    for (const dia of dias) {
      const clave = dia.slice(0, 7);
      const ultimo = grupos.at(-1);
      if (ultimo?.clave === clave) ultimo.dias += 1;
      else {
        const [anio, mes] = clave.split("-").map(Number);
        grupos.push({ clave, etiqueta: `${MESES[mes - 1]} ${String(anio).slice(2)}`, dias: 1, inicio: dia });
      }
    }
    return grupos;
  }, [dias]);

  const finDeSemana = useMemo(() => dias.filter((d) => [0, 6].includes(diaDeSemana(d))), [dias]);

  useEffect(() => {
    const el = scroll.current;
    if (!el) return;
    el.scrollLeft = Math.max(0, xHoy - (el.clientWidth - COLUMNA) / 3);
  }, [xHoy]);

  const conteo = tareas.reduce(
    (acc, t) => {
      acc[estadoTarea(t, hoy)] += 1;
      return acc;
    },
    { terminada: 0, en_curso: 0, demorada: 0, vencida: 0, pendiente: 0 },
  );

  return (
    <div className="flex min-w-0 flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <ul className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted" aria-label="Resumen">
          {(["terminada", "en_curso", "demorada", "vencida"] as const).map((estado) => (
            <li key={estado} className="flex items-center gap-1.5">
              <span className={`size-2 rounded-full ${ESTADO_TAREA[estado].punto}`} aria-hidden="true" />
              <span className={conteo[estado] > 0 && (estado === "demorada" || estado === "vencida") ? `font-medium ${ESTADO_TAREA[estado].texto}` : ""}>
                {conteo[estado]} {ESTADO_TAREA[estado].etiqueta.toLowerCase()}
                {conteo[estado] === 1 ? "" : "s"}
              </span>
            </li>
          ))}
        </ul>
        <div role="group" aria-label="Escala" className="inline-flex rounded-md border border-line bg-subtle p-0.5">
          {(Object.keys(ZOOM) as Zoom[]).map((z) => (
            <button
              key={z}
              type="button"
              aria-pressed={zoom === z}
              onClick={() => setZoom(z)}
              className="h-7 rounded px-2.5 text-xs font-medium text-muted hover:text-fg aria-pressed:bg-surface aria-pressed:text-fg aria-pressed:shadow-sm"
            >
              {ZOOM[z].etiqueta}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-line bg-surface">
        <div ref={scroll} className="overflow-x-auto">
          <div className="relative" style={{ width: COLUMNA + ancho }}>
            <div aria-hidden="true" className="pointer-events-none absolute inset-y-0" style={{ left: COLUMNA }}>
              {zoom !== "meses" &&
                finDeSemana.map((d) => (
                  <span key={d} className="absolute inset-y-0 bg-subtle" style={{ left: x(d), width: px }} />
                ))}
              {meses.map((m) => (
                <span key={m.clave} className="absolute inset-y-0 w-px bg-line" style={{ left: x(m.inicio) }} />
              ))}
            </div>

            <div className="relative flex border-b border-line text-xs">
              <div
                className="sticky left-0 z-20 flex shrink-0 items-end justify-between border-r border-line bg-surface px-4 pb-2 font-medium uppercase tracking-wide text-pizarra"
                style={{ width: COLUMNA }}
              >
                <span>Actividad</span>
                <span>Duración</span>
              </div>
              <div className="relative" style={{ width: ancho }}>
                <div className="relative h-7">
                  {meses.map((m) => (
                    <span
                      key={m.clave}
                      className="absolute top-2 truncate px-2 font-medium capitalize"
                      style={{ left: x(m.inicio), width: m.dias * px }}
                    >
                      {m.etiqueta}
                    </span>
                  ))}
                </div>
                <div className="relative h-6 tabular-nums text-muted">
                  {zoom !== "meses" &&
                    dias
                      .filter((d) => zoom === "dias" || diaDeSemana(d) === 1)
                      .map((d) => (
                        <span
                          key={d}
                          className={`absolute top-1 text-center text-[11px] ${d === hoy ? "font-semibold text-marron" : ""}`}
                          style={{ left: x(d), width: zoom === "dias" ? px : px * 7 }}
                        >
                          {Number(d.slice(8))}
                        </span>
                      ))}
                </div>
              </div>
            </div>

            <ul aria-label="Tareas del cronograma">
              {tareas.map((tarea, i) => {
                const estado = estadoTarea(tarea, hoy);
                const activa = tarea.id === seleccion;
                const marca = activa ? "shadow-[inset_0_0_0_999px_var(--marron-bg)]" : "";
                const izquierda = x(tarea.inicio);
                const largo = duracion(tarea) * px;
                return (
                  <li key={tarea.id} className="border-b border-line last:border-b-0">
                    <button
                      type="button"
                      aria-pressed={activa}
                      onClick={() => onElegir(tarea.id)}
                      className="group flex h-11 w-full text-left"
                    >
                      <span
                        className={`sticky left-0 z-20 flex shrink-0 items-center gap-2.5 border-r border-line bg-surface px-4 text-sm group-hover:bg-subtle ${marca} ${
                          activa ? "border-l-2 border-l-marron pl-3.5" : ""
                        }`}
                        style={{ width: COLUMNA }}
                      >
                        <span className="w-4 shrink-0 text-right text-xs tabular-nums text-muted">{i + 1}</span>
                        <span className={`size-2 shrink-0 rounded-full ${ESTADO_TAREA[estado].punto}`} aria-hidden="true" />
                        <span title={tarea.nombre} className={`min-w-0 flex-1 truncate ${activa ? "font-medium" : ""}`}>{tarea.nombre}</span>
                        <span className="shrink-0 text-xs tabular-nums text-muted">{duracion(tarea)} d</span>
                        <span className="sr-only">, {ESTADO_TAREA[estado].etiqueta}</span>
                      </span>
                      <span className={`relative block ${marca}`} style={{ width: ancho }}>
                        <span
                          className={`absolute top-1/2 h-4 -translate-y-1/2 overflow-hidden rounded-sm bg-pizarra/25 ${ESTADO_TAREA[estado].anillo} ${
                            activa ? "outline-2 outline-offset-2 outline-marron" : ""
                          }`}
                          style={{ left: izquierda, width: largo }}
                        >
                          <span className="block h-full bg-pizarra" style={{ width: `${tarea.avance}%` }} />
                        </span>
                        <span
                          className="absolute top-1/2 -translate-y-1/2 whitespace-nowrap text-xs text-muted"
                          style={{ left: izquierda + largo + 10 }}
                        >
                          {tarea.nombre} · {tarea.personas}p
                          {tarea.avance > 0 && tarea.avance < 100 ? ` · ${tarea.avance}%` : ""}
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>

            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-y-0 z-10 w-px bg-marron"
              style={{ left: COLUMNA + xHoy }}
            >
              <span className="absolute -translate-x-1/2 rounded bg-marron px-1.5 py-0.5 text-[10px] font-semibold uppercase text-white" style={{ top: 6 }}>
                Hoy
              </span>
            </div>
          </div>
        </div>
      </div>

      <ul className="flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-muted" aria-label="Referencias">
        <li className="flex items-center gap-1.5">
          <span className="h-2.5 w-5 rounded-sm bg-pizarra/25" aria-hidden="true" />
          Planificado
        </li>
        <li className="flex items-center gap-1.5">
          <span className="h-2.5 w-5 rounded-sm bg-pizarra" aria-hidden="true" />
          Avance real
        </li>
        <li className="flex items-center gap-1.5">
          <span className="h-2.5 w-5 rounded-sm bg-pizarra/25 ring-2 ring-atraso" aria-hidden="true" />
          Por detrás del plan
        </li>
        <li className="flex items-center gap-1.5">
          <span className="h-3 w-px bg-marron" aria-hidden="true" />
          Hoy
        </li>
      </ul>
    </div>
  );
}
