"use client";

import { useRef, useState } from "react";
import { FileText, Upload, X } from "lucide-react";
import { checklist, proyecto } from "@/lib/datos";
import type { ArchivoCargado, RegistroItem } from "@/lib/tipos";
import { BadgeEstado } from "./EstadoItem";

const CAMPO =
  "h-9 w-full rounded-md border border-line bg-bg px-3 text-sm placeholder:text-muted/70 hover:border-muted";

function formatearPeso(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function Ingreso({
  archivos,
  registros,
  onAgregar,
  onAsignar,
  onQuitar,
}: {
  archivos: ArchivoCargado[];
  registros: Record<string, RegistroItem>;
  onAgregar: (files: FileList) => void;
  onAsignar: (archivoId: string, itemId: string | null) => void;
  onQuitar: (archivoId: string) => void;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [arrastrando, setArrastrando] = useState(false);

  return (
    <section
      aria-labelledby="t-ingreso"
      className="overflow-hidden rounded-xl border border-line bg-surface"
    >
      <div className="flex items-baseline justify-between gap-4 border-b border-line px-5 py-4">
        <div>
          <h2 id="t-ingreso" className="text-base">
            1. Contanos del proyecto
          </h2>
          <p className="text-sm text-muted">Cargá lo que te dio la constructora. Nosotros lo verificamos.</p>
        </div>
      </div>

      <div className="grid gap-6 p-5 md:grid-cols-2">
        <div className="flex flex-col gap-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="flex flex-col gap-1.5 text-xs font-medium">
              Proyecto
              <input className={CAMPO} defaultValue={proyecto.obra} />
            </label>
            <label className="flex flex-col gap-1.5 text-xs font-medium">
              Constructora
              <input className={CAMPO} defaultValue={proyecto.constructora} />
            </label>
            <label className="flex flex-col gap-1.5 text-xs font-medium">
              Unidad
              <input className={CAMPO} defaultValue={proyecto.unidad} />
            </label>
            <label className="flex flex-col gap-1.5 text-xs font-medium">
              Monto a invertir
              <input className={CAMPO} inputMode="numeric" placeholder="USD 85.000" />
            </label>
          </div>
          <label className="flex flex-col gap-1.5 text-xs font-medium">
            ¿Qué te ofrecieron?
            <textarea
              rows={3}
              className={`${CAMPO} h-auto resize-none py-2 leading-relaxed`}
              placeholder="Ej.: 2 ambientes en pozo, anticipo del 30% y 36 cuotas ajustadas por CAC."
            />
          </label>
        </div>

        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={() => input.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              setArrastrando(true);
            }}
            onDragLeave={() => setArrastrando(false)}
            onDrop={(e) => {
              e.preventDefault();
              setArrastrando(false);
              if (e.dataTransfer.files.length) onAgregar(e.dataTransfer.files);
            }}
            className={`flex min-h-32 flex-col items-center justify-center gap-2 rounded-lg border border-dashed px-4 py-6 text-center transition-colors ${
              arrastrando ? "border-marron bg-marron-bg" : "border-line hover:border-muted hover:bg-subtle"
            }`}
          >
            <span className="flex size-9 items-center justify-center rounded-full bg-marron-bg text-marron">
              <Upload className="size-4" aria-hidden="true" />
            </span>
            <span className="text-sm font-medium">Subí tus documentos</span>
            <span className="text-xs text-muted">
              Boleto, informe de dominio, permiso, póliza… PDF o imagen
            </span>
          </button>
          <input
            ref={input}
            type="file"
            multiple
            accept=".pdf,image/*,.doc,.docx"
            className="sr-only"
            tabIndex={-1}
            onChange={(e) => {
              if (e.target.files?.length) onAgregar(e.target.files);
              e.target.value = "";
            }}
          />

          {archivos.length > 0 && (
            <ul className="flex flex-col divide-y divide-line rounded-lg border border-line">
              {archivos.map((archivo) => {
                const registro = archivo.itemId ? registros[archivo.itemId] : undefined;
                return (
                  <li key={archivo.id} className="flex flex-col gap-2 px-3 py-2.5">
                    <div className="flex items-center gap-2">
                      <FileText className="size-4 shrink-0 text-muted" aria-hidden="true" />
                      <span className="min-w-0 flex-1 truncate text-sm">{archivo.nombre}</span>
                      <span className="text-xs text-muted tabular-nums">{formatearPeso(archivo.peso)}</span>
                      <button
                        type="button"
                        onClick={() => onQuitar(archivo.id)}
                        className="rounded p-1 text-muted hover:bg-subtle hover:text-fg"
                        aria-label={`Quitar ${archivo.nombre}`}
                      >
                        <X className="size-3.5" aria-hidden="true" />
                      </button>
                    </div>
                    <div className="flex items-center gap-2 pl-6">
                      <select
                        value={archivo.itemId ?? ""}
                        onChange={(e) => onAsignar(archivo.id, e.target.value || null)}
                        aria-label={`Qué documento es ${archivo.nombre}`}
                        className={`h-7 min-w-0 flex-1 rounded-md border bg-bg px-2 text-xs ${
                          archivo.itemId ? "border-line" : "border-atraso text-atraso"
                        }`}
                      >
                        <option value="">¿Qué documento es?</option>
                        {checklist.map((grupo) => (
                          <optgroup key={grupo.id} label={grupo.titulo}>
                            {grupo.items.map((item) => (
                              <option key={item.id} value={item.id}>
                                {item.documento}
                              </option>
                            ))}
                          </optgroup>
                        ))}
                      </select>
                      {registro && <BadgeEstado estado={registro.estado} />}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
