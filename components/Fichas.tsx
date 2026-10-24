import { constructora } from "@/lib/datos";
import { ETIQUETA_FICHA } from "@/lib/estados";

export function Fichas() {
  return (
    <div className="flex flex-col gap-5">
      <div>
        <p className="font-mono text-xs tracking-[0.16em] text-pendiente">LA CONSTRUCTORA</p>
        <h2 className="font-display text-4xl font-bold uppercase leading-none">Antes de invertir</h2>
        <p className="mt-3 max-w-2xl text-lg leading-snug">
          {constructora.nombre}. Cada ficha es un dato con su origen. Ninguna dice que la inversión sea segura.
        </p>
      </div>
      <ul className="grid gap-3 md:grid-cols-2">
        {constructora.indicadores.map((indicador) => (
          <li key={indicador.id}>
            <article
              className={`flex h-full flex-col gap-3 border bg-card p-4 ${
                indicador.estado === "alerta" ? "border-vencido/50" : "border-line"
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="font-mono text-xs tracking-[0.14em] uppercase">{indicador.agente}</h3>
                {indicador.listo ? (
                  <p
                    className={`font-mono text-xs tracking-wide uppercase ${
                      indicador.estado === "alerta"
                        ? "text-vencido"
                        : indicador.estado === "sin_alertas"
                          ? "text-ink"
                          : "text-pendiente"
                    }`}
                  >
                    {ETIQUETA_FICHA[indicador.estado]}
                  </p>
                ) : (
                  <p className="border border-dashed border-pendiente px-2 py-1 font-mono text-xs">
                    Próximamente
                  </p>
                )}
              </div>
              <p className="text-lg leading-snug">{indicador.dato}</p>
              <p className="mt-auto font-mono text-xs text-pendiente">Origen: {indicador.origen}</p>
            </article>
          </li>
        ))}
      </ul>
    </div>
  );
}
