# Brief para el repo · Shippear #3 (2026-10-24)

**Equipo**: Facundo Perez Castelli (agente + producto) · Andrés Bonet (datos de demo + pitch) · Santiago Bruera (repo + UX/UI + deploy)
**Nombre provisorio**: "Inversiones en Pozo — Agentes de Seguimiento" (cambiar cuando esté el nombre)
**Entregables de hoy**: repo en GitHub · URL pública que funcione · un agente que se pueda probar · pitch de 2 minutos
**Corte**: 14:30 arranca el pitch. A las 14:00 se congela el código.

---

## 1. La idea en una frase
Un agente que acompaña al **inversor en pozo** desde que pone la plata hasta que recibe la llave. Mira la obra todos los días (cámara), compara contra lo que le prometieron en el boleto y le contesta en lenguaje simple: **"¿cómo viene mi obra?"**.

Caso de uso para la demo (recomendado por Esteban Suárez): **cámara en obra + reconocimiento de imágenes con un agente que valida avances + chat donde el inversor pregunta cómo avanza**.

## 2. Alcance de HOY
**Entra (funciona de verdad):**
1. **Agente de visión.** Recibe una foto de obra con fecha y devuelve una observación estructurada: etapa, pisos de estructura visibles, elementos, cambios respecto de la foto anterior y confianza.
2. **Chat del inversor.** Un agente con herramientas lee el cronograma prometido, las observaciones y la ficha de la constructora, y responde **citando foto y fecha**.
3. **"Cámara de hoy".** Se sube una foto nueva desde la web, el agente la analiza en vivo y aparece en la línea de tiempo.

**Entra como pantalla, con datos de ejemplo marcados como "próximamente":**
4. **"Antes de invertir"**: los agentes del deck de Andy (historial de la constructora, cantidad de obras, conflictos con normativa, unidades en venta con la misma dirección, seguimiento en redes y registros, zonas de construcción, situación crediticia) como fichas con semáforo.

**No entra hoy:** login, base de datos, integración con una cámara real, scraping de portales, pagos, app móvil.

## 3. Reglas del producto (importan para el jurado)
- **Prometido vs. observado**: el cronograma sale del boleto (ficticio); lo observado sale de las fotos. Nunca se mezclan.
- **Hitos, no porcentajes inventados**: "estructura hasta piso 3 visible", no "avance 43%".
- **Siempre con evidencia**: cada afirmación lleva foto y fecha. Si no hay foto reciente, se dice.
- **Sin verde de "inversión segura"**: los estados posibles son *cumplido*, *pendiente*, *vencido sin evidencia* y *no determinable*.
- **El agente lee y describe; el estado del hito lo calcula una regla fija en código**, no el modelo.
- **Datos ficticios**: constructora, obra y dirección inventadas. Fotos sin logos, carteles ni caras.

## 4. Stack
- **Next.js (App Router) + TypeScript + Tailwind**, con shadcn/ui opcional. Deploy en **Vercel**.
- **Claude API** con el SDK oficial `@anthropic-ai/sdk` y `zod`. Modelo: `claude-opus-5-5` con `effort: "low"` para que responda rápido.
- **Sin base de datos**: JSON en `/data` + estado en el cliente para las fotos que se suben en vivo.
- Variable de entorno: `ANTHROPIC_API_KEY`, en `.env.local` y en Vercel → Settings → Environment Variables.

```bash
npx create-next-app@latest pozo --ts --tailwind --app --eslint
cd pozo && npm install @anthropic-ai/sdk zod
```

