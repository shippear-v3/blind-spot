import assert from "node:assert/strict";
import { test } from "node:test";
import { bloquesDe } from "./markdown";

const RESPUESTA = `**Tu obra va bien hasta el piso 2.**

- **Lo confirmado:** fundaciones en la foto del 2026-02-01.
- **Lo dudoso:** el piso 3 vencía el 30/09
  y el 1/10 seguían viéndose 2 pisos.

Pedile a la constructora fotos nuevas.`;

test("bloquesDe turns Claude markdown into paragraphs, bold and lists", () => {
  const bloques = bloquesDe(RESPUESTA);
  assert.equal(bloques.length, 3);

  assert.equal(bloques[0].tipo, "parrafo");
  if (bloques[0].tipo !== "parrafo") return;
  assert.deepEqual(bloques[0].fragmentos, [{ tipo: "negrita", valor: "Tu obra va bien hasta el piso 2." }]);

  assert.equal(bloques[1].tipo, "lista");
  if (bloques[1].tipo !== "lista") return;
  assert.equal(bloques[1].items.length, 2);
  assert.deepEqual(bloques[1].items[0][0], { tipo: "negrita", valor: "Lo confirmado:" });
  assert.equal(bloques[1].items[0][1].tipo, "texto");
  assert.match(bloques[1].items[0][1].valor, /2026-02-01/);
  assert.match(bloques[1].items[1].at(-1)?.valor ?? "", /2 pisos/);

  assert.equal(bloques[2].tipo, "parrafo");
  if (bloques[2].tipo !== "parrafo") return;
  assert.deepEqual(bloques[2].fragmentos, [{ tipo: "texto", valor: "Pedile a la constructora fotos nuevas." }]);
});

test("bloquesDe leaves an unclosed bold marker as text", () => {
  const bloques = bloquesDe("Quedó **abierto");
  assert.equal(bloques[0].tipo, "parrafo");
  if (bloques[0].tipo !== "parrafo") return;
  assert.deepEqual(bloques[0].fragmentos, [{ tipo: "texto", valor: "Quedó **abierto" }]);
});
