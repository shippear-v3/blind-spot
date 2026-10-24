const RESPUESTAS: { clave: string; texto: string }[] = [
  {
    clave: "viene",
    texto: "La estructura que se ve llega a cuatro losas, en la foto del 2026-10-18. El boleto pedía estructura hasta piso 6 para el 15 oct 2026 y ninguna foto llega a seis losas: ese hito está vencido sin evidencia. La última foto es del 18 oct 2026.",
  },
  {
    clave: "atras",
    texto: "Piso 3 se ve recién en la foto del 2026-08-12, después del 31 jul 2026: cumplido con atraso. Piso 6 venció el 15 oct 2026 sin evidencia. Fundaciones y el permiso figuran cumplidos a tiempo.",
  },
  {
    clave: "julio",
    texto: "El 15 jul se veían dos losas (foto del 2026-07-15). El 12 ago aparece la tercera (foto del 2026-08-12). El 20 sep se suma la cuarta (foto del 2026-09-20). El 18 oct sigue igual (foto del 2026-10-18): no hay un piso nuevo.",
  },
  {
    clave: "constructora",
    texto: "Constructora Demo S.A., ficticia. Declara 8 de 10 obras entregadas. Compradores reportan una demora promedio de 5 meses. La situación en el BCRA figura como normal, en una fuente pública. Portales, normativa, redes y la zona todavía no están mirados.",
  },
];

export const PREGUNTAS = [
  "¿Cómo viene la obra?",
  "¿Estamos atrasados respecto del boleto?",
  "¿Qué cambió desde julio?",
  "¿Quién es la constructora?",
];

export function respuestaMock(pregunta: string) {
  const texto = pregunta.toLowerCase();
  if (/\bviene\b/.test(texto)) return RESPUESTAS[0].texto;
  if (texto.includes("atras")) return RESPUESTAS[1].texto;
  if (texto.includes("julio") || texto.includes("cambió") || texto.includes("cambio")) {
    return RESPUESTAS[2].texto;
  }
  if (texto.includes("constructora") || texto.includes("quién") || texto.includes("quien")) {
    return RESPUESTAS[3].texto;
  }
  return null;
}