## 5. Estructura del repo
```
/app
  page.tsx                  # Mi inversión: línea de tiempo + última foto + alertas
  chat/page.tsx             # Chat "Preguntale a tu obra" (o como panel en page.tsx)
  antes-de-invertir/page.tsx# Semáforos (mock)
  api/analizar/route.ts     # POST foto → observación (visión)
  api/chat/route.ts         # POST conversación → respuesta del agente (tools)
/lib
  claude.ts                 # cliente + modelo
  vision.ts                 # analizarFoto() con salida estructurada
  herramientas.ts           # tools del chat + reglas de estado de hitos
  prompt.ts                 # system prompt del chat
/data
  proyecto.json             # obra, constructora, entrega prometida
  hitos.json                # cronograma del boleto (ficticio)
  observaciones.json        # generado por el script a partir de las fotos
  constructora.json         # indicadores con fuente (mock)
/public/obra
  2026-03-10.jpg ...        # 8-12 fotos con fecha en el nombre
/scripts
  analizar-fotos.ts         # corre local una vez y genera data/observaciones.json
```

**Fotos**: 8 a 12 de la misma obra, en distintas etapas, nombradas `AAAA-MM-DD.jpg`. **Achicarlas a ~1280 px de ancho** (mandarlas por WhatsApp alcanza): el límite de body de Vercel es 4,5 MB.

## 6. Datos de ejemplo (formato)
`data/proyecto.json`
```json
{
  "obra": "Torre Ejemplo",
  "direccion": "Calle Ficticia 1234, Rosario",
  "constructora": "Constructora Demo S.A. (ficticia)",
  "unidad": "Depto 4B, 2 ambientes",
  "entrega_prometida": "2027-12-15",
  "fecha_demo": "2026-10-24"
}
```
`data/hitos.json` (el cronograma que "promete el boleto")
```json
[
  { "id": "permiso", "nombre": "Permiso de edificación aprobado", "fecha_prometida": "2026-02-28",
    "tipo": "documento", "evidencia_documental": { "fecha": "2026-02-20", "fuente": "Permiso N° 0000 (ficticio)" } },
  { "id": "fundaciones", "nombre": "Excavación y fundaciones", "fecha_prometida": "2026-04-30",
    "tipo": "foto", "etapa_minima": "excavacion_y_fundaciones", "pisos_minimos": null },
  { "id": "estructura_p3", "nombre": "Estructura hasta piso 3", "fecha_prometida": "2026-07-31",
    "tipo": "foto", "etapa_minima": "estructura", "pisos_minimos": 3 },
  { "id": "estructura_p6", "nombre": "Estructura hasta piso 6", "fecha_prometida": "2026-10-15",
    "tipo": "foto", "etapa_minima": "estructura", "pisos_minimos": 6 },
  { "id": "mamposteria", "nombre": "Mampostería", "fecha_prometida": "2027-03-31",
    "tipo": "foto", "etapa_minima": "mamposteria", "pisos_minimos": null }
]
```
> Andy: ajustar las fechas para que con las fotos reales quede **un hito vencido sin evidencia**. Es el momento fuerte de la demo.

`data/constructora.json` (mock, cada dato con su origen)
```json
{
  "nombre": "Constructora Demo S.A. (ficticia)",
  "indicadores": [
    { "dato": "Obras entregadas: 8 de 10", "origen": "declarado por la empresa", "estado": "sin_alertas" },
    { "dato": "Demora promedio: 5 meses sobre lo prometido", "origen": "reportado por compradores", "estado": "alerta" },
    { "dato": "Situación crediticia BCRA: 1 (normal)", "origen": "fuente pública (BCRA)", "estado": "sin_alertas" },
    { "dato": "Otra unidad en venta con la misma dirección en un portal", "origen": "próximamente", "estado": "no_determinable" }
  ]
}
```

## 7. Código base

### `lib/claude.ts`
```ts
import Anthropic from "@anthropic-ai/sdk";

export const client = new Anthropic(); // lee ANTHROPIC_API_KEY del entorno
export const MODEL = "claude-opus-5-5";
```

