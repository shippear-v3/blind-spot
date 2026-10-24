import { observaciones as semilla } from "./datos";
import { fusionarObservaciones } from "./observaciones";
import type { ObservacionConFoto } from "./tipos";

function usaNeon() {
  return Boolean(process.env.DATABASE_URL);
}

function usaBlob() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

export async function listarObservaciones(): Promise<ObservacionConFoto[]> {
  const extras = usaNeon() ? await leerNeon() : await leerLocal();
  return fusionarObservaciones(semilla, extras);
}

export async function guardarObservacion(
  obs: ObservacionConFoto,
  jpeg: Buffer,
): Promise<ObservacionConFoto> {
  if (process.env.VERCEL && !usaNeon()) {
    throw new Error("Falta DATABASE_URL para guardar en Vercel.");
  }
  const foto = await guardarFoto(obs.fecha, jpeg);
  const guardada = { ...obs, foto };
  if (usaNeon()) await escribirNeon(guardada);
  else await escribirLocal(guardada);
  return guardada;
}

async function guardarFoto(fecha: string, jpeg: Buffer) {
  if (usaBlob()) {
    const { put } = await import("@vercel/blob");
    const blob = await put(`obra/${fecha}.jpg`, jpeg, {
      access: "public",
      contentType: "image/jpeg",
      allowOverwrite: true,
    });
    return blob.url;
  }
  if (process.env.VERCEL) {
    throw new Error("Falta BLOB_READ_WRITE_TOKEN para guardar la foto.");
  }
  const fs = await import("node:fs/promises");
  const path = await import("node:path");
  const dest = path.join(process.cwd(), "public", "obra", `${fecha}.jpg`);
  await fs.mkdir(path.dirname(dest), { recursive: true });
  await fs.writeFile(dest, jpeg);
  return `/obra/${fecha}.jpg`;
}

async function archivoLocal() {
  const path = await import("node:path");
  return path.join(process.cwd(), ".data", "observaciones.json");
}

async function leerLocal(): Promise<ObservacionConFoto[]> {
  const fs = await import("node:fs/promises");
  try {
    const raw = await fs.readFile(await archivoLocal(), "utf8");
    return JSON.parse(raw) as ObservacionConFoto[];
  } catch {
    return [];
  }
}

async function escribirLocal(obs: ObservacionConFoto) {
  const fs = await import("node:fs/promises");
  const path = await import("node:path");
  const archivo = await archivoLocal();
  const extras = fusionarObservaciones(await leerLocal(), [obs]);
  await fs.mkdir(path.dirname(archivo), { recursive: true });
  await fs.writeFile(archivo, JSON.stringify(extras, null, 2));
}

type Fila = {
  fecha: string;
  foto: string;
  etapa: string;
  pisos: number | null;
  elementos: string;
  actividad: boolean;
  cambios: string;
  descripcion: string;
  confianza: string;
  limitaciones: string;
};

function filaAObs(row: Fila): ObservacionConFoto {
  return {
    fecha: row.fecha,
    foto: row.foto,
    etapa: row.etapa as ObservacionConFoto["etapa"],
    pisos_con_estructura_visibles: row.pisos,
    elementos_visibles: JSON.parse(row.elementos) as string[],
    hay_actividad_visible: row.actividad,
    cambios_vs_foto_anterior: row.cambios,
    descripcion: row.descripcion,
    confianza: row.confianza as ObservacionConFoto["confianza"],
    limitaciones: row.limitaciones,
  };
}

async function sqlNeon() {
  const { neon } = await import("@neondatabase/serverless");
  return neon(process.env.DATABASE_URL!);
}

async function asegurarTabla() {
  const sql = await sqlNeon();
  await sql`
    CREATE TABLE IF NOT EXISTS observaciones (
      fecha TEXT PRIMARY KEY,
      foto TEXT NOT NULL,
      etapa TEXT NOT NULL,
      pisos INTEGER,
      elementos TEXT NOT NULL,
      actividad BOOLEAN NOT NULL,
      cambios TEXT NOT NULL,
      descripcion TEXT NOT NULL,
      confianza TEXT NOT NULL,
      limitaciones TEXT NOT NULL
    )
  `;
  return sql;
}

async function leerNeon(): Promise<ObservacionConFoto[]> {
  const sql = await asegurarTabla();
  const rows = (await sql`SELECT * FROM observaciones ORDER BY fecha`) as Fila[];
  return rows.map(filaAObs);
}

async function escribirNeon(obs: ObservacionConFoto) {
  const sql = await asegurarTabla();
  await sql`
    INSERT INTO observaciones (
      fecha, foto, etapa, pisos, elementos, actividad, cambios, descripcion, confianza, limitaciones
    ) VALUES (
      ${obs.fecha},
      ${obs.foto},
      ${obs.etapa},
      ${obs.pisos_con_estructura_visibles},
      ${JSON.stringify(obs.elementos_visibles)},
      ${obs.hay_actividad_visible},
      ${obs.cambios_vs_foto_anterior},
      ${obs.descripcion},
      ${obs.confianza},
      ${obs.limitaciones}
    )
    ON CONFLICT (fecha) DO UPDATE SET
      foto = EXCLUDED.foto,
      etapa = EXCLUDED.etapa,
      pisos = EXCLUDED.pisos,
      elementos = EXCLUDED.elementos,
      actividad = EXCLUDED.actividad,
      cambios = EXCLUDED.cambios,
      descripcion = EXCLUDED.descripcion,
      confianza = EXCLUDED.confianza,
      limitaciones = EXCLUDED.limitaciones
  `;
}
