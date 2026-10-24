import { Search } from "lucide-react";
import type { EstadoItem } from "@/lib/tipos";
import { ETIQUETA_ESTADO } from "./EstadoItem";

export type FiltroEstado = "todos" | EstadoItem;

const OPCIONES: FiltroEstado[] = ["todos", "pendiente", "verificando", "verificado", "observado"];

export function Filtros({
  estado,
  onEstado,
  soloClaves,
  onSoloClaves,
  busqueda,
  onBusqueda,
  conteos,
}: {
  estado: FiltroEstado;
  onEstado: (e: FiltroEstado) => void;
  soloClaves: boolean;
  onSoloClaves: (v: boolean) => void;
  busqueda: string;
  onBusqueda: (v: string) => void;
  conteos: Record<FiltroEstado, number>;
}) {
  return (
    <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
      <div role="group" aria-label="Filtrar por estado" className="flex flex-wrap gap-1.5">
        {OPCIONES.map((op) => {
          const activo = estado === op;
          return (
            <button
              key={op}
              type="button"
              aria-pressed={activo}
              onClick={() => onEstado(op)}
              className={`flex h-8 items-center gap-1.5 rounded-full border px-3 text-xs font-medium transition-colors ${
                activo
                  ? "border-fg bg-fg text-bg"
                  : "border-line text-fg/80 hover:border-muted hover:text-fg"
              }`}
            >
              {op === "todos" ? "Todos" : ETIQUETA_ESTADO[op]}
              <span className={`tabular-nums ${activo ? "text-bg/70" : "text-muted"}`}>{conteos[op]}</span>
            </button>
          );
        })}
      </div>
      <div className="flex items-center justify-between gap-3">
        <label className="flex cursor-pointer items-center gap-2 whitespace-nowrap text-xs font-medium">
          <input
            type="checkbox"
            checked={soloClaves}
            onChange={(e) => onSoloClaves(e.target.checked)}
            className="size-3.5 accent-[var(--marron)]"
          />
          Solo puntos clave
        </label>
        <div className="relative">
          <Search
            className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted"
            aria-hidden="true"
          />
          <input
            type="search"
            value={busqueda}
            onChange={(e) => onBusqueda(e.target.value)}
            placeholder="Buscar"
            aria-label="Buscar en el checklist"
            className="h-8 w-40 rounded-full border border-line bg-bg pl-8 pr-3 text-xs placeholder:text-muted"
          />
        </div>
      </div>
    </div>
  );
}
