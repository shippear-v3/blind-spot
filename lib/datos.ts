import constructoraJson from "@/data/constructora.json";
import hitosJson from "@/data/hitos.json";
import observacionesJson from "@/data/observaciones.json";
import proyectoJson from "@/data/proyecto.json";
import type {
  Constructora,
  Hito,
  ObservacionConFoto,
  Proyecto,
} from "./tipos";

export const proyecto = proyectoJson as Proyecto;
export const hitos = hitosJson as Hito[];
export const observaciones = observacionesJson as ObservacionConFoto[];
export const constructora = constructoraJson as Constructora;
