import type { Etapa, EstadoHito, EstadoIndicador } from "./tipos";

export const ETIQUETA_ETAPA: Record<Etapa, string> = {
  terreno: "Terreno",
  excavacion_y_fundaciones: "Excavación y fundaciones",
  estructura: "Estructura",
  mamposteria: "Mampostería",
  instalaciones: "Instalaciones",
  terminaciones: "Terminaciones",
};

export const ETIQUETA_HITO: Record<EstadoHito, string> = {
  cumplido: "Cumplido",
  cumplido_con_atraso: "Con atraso",
  pendiente: "Pendiente",
  vencido_sin_evidencia: "Vencido",
};

export const ETIQUETA_FICHA: Record<EstadoIndicador, string> = {
  sin_alertas: "Sin alertas",
  alerta: "Alerta",
  no_determinable: "No determinable",
};

export const ESTILO_HITO: Record<EstadoHito, { icono: string; badge: string }> = {
  cumplido: {
    icono: "text-fg",
    badge: "bg-subtle text-fg",
  },
  cumplido_con_atraso: {
    icono: "text-atraso",
    badge: "bg-atraso-bg text-atraso",
  },
  pendiente: {
    icono: "text-muted",
    badge: "border border-line text-muted",
  },
  vencido_sin_evidencia: {
    icono: "text-vencido",
    badge: "bg-vencido-bg text-vencido",
  },
};
