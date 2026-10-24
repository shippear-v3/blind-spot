import assert from "node:assert/strict";
import { test } from "node:test";
import { observaciones } from "./datos";
import { ejecutarHerramienta } from "./herramientas";

test("ver_cronograma derives hito state from the observations it is given", async () => {
  const resultado = (await ejecutarHerramienta("ver_cronograma", {}, observaciones)) as {
    hitos: { id: string; estado: string }[];
  };
  const piso3 = resultado.hitos.find((hito) => hito.id === "estructura_p3");
  assert.equal(piso3?.estado, "cumplido_con_atraso");
});

test("ver_observaciones filters by date range", async () => {
  const resultado = (await ejecutarHerramienta(
    "ver_observaciones",
    { desde: "2026-10-01", hasta: "2026-10-31" },
    observaciones,
  )) as { fecha: string }[];
  assert.deepEqual(
    resultado.map((item) => item.fecha),
    ["2026-10-01"],
  );
});
