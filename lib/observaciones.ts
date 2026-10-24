import type { ObservacionConFoto } from "./tipos";

export function fusionarObservaciones(
  base: ObservacionConFoto[],
  extras: ObservacionConFoto[],
): ObservacionConFoto[] {
  const mapa = new Map<string, ObservacionConFoto>();
  for (const item of base) mapa.set(item.fecha, item);
  for (const item of extras) mapa.set(item.fecha, item);
  return [...mapa.values()].sort((a, b) => a.fecha.localeCompare(b.fecha));
}
