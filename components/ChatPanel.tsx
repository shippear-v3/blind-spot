"use client";

import { useState } from "react";
import { fechasCitadas, PREGUNTAS } from "@/lib/preguntas";
import type { ObservacionConFoto } from "@/lib/tipos";
import { FotoObra } from "./FotoObra";

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

export function ChatPanel({ fotos }: { fotos: ObservacionConFoto[] }) {
  const [pregunta, setPregunta] = useState("");
  const [messages, setMessages] = useState<Mensaje[]>([]);
  const [pendiente, setPendiente] = useState(false);
  const [error, setError] = useState("");

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
      setError("No pude responder ahora.");
    } finally {
      setPendiente(false);
    }
  }

  const burbujas = burbujasDe(messages);

  return (
    <section id="preguntar" className="flex min-w-0 scroll-mt-6 flex-col gap-4">
      <div>
        <p className="font-mono text-xs tracking-[0.16em] text-pendiente">PREGUNTA</p>
        <h2 className="font-display text-4xl font-bold uppercase leading-none">Preguntale a tu obra</h2>
        <p className="mt-2 max-w-2xl text-sm text-pendiente">
          El agente lee el boleto y las fotos. Cada afirmación lleva fecha.
        </p>
      </div>
      <ul className="flex flex-wrap gap-2">
        {PREGUNTAS.map((sugerida) => (
          <li key={sugerida}>
            <button
              type="button"
              onClick={() => enviar(sugerida)}
              disabled={pendiente}
              className="min-h-11 border border-line bg-card px-3 text-left text-sm disabled:opacity-60"
            >
              {sugerida}
            </button>
          </li>
        ))}
      </ul>
      {burbujas.length > 0 && (
        <ol className="flex flex-col gap-3">
          {burbujas.map((mensaje, indice) => (
            <li key={`${mensaje.rol}-${indice}`} className={mensaje.rol === "inversor" ? "max-w-xl" : ""}>
              {mensaje.rol === "inversor" ? (
                <p className="bg-soil px-3 py-2 text-card">{mensaje.texto}</p>
              ) : (
                <div className="border-l-4 border-sodium bg-card px-3 py-3">
                  <p className="max-w-3xl leading-relaxed whitespace-pre-wrap">{mensaje.texto}</p>
                  <ul className="mt-3 flex flex-wrap gap-2">
                    {fechasCitadas(mensaje.texto).map((cita) => {
                      const foto = fotos.find((item) => item.fecha === cita);
                      if (!foto) return null;
                      return (
                        <li key={cita} className="w-28">
                          <div className="h-16 overflow-hidden bg-soil">
                            <FotoObra obs={foto} />
                          </div>
                          <p className="mt-1 font-mono text-xs">{cita}</p>
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
      {pendiente && <p className="font-mono text-xs text-pendiente">Mirando el cronograma…</p>}
      {error && <p className="text-sm text-vencido">{error}</p>}
      <form
        className="flex flex-col gap-2 sm:flex-row sm:items-end"
        onSubmit={(event) => {
          event.preventDefault();
          enviar(pregunta);
        }}
      >
        <div className="flex flex-1 flex-col gap-1">
          <label htmlFor="pregunta" className="font-mono text-xs tracking-[0.14em] text-pendiente">
            TU PREGUNTA
          </label>
          <input
            id="pregunta"
            value={pregunta}
            onChange={(event) => setPregunta(event.target.value)}
            placeholder="Escribí tu pregunta"
            autoComplete="off"
            disabled={pendiente}
            className="min-h-11 border border-line bg-card px-3"
          />
        </div>
        <button
          type="submit"
          disabled={pendiente}
          className="min-h-11 bg-soil px-4 text-sm font-semibold text-card disabled:opacity-60"
        >
          Preguntar
        </button>
      </form>
    </section>
  );
}
