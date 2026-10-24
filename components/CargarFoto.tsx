"use client";

import Link from "next/link";
import { useState } from "react";
import { achicarJpeg } from "@/lib/achicar";
import { proyecto } from "@/lib/datos";
import type { ObservacionConFoto } from "@/lib/tipos";
import { FotoObra } from "./FotoObra";

export function CargarFoto() {
  const [fecha, setFecha] = useState(proyecto.fecha_demo);
  const [archivo, setArchivo] = useState<File | null>(null);
  const [pendiente, setPendiente] = useState(false);
  const [error, setError] = useState("");
  const [guardada, setGuardada] = useState<ObservacionConFoto | null>(null);

  async function enviar() {
    if (!archivo || pendiente) return;
    setPendiente(true);
    setError("");
    try {
      const { base64, mediaType } = await achicarJpeg(archivo);
      const res = await fetch("/api/analizar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ base64, mediaType, fecha }),
      });
      const data = (await res.json()) as { observacion?: ObservacionConFoto; error?: string };
      if (!res.ok || !data.observacion) {
        setError(data.error || "No pude analizar la foto.");
        return;
      }
      setGuardada(data.observacion);
      setArchivo(null);
    } catch (causa) {
      console.error(causa);
      setError("No pude analizar la foto.");
    } finally {
      setPendiente(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-sm text-muted">Constructora</p>
        <h1 className="text-3xl font-semibold tracking-tight">Cargar foto de obra</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted">
          La foto entra por acá. El inversor la ve en la cámara y se la pregunta al agente.
        </p>
      </div>
      <form
        className="flex max-w-xl flex-col gap-4 rounded-xl border border-line bg-surface p-4"
        onSubmit={(event) => {
          event.preventDefault();
          enviar();
        }}
      >
        <div className="flex flex-col gap-1">
          <label htmlFor="fecha-foto" className="text-xs text-muted">
            Fecha de la foto
          </label>
          <input
            id="fecha-foto"
            type="date"
            value={fecha}
            onChange={(event) => setFecha(event.target.value)}
            className="h-10 rounded-md border border-line bg-bg px-3 text-sm"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="archivo-foto" className="text-xs text-muted">
            Archivo
          </label>
          <input
            id="archivo-foto"
            type="file"
            accept="image/*"
            onChange={(event) => setArchivo(event.target.files?.[0] ?? null)}
            className="text-sm"
          />
        </div>
        <button
          type="submit"
          disabled={!archivo || pendiente}
          className="h-10 rounded-md bg-marron px-4 text-sm font-semibold text-white disabled:opacity-60"
        >
          {pendiente ? "Mirando la foto…" : "Analizar y guardar"}
        </button>
        {error && <p className="text-sm text-vencido">{error}</p>}
      </form>
      {guardada && (
        <section className="max-w-xl rounded-xl border border-line bg-surface p-4">
          <p className="text-xs font-medium text-ok">Guardada</p>
          <div className="mt-3 aspect-[16/10] overflow-hidden rounded-lg bg-black grayscale">
            <FotoObra obs={guardada} />
          </div>
          <p className="mt-3 text-sm leading-relaxed">{guardada.descripcion}</p>
          <p className="mt-2 text-xs text-muted">
            {guardada.etapa} · {guardada.fecha}
          </p>
          <Link href="/" className="mt-4 inline-block text-sm font-medium underline underline-offset-4">
            Ver como inversor
          </Link>
        </section>
      )}
    </div>
  );
}
