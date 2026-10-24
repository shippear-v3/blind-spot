import { fechaLarga } from "@/lib/fechas";
import type { Alerta } from "@/lib/tipos";

export function Alertas({ items }: { items: Alerta[] }) {
  if (items.length === 0) {
    return (
      <p className="border border-line bg-card px-4 py-3 text-sm">
        Hoy no hay un hito vencido ni silencio de la cámara.
      </p>
    );
  }

  return (
    <section className="border border-vencido/40 bg-vencido/10 px-4 py-3" aria-label="Para mirar hoy">
      <h2 className="font-mono text-xs tracking-[0.16em] text-vencido">PARA MIRAR HOY</h2>
      <ul className="mt-2 flex flex-col gap-1">
        {items.map((item) => (
          <li key={item.tipo === "vencido" ? item.nombre : item.tipo}>
            {item.tipo === "vencido" &&
              `${item.nombre} venció el ${fechaLarga(item.fecha)}. No hay evidencia que lo muestre.`}
            {item.tipo === "silencio" &&
              `Sin fotos hace ${item.dias} días. La última es del ${fechaLarga(item.fecha)}.`}
            {item.tipo === "sin_fotos" && "No hay fotos de la cámara."}
          </li>
        ))}
      </ul>
    </section>
  );
}
