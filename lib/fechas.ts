const MESES = [
  "ene",
  "feb",
  "mar",
  "abr",
  "may",
  "jun",
  "jul",
  "ago",
  "sep",
  "oct",
  "nov",
  "dic",
];

export function fechaLarga(iso: string) {
  const [anio, mes, dia] = iso.split("-").map(Number);
  if (!anio || !mes || !dia || !MESES[mes - 1]) return iso;
  return `${dia} ${MESES[mes - 1]} ${anio}`;
}

export function fechaCorta(iso: string) {
  return fechaLarga(iso).replace(/ \d{4}$/, "");
}

export function fechaCamara(iso: string) {
  return fechaLarga(iso).toUpperCase();
}

export function diasEntre(desde: string, hasta: string) {
  const inicio = Date.parse(`${desde}T00:00:00Z`);
  const fin = Date.parse(`${hasta}T00:00:00Z`);
  if (Number.isNaN(inicio) || Number.isNaN(fin)) return 0;
  return Math.round((fin - inicio) / 86_400_000);
}
