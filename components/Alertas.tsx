import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { fechaLarga } from "@/lib/fechas";
import type { Alerta } from "@/lib/tipos";

export function Alertas({ items }: { items: Alerta[] }) {
  if (items.length === 0) {
    return (
      <p className="flex items-center gap-3 rounded-xl border border-line bg-surface px-4 py-3 text-sm">
        <CheckCircle2 className="size-4 shrink-0" aria-hidden="true" />
        Hoy no hay hitos vencidos ni silencio de la cámara.
      </p>
    );
  }

  return (
    <section
      className="flex gap-3 rounded-xl border border-vencido/30 bg-vencido-bg px-4 py-3.5"
      aria-label="Requiere tu atención"
    >
      <AlertTriangle className="mt-0.5 size-4 shrink-0 text-vencido" aria-hidden="true" />
      <div className="min-w-0">
        <h2 className="text-sm font-semibold text-vencido">Requiere tu atención</h2>
        <ul className="mt-1 flex flex-col gap-0.5 text-sm">
          {items.map((item) => (
            <li key={item.tipo === "vencido" ? item.nombre : item.tipo}>
              {item.tipo === "vencido" &&
                `${item.nombre} venció el ${fechaLarga(item.fecha)} y no hay evidencia que lo muestre.`}
              {item.tipo === "silencio" &&
                `Sin fotos hace ${item.dias} días. La última es del ${fechaLarga(item.fecha)}.`}
              {item.tipo === "sin_fotos" && "No hay fotos de la cámara."}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
