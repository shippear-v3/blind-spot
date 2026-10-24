export type Fragmento = { tipo: "texto"; valor: string } | { tipo: "negrita"; valor: string };

export type Bloque =
  | { tipo: "parrafo"; fragmentos: Fragmento[] }
  | { tipo: "lista"; items: Fragmento[][] };

function esItem(linea: string) {
  return /^\s*-\s+/.test(linea);
}

export function fragmentosDe(texto: string): Fragmento[] {
  const partes = texto.split("**");
  const cerrado = partes.length % 2 === 1;
  const usados = cerrado ? partes : partes.slice(0, -1);
  const fragmentos: Fragmento[] = [];
  usados.forEach((parte, i) => {
    if (!parte) return;
    fragmentos.push(i % 2 === 0 ? { tipo: "texto", valor: parte } : { tipo: "negrita", valor: parte });
  });
  if (!cerrado) {
    const resto = `**${partes.at(-1) ?? ""}`;
    if (resto !== "**") fragmentos.push({ tipo: "texto", valor: resto });
  }
  return fragmentos.reduce<Fragmento[]>((salida, fragmento) => {
    const previo = salida.at(-1);
    if (fragmento.tipo === "texto" && previo?.tipo === "texto") previo.valor += fragmento.valor;
    else salida.push(fragmento);
    return salida;
  }, []);
}

export function bloquesDe(texto: string): Bloque[] {
  const lineas = texto.replace(/\r\n/g, "\n").split("\n");
  const bloques: Bloque[] = [];
  let i = 0;

  while (i < lineas.length) {
    if (lineas[i].trim() === "") {
      i++;
      continue;
    }

    if (esItem(lineas[i])) {
      const items: string[] = [];
      while (i < lineas.length && lineas[i].trim() !== "") {
        if (esItem(lineas[i])) items.push(lineas[i].replace(/^\s*-\s+/, ""));
        else if (items.length > 0 && /^\s+/.test(lineas[i])) items[items.length - 1] += ` ${lineas[i].trim()}`;
        else break;
        i++;
      }
      bloques.push({ tipo: "lista", items: items.map(fragmentosDe) });
      continue;
    }

    const partes: string[] = [];
    while (i < lineas.length && lineas[i].trim() !== "" && !esItem(lineas[i])) {
      partes.push(lineas[i].trim());
      i++;
    }
    bloques.push({ tipo: "parrafo", fragmentos: fragmentosDe(partes.join(" ")) });
  }

  return bloques;
}
