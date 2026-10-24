import { Star } from "lucide-react";
import { constructora } from "@/lib/datos";

function Estrellas({ puntaje, className = "size-3" }: { puntaje: number; className?: string }) {
  return (
    <span className="flex gap-0.5" aria-label={`${puntaje} de 5`} role="img">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={`${className} ${n <= Math.round(puntaje) ? "fill-marron text-marron" : "text-line"}`}
          aria-hidden="true"
        />
      ))}
    </span>
  );
}

const DOT = {
  sin_alertas: "bg-ok",
  alerta: "bg-vencido",
  no_determinable: "bg-line",
} as const;

export function ScoreEmpresa() {
  const { score, puntaje_promedio, cantidad_opiniones, opiniones, indicadores } = constructora;
  const listos = indicadores.filter((i) => i.listo);

  return (
    <section aria-labelledby="t-score" className="rounded-xl border border-line bg-surface">
      <div className="p-5">
        <h2 id="t-score" className="text-xs font-medium uppercase tracking-wide text-muted">
          Scoring de la constructora
        </h2>
        <div className="mt-2 flex items-end justify-between gap-4">
          <p className="text-3xl font-semibold tracking-tight tabular-nums">
            {score}
            <span className="text-base font-normal text-muted">/100</span>
          </p>
          <div className="flex flex-col items-end gap-1">
            <Estrellas puntaje={puntaje_promedio} className="size-3.5" />
            <span className="text-xs text-muted">
              {puntaje_promedio.toLocaleString("es-AR")} · {cantidad_opiniones} opiniones
            </span>
          </div>
        </div>
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-line" aria-hidden="true">
          <div className="h-full bg-marron" style={{ width: `${score}%` }} />
        </div>

        <ul className="mt-4 flex flex-col gap-2">
          {listos.map((i) => (
            <li key={i.id} className="flex items-start gap-2 text-xs">
              <span className={`mt-1 size-1.5 shrink-0 rounded-full ${DOT[i.estado]}`} aria-hidden="true" />
              <span className="min-w-0">
                <span className="font-medium">{i.agente}.</span>{" "}
                <span className={i.estado === "alerta" ? "text-vencido" : "text-muted"}>{i.dato}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className="border-t border-line p-5">
        <h3 className="text-xs font-medium text-muted">Opiniones recientes</h3>
        <ul className="mt-3 flex flex-col gap-4">
          {opiniones.map((o) => (
            <li key={o.autor} className="flex flex-col gap-1">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-medium">{o.autor}</span>
                <Estrellas puntaje={o.puntaje} />
              </div>
              <p className="text-xs leading-relaxed text-fg/80">&ldquo;{o.texto}&rdquo;</p>
              <span className="text-[11px] text-muted">
                {o.rol} · {o.fecha}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
