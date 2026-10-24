import type Anthropic from "@anthropic-ai/sdk";
import { constructora, proyecto } from "./datos";
import { cronograma } from "./reglas";
import { listarObservaciones } from "./store";
import type { ObservacionConFoto } from "./tipos";

const HOY = proyecto.fecha_demo;

export const tools: Anthropic.Tool[] = [
  {
    name: "ver_cronograma",
    description:
      "Hitos prometidos en el boleto con su fecha y el estado calculado contra la evidencia: cumplido, cumplido_con_atraso, pendiente o vencido_sin_evidencia.",
    input_schema: { type: "object", properties: {}, required: [] },
  },
  {
    name: "ver_observaciones",
    description:
      "Lo que el agente de visión registró en cada foto de la cámara de obra, ordenado por fecha. Filtrá con desde/hasta (AAAA-MM-DD) si hace falta.",
    input_schema: {
      type: "object",
      properties: { desde: { type: "string" }, hasta: { type: "string" } },
      required: [],
    },
  },
  {
    name: "ver_constructora",
    description: "Ficha de la constructora: indicadores con su origen (verificado, declarado o reportado).",
    input_schema: { type: "object", properties: {}, required: [] },
  },
];

export async function ejecutarHerramienta(
  nombre: string,
  input: unknown,
  lista?: ObservacionConFoto[],
) {
  const obs = lista ?? (await listarObservaciones());
  switch (nombre) {
    case "ver_cronograma":
      return {
        hoy: HOY,
        entrega_prometida: proyecto.entrega_prometida,
        hitos: cronograma(obs),
      };
    case "ver_observaciones": {
      const { desde, hasta } = (input ?? {}) as { desde?: string; hasta?: string };
      return obs.filter((item) => (!desde || item.fecha >= desde) && (!hasta || item.fecha <= hasta));
    }
    case "ver_constructora":
      return constructora;
    default:
      return { error: `herramienta desconocida: ${nombre}` };
  }
}
