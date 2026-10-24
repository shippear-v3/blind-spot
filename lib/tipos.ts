export const ETAPAS = [
  "terreno",
  "excavacion_y_fundaciones",
  "estructura",
  "mamposteria",
  "instalaciones",
  "terminaciones",
] as const;

export type Etapa = (typeof ETAPAS)[number];

export type Confianza = "alta" | "media" | "baja";

export type Observacion = {
  etapa: Etapa | "no_determinable";
  pisos_con_estructura_visibles: number | null;
  elementos_visibles: string[];
  hay_actividad_visible: boolean;
  cambios_vs_foto_anterior: string;
  descripcion: string;
  confianza: Confianza;
  limitaciones: string;
};

export type ObservacionConFoto = Observacion & {
  fecha: string;
  foto: string;
};

export type EstadoHito =
  | "cumplido"
  | "cumplido_con_atraso"
  | "pendiente"
  | "vencido_sin_evidencia";

export type Hito = {
  id: string;
  nombre: string;
  fecha_prometida: string;
  tipo: "documento" | "foto";
  evidencia_documental?: { fecha: string; fuente: string };
  etapa_minima?: Etapa;
  pisos_minimos?: number | null;
};

export type HitoConEstado = Hito & {
  estado: EstadoHito;
  fecha?: string;
  evidencia?: string;
};

export type Proyecto = {
  obra: string;
  direccion: string;
  constructora: string;
  unidad: string;
  entrega_prometida: string;
  fecha_demo: string;
};

export type EstadoIndicador = "sin_alertas" | "alerta" | "no_determinable";

export type Indicador = {
  id: string;
  agente: string;
  dato: string;
  porque: string;
  origen: string;
  estado: EstadoIndicador;
  listo: boolean;
};

export type Constructora = {
  nombre: string;
  indicadores: Indicador[];
};

export type ItemChecklist = {
  id: string;
  titulo: string;
  detalle: string;
  clave: boolean;
};

export type GrupoChecklist = {
  id: string;
  titulo: string;
  items: ItemChecklist[];
};

export type Alerta =
  | { tipo: "vencido"; nombre: string; fecha: string }
  | { tipo: "silencio"; dias: number; fecha: string }
  | { tipo: "sin_fotos" };
