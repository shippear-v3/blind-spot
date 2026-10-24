"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowUp, MessageSquare, X } from "lucide-react";
import { fechaCorta } from "@/lib/fechas";
import { fotosOrdenadas } from "@/lib/reglas";
import { PREGUNTAS, respuestaMock } from "@/lib/respuestas-mock";
import { EscenaObra } from "./EscenaObra";
import { useChat } from "./Shell";

type Burbuja = { rol: "inversor" | "agente"; texto: string };

const AVISO =
  "Esa pregunta la va a contestar el agente cuando lo conectemos. Mientras, probá una de las sugeridas.";

function fechasCitadas(texto: string) {
  return [...new Set(texto.match(/\d{4}-\d{2}-\d{2}/g) ?? [])];
}

export function ChatPanel() {
  const chat = useChat();
  const fotos = useMemo(() => fotosOrdenadas(), []);
  const [pregunta, setPregunta] = useState("");
  const [mensajes, setMensajes] = useState<Burbuja[]>([]);
  const lista = useRef<HTMLDivElement>(null);
  const campo = useRef<HTMLInputElement>(null);

  useEffect(() => {
    lista.current?.scrollTo({ top: lista.current.scrollHeight, behavior: "smooth" });
  }, [mensajes]);

  useEffect(() => {
    if (chat.abierto) campo.current?.focus();
  }, [chat.abierto]);

  function enviar(texto: string) {
    const limpio = texto.trim();
    if (!limpio) return;
    const respuesta = respuestaMock(limpio) ?? AVISO;
    setMensajes((actual) => [
      ...actual,
      { rol: "inversor", texto: limpio },
      { rol: "agente", texto: respuesta },
    ]);
    setPregunta("");
  }

  const pendientes = PREGUNTAS.filter((p) => !mensajes.some((m) => m.texto === p));

  return (
    <>
      {chat.abierto && (
        <div className="fixed inset-0 z-40 bg-black/40 lg:hidden" aria-hidden="true" onClick={chat.cerrar} />
      )}
      <aside
        aria-label="Chat con tu obra"
        hidden={!chat.abierto}
        className="fixed inset-y-0 right-0 z-50 w-full max-w-sm border-l border-line bg-surface lg:sticky lg:top-0 lg:z-auto lg:h-screen lg:w-96 lg:max-w-none lg:shrink-0"
      >
        <div className="flex h-full flex-col">
          <div className="flex h-14 shrink-0 items-center justify-between gap-3 border-b border-line px-4">
            <div className="flex items-center gap-2">
              <MessageSquare className="size-4 text-muted" aria-hidden="true" />
              <h2 className="text-sm font-semibold">Consultá tu obra</h2>
            </div>
            <button
              type="button"
              onClick={chat.cerrar}
              className="flex size-8 items-center justify-center rounded-md text-muted hover:bg-subtle hover:text-fg"
            >
              <X className="size-4" aria-hidden="true" />
              <span className="sr-only">Cerrar chat</span>
            </button>
          </div>

          <div ref={lista} className="flex-1 overflow-y-auto px-4 py-5" aria-live="polite">
            {mensajes.length === 0 && (
              <p className="text-sm leading-relaxed text-muted">
                Preguntá sobre el avance, el cronograma o la constructora. Cada respuesta cita la foto
                de la que sale.
              </p>
            )}

            {mensajes.length > 0 && (
              <ol className="flex flex-col gap-4">
                {mensajes.map((mensaje, indice) => (
                  <li
                    key={`${mensaje.rol}-${indice}`}
                    className={mensaje.rol === "inversor" ? "flex justify-end" : ""}
                  >
                    {mensaje.rol === "inversor" ? (
                      <p className="max-w-[85%] rounded-2xl rounded-br-sm bg-fg px-3.5 py-2 text-sm text-bg">
                        {mensaje.texto}
                      </p>
                    ) : (
                      <div className="flex flex-col gap-3">
                        <p className="text-sm leading-relaxed">{mensaje.texto}</p>
                        <ul className="flex flex-wrap gap-2">
                          {fechasCitadas(mensaje.texto).map((cita) => {
                            const foto = fotos.find((item) => item.fecha === cita);
                            if (!foto) return null;
                            return (
                              <li key={cita} className="w-24">
                                <div className="aspect-[16/10] overflow-hidden rounded-md border border-line grayscale">
                                  <EscenaObra obs={foto} />
                                </div>
                                <p className="mt-1 text-xs text-muted tabular-nums">{fechaCorta(cita)}</p>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    )}
                  </li>
                ))}
              </ol>
            )}

            {pendientes.length > 0 && (
              <div className="mt-6">
                <p className="mb-2 text-xs font-medium text-muted">Sugeridas</p>
                <ul className="flex flex-col gap-1.5">
                  {pendientes.map((sugerida) => (
                    <li key={sugerida}>
                      <button
                        type="button"
                        onClick={() => enviar(sugerida)}
                        className="w-full rounded-lg border border-line px-3 py-2 text-left text-sm hover:bg-subtle"
                      >
                        {sugerida}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <form
            className="border-t border-line p-3"
            onSubmit={(event) => {
              event.preventDefault();
              enviar(pregunta);
            }}
          >
            <label htmlFor="pregunta" className="sr-only">
              Tu pregunta
            </label>
            <div className="flex items-center gap-2 rounded-lg border border-line bg-bg pl-3 pr-1.5 focus-within:border-fg">
              <input
                ref={campo}
                id="pregunta"
                value={pregunta}
                onChange={(event) => setPregunta(event.target.value)}
                placeholder="Escribí tu pregunta"
                autoComplete="off"
                className="h-10 min-w-0 flex-1 bg-transparent text-sm outline-none! placeholder:text-muted"
              />
              <button
                type="submit"
                disabled={!pregunta.trim()}
                className="flex size-7 shrink-0 items-center justify-center rounded-md bg-fg text-bg disabled:opacity-30"
              >
                <ArrowUp className="size-4" aria-hidden="true" />
                <span className="sr-only">Enviar</span>
              </button>
            </div>
            <p className="mt-2 text-[11px] text-muted">Respuestas de ejemplo. El agente en vivo entra después.</p>
          </form>
        </div>
      </aside>
    </>
  );
}
