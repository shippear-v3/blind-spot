import fs from "node:fs";
import path from "node:path";
import type { Observacion } from "../lib/tipos";
import { analizarFoto } from "../lib/vision";

const dir = path.join(process.cwd(), "public", "obra");
const archivos = fs
  .readdirSync(dir)
  .filter((archivo) => /^\d{4}-\d{2}-\d{2}\.(jpe?g|png)$/i.test(archivo))
  .sort();

if (archivos.length === 0) {
  console.error("No hay fotos AAAA-MM-DD.jpg en public/obra. Se deja data/observaciones.json.");
  process.exit(0);
}

async function main() {
  const salida: (Observacion & { fecha: string; foto: string })[] = [];
  let anterior: Observacion | null = null;

  for (const archivo of archivos) {
    const fecha = archivo.slice(0, 10);
    const base64 = fs.readFileSync(path.join(dir, archivo)).toString("base64");
    const mediaType = archivo.toLowerCase().endsWith(".png") ? "image/png" : "image/jpeg";
    const obs = await analizarFoto({ base64, mediaType, fecha, observacionAnterior: anterior });
    salida.push({ fecha, foto: `/obra/${archivo}`, ...obs });
    anterior = obs;
    console.error(fecha, obs.etapa, obs.pisos_con_estructura_visibles);
  }

  fs.writeFileSync(path.join(process.cwd(), "data", "observaciones.json"), JSON.stringify(salida, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
