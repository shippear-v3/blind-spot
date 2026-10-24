"use client";

import { useState } from "react";
import { AlertTriangle, Check, CheckCircle2, CircleDashed } from "lucide-react";
import { checklist, constructora } from "@/lib/datos";
import { ETIQUETA_FICHA } from "@/lib/estados";
import type { Indicador, ItemChecklist } from "@/lib/tipos";

const listos = constructora.indicadores.filter((i) => i.listo);
const proximos = constructora.indicadores.filter((i) => !i.listo);
const totalManual = checklist.reduce((n, g) => n + g.items.length, 0);

function FilaIndicador({ indicador }: { indicador: Indicador }) {
  const alerta = indicador.estado === "alerta";
  const Icono = !indicador.listo ? CircleDashed : alerta ? AlertTriangle : CheckCircle2;
  return (
    <li className="flex gap-3 px-4 py-4 sm:px-5">
      <Icono
        className={`mt-0.5 size-[18px] shrink-0 ${
          !indicador.listo ? "text-muted" : alerta ? "text-vencido" : "text-fg"
        }`}
        aria-hidden="true"
      />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-1">
          <h3 className={`text-sm font-medium ${indicador.listo ? "" : "text-muted"}`}>{indicador.agente}</h3>
          <span
            className={`rounded-full px-2 py-0.5 text-xs font-medium ${
              !indicador.listo
                ? "border border-line text-muted"
                : alerta
                  ? "bg-vencido-bg text-vencido"
                  : "bg-subtle text-fg"
            }`}
          >
            {indicador.listo ? ETIQUETA_FICHA[indicador.estado] : "Próximamente"}
          </span>
        </div>
        {indicador.listo && <p className="mt-1 text-sm">{indicador.dato}</p>}
        <p className="mt-1 text-sm text-muted">{indicador.porque}</p>
        {indicador.listo && <p className="mt-2 text-xs text-muted">Origen: {indicador.origen}</p>}
      </div>
    </li>
  );
}

function FilaManual({
  item,
  marcado,
  onCambiar,
}: {
  item: ItemChecklist;
  marcado: boolean;
  onCambiar: () => void;
}) {
  return (
    <li>
      <label className="flex cursor-pointer gap-3 px-4 py-4 hover:bg-subtle sm:px-5">
        <input type="checkbox" checked={marcado} onChange={onCambiar} className="peer sr-only" />
        <span
          aria-hidden="true"
          className={`mt-0.5 flex size-[18px] shrink-0 items-center justify-center rounded border transition-colors peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-fg ${
            marcado ? "border-fg bg-fg text-bg" : "border-muted"
          }`}
        >
          {marcado && <Check className="size-3" strokeWidth={3} />}
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-center gap-2">
            <span className={`text-sm font-medium ${marcado ? "text-muted line-through" : ""}`}>
              {item.titulo}
            </span>
            {item.clave && (
              <span className="rounded-full border border-line px-2 py-0.5 text-[11px] font-medium text-muted">
                Clave
              </span>
            )}
          </span>
          <span className="mt-1 block text-sm leading-relaxed text-muted">{item.detalle}</span>
        </span>
      </label>
    </li>
  );
}

