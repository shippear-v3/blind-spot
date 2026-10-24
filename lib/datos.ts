import checklistJson from "@/data/checklist.json";
import constructoraJson from "@/data/constructora.json";
import cronogramaJson from "@/data/cronograma.json";
import hitosJson from "@/data/hitos.json";
import observacionesJson from "@/data/observaciones.json";
import proyectoJson from "@/data/proyecto.json";
import type {
  Constructora,
  GrupoChecklist,
  Hito,
  ObservacionConFoto,
  Proyecto,
  Tarea,
} from "./tipos";

export const proyecto = proyectoJson as Proyecto;
export const hitos = hitosJson as Hito[];
export const observaciones = observacionesJson as ObservacionConFoto[];
export const constructora = constructoraJson as Constructora;
export const checklist = checklistJson as GrupoChecklist[];
export const cronograma = cronogramaJson as Tarea[];