### `lib/vision.ts`: agente de visión con salida estructurada
```ts
import { z } from "zod";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { client, MODEL } from "./claude";

export const ETAPAS = [
  "terreno",
  "excavacion_y_fundaciones",
  "estructura",
  "mamposteria",
  "instalaciones",
  "terminaciones",
] as const;

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
export type Observacion = z.infer<typeof ObservacionSchema>;

const PROMPT_VISION = `Sos un inspector de obra que describe fotos para un inversor que no sabe de construcción.
Describí solo lo que se ve. No estimes porcentajes de avance.
Contá los pisos de estructura (losas) que se ven completos; si no se puede contar, null.
Si la foto no permite determinar la etapa, usá "no_determinable" y explicá por qué en "limitaciones".
"cambios_vs_foto_anterior": compará con la observación anterior que te paso; si no hay, escribí "primera foto".
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
          { type: "image", source: { type: "base64", media_type: params.mediaType, data: params.base64 } },
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
```

### `scripts/analizar-fotos.ts`: corre una vez en local
```ts
import fs from "fs";
import path from "path";
import { analizarFoto, type Observacion } from "../lib/vision";

const dir = path.join(process.cwd(), "public", "obra");
const archivos = fs.readdirSync(dir).filter((f) => /^\d{4}-\d{2}-\d{2}\.(jpe?g|png)$/i.test(f)).sort();

const salida: (Observacion & { fecha: string; foto: string })[] = [];
let anterior: Observacion | null = null;

for (const archivo of archivos) {
  const fecha = archivo.slice(0, 10);
  const base64 = fs.readFileSync(path.join(dir, archivo)).toString("base64");
  const mediaType = archivo.toLowerCase().endsWith(".png") ? "image/png" : "image/jpeg";
  const obs = await analizarFoto({ base64, mediaType, fecha, observacionAnterior: anterior });
  salida.push({ fecha, foto: `/obra/${archivo}`, ...obs });
  anterior = obs;
  console.log(fecha, obs.etapa, obs.pisos_con_estructura_visibles);
}

fs.writeFileSync(path.join(process.cwd(), "data", "observaciones.json"), JSON.stringify(salida, null, 2));
```
```bash
npx tsx --env-file=.env.local scripts/analizar-fotos.ts
```
Revisar el JSON a mano: si el modelo contó mal un piso, se corrige ahí. Es la base de la demo.

### `app/api/analizar/route.ts`: foto en vivo
```ts
import { NextResponse } from "next/server";
import { analizarFoto } from "@/lib/vision";

export const maxDuration = 60;

