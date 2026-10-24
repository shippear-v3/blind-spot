"use client";

import { useState } from "react";
import { Camara } from "@/components/Camara";
import { alertasDe, cronograma, fotosOrdenadas } from "@/lib/reglas";
import { Alertas } from "./Alertas";
import { ChatPanel } from "./ChatPanel";
import { LineaDeTiempo } from "./LineaDeTiempo";

export function Inversion() {
  const fotos = fotosOrdenadas();
  const hitos = cronograma();
  const avisos = alertasDe(hitos, fotos);
  const [vista, setVista] = useState({ fecha: fotos.at(-1)?.fecha ?? "", n: 0 });

  function verFoto(fecha: string) {
    setVista((actual) => ({ fecha, n: actual.n + 1 }));
  }

  return (
    <div className="flex flex-col gap-6">
      <Alertas items={avisos} />
      <div className="grid min-w-0 items-start gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(18rem,0.8fr)]">
        <Camara fotos={fotos} fecha={vista.fecha} seleccion={vista.n} onElegirFecha={verFoto} />
        <LineaDeTiempo hitos={hitos} fechaVisible={vista.fecha} onVerFoto={verFoto} />
      </div>
      <ChatPanel />
    </div>
  );
}
