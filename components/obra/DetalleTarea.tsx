import { ChevronLeft, ChevronRight, Users } from "lucide-react";
import { avanceEsperado, duracion, estadoTarea, ESTADO_TAREA } from "@/lib/cronograma";
import { diasEntre, fechaCorta, fechaLarga } from "@/lib/fechas";
import type { ObservacionConFoto, Tarea } from "@/lib/tipos";
import { EscenaObra } from "../EscenaObra";
import { Bloque } from "./Bloque";

function Barra({ etiqueta, valor, tono }: { etiqueta: string; valor: number; tono: string }) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between text-xs">
        <span className="text-muted">{etiqueta}</span>
        <span className="font-medium tabular-nums">{valor}%</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-subtle">
        <div className={`h-full rounded-full ${tono}`} style={{ width: `${valor}%` }} />
      </div>
    </div>
  );
}

export function DetalleTarea({
  tareas,
  tarea,
  hoy,
  fotos,
  onElegir,
  onVerFoto,
}: {
  tareas: Tarea[];
  tarea: Tarea;
  hoy: string;
  fotos: ObservacionConFoto[];
  onElegir: (id: string) => void;
  onVerFoto: (fecha: string) => void;
}) {
  const indice = tareas.findIndex((t) => t.id === tarea.id);
  const estado = estadoTarea(tarea, hoy);
  const esperado = avanceEsperado(tarea, hoy);
  const diferencia = esperado - tarea.avance;
  const delPeriodo = fotos.filter((f) => f.fecha >= tarea.inicio && f.fecha <= tarea.fin);

  let plazo = `${duracion(tarea)} días planificados`;
  if (estado === "pendiente") plazo = `Empieza en ${diasEntre(hoy, tarea.inicio)} días`;
  else if (estado === "vencida") plazo = `Venció hace ${diasEntre(tarea.fin, hoy)} días`;
  else if (estado !== "terminada") plazo = `Faltan ${diasEntre(hoy, tarea.fin)} días según el plan`;

  return (
    <aside
      aria-label="Detalle de la tarea"
      className="flex flex-col overflow-hidden rounded-xl border border-line bg-surface"
    >
      <div className="flex items-start justify-between gap-2 px-5 py-4">
        <div className="min-w-0">
          <p className="text-xs text-muted tabular-nums">
            Tarea {indice + 1} de {tareas.length}
          </p>
          <p className="font-display text-lg font-bold text-balance">{tarea.nombre}</p>
          <p className={`mt-1 flex items-center gap-1.5 text-xs font-medium ${ESTADO_TAREA[estado].texto}`}>
            <span className={`size-2 rounded-full ${ESTADO_TAREA[estado].punto}`} aria-hidden="true" />
            {ESTADO_TAREA[estado].etiqueta}
          </p>
        </div>
        <div className="flex shrink-0 gap-1">
          <button
            type="button"
            onClick={() => onElegir(tareas[indice - 1].id)}
            disabled={indice === 0}
            aria-label="Tarea anterior"
            className="flex size-8 items-center justify-center rounded-md border border-line hover:bg-subtle disabled:opacity-40 disabled:hover:bg-transparent"
          >
            <ChevronLeft className="size-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => onElegir(tareas[indice + 1].id)}
            disabled={indice === tareas.length - 1}
            aria-label="Tarea siguiente"
            className="flex size-8 items-center justify-center rounded-md border border-line hover:bg-subtle disabled:opacity-40 disabled:hover:bg-transparent"
          >
            <ChevronRight className="size-4" aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 xl:grid-cols-4 [&>div]:border-line sm:[&>div]:border-l sm:[&>div:nth-child(odd)]:border-l-0 xl:[&>div:nth-child(odd)]:border-l xl:[&>div:first-child]:border-l-0">
      <Bloque titulo="Avance">
        <div className="flex flex-col gap-3">
          <Barra etiqueta="Real" valor={tarea.avance} tono="bg-pizarra" />
          <Barra etiqueta="Esperado a hoy" valor={esperado} tono="bg-pizarra/30" />
        </div>
        {estado === "demorada" || estado === "vencida" ? (
          <p className={`text-sm font-medium ${ESTADO_TAREA[estado].texto}`}>
            {diferencia} puntos por detrás del plan.
          </p>
        ) : estado === "en_curso" ? (
          <p className="text-sm text-muted">Dentro de lo planificado.</p>
        ) : null}
      </Bloque>

      <Bloque titulo="Fechas">
        <p className="text-sm tabular-nums">
          {fechaLarga(tarea.inicio)} <span className="text-muted">→</span> {fechaLarga(tarea.fin)}
        </p>
        <p className={`text-sm ${estado === "vencida" ? "font-medium text-vencido" : "text-muted"}`}>{plazo}</p>
      </Bloque>

      <Bloque titulo="Equipo">
        <p className="flex items-center gap-2 text-sm">
          <Users className="size-4 text-pizarra" strokeWidth={2.25} aria-hidden="true" />
          {tarea.responsable} · {tarea.personas} personas
        </p>
        {tarea.nota && <p className="text-pretty text-sm leading-relaxed text-muted">{tarea.nota}</p>}
      </Bloque>

      <Bloque titulo="Fotos del período">
        {delPeriodo.length > 0 ? (
          <ul className="flex flex-wrap gap-2">
            {delPeriodo.map((foto) => (
              <li key={foto.fecha}>
                <button
                  type="button"
                  onClick={() => onVerFoto(foto.fecha)}
                  aria-label={`Ver foto del ${fechaLarga(foto.fecha)}`}
                  className="group w-16"
                >
                  <span className="block aspect-[4/3] overflow-hidden rounded-md opacity-70 grayscale transition-opacity group-hover:opacity-100">
                    <EscenaObra obs={foto} />
                  </span>
                  <span className="mt-1 block text-center text-xs tabular-nums text-muted">{fechaCorta(foto.fecha)}</span>
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className={`text-sm ${estado === "pendiente" ? "text-muted" : "font-medium text-atraso"}`}>
            {estado === "pendiente" ? "Todavía no empezó." : "Ninguna foto muestra esta tarea."}
          </p>
        )}
      </Bloque>
      </div>
    </aside>
  );
}
