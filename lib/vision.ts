import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { z } from "zod";
import { client, MODEL } from "./claude";
import { ETAPAS, type Observacion } from "./tipos";

export const ObservacionSchema = z.object({
  etapa: z.enum([...ETAPAS, "no_determinable"]),
  pisos_con_estructura_visibles: z.number().int().nullable(),
  elementos_visibles: z.array(z.string()),
  hay_actividad_visible: z.boolean(),
  cambios_vs_foto_anterior: z.string(),
  descripcion: z.string(),
  confianza: z.enum(["alta", "media", "baja"]),
  limitaciones: z.string(),
});

const PROMPT_VISION = `Sos un inspector de obra. Tu salida compara el avance con el cronograma del boleto.
Hablá solo del avance: etapa, losas completas, qué avanzó y qué no respecto de la foto anterior.
No describas la imagen. No enumeres vehículos, cerco, carteles, vegetación ni el entorno.
No estimes porcentajes.
Contá los pisos de estructura (losas) que se ven completos; si no se puede contar, null.
Si la foto no permite determinar la etapa, usá "no_determinable" y explicá por qué en "limitaciones".
"descripcion": una o dos frases sobre el avance.
"elementos_visibles": como máximo 4 elementos que cambian el avance (losa, encofrado, fundación, mampostería, fachada).
"cambios_vs_foto_anterior": qué avanzó o qué quedó igual; si no hay anterior, "primera foto".
"limitaciones": vacía, salvo que impidan leer el avance o la fecha.
Español rioplatense, frases cortas.`;

export async function analizarFoto(params: {
  base64: string;
  mediaType: "image/jpeg" | "image/png" | "image/webp";
  fecha: string;
  observacionAnterior?: Observacion | null;
}): Promise<Observacion> {
  const response = await client.messages.parse({
    model: MODEL,
    max_tokens: 16000,
    output_config: { effort: "low", format: zodOutputFormat(ObservacionSchema) },
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image",
            source: { type: "base64", media_type: params.mediaType, data: params.base64 },
          },
          {
            type: "text",
            text: `${PROMPT_VISION}\n\nFecha de la foto: ${params.fecha}\nObservación anterior: ${
              params.observacionAnterior ? JSON.stringify(params.observacionAnterior) : "ninguna"
            }`,
          },
        ],
      },
    ],
  });
  if (!response.parsed_output) {
    throw new Error(`Sin salida estructurada (stop_reason: ${response.stop_reason})`);
  }
  return response.parsed_output;
}
