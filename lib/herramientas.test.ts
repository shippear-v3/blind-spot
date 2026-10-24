import assert from "node:assert/strict";
import { test } from "node:test";
import { observaciones } from "./datos";
import { ejecutarHerramienta } from "./herramientas";

test("ver_cronograma derives hito state from the observations it is given", async () => {
  const resultado = (await ejecutarHerramienta("ver_cronograma", {}, observaciones)) as {
    hitos: { id: string; estado: string }[];
  };
  const piso1 = resultado.hitos.find((hito) => hito.id === "estructura_p1");
  assert.equal(piso1?.estado, "cumplido");
});

test("ver_observaciones filters by date range", async () => {
  const resultado = (await ejecutarHerramienta(
    "ver_observaciones",
    { desde: "2026-02-01", hasta: "2026-02-28" },
    observaciones,
  )) as { fecha: string }[];
  assert.deepEqual(
    resultado.map((item) => item.fecha),
    ["2026-02-01", "2026-02-10"],
  );
});
