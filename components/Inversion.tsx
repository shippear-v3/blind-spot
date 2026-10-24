"use client";

import { useState, type ReactNode } from "react";
import { proyecto } from "@/lib/datos";
import { diasEntre, fechaLarga } from "@/lib/fechas";
import { alertasDe, cronograma, fotosOrdenadas } from "@/lib/reglas";
import { Alertas } from "./Alertas";
import { Camara } from "./Camara";
import { LineaDeTiempo } from "./LineaDeTiempo";

function Dato({
  etiqueta,
  valor,
  detalle,
  tono = "normal",
  children,
}: {
  etiqueta: string;
  valor: string;
  detalle?: string;
  tono?: "normal" | "atraso" | "vencido";
  children?: ReactNode;
}) {
  const color = tono === "vencido" ? "text-vencido" : tono === "atraso" ? "text-atraso" : "text-fg";
  return (
    <div className="flex flex-col gap-1 bg-surface p-4 sm:p-5">
      <dt className="text-xs text-muted">{etiqueta}</dt>
      <dd className={`text-xl font-semibold tracking-tight tabular-nums ${color}`}>{valor}</dd>
      {detalle && <dd className="text-xs text-muted">{detalle}</dd>}
      {children}
    </div>
  );
}

export function Inversion() {
  const fotos = fotosOrdenadas();
  const hitos = cronograma();
  const avisos = alertasDe(hitos, fotos);
  const [vista, setVista] = useState({ fecha: fotos.at(-1)?.fecha ?? "", n: 0 });

  function verFoto(fecha: string) {
    setVista((actual) => ({ fecha, n: actual.n + 1 }));
  }

  const cumplidos = hitos.filter((h) => h.estado === "cumplido" || h.estado === "cumplido_con_atraso").length;
  const conAtraso = hitos.filter((h) => h.estado === "cumplido_con_atraso").length;
  const vencidos = hitos.filter((h) => h.estado === "vencido_sin_evidencia").length;
  const ultima = fotos.at(-1);
  const diasSinFoto = ultima ? diasEntre(ultima.fecha, proyecto.fecha_demo) : null;
  const mesesEntrega = Math.round(diasEntre(proyecto.fecha_demo, proyecto.entrega_prometida) / 30);

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-1">
        <p className="text-sm text-muted">Mi inversión</p>
        <h1 className="text-balance text-3xl font-semibold tracking-tight">{proyecto.obra}</h1>
        <p className="text-sm text-muted">
          {proyecto.unidad} · {proyecto.direccion} · {proyecto.constructora}
        </p>
      </header>

      <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-line bg-line lg:grid-cols-4">
        <Dato etiqueta="Avance del cronograma" valor={`${cumplidos} de ${hitos.length}`}>
          <div className="mt-2 flex gap-1" aria-hidden="true">
            {hitos.map((h) => (
              <span
                key={h.id}
                className={`h-1 flex-1 rounded-full ${
                  h.estado === "cumplido"
                    ? "bg-pizarra"
                    : h.estado === "cumplido_con_atraso"
                      ? "bg-atraso"
                      : h.estado === "vencido_sin_evidencia"
                        ? "bg-vencido"
                        : "bg-line"
                }`}
              />
            ))}
          </div>
        </Dato>
        <Dato
          etiqueta="Hitos vencidos"
          valor={String(vencidos)}
          detalle={conAtraso > 0 ? `${conAtraso} cumplido con atraso` : "Ninguno con atraso"}
          tono={vencidos > 0 ? "vencido" : "normal"}
        />
        <Dato
          etiqueta="Última foto"
          valor={diasSinFoto === null ? "Sin fotos" : diasSinFoto === 0 ? "Hoy" : `Hace ${diasSinFoto} días`}
          detalle={ultima ? fechaLarga(ultima.fecha) : undefined}
          tono={diasSinFoto !== null && diasSinFoto >= 3 ? "atraso" : "normal"}
        />
        <Dato
          etiqueta="Entrega prometida"
          valor={fechaLarga(proyecto.entrega_prometida)}
          detalle={`En ${mesesEntrega} meses, según boleto`}
        />
      </dl>

      <Alertas items={avisos} />

      <Camara fotos={fotos} fecha={vista.fecha} seleccion={vista.n} onElegirFecha={verFoto} />
      <LineaDeTiempo hitos={hitos} fechaVisible={vista.fecha} onVerFoto={verFoto} />
    </div>
  );
}
