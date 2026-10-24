"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarRange, ChevronLeft, ChevronRight, Image as ImageIcon, Upload } from "lucide-react";
import { achicarJpeg } from "@/lib/achicar";
import { cronograma, proyecto } from "@/lib/datos";
import { estadoTarea } from "@/lib/cronograma";
import { ETIQUETA_ETAPA } from "@/lib/estados";
import { fechaCorta, fechaLarga } from "@/lib/fechas";
import { ETAPAS, type ObservacionConFoto } from "@/lib/tipos";
import { FotoObra } from "./FotoObra";
import { Bloque } from "./obra/Bloque";
import { DetalleTarea } from "./obra/DetalleTarea";
import { Gantt } from "./obra/Gantt";

type Previa = { url: string; nombre: string; archivo: File };

function Etapas({ etapa }: { etapa: ObservacionConFoto["etapa"] }) {
  const actual = (ETAPAS as readonly string[]).indexOf(etapa);
  return (
    <ol className="flex flex-col gap-2">
      {ETAPAS.map((e, i) => {
        const hecha = actual >= 0 && i < actual;
        const enCurso = i === actual;
        return (
          <li key={e} className="flex items-center gap-2.5 text-sm">
            <span
              className={`size-2 shrink-0 rounded-full ${
                enCurso ? "bg-marron ring-4 ring-marron-bg" : hecha ? "bg-fg" : "border border-line bg-surface"
              }`}
              aria-hidden="true"
            />
            <span className={enCurso ? "font-medium" : hecha ? "" : "text-muted"}>{ETIQUETA_ETAPA[e]}</span>
            {enCurso && <span className="ml-auto text-xs font-medium text-marron">En curso</span>}
          </li>
        );
      })}
      {actual < 0 && <li className="text-sm text-atraso">La etapa no se puede determinar en esta foto.</li>}
    </ol>
  );
}

type Vista = "fotos" | "cronograma";

const tareaInicial =
  cronograma.find((t) => ["vencida", "demorada"].includes(estadoTarea(t, proyecto.fecha_demo)))?.id ??
  cronograma[0]?.id;

