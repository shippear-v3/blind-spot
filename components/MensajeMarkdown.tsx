import { bloquesDe, type Fragmento } from "@/lib/markdown";

function Linea({ fragmentos }: { fragmentos: Fragmento[] }) {
  return fragmentos.map((fragmento, indice) =>
    fragmento.tipo === "negrita" ? (
      <strong key={indice} className="font-semibold">
        {fragmento.valor}
      </strong>
    ) : (
      <span key={indice}>{fragmento.valor}</span>
    ),
  );
}

export function MensajeMarkdown({ texto }: { texto: string }) {
  return (
    <div className="flex flex-col gap-3 text-sm leading-relaxed">
      {bloquesDe(texto).map((bloque, indice) =>
        bloque.tipo === "lista" ? (
          <ul key={indice} className="flex list-disc flex-col gap-2 pl-5">
            {bloque.items.map((item, itemIndice) => (
              <li key={itemIndice}>
                <Linea fragmentos={item} />
              </li>
            ))}
          </ul>
        ) : (
          <p key={indice}>
            <Linea fragmentos={bloque.fragmentos} />
          </p>
        ),
      )}
    </div>
  );
}
