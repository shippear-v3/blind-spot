import { ESTILO_HITO, ETIQUETA_HITO } from "@/lib/estados";
import { fechaLarga } from "@/lib/fechas";
import type { HitoConEstado } from "@/lib/tipos";

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
    <section className="min-w-0">
      <p className="font-mono text-xs tracking-[0.16em] text-pendiente">PROMETIDO</p>
      <h2 className="font-display text-4xl font-bold uppercase leading-none">Cronograma del boleto</h2>
      <ol className="relative mt-4 flex flex-col gap-2">
        <span className="rebar absolute bottom-3 left-[9px] top-3 w-1.5" aria-hidden="true" />
        {hitos.map((hito) => {
          const estilo = ESTILO_HITO[hito.estado];
          const esFoto = hito.evidencia?.startsWith("/obra/");
          return (
            <li key={hito.id} className={`relative py-3 pr-3 pl-8 ${estilo.superficie}`}>
              <span className={`absolute top-5 left-[5px] size-3 ${estilo.marca}`} aria-hidden="true" />
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h3 className="text-base font-semibold leading-tight">{hito.nombre}</h3>
                <p className={`font-mono text-xs tracking-wide uppercase ${estilo.texto}`}>
                  {ETIQUETA_HITO[hito.estado]}
                </p>
              </div>
              <dl className="mt-2 grid grid-cols-2 gap-2 font-mono text-xs">
                <div>
                  <dt className="text-pendiente">Prometido</dt>
                  <dd>{fechaLarga(hito.fecha_prometida)}</dd>
                </div>
                <div>
                  <dt className="text-pendiente">Observado</dt>
                  <dd>{hito.fecha ? fechaLarga(hito.fecha) : "Sin evidencia"}</dd>
                </div>
              </dl>
              {hito.evidencia && !esFoto && (
                <p className="mt-2 text-sm text-pendiente">{hito.evidencia}</p>
              )}
              {esFoto && hito.fecha && onVerFoto && (
                <button
                  type="button"
                  onClick={() => onVerFoto(hito.fecha!)}
                  className="mt-2 text-sm underline"
                >
                  {fechaVisible === hito.fecha ? "Estás viendo esta foto" : "Ver esa foto"}
                </button>
              )}
            </li>
          );
        })}
      </ol>
    </section>
  );
}
