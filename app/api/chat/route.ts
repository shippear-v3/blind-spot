import type Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import { client, MODEL } from "@/lib/claude";
import { ejecutarHerramienta, tools } from "@/lib/herramientas";
import { SYSTEM_PROMPT } from "@/lib/prompt";

export const maxDuration = 60;

export async function POST(req: Request) {
  const { messages } = (await req.json()) as { messages?: Anthropic.MessageParam[] };
  if (!Array.isArray(messages) || messages.length === 0) {
    return NextResponse.json({ error: "Falta la conversación." }, { status: 400 });
  }

  const conversation: Anthropic.MessageParam[] = [...messages];

  try {
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
          .filter((bloque): bloque is Anthropic.TextBlock => bloque.type === "text")
          .map((bloque) => bloque.text)
          .join("\n");
        return NextResponse.json({
          texto: texto || "No pude responder eso, probá de otra forma.",
          messages: conversation,
        });
      }

      const resultados: Anthropic.ToolResultBlockParam[] = [];
      for (const bloque of response.content) {
        if (bloque.type !== "tool_use") continue;
        resultados.push({
          type: "tool_result",
          tool_use_id: bloque.id,
          content: JSON.stringify(await ejecutarHerramienta(bloque.name, bloque.input)),
        });
      }
      conversation.push({ role: "user", content: resultados });
    }

    return NextResponse.json({ texto: "No llegué a terminar, probá reformular.", messages: conversation });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "No pude responder ahora." }, { status: 500 });
  }
}
