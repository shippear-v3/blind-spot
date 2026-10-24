import { diasEntre } from "./fechas";
import type { EstadoTarea, Tarea } from "./tipos";

const TOLERANCIA = 10;

export function duracion(tarea: Tarea) {
  return diasEntre(tarea.inicio, tarea.fin) + 1;
}

export function avanceEsperado(tarea: Tarea, hoy: string) {
  if (hoy < tarea.inicio) return 0;
  if (hoy >= tarea.fin) return 100;
  return Math.round(((diasEntre(tarea.inicio, hoy) + 1) / duracion(tarea)) * 100);
}

export function estadoTarea(tarea: Tarea, hoy: string): EstadoTarea {
  if (tarea.avance >= 100) return "terminada";
  if (hoy < tarea.inicio) return "pendiente";
  if (hoy > tarea.fin) return "vencida";
  if (avanceEsperado(tarea, hoy) - tarea.avance > TOLERANCIA) return "demorada";
  return "en_curso";
}

export const ESTADO_TAREA: Record<EstadoTarea, { etiqueta: string; texto: string; punto: string; anillo: string }> = {
  terminada: { etiqueta: "Lista", texto: "text-ok", punto: "bg-ok", anillo: "" },
  en_curso: { etiqueta: "En marcha", texto: "text-marron", punto: "bg-marron", anillo: "" },
  demorada: { etiqueta: "Atrasada", texto: "text-atraso", punto: "bg-atraso", anillo: "ring-2 ring-atraso" },
  vencida: { etiqueta: "Fuera de plazo", texto: "text-vencido", punto: "bg-vencido", anillo: "ring-2 ring-vencido" },
  pendiente: { etiqueta: "Por empezar", texto: "text-muted", punto: "bg-line", anillo: "" },
};

export function sumarDias(iso: string, dias: number) {
  const fecha = new Date(`${iso}T00:00:00Z`);
  fecha.setUTCDate(fecha.getUTCDate() + dias);
  return fecha.toISOString().slice(0, 10);
}

export function diaDeSemana(iso: string) {
  return new Date(`${iso}T00:00:00Z`).getUTCDay();
}
