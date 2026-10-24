"use client";

import { useRef } from "react";
import { ChevronDown, Paperclip, Upload } from "lucide-react";
import type { GrupoChecklist, ItemChecklist, RegistroItem } from "@/lib/tipos";
import { IconoEstado, Pasos } from "./EstadoItem";

const COLOR_ICONO = {
  pendiente: "text-line",
  verificando: "text-pizarra",
  verificado: "text-ok",
  observado: "text-vencido",
} as const;

function Fila({
  item,
  registro,
  onSubir,
}: {
  item: ItemChecklist;
  registro: RegistroItem;
  onSubir: (file: File) => void;
}) {
  const input = useRef<HTMLInputElement>(null);
  const { estado, archivo } = registro;

  return (
    <li className="flex gap-3 px-5 py-4">
      <span className={`mt-0.5 ${COLOR_ICONO[estado]}`}>
        <IconoEstado estado={estado} className="size-[18px]" />
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h4 className="text-sm font-medium">{item.titulo}</h4>
              {item.clave && (
                <span className="rounded-full bg-marron-bg px-2 py-0.5 text-[11px] font-medium text-marron">
                  Clave
                </span>
              )}
            </div>
            <p className="mt-0.5 text-sm leading-relaxed text-muted">{item.detalle}</p>
          </div>
          {estado !== "verificando" && (
            <button
              type="button"
              onClick={() => input.current?.click()}
              className={`flex h-8 shrink-0 items-center gap-1.5 rounded-md px-3 text-xs font-medium transition-colors ${
                estado === "pendiente"
                  ? "bg-fg text-bg hover:bg-fg/85"
                  : "border border-line text-fg/80 hover:bg-subtle hover:text-fg"
              }`}
            >
              <Upload className="size-3.5" aria-hidden="true" />
              {estado === "pendiente" ? "Subir" : "Reemplazar"}
              <span className="sr-only"> {item.documento}</span>
            </button>
          )}
          <input
            ref={input}
            type="file"
            accept=".pdf,image/*,.doc,.docx"
            className="sr-only"
            tabIndex={-1}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onSubir(file);
              e.target.value = "";
            }}
          />
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
          <Pasos estado={estado} />
          <span className="flex min-w-0 items-center gap-1 text-xs text-muted">
            <Paperclip className="size-3 shrink-0" aria-hidden="true" />
            <span className="truncate">{archivo ?? item.documento}</span>
          </span>
        </div>

        {estado === "observado" && item.observacion_demo && (
          <p className="rounded-md bg-vencido-bg px-3 py-2 text-xs leading-relaxed text-vencido">
            {item.observacion_demo}
          </p>
        )}
      </div>
    </li>
  );
}

export function Grupo({
  grupo,
  items,
  registros,
  abierto,
  onAlternar,
  onSubir,
}: {
  grupo: GrupoChecklist;
  items: ItemChecklist[];
  registros: Record<string, RegistroItem>;
  abierto: boolean;
  onAlternar: () => void;
  onSubir: (itemId: string, file: File) => void;
}) {
  const estados = grupo.items.map((i) => registros[i.id]?.estado ?? "pendiente");
  const verificados = estados.filter((e) => e === "verificado").length;
  const observados = estados.filter((e) => e === "observado").length;
  const total = grupo.items.length;
  const completo = verificados === total;
  const panelId = `panel-${grupo.id}`;

  return (
    <div className="overflow-hidden rounded-xl border border-line bg-surface">
      <h3>
        <button
          type="button"
          aria-expanded={abierto}
          aria-controls={panelId}
          onClick={onAlternar}
          className="flex w-full items-center gap-4 px-5 py-4 text-left hover:bg-subtle"
        >
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-semibold">{grupo.titulo}</span>
            <span className="block truncate text-xs text-muted">{grupo.descripcion}</span>
          </span>
          {observados > 0 && (
            <span className="hidden rounded-full bg-vencido-bg px-2 py-0.5 text-xs font-medium text-vencido sm:inline">
              {observados} observado{observados > 1 ? "s" : ""}
            </span>
          )}
          <span className="flex shrink-0 flex-col items-end gap-1.5">
            <span className={`text-xs font-medium tabular-nums ${completo ? "text-ok" : ""}`}>
              {verificados} de {total} cumplidos
            </span>
            <span className="flex h-1 w-24 overflow-hidden rounded-full bg-line" aria-hidden="true">
              <span className="h-full bg-ok transition-[width]" style={{ width: `${(verificados / total) * 100}%` }} />
              <span
                className="h-full bg-vencido transition-[width]"
                style={{ width: `${(observados / total) * 100}%` }}
              />
            </span>
          </span>
          <ChevronDown
            className={`size-4 shrink-0 text-muted transition-transform ${abierto ? "rotate-180" : ""}`}
            aria-hidden="true"
          />
        </button>
      </h3>
      {abierto && (
        <ul id={panelId} className="divide-y divide-line border-t border-line">
          {items.length > 0 ? (
            items.map((item) => (
              <Fila
                key={item.id}
                item={item}
                registro={registros[item.id] ?? { estado: "pendiente" }}
                onSubir={(file) => onSubir(item.id, file)}
              />
            ))
          ) : (
            <li className="px-5 py-4 text-sm text-muted">Ningún punto coincide con el filtro.</li>
          )}
        </ul>
      )}
    </div>
  );
}
