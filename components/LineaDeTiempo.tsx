import { AlertCircle, CheckCircle2, Circle, Clock } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { ESTILO_HITO, ETIQUETA_HITO } from "@/lib/estados";
import { fechaLarga } from "@/lib/fechas";
import type { EstadoHito, HitoConEstado } from "@/lib/tipos";

const ICONO: Record<EstadoHito, LucideIcon> = {
  cumplido: CheckCircle2,
  cumplido_con_atraso: Clock,
  pendiente: Circle,
  vencido_sin_evidencia: AlertCircle,
};

export function LineaDeTiempo({
  hitos,
  fechaVisible,
  onVerFoto,
}: {
  hitos: HitoConEstado[];
  fechaVisible?: string;
  onVerFoto?: (fecha: string) => void;
}) {
  return (
    <section className="flex min-w-0 flex-col gap-4">
      <div>
        <h2 className="text-base font-semibold">Cronograma del boleto</h2>
        <p className="text-sm text-muted">Lo prometido, contra lo que muestran las fotos.</p>
      </div>
      <ol className="overflow-hidden rounded-xl border border-line bg-surface">
        {hitos.map((hito, indice) => {
          const estilo = ESTILO_HITO[hito.estado];
          const Icono = ICONO[hito.estado];
          const esFoto =
            !!hito.evidencia &&
            (hito.evidencia.startsWith("/obra/") || hito.evidencia.startsWith("http"));
          const ultimo = indice === hitos.length - 1;
          return (
            <li key={hito.id} className="relative flex gap-3 px-4 py-4">
              {!ultimo && (
                <span className="absolute left-[25px] top-10 bottom-0 w-px bg-line" aria-hidden="true" />
              )}
              <Icono className={`relative mt-0.5 size-[18px] shrink-0 bg-surface ${estilo.icono}`} aria-hidden="true" />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-1">
                  <h3 className="text-sm font-medium leading-snug">{hito.nombre}</h3>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${estilo.badge}`}>
                    {ETIQUETA_HITO[hito.estado]}
                  </span>
                </div>
                <dl className="mt-2 grid grid-cols-2 gap-2 text-xs tabular-nums">
                  <div>
                    <dt className="text-muted">Prometido</dt>
                    <dd className="mt-0.5">{fechaLarga(hito.fecha_prometida)}</dd>
                  </div>
                  <div>
                    <dt className="text-muted">Observado</dt>
                    <dd className={`mt-0.5 ${hito.fecha ? "" : "text-muted"}`}>
                      {hito.fecha ? fechaLarga(hito.fecha) : "Sin evidencia"}
                    </dd>
                  </div>
                </dl>
                {hito.evidencia && !esFoto && (
                  <p className="mt-2 text-xs text-muted">{hito.evidencia}</p>
                )}
                {esFoto && hito.fecha && onVerFoto && (
                  <button
                    type="button"
                    onClick={() => onVerFoto(hito.fecha!)}
                    disabled={fechaVisible === hito.fecha}
                    className="mt-2 text-xs font-medium underline underline-offset-4 disabled:text-muted disabled:no-underline"
                  >
                    {fechaVisible === hito.fecha ? "Estás viendo esta foto" : "Ver foto de evidencia"}
                  </button>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
