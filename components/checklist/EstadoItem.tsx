import { AlertCircle, Check, Circle, Loader2 } from "lucide-react";
import type { EstadoItem } from "@/lib/tipos";

export const ETIQUETA_ESTADO: Record<EstadoItem, string> = {
  pendiente: "Pendiente",
  verificando: "Verificando",
  verificado: "Verificado",
  observado: "Observado",
};

const ESTILO: Record<EstadoItem, string> = {
  pendiente: "border border-line text-muted",
  verificando: "bg-pizarra-bg text-pizarra",
  verificado: "bg-ok-bg text-ok",
  observado: "bg-vencido-bg text-vencido",
};

export function IconoEstado({ estado, className = "size-4" }: { estado: EstadoItem; className?: string }) {
  if (estado === "verificando") return <Loader2 className={`${className} animate-spin`} aria-hidden="true" />;
  if (estado === "verificado") return <Check className={className} aria-hidden="true" />;
  if (estado === "observado") return <AlertCircle className={className} aria-hidden="true" />;
  return <Circle className={className} aria-hidden="true" />;
}

export function BadgeEstado({ estado }: { estado: EstadoItem }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${ESTILO[estado]}`}
    >
      <IconoEstado estado={estado} className="size-3" />
      {ETIQUETA_ESTADO[estado]}
    </span>
  );
}

export function Pasos({ estado }: { estado: EstadoItem }) {
  const ingresado = estado !== "pendiente";
  const colorVerif =
    estado === "verificado"
      ? "bg-ok"
      : estado === "observado"
        ? "bg-vencido"
        : estado === "verificando"
          ? "bg-pizarra animate-pulse"
          : "bg-line";
  return (
    <ol className="flex items-center gap-2 text-xs text-muted" aria-label="Progreso del punto">
      <li className="flex items-center gap-1.5">
        <span className={`size-2 rounded-full ${ingresado ? "bg-fg" : "bg-line"}`} aria-hidden="true" />
        <span className={ingresado ? "text-fg" : ""}>Ingreso</span>
      </li>
      <li aria-hidden="true" className={`h-px w-6 ${ingresado ? "bg-fg" : "bg-line"}`} />
      <li className="flex items-center gap-1.5">
        <span className={`size-2 rounded-full ${colorVerif}`} aria-hidden="true" />
        <span className={estado === "verificado" || estado === "observado" ? "text-fg" : ""}>
          Verificación
        </span>
      </li>
    </ol>
  );
}