export function Checklist() {
  const [marcados, setMarcados] = useState<Set<string>>(new Set());
  const alertas = listos.filter((i) => i.estado === "alerta").length;
  const clavesPendientes = checklist
    .flatMap((g) => g.items)
    .filter((i) => i.clave && !marcados.has(i.id)).length;

  function alternar(id: string) {
    setMarcados((actual) => {
      const siguiente = new Set(actual);
      if (siguiente.has(id)) siguiente.delete(id);
      else siguiente.add(id);
      return siguiente;
    });
  }

  const porcentaje = Math.round((marcados.size / totalManual) * 100);

  return (
    <div className="flex flex-col gap-10">
      <header className="flex max-w-2xl flex-col gap-2">
        <p className="text-sm text-muted">Antes de invertir</p>
        <h1 className="text-balance text-3xl font-semibold tracking-tight">Checklist del inversor</h1>
        <p className="text-pretty leading-relaxed text-muted">
          Lo que conviene saber de {constructora.nombre} antes de firmar. Una parte la revisamos
          nosotros con fuentes públicas; la otra la tenés que pedir vos.
        </p>
      </header>

      <dl className="grid gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-3">
        <div className="flex flex-col gap-1 bg-surface p-4 sm:p-5">
          <dt className="text-xs text-muted">Tu revisión</dt>
          <dd className="text-xl font-semibold tracking-tight tabular-nums">
            {marcados.size} de {totalManual}
          </dd>
          <dd className="mt-2 h-1 overflow-hidden rounded-full bg-line" aria-hidden="true">
            <div className="h-full bg-fg transition-[width]" style={{ width: `${porcentaje}%` }} />
          </dd>
        </div>
        <div className="flex flex-col gap-1 bg-surface p-4 sm:p-5">
          <dt className="text-xs text-muted">Puntos clave sin revisar</dt>
          <dd
            className={`text-xl font-semibold tracking-tight tabular-nums ${
              clavesPendientes > 0 ? "text-atraso" : ""
            }`}
          >
            {clavesPendientes}
          </dd>
          <dd className="text-xs text-muted">No firmes sin estos</dd>
        </div>
        <div className="flex flex-col gap-1 bg-surface p-4 sm:p-5">
          <dt className="text-xs text-muted">Alertas de la constructora</dt>
          <dd
            className={`text-xl font-semibold tracking-tight tabular-nums ${alertas > 0 ? "text-vencido" : ""}`}
          >
            {alertas}
          </dd>
          <dd className="text-xs text-muted">
            {listos.length} de {constructora.indicadores.length} verificaciones disponibles
          </dd>
        </div>
      </dl>

      <div className="grid items-start gap-10 xl:grid-cols-2">
        <section className="flex flex-col gap-4" aria-labelledby="t-auto">
          <div>
            <h2 id="t-auto" className="text-base font-semibold">
              Lo que revisamos nosotros
            </h2>
            <p className="text-sm text-muted">Cada dato indica de dónde sale.</p>
          </div>
          <ul className="divide-y divide-line overflow-hidden rounded-xl border border-line bg-surface">
            {[...listos, ...proximos].map((indicador) => (
              <FilaIndicador key={indicador.id} indicador={indicador} />
            ))}
          </ul>
        </section>

        <section className="flex flex-col gap-4" aria-labelledby="t-manual">
          <div>
            <h2 id="t-manual" className="text-base font-semibold">
              Lo que tenés que pedir vos
            </h2>
            <p className="text-sm text-muted">Marcá cada punto a medida que lo confirmás.</p>
          </div>
          {checklist.map((grupo) => {
            const hechos = grupo.items.filter((i) => marcados.has(i.id)).length;
            return (
              <div key={grupo.id} className="overflow-hidden rounded-xl border border-line bg-surface">
                <div className="flex items-center justify-between border-b border-line px-4 py-3 sm:px-5">
                  <h3 className="text-sm font-semibold">{grupo.titulo}</h3>
                  <span className="text-xs text-muted tabular-nums">
                    {hechos}/{grupo.items.length}
                  </span>
                </div>
                <ul className="divide-y divide-line">
                  {grupo.items.map((item) => (
                    <FilaManual
                      key={item.id}
                      item={item}
                      marcado={marcados.has(item.id)}
                      onCambiar={() => alternar(item.id)}
                    />
                  ))}
                </ul>
              </div>
            );
          })}
        </section>
      </div>

      <p className="max-w-2xl text-xs leading-relaxed text-muted">
        Ninguna verificación garantiza que una inversión sea segura. Esta lista te ayuda a hacer las
        preguntas correctas; consultá con un abogado o escribano antes de firmar.
      </p>
    </div>
  );
}
