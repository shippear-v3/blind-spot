"use client";

import { useState } from "react";
import { Camara } from "@/components/Camara";
import { alertasDe, cronograma } from "@/lib/reglas";
import type { ObservacionConFoto } from "@/lib/tipos";
import { Alertas } from "./Alertas";
import { ChatPanel } from "./ChatPanel";
import { LineaDeTiempo } from "./LineaDeTiempo";

export function Inversion({ fotos }: { fotos: ObservacionConFoto[] }) {
  const hitos = cronograma(fotos);
  const avisos = alertasDe(hitos, fotos);
  const [fecha, setFecha] = useState(fotos.at(-1)?.fecha ?? "");

  return (
    <div className="flex flex-col gap-6">
      <Alertas items={avisos} />
      <div className="grid min-w-0 items-start gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(18rem,0.8fr)]">
        <Camara fotos={fotos} fecha={fecha} onElegirFecha={setFecha} />
        <LineaDeTiempo hitos={hitos} fechaVisible={fecha} onVerFoto={setFecha} />
      </div>
      <ChatPanel fotos={fotos} />
    </div>
  );
}
