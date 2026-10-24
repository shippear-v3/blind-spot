export const PREGUNTAS = [
  "¿Cómo viene la obra?",
  "¿Estamos atrasados respecto del boleto?",
  "¿Qué cambió desde febrero?",
  "¿Quién es la constructora?",
];

export function fechasCitadas(texto: string) {
  return [...new Set(texto.match(/\d{4}-\d{2}-\d{2}/g) ?? [])];
}
