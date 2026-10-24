import { NextResponse } from "next/server";
import { listarObservaciones, guardarObservacion } from "@/lib/store";
import { analizarFoto } from "@/lib/vision";

export const maxDuration = 60;

type Cuerpo = {
  base64?: string;
  mediaType?: "image/jpeg" | "image/png" | "image/webp";
  fecha?: string;
};

export async function POST(req: Request) {
  const { base64, mediaType, fecha } = (await req.json()) as Cuerpo;
  if (!base64 || !mediaType || !fecha || !/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
    return NextResponse.json({ error: "Falta la foto o la fecha." }, { status: 400 });
  }

  try {
    const existentes = await listarObservaciones();
    const anterior = [...existentes].reverse().find((item) => item.fecha < fecha) ?? null;
    const observacion = await analizarFoto({
      base64,
      mediaType,
      fecha,
      observacionAnterior: anterior,
    });
    const jpeg = Buffer.from(base64, "base64");
    const guardada = await guardarObservacion({ fecha, foto: "", ...observacion }, jpeg);
    return NextResponse.json({ observacion: guardada });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "No pude analizar la foto." }, { status: 500 });
  }
}