export function Camara({
  fotos,
  fecha,
  seleccion,
  onElegirFecha,
}: {
  fotos: ObservacionConFoto[];
  fecha: string;
  seleccion: number;
  onElegirFecha: (fecha: string) => void;
}) {
  const router = useRouter();
  const indice = Math.max(
    0,
    fotos.findIndex((foto) => foto.fecha === fecha),
  );
  const actual = fotos[indice] ?? fotos.at(-1);
  const [vista, setVista] = useState<Vista>("fotos");
  const [tareaId, setTareaId] = useState(tareaInicial);
  const tarea = cronograma.find((t) => t.id === tareaId) ?? cronograma[0];
  const [previa, setPrevia] = useState<Previa | null>(null);
  const [pendiente, setPendiente] = useState(false);
  const [error, setError] = useState("");
  const previaRef = useRef<Previa | null>(null);
  const tira = useRef<HTMLUListElement>(null);
  const seleccionInicial = useRef(seleccion);

  useEffect(() => {
    return () => {
      if (previaRef.current) URL.revokeObjectURL(previaRef.current.url);
    };
  }, []);

  useEffect(() => {
    const activo = tira.current?.querySelector('[aria-pressed="true"]');
    if (activo instanceof HTMLElement && tira.current) {
      tira.current.scrollLeft = Math.max(0, activo.offsetLeft - 8);
    }
  }, [fecha, previa]);

  useEffect(() => {
    if (seleccionInicial.current === seleccion) return;
    seleccionInicial.current = seleccion;
    if (!previaRef.current) return;
    URL.revokeObjectURL(previaRef.current.url);
    previaRef.current = null;
    setPrevia(null);
    setError("");
  }, [seleccion]);

  function guardarPrevia(siguiente: Previa | null) {
    if (previaRef.current) URL.revokeObjectURL(previaRef.current.url);
    previaRef.current = siguiente;
    setPrevia(siguiente);
    setError("");
  }

  if (!actual) return null;

  function elegir(archivo: File | undefined) {
    if (!archivo || !archivo.type.startsWith("image/")) return;
    guardarPrevia({ url: URL.createObjectURL(archivo), nombre: archivo.name, archivo });
  }

  function ir(paso: number) {
    const destino = fotos[indice + paso];
    if (!destino) return;
    guardarPrevia(null);
    onElegirFecha(destino.fecha);
  }

  async function analizar() {
    if (!previa || pendiente) return;
    setPendiente(true);
    setError("");
    try {
      const { base64, mediaType } = await achicarJpeg(previa.archivo);
      const res = await fetch("/api/analizar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ base64, mediaType, fecha: proyecto.fecha_demo }),
      });
      const data = (await res.json()) as { observacion?: ObservacionConFoto; error?: string };
      if (!res.ok || !data.observacion) {
        setError(data.error || "No pude analizar la foto.");
        return;
      }
      guardarPrevia(null);
      onElegirFecha(data.observacion.fecha);
      router.refresh();
    } catch (causa) {
      console.error(causa);
      setError("No pude analizar la foto.");
    } finally {
      setPendiente(false);
    }
  }

  const anterior = indice > 0 ? fotos[indice - 1] : null;

  return (
    <section className="flex min-w-0 flex-col gap-4" aria-labelledby="titulo-camara">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 id="titulo-camara" className="text-xl">
            Durante la obra
          </h2>
          <p className="text-sm text-muted">
            {vista === "fotos"
              ? "Cada foto de la cámara, con lo que avanzó."
              : "El plan de la constructora contra el avance real de cada tarea."}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div role="group" aria-label="Vista" className="inline-flex rounded-md border border-line bg-subtle p-0.5">
            {(
              [
                { id: "fotos", etiqueta: "Fotos", Icono: ImageIcon },
                { id: "cronograma", etiqueta: "Cronograma", Icono: CalendarRange },
              ] as const
            ).map(({ id, etiqueta, Icono }) => (
              <button
                key={id}
                type="button"
                aria-pressed={vista === id}
                onClick={() => setVista(id)}
                className="inline-flex h-7 items-center gap-1.5 rounded px-2.5 text-sm font-medium text-muted hover:text-fg aria-pressed:bg-surface aria-pressed:text-fg aria-pressed:shadow-sm"
              >
                <Icono className="size-4" strokeWidth={2.25} aria-hidden="true" />
                {etiqueta}
              </button>
            ))}
          </div>
          {vista === "fotos" && (
            <label className="inline-flex h-8 cursor-pointer items-center gap-2 rounded-md border border-line bg-surface px-3 text-sm font-medium hover:bg-subtle focus-within:outline-2 focus-within:outline-pizarra">
              <input
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={(event) => {
                  elegir(event.target.files?.[0]);
                  event.target.value = "";
                }}
              />
              <Upload className="size-4" aria-hidden="true" />
              Subir foto
            </label>
          )}
        </div>
      </div>

      {vista === "cronograma" && tarea ? (
        <div className="flex min-w-0 flex-col gap-4">
          <Gantt tareas={cronograma} hoy={proyecto.fecha_demo} seleccion={tarea.id} onElegir={setTareaId} />
          <DetalleTarea
            tareas={cronograma}
            tarea={tarea}
            hoy={proyecto.fecha_demo}
            fotos={fotos}
            onElegir={setTareaId}
            onVerFoto={(f) => {
              guardarPrevia(null);
              onElegirFecha(f);
              setVista("fotos");
            }}
          />
        </div>
      ) : (
      <div className="grid min-w-0 items-start gap-4 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="flex min-w-0 flex-col gap-3">
          <figure className="relative aspect-[16/10] overflow-hidden rounded-xl border border-line bg-black">
            {previa ? (
              <div
                role="img"
                aria-label="Foto elegida, sin analizar"
                className="h-full w-full bg-contain bg-center bg-no-repeat grayscale"
                style={{ backgroundImage: `url(${previa.url})` }}
              />
            ) : (
              <div className="h-full w-full grayscale">
                <FotoObra obs={actual} />
              </div>
            )}
            <figcaption className="absolute inset-x-3 bottom-3 flex items-center justify-between gap-2 text-xs font-medium text-white tabular-nums">
              <span className="rounded bg-black/60 px-2 py-1 backdrop-blur">CAM 04</span>
              <span className="rounded bg-black/60 px-2 py-1 backdrop-blur">
                {fechaLarga(previa ? proyecto.fecha_demo : actual.fecha)}
                {previa ? " · Sin analizar" : ""}
              </span>
            </figcaption>
          </figure>

          <ul ref={tira} className="flex min-w-0 gap-2 overflow-x-auto pb-1" aria-label="Fotos de la obra">
            {fotos.map((foto) => {
              const activa = !previa && foto.fecha === actual.fecha;
              return (
                <li key={foto.fecha} className="shrink-0">
                  <button
                    type="button"
                    aria-pressed={activa}
                    aria-label={`Ver foto del ${fechaLarga(foto.fecha)}`}
                    onClick={() => {
                      guardarPrevia(null);
                      onElegirFecha(foto.fecha);
                    }}
                    className="group w-16"
                  >
                    <span
                      className={`block aspect-[4/3] overflow-hidden rounded-md grayscale transition-opacity ${
                        activa ? "ring-2 ring-marron ring-offset-2 ring-offset-bg" : "opacity-50 group-hover:opacity-100"
                      }`}
                    >
                      <FotoObra obs={foto} />
                    </span>
                    <span
                      className={`mt-1.5 block text-center text-xs tabular-nums ${activa ? "font-medium" : "text-muted"}`}
                    >
                      {fechaCorta(foto.fecha)}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        <aside
          aria-label="Avances de la foto"
          className="flex flex-col overflow-hidden rounded-xl border border-line bg-surface lg:sticky lg:top-20"
        >
          <div className="flex items-center justify-between gap-2 px-5 py-4">
            <div>
              <p className="text-xs text-muted tabular-nums">
                {previa ? "Foto nueva" : `Foto ${indice + 1} de ${fotos.length}`}
              </p>
              <p className="font-display text-lg font-bold tabular-nums">
                {fechaLarga(previa ? proyecto.fecha_demo : actual.fecha)}
              </p>
            </div>
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => ir(-1)}
                disabled={!!previa || indice === 0}
                aria-label="Foto anterior"
                className="flex size-8 items-center justify-center rounded-md border border-line hover:bg-subtle disabled:opacity-40 disabled:hover:bg-transparent"
              >
                <ChevronLeft className="size-4" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => ir(1)}
                disabled={!!previa || indice === fotos.length - 1}
                aria-label="Foto siguiente"
                className="flex size-8 items-center justify-center rounded-md border border-line hover:bg-subtle disabled:opacity-40 disabled:hover:bg-transparent"
              >
                <ChevronRight className="size-4" aria-hidden="true" />
              </button>
            </div>
          </div>

          {previa ? (
            <Bloque titulo="Sin analizar">
              <p className="text-sm leading-relaxed">
                {previa.nombre} se guarda con la fecha de seguimiento, {fechaLarga(proyecto.fecha_demo)}.
              </p>
              <button
                type="button"
                onClick={analizar}
                disabled={pendiente}
                className="self-start rounded-md bg-marron px-3 py-1.5 text-sm font-semibold text-white disabled:opacity-60"
              >
                {pendiente ? "Mirando la foto…" : "Analizar y guardar"}
              </button>
              {error && <p className="text-sm text-vencido">{error}</p>}
              <button
                type="button"
                onClick={() => guardarPrevia(null)}
                disabled={pendiente}
                className="self-start text-sm font-medium underline underline-offset-4 disabled:opacity-60"
              >
                Volver a la última foto de la obra
              </button>
            </Bloque>
          ) : (
            <>
              <Bloque titulo={anterior ? `Avance desde el ${fechaCorta(anterior.fecha)}` : "Primera foto"}>
                <p className="text-pretty text-sm leading-relaxed">{actual.cambios_vs_foto_anterior}</p>
                {!actual.hay_actividad_visible && (
                  <p className="text-sm font-medium text-atraso">En esta foto no se ve actividad.</p>
                )}
              </Bloque>

              <Bloque titulo="Etapa">
                <Etapas etapa={actual.etapa} />
              </Bloque>

              <Bloque titulo="Lo que se ve">
                {actual.pisos_con_estructura_visibles !== null && (
                  <p className="text-sm">
                    <span className="font-display text-2xl font-bold tabular-nums">
                      {actual.pisos_con_estructura_visibles}
                    </span>{" "}
                    <span className="text-muted">
                      {actual.pisos_con_estructura_visibles === 1 ? "piso" : "pisos"} con estructura
                    </span>
                  </p>
                )}
                <p className="text-pretty text-sm leading-relaxed text-muted">{actual.descripcion}</p>
                <ul className="flex flex-wrap gap-1.5" aria-label="Elementos visibles">
                  {actual.elementos_visibles.map((el) => (
                    <li key={el} className="rounded-full bg-subtle px-2.5 py-0.5 text-xs">
                      {el}
                    </li>
                  ))}
                </ul>
              </Bloque>

              {actual.limitaciones && (
                <Bloque titulo="Lectura">
                  <p className="text-sm text-muted">{actual.limitaciones}</p>
                </Bloque>
              )}
            </>
          )}
        </aside>
      </div>
      )}
    </section>
  );
}
