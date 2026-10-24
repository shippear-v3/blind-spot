import type { EstadoHito, EstadoIndicador } from "./tipos";

export const ETIQUETA_HITO: Record<EstadoHito, string> = {
  cumplido: "Cumplido",
  cumplido_con_atraso: "Cumplido con atraso",
  pendiente: "Pendiente",
  vencido_sin_evidencia: "Vencido sin evidencia",
};

export const ETIQUETA_FICHA: Record<EstadoIndicador, string> = {
  sin_alertas: "Sin alertas",
  alerta: "Alerta",
  no_determinable: "No determinable",
};

export const ESTILO_HITO: Record<
  EstadoHito,
  { texto: string; superficie: string; marca: string }
> = {
  cumplido: {
    texto: "text-cumplido",
    superficie: "bg-card",
    marca: "bg-cumplido",
  },
  cumplido_con_atraso: {
    texto: "text-atraso",
    superficie: "bg-atraso/10",
    marca: "bg-atraso",
  },
  pendiente: {
    texto: "text-pendiente",
    superficie: "bg-card",
    marca: "bg-pendiente",
  },
  vencido_sin_evidencia: {
    texto: "text-vencido",
    superficie: "bg-vencido/10",
    marca: "bg-vencido",
  },
};
