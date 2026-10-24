import assert from "node:assert/strict";
import { test } from "node:test";
import { observaciones } from "./datos";
import { alertasDe, cronograma } from "./reglas";

test("cronograma marks floor 3 late and the facade on time", () => {
  const hitos = cronograma(observaciones);
  const piso2 = hitos.find((hito) => hito.id === "estructura_p2");
  const piso3 = hitos.find((hito) => hito.id === "estructura_p3");
  const fachada = hitos.find((hito) => hito.id === "terminaciones");
  assert.equal(piso2?.estado, "cumplido");
  assert.equal(piso2?.fecha, "2026-06-24");
  assert.equal(piso3?.estado, "cumplido_con_atraso");
  assert.equal(piso3?.fecha, "2026-11-10");
  assert.equal(fachada?.estado, "cumplido");
  assert.equal(fachada?.fecha, "2026-11-10");
});

test("cronograma marks floor 3 overdue without the November photo", () => {
  const previas = observaciones.filter((foto) => foto.fecha < "2026-11-10");
  const piso3 = cronograma(previas).find((hito) => hito.id === "estructura_p3");
  assert.equal(piso3?.estado, "vencido_sin_evidencia");
});

test("alertasDe reports silence when the last photo is older than three days", () => {
  const previas = observaciones.filter((foto) => foto.fecha <= "2026-10-01");
  const avisos = alertasDe(cronograma(previas), previas);
  assert.ok(avisos.some((aviso) => aviso.tipo === "silencio" && aviso.dias === 40));
});
