"use client";

import { useMemo } from "react";
import {
  BrickWall,
  Building2,
  Droplets,
  Fence,
  Grid2x2,
  Hammer,
  Layers,
  PaintRoller,
  Shovel,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { avanceEsperado, duracion, estadoTarea, ESTADO_TAREA } from "@/lib/cronograma";
import { diasEntre } from "@/lib/fechas";
import type { EstadoTarea, Tarea } from "@/lib/tipos";

const MESES = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

const ICONOS: Record<string, LucideIcon> = {
  obrador: Fence,
  excavacion: Shovel,
  fundaciones: Layers,
  estructura: Building2,
  mamposteria: BrickWall,
  sanitarias: Droplets,
  electrica: Zap,
  contrapisos: Grid2x2,
  revoques: PaintRoller,
};

const TILE: Record<EstadoTarea, string> = {
  terminada: "bg-fg text-bg",
  en_curso: "bg-marron text-white",
  demorada: "bg-surface text-atraso ring-2 ring-atraso",
  vencida: "bg-surface text-vencido ring-2 ring-vencido",
  pendiente: "bg-subtle text-muted",
};

const RELLENO: Record<EstadoTarea, string> = {
  terminada: "bg-fg",
  en_curso: "bg-marron",
  demorada: "bg-atraso",
  vencida: "bg-vencido",
  pendiente: "bg-fg",
};

function rango(tareas: Tarea[]) {
  const inicio = tareas.reduce((min, t) => (t.inicio < min ? t.inicio : min), tareas[0].inicio);
  const fin = tareas.reduce((max, t) => (t.fin > max ? t.fin : max), tareas[0].fin);
  const desde = `${inicio.slice(0, 8)}01`;
  const [anioFin, mesFin] = fin.split("-").map(Number);
  const hasta = new Date(Date.UTC(anioFin, mesFin, 0)).toISOString().slice(0, 10);
  const total = diasEntre(desde, hasta) + 1;

  const meses: { clave: string; etiqueta: string; inicio: string; anio: number }[] = [];
  let [anio, mes] = desde.split("-").map(Number);
  while (anio < anioFin || (anio === anioFin && mes <= mesFin)) {
    meses.push({
      clave: `${anio}-${mes}`,
      etiqueta: MESES[mes - 1],
      inicio: `${anio}-${String(mes).padStart(2, "0")}-01`,
      anio,
    });
    mes += 1;
    if (mes > 12) {
      mes = 1;
      anio += 1;
    }
  }
  return { desde, total, meses };
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
  const { desde, total, meses } = useMemo(() => rango(tareas), [tareas]);
  const pct = (iso: string) => (diasEntre(desde, iso) / total) * 100;
  const largo = (t: Tarea) => (duracion(t) / total) * 100;
  const hoyPct = pct(hoy) + 50 / total;

  const pesoTotal = tareas.reduce((s, t) => s + duracion(t), 0);
  const real = Math.round(tareas.reduce((s, t) => s + t.avance * duracion(t), 0) / pesoTotal);
  const esperado = Math.round(tareas.reduce((s, t) => s + avanceEsperado(t, hoy) * duracion(t), 0) / pesoTotal);
  const atrasadas = tareas.filter((t) => ["demorada", "vencida"].includes(estadoTarea(t, hoy))).length;

  return (
    <div className="flex min-w-0 flex-col gap-4">
      <div className="flex flex-wrap items-center gap-x-8 gap-y-3 rounded-xl border border-line bg-surface px-5 py-4">
        <div>
          <p className="text-xs text-muted">Avance de la obra</p>
          <p className="font-display text-3xl font-bold tabular-nums">{real}%</p>
        </div>
        <div>
          <p className="text-xs text-muted">Debería ir por</p>
          <p className="font-display text-3xl font-bold tabular-nums text-muted">{esperado}%</p>
        </div>
        <div className="min-w-48 flex-1">
          <div className="relative h-3 overflow-hidden rounded-full bg-subtle">
            <div className="absolute inset-y-0 left-0 rounded-full bg-fg" style={{ width: `${real}%` }} />
          </div>
          <div className="relative mt-1 h-4">
            <span
              className="absolute -translate-x-1/2 text-[11px] text-muted tabular-nums"
              style={{ left: `${esperado}%` }}
            >
              ▲ plan
            </span>
          </div>
        </div>
        {atrasadas > 0 && (
          <p className="rounded-full bg-atraso/10 px-3 py-1 text-sm font-medium text-atraso">
            {atrasadas} {atrasadas === 1 ? "etapa atrasada" : "etapas atrasadas"}
          </p>
        )}
      </div>

      <div className="overflow-hidden rounded-xl border border-line bg-surface">
        <div className="flex border-b border-line">
          <div className="w-20 shrink-0 sm:w-28" />
          <div className="relative h-9 flex-1">
            {meses.map((m, i) => (
              <span
                key={m.clave}
                className="absolute inset-y-0 flex items-center justify-center text-[11px] font-medium text-muted"
                style={{ left: `${pct(m.inicio)}%`, width: `${100 / meses.length}%` }}
              >
                <span className="hidden md:inline">{m.etiqueta}</span>
                <span className="md:hidden">{m.etiqueta[0]}</span>
                {(i === 0 || m.etiqueta === "Ene") && (
                  <span className="ml-1 hidden text-[10px] font-normal lg:inline">{String(m.anio).slice(2)}</span>
                )}
              </span>
            ))}
          </div>
        </div>

        <div className="relative">
          <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 right-0 left-20 sm:left-28">
            {meses.map((m, i) =>
              i % 2 === 1 ? (
                <span
                  key={m.clave}
                  className="absolute inset-y-0 bg-subtle/60"
                  style={{ left: `${pct(m.inicio)}%`, width: `${100 / meses.length}%` }}
                />
              ) : null,
            )}
            <div className="absolute inset-y-0 z-10 w-0.5 -translate-x-1/2 bg-marron" style={{ left: `${hoyPct}%` }}>
              <span className="absolute top-1 left-1/2 -translate-x-1/2 rounded-full bg-marron px-2 py-0.5 text-[10px] font-semibold uppercase text-white">
                Hoy
              </span>
            </div>
          </div>

          <ul aria-label="Etapas de la obra" className="relative">
            {tareas.map((tarea) => {
              const estado = estadoTarea(tarea, hoy);
              const Icono = ICONOS[tarea.id] ?? Hammer;
              const activa = tarea.id === seleccion;
              const izq = pct(tarea.inicio);
              const ancho = largo(tarea);
              const etiquetaAfuera = izq + ancho < 82;
              const atrasada = estado === "demorada" || estado === "vencida";
              return (
                <li key={tarea.id} className="border-b border-line last:border-b-0">
                  <button
                    type="button"
                    aria-pressed={activa}
                    onClick={() => onElegir(tarea.id)}
                    className={`flex w-full items-center text-left transition-colors hover:bg-subtle/70 ${
                      activa ? "bg-marron-bg/60" : ""
                    }`}
                  >
                    <span
                      className={`flex w-20 shrink-0 flex-col items-center gap-1 py-3 sm:w-28 ${
                        activa ? "border-l-2 border-marron" : "border-l-2 border-transparent"
                      }`}
                    >
                      <span className={`flex size-10 items-center justify-center rounded-xl ${TILE[estado]}`}>
                        <Icono className="size-5" strokeWidth={2.25} aria-hidden="true" />
                      </span>
                      <span className="w-full truncate px-1 text-center text-[11px] leading-tight text-muted" title={tarea.nombre}>
                        {tarea.nombre}
                      </span>
                    </span>

                    <span className="relative block h-20 flex-1">
                      <span
                        className={`absolute top-1/2 h-7 -translate-y-1/2 overflow-hidden rounded-full bg-fg/10 ${
                          activa ? "outline-2 outline-offset-2 outline-marron" : ""
                        }`}
                        style={{ left: `${izq}%`, width: `${ancho}%` }}
                      >
                        <span
                          className={`block h-full rounded-full ${RELLENO[estado]}`}
                          style={{ width: `${tarea.avance}%` }}
                        />
                      </span>
                      <span
                        className={`absolute top-1/2 flex -translate-y-1/2 items-center gap-2 whitespace-nowrap px-2 ${
                          etiquetaAfuera ? "" : "-translate-x-full"
                        }`}
                        style={{ left: `${etiquetaAfuera ? izq + ancho : izq}%` }}
                      >
                        <span className="font-display text-base font-bold tabular-nums">{tarea.avance}%</span>
                        <span className={`text-xs font-medium ${atrasada ? ESTADO_TAREA[estado].texto : "text-muted"}`}>
                          {ESTADO_TAREA[estado].etiqueta}
                        </span>
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      <ul className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-muted" aria-label="Referencias">
        <li className="flex items-center gap-1.5">
          <span className="h-3 w-6 rounded-full bg-fg" aria-hidden="true" />
          Lista
        </li>
        <li className="flex items-center gap-1.5">
          <span className="h-3 w-6 rounded-full bg-marron" aria-hidden="true" />
          En marcha
        </li>
        <li className="flex items-center gap-1.5">
          <span className="h-3 w-6 rounded-full bg-atraso" aria-hidden="true" />
          Atrasada
        </li>
        <li className="flex items-center gap-1.5">
          <span className="h-3 w-6 rounded-full bg-fg/10" aria-hidden="true" />
          Lo que falta
        </li>
        <li className="flex items-center gap-1.5">
          <span className="h-3 w-0.5 bg-marron" aria-hidden="true" />
          Hoy
        </li>
        <li className="ml-auto">Tocá una etapa para ver el detalle.</li>
      </ul>
    </div>
  );
}
