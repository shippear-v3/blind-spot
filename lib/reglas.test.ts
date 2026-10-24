import assert from "node:assert/strict";
import { test } from "node:test";
import { observaciones } from "./datos";
import { alertasDe, cronograma } from "./reglas";

test("cronograma marks floor 1 done and later milestones still ahead", () => {
  const hitos = cronograma(observaciones);
  const piso1 = hitos.find((hito) => hito.id === "estructura_p1");
  const piso2 = hitos.find((hito) => hito.id === "estructura_p2");
  const fachada = hitos.find((hito) => hito.id === "terminaciones");
  assert.equal(piso1?.estado, "cumplido");
  assert.equal(piso1?.fecha, "2026-04-28");
  assert.equal(piso2?.estado, "pendiente");
  assert.equal(fachada?.estado, "pendiente");
});

test("alertasDe reports silence when photos stop in February", () => {
  const previas = observaciones.filter((foto) => foto.fecha <= "2026-02-10");
  const avisos = alertasDe(cronograma(previas), previas);
  assert.ok(avisos.some((aviso) => aviso.tipo === "silencio" && aviso.dias === 77));
});
