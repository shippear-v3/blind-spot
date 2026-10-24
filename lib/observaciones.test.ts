import assert from "node:assert/strict";
import { test } from "node:test";
import { fusionarObservaciones } from "./observaciones";
import type { ObservacionConFoto } from "./tipos";

function obs(fecha: string, extra: Partial<ObservacionConFoto> = {}): ObservacionConFoto {
  return {
    fecha,
    foto: `/obra/${fecha}.jpg`,
    etapa: "estructura",
    pisos_con_estructura_visibles: 4,
    elementos_visibles: ["losas"],
    hay_actividad_visible: false,
    cambios_vs_foto_anterior: "",
    descripcion: "base",
    confianza: "alta",
    limitaciones: "",
    ...extra,
  };
}

test("fusionarObservaciones keeps seed dates and lets extras win the same day", () => {
  const fusion = fusionarObservaciones(
    [obs("2026-10-18", { descripcion: "semilla" }), obs("2026-09-20")],
    [obs("2026-10-24", { descripcion: "hoy" }), obs("2026-10-18", { descripcion: "rehecha" })],
  );
  assert.deepEqual(
    fusion.map((item) => [item.fecha, item.descripcion]),
    [
      ["2026-09-20", "base"],
      ["2026-10-18", "rehecha"],
      ["2026-10-24", "hoy"],
    ],
  );
});
