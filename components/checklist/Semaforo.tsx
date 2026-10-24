export type NivelRiesgo = "alto" | "medio" | "bajo";

const NIVELES: { id: NivelRiesgo; etiqueta: string; color: string; texto: string; fondo: string }[] = [
  { id: "alto", etiqueta: "Alto", color: "bg-vencido", texto: "text-vencido", fondo: "bg-vencido-bg" },
  { id: "medio", etiqueta: "Medio", color: "bg-atraso", texto: "text-atraso", fondo: "bg-atraso-bg" },
  { id: "bajo", etiqueta: "Bajo", color: "bg-ok", texto: "text-ok", fondo: "bg-ok-bg" },
];

const TITULO: Record<NivelRiesgo, string> = {
  alto: "No firmes todavía",
  medio: "Avanzá con cuidado",
  bajo: "Documentación en orden",
};

export function Semaforo({
  nivel,
  verificados,
  total,
  motivos,
}: {
  nivel: NivelRiesgo;
  verificados: number;
  total: number;
  motivos: string[];
}) {
  const actual = NIVELES.find((n) => n.id === nivel)!;
  return (
    <section aria-labelledby="t-riesgo" className="rounded-xl border border-line bg-surface p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 id="t-riesgo" className="text-xs font-medium uppercase tracking-wide text-muted">
            Riesgo de la inversión
          </h2>
          <p className={`mt-1 text-xl font-semibold tracking-tight ${actual.texto}`}>
            {actual.etiqueta}
          </p>
          <p className="text-sm">{TITULO[nivel]}</p>
        </div>
        <div
          className="flex flex-col gap-1.5 rounded-full border border-line bg-subtle p-1.5"
          role="img"
          aria-label={`Semáforo en riesgo ${actual.etiqueta.toLowerCase()}`}
        >
          {NIVELES.map((n) => (
            <span
              key={n.id}
              className={`size-4 rounded-full transition-colors ${
                n.id === nivel ? `${n.color} shadow-[0_0_0_3px_var(--surface)]` : "bg-line"
              }`}
            />
          ))}
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between text-xs">
        <span className="text-muted">Puntos cumplidos</span>
        <span className="font-medium tabular-nums">
          {verificados} / {total}
        </span>
      </div>
      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-line" aria-hidden="true">
        <div
          className={`h-full transition-[width] ${actual.color}`}
          style={{ width: `${(verificados / total) * 100}%` }}
        />
      </div>

      {motivos.length > 0 && (
        <ul className={`mt-4 flex flex-col gap-1.5 rounded-lg p-3 text-xs leading-relaxed ${actual.fondo}`}>
          {motivos.map((m) => (
            <li key={m} className="flex gap-2">
              <span className={`mt-1.5 size-1 shrink-0 rounded-full ${actual.color}`} aria-hidden="true" />
              {m}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
