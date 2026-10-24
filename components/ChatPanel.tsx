"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUp, MessageSquare, X } from "lucide-react";
import { fechaCorta } from "@/lib/fechas";
import { fechasCitadas, PREGUNTAS } from "@/lib/preguntas";
import { FotoObra } from "./FotoObra";
import { MensajeMarkdown } from "./MensajeMarkdown";
import { useChat, useFotos } from "./Shell";

type Mensaje = {
  role: "user" | "assistant";
  content: string | { type: string; text?: string }[];
};

type Burbuja = { rol: "inversor" | "agente"; texto: string };

function burbujasDe(messages: Mensaje[]): Burbuja[] {
  const salida: Burbuja[] = [];
  for (const mensaje of messages) {
    if (mensaje.role === "user") {
      if (typeof mensaje.content === "string") {
        salida.push({ rol: "inversor", texto: mensaje.content });
      }
      continue;
    }
    if (!Array.isArray(mensaje.content)) continue;
    const texto = mensaje.content
      .filter((bloque) => bloque.type === "text" && bloque.text)
      .map((bloque) => bloque.text)
      .join("\n")
      .trim();
    if (texto) salida.push({ rol: "agente", texto });
  }
  return salida;
}

export function ChatPanel() {
  const chat = useChat();
  const fotos = useFotos();
  const [pregunta, setPregunta] = useState("");
  const [messages, setMessages] = useState<Mensaje[]>([]);
  const [pendiente, setPendiente] = useState(false);
  const [error, setError] = useState("");
  const lista = useRef<HTMLDivElement>(null);
  const campo = useRef<HTMLInputElement>(null);
  const burbujas = burbujasDe(messages);
  const pendientes = PREGUNTAS.filter((p) => !burbujas.some((m) => m.texto === p));

  useEffect(() => {
    lista.current?.scrollTo({ top: lista.current.scrollHeight, behavior: "smooth" });
  }, [burbujas.length, pendiente]);

  useEffect(() => {
    if (chat.abierto) campo.current?.focus();
  }, [chat.abierto]);

  async function enviar(texto: string) {
    const limpio = texto.trim();
    if (!limpio || pendiente) return;
    const siguiente: Mensaje[] = [...messages, { role: "user", content: limpio }];
    setMessages(siguiente);
    setPregunta("");
    setPendiente(true);
    setError("");
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: siguiente }),
      });
      const data = (await res.json()) as { messages?: Mensaje[]; error?: string };
      if (!res.ok || !data.messages) {
        setMessages(messages);
        setError(data.error || "No pude responder ahora.");
        return;
      }
      setMessages(data.messages);
    } catch (causa) {
      console.error(causa);
      setMessages(messages);
      setError("No pude responder ahora.");
    } finally {
      setPendiente(false);
    }
  }

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
            {burbujas.length === 0 && (
              <p className="text-sm leading-relaxed text-muted">
                Preguntá sobre el avance, el cronograma o la constructora. Cada respuesta cita la foto de la que
                sale.
              </p>
            )}

            {burbujas.length > 0 && (
              <ol className="flex flex-col gap-4">
                {burbujas.map((mensaje, indice) => (
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
                        <MensajeMarkdown texto={mensaje.texto} />
                        <ul className="flex flex-wrap gap-2">
                          {fechasCitadas(mensaje.texto).map((cita) => {
                            const foto = fotos.find((item) => item.fecha === cita);
                            if (!foto) return null;
                            return (
                              <li key={cita} className="w-24">
                                <div className="aspect-[16/10] overflow-hidden rounded-md border border-line grayscale">
                                  <FotoObra obs={foto} />
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

            {pendiente && <p className="mt-4 text-sm text-muted">Mirando el cronograma…</p>}
            {error && <p className="mt-4 text-sm text-vencido">{error}</p>}

            {pendientes.length > 0 && (
              <div className="mt-6">
                <p className="mb-2 text-xs font-medium text-muted">Sugeridas</p>
                <ul className="flex flex-col gap-1.5">
                  {pendientes.map((sugerida) => (
                    <li key={sugerida}>
                      <button
                        type="button"
                        onClick={() => enviar(sugerida)}
                        disabled={pendiente}
                        className="w-full rounded-lg border border-line px-3 py-2 text-left text-sm hover:bg-subtle disabled:opacity-60"
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
                disabled={pendiente}
                className="h-10 min-w-0 flex-1 bg-transparent text-sm outline-none! placeholder:text-muted"
              />
              <button
                type="submit"
                disabled={pendiente || !pregunta.trim()}
                className="flex size-7 shrink-0 items-center justify-center rounded-md bg-fg text-bg disabled:opacity-30"
              >
                <ArrowUp className="size-4" aria-hidden="true" />
                <span className="sr-only">Enviar</span>
              </button>
            </div>
          </form>
        </div>
      </aside>
    </>
  );
}
