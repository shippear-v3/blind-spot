"use client";

import { useMemo, useState } from "react";
import { fotosOrdenadas } from "@/lib/reglas";
import { PREGUNTAS, respuestaMock } from "@/lib/respuestas-mock";
import { EscenaObra } from "./EscenaObra";

type Burbuja = { rol: "inversor" | "agente"; texto: string };

const AVISO =
  "Esa pregunta la va a contestar el agente cuando lo conectemos. Mientras, probá una de las cuatro de arriba.";

function fechasCitadas(texto: string) {
  return [...new Set(texto.match(/\d{4}-\d{2}-\d{2}/g) ?? [])];
}

export function ChatPanel() {
  const fotos = useMemo(() => fotosOrdenadas(), []);
  const [pregunta, setPregunta] = useState("");
  const [mensajes, setMensajes] = useState<Burbuja[]>([]);

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

  return (
    <section id="preguntar" className="flex min-w-0 scroll-mt-6 flex-col gap-4">
      <div>
        <p className="font-mono text-xs tracking-[0.16em] text-pendiente">PREGUNTA</p>
        <h2 className="font-display text-4xl font-bold uppercase leading-none">Preguntale a tu obra</h2>
        <p className="mt-2 max-w-2xl text-sm text-pendiente">
          En esta maqueta las cuatro preguntas responden con los datos de la obra. El agente en vivo entra después.
        </p>
      </div>
      <ul className="flex flex-wrap gap-2">
        {PREGUNTAS.map((sugerida) => (
          <li key={sugerida}>
            <button
              type="button"
              onClick={() => enviar(sugerida)}
              className="min-h-11 border border-line bg-card px-3 text-left text-sm"
            >
              {sugerida}
            </button>
          </li>
        ))}
      </ul>
      {mensajes.length > 0 && (
        <ol className="flex flex-col gap-3">
          {mensajes.map((mensaje, indice) => (
            <li key={`${mensaje.rol}-${indice}`} className={mensaje.rol === "inversor" ? "max-w-xl" : ""}>
              {mensaje.rol === "inversor" ? (
                <p className="bg-soil px-3 py-2 text-card">{mensaje.texto}</p>
              ) : (
                <div className="border-l-4 border-sodium bg-card px-3 py-3">
                  <p className="max-w-3xl leading-relaxed">{mensaje.texto}</p>
                  <ul className="mt-3 flex flex-wrap gap-2">
                    {fechasCitadas(mensaje.texto).map((cita) => {
                      const foto = fotos.find((item) => item.fecha === cita);
                      if (!foto) return null;
                      return (
                        <li key={cita} className="w-28">
                          <div className="h-16 overflow-hidden bg-soil">
                            <EscenaObra obs={foto} />
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
            className="min-h-11 border border-line bg-card px-3"
          />
        </div>
        <button type="submit" className="min-h-11 bg-soil px-4 text-sm font-semibold text-card">
          Preguntar
        </button>
      </form>
    </section>
  );
}