export async function POST(req: Request) {
  const { base64, mediaType, fecha, observacionAnterior } = await req.json();
  try {
    const observacion = await analizarFoto({ base64, mediaType, fecha, observacionAnterior });
    return NextResponse.json({ fecha, observacion });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
```
En el cliente: leer el archivo, **achicarlo con un canvas a ~1280 px en JPEG** y mandar el base64 sin el prefijo `data:image/jpeg;base64,`.

### `lib/herramientas.ts`: tools del chat + regla de estado
```ts
import Anthropic from "@anthropic-ai/sdk";
import proyecto from "@/data/proyecto.json";
import hitos from "@/data/hitos.json";
import observacionesBase from "@/data/observaciones.json";
import constructora from "@/data/constructora.json";
import { ETAPAS } from "./vision";

type Obs = (typeof observacionesBase)[number];
const HOY = proyecto.fecha_demo;
const nivel = (etapa: string) => ETAPAS.indexOf(etapa as (typeof ETAPAS)[number]);

function estadoHito(h: (typeof hitos)[number], obs: Obs[]) {
  if (h.tipo === "documento") {
    const ev = h.evidencia_documental;
    return ev ? { estado: "cumplido", fecha: ev.fecha, evidencia: ev.fuente } : venceOPendiente(h);
  }
  const prueba = obs.find(
    (o) =>
      o.confianza !== "baja" &&
      nivel(o.etapa) >= nivel(h.etapa_minima!) &&
      (h.pisos_minimos == null || (o.pisos_con_estructura_visibles ?? 0) >= h.pisos_minimos),
  );
  if (prueba) {
    const tarde = prueba.fecha > h.fecha_prometida;
    return { estado: tarde ? "cumplido_con_atraso" : "cumplido", fecha: prueba.fecha, evidencia: prueba.foto };
  }
  return venceOPendiente(h);
}
function venceOPendiente(h: { fecha_prometida: string }) {
  return HOY > h.fecha_prometida ? { estado: "vencido_sin_evidencia" } : { estado: "pendiente" };
}

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

export function ejecutarHerramienta(nombre: string, input: unknown, extra: Obs[] = []) {
  const obs = [...observacionesBase, ...extra].sort((a, b) => a.fecha.localeCompare(b.fecha));
  switch (nombre) {
    case "ver_cronograma":
      return { hoy: HOY, entrega_prometida: proyecto.entrega_prometida, hitos: hitos.map((h) => ({ ...h, ...estadoHito(h, obs) })) };
    case "ver_observaciones": {
      const { desde, hasta } = (input ?? {}) as { desde?: string; hasta?: string };
      return obs.filter((o) => (!desde || o.fecha >= desde) && (!hasta || o.fecha <= hasta));
    }
    case "ver_constructora":
      return constructora;
    default:
      return { error: `herramienta desconocida: ${nombre}` };
  }
}
```

### `lib/prompt.ts`
```ts
export const SYSTEM_PROMPT = `Sos el agente de seguimiento de una inversión en pozo. Hablás con el inversor, que no sabe de construcción.
Tu trabajo: contarle cómo avanza su obra comparando lo PROMETIDO (cronograma del boleto) con lo OBSERVADO (fotos diarias de la cámara de obra).
Reglas:
- Usá las herramientas antes de responder. No inventes datos.
- Cada afirmación sobre la obra lleva su evidencia: "(foto del AAAA-MM-DD)".
- Hablá en hitos ("estructura hasta piso 3"), nunca en porcentajes de avance.
- Si un hito está vencido sin evidencia, decilo claro y sugerí qué pedirle a la constructora.
- Si no hay fotos recientes o la confianza es baja, decilo.
- Nunca digas que la inversión es segura ni des asesoramiento legal o financiero.
- Español rioplatense, respuestas cortas: 3 a 6 líneas.`;
```

### `app/api/chat/route.ts`: agente con loop de herramientas
```ts
import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import { client, MODEL } from "@/lib/claude";
import { tools, ejecutarHerramienta } from "@/lib/herramientas";
import { SYSTEM_PROMPT } from "@/lib/prompt";

export const maxDuration = 60;

export async function POST(req: Request) {
  const { messages, observacionesExtra = [] } = (await req.json()) as {
    messages: Anthropic.MessageParam[];
    observacionesExtra?: any[];
  };
  const conversation: Anthropic.MessageParam[] = [...messages];

  for (let vuelta = 0; vuelta < 6; vuelta++) {
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 16000,
      system: SYSTEM_PROMPT,
      output_config: { effort: "low" },
      tools,
      messages: conversation,
    });
    conversation.push({ role: "assistant", content: response.content });

    if (response.stop_reason !== "tool_use") {
      const texto = response.content
        .filter((b): b is Anthropic.TextBlock => b.type === "text")
        .map((b) => b.text)
        .join("\n");
      return NextResponse.json({ texto: texto || "No pude responder eso, probá de otra forma.", messages: conversation });
    }

    const resultados: Anthropic.ToolResultBlockParam[] = response.content
      .filter((b): b is Anthropic.ToolUseBlock => b.type === "tool_use")
      .map((b) => ({
        type: "tool_result",
        tool_use_id: b.id,
        content: JSON.stringify(ejecutarHerramienta(b.name, b.input, observacionesExtra)),
      }));
    conversation.push({ role: "user", content: resultados });
  }
  return NextResponse.json({ texto: "No llegué a terminar, probá reformular.", messages: conversation });
}
```
**Importante en el cliente**: guardar el `messages` que devuelve el servidor **tal cual**, sin editarlo, y agregarle la próxima pregunta al final. La historia tiene que ser solo de agregado: no se borra ni se reescribe nada.

## 8. Pantallas (Santi)
1. **Mi inversión** (home)
   - Encabezado: obra, unidad, constructora, entrega prometida.
   - **Línea de tiempo**: cada hito con fecha prometida contra fecha observada. Estados con color: cumplido, cumplido con atraso, pendiente, vencido sin evidencia (rojo).
   - **Última foto** con la descripción del agente y la fecha.
   - **Alertas**: hito vencido sin evidencia; "sin fotos hace X días".
2. **Preguntale a tu obra** (chat, puede ser un panel lateral). Preguntas sugeridas:
   - "¿Cómo viene la obra?"
   - "¿Estamos atrasados respecto del boleto?"
   - "¿Qué cambió desde julio?"
   - "¿Quién es la constructora?"

   Las respuestas muestran miniaturas de las fotos citadas.
3. **Cámara de hoy**: botón "subir foto". Llama a `/api/analizar`, muestra la observación y la suma a la línea de tiempo (estado en el cliente) y a `observacionesExtra` del chat.
4. **Antes de invertir**: fichas de los agentes del deck con semáforo y etiqueta de origen. Las que no están hechas, marcadas "próximamente".

## 9. Plan del día
| Hora | Facundo | Santi | Andy |
|---|---|---|---|
| 10:50-11:15 | Elegir y achicar fotos, armar `hitos.json` | Repo + Next.js + **primer deploy en Vercel** (URL viva temprano) | `proyecto.json`, `constructora.json`, esqueleto del pitch |
| 11:15-12:30 | `lib/vision.ts` + script → `observaciones.json`; `/api/chat` | Pantallas 1 y 2 con datos de ejemplo | Deck y guion; ajustar fechas de hitos |
| 12:30-13:15 | Probar 10 preguntas, afinar el prompt | Conectar UI con las APIs; pantalla 3 | Pantalla 4 (contenido) |
| 13:15-14:00 | Deploy final, probar en la URL pública | Pulido visual, mobile | Grabar video de respaldo de la demo |
| 14:00-14:30 | **Código congelado.** Ensayo del pitch ×2 | Ensayo | Ensayo |

## 10. Checklist antes de las 14:00
- [ ] URL pública abre en el celular.
- [ ] `ANTHROPIC_API_KEY` cargada en Vercel (no en el repo).
- [ ] Las 4 preguntas sugeridas responden bien y citan fotos.
- [ ] Subir una foto nueva funciona (menos de 4,5 MB).
- [ ] Hay un hito "vencido sin evidencia" visible.
- [ ] README con: qué es, cómo correrlo, stack, y que los datos son ficticios.
- [ ] Video de respaldo grabado por si falla internet.

## 11. Pitch de 2 minutos (estructura)
| Tiempo | Qué |
|---|---|
| 0:00-0:20 | **Problema**: en pozo se vende entre el 30% y el 50% antes de que exista la obra. El inversor paga y no ve nada. Desde noviembre de 2024 el seguro que lo protegía es optativo (DNU 1017/2024). |
| 0:20-0:35 | **Qué es**: un agente del lado del inversor, del pago a la llave. |
| 0:35-1:20 | **Demo**: "¿cómo viene la obra?" → respuesta con fotos. "¿Estamos atrasados?" → hito vencido sin evidencia. Subo la foto de hoy → el agente la analiza en vivo. |
| 1:20-1:40 | **Antes de invertir**: agentes de historial, normativa, unidades duplicadas en portales, BCRA (próximos). |
| 1:40-2:00 | **Por qué nosotros + cierre**: arquitectos con obra real. Paga el inversor, así la información es independiente. |

**Preguntas probables del jurado:**
- *"¿Y LISUAL?"*: LISUAL vende cámaras a la constructora. Nosotros estamos del lado del inversor, comparamos contra lo prometido en el boleto y respondemos preguntas.
- *"¿Y si la IA se equivoca?"*: no estimamos porcentajes. Cada dato lleva foto y fecha, y el estado del hito lo calcula una regla, no el modelo.
- *"¿Quién paga?"*: el inversor. Si pagara la constructora, el inversor no podría confiar.
