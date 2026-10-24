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
        <p className="font-mono text-xs tracking-[0.16em] text-pendiente">CONSTRUCTORA</p>
        <h2 className="font-display text-4xl font-bold uppercase leading-none">Cargar foto de obra</h2>
        <p className="mt-3 max-w-2xl text-lg leading-snug">
          La foto entra por acá. El inversor no la sube: la ve en la cámara y se la pregunta al agente.
        </p>
      </div>
      <form
        className="flex max-w-xl flex-col gap-4 bg-card p-4"
        onSubmit={(event) => {
          event.preventDefault();
          enviar();
        }}
      >
        <div className="flex flex-col gap-1">
          <label htmlFor="fecha-foto" className="font-mono text-xs tracking-[0.14em] text-pendiente">
            FECHA DE LA FOTO
          </label>
          <input
            id="fecha-foto"
            type="date"
            value={fecha}
            onChange={(event) => setFecha(event.target.value)}
            className="min-h-11 border border-line bg-galvanized px-3"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="archivo-foto" className="font-mono text-xs tracking-[0.14em] text-pendiente">
            ARCHIVO
          </label>
          <input
            id="archivo-foto"
            type="file"
            accept="image/*"
            onChange={(event) => setArchivo(event.target.files?.[0] ?? null)}
            className="min-h-11 text-sm"
          />
        </div>
        <button
          type="submit"
          disabled={!archivo || pendiente}
          className="min-h-11 bg-soil px-4 text-sm font-semibold text-card disabled:opacity-60"
        >
          {pendiente ? "Mirando la foto…" : "Analizar y guardar"}
        </button>
        {error && <p className="text-sm text-vencido">{error}</p>}
      </form>
      {guardada && (
        <section className="max-w-xl bg-card p-4">
          <p className="font-mono text-xs tracking-[0.16em] text-cumplido">GUARDADA</p>
          <div className="mt-3 aspect-[16/10] overflow-hidden bg-soil">
            <FotoObra obs={guardada} />
          </div>
          <p className="mt-3 text-lg leading-snug">{guardada.descripcion}</p>
          <p className="mt-2 font-mono text-xs text-pendiente">
            {guardada.etapa} · {guardada.fecha}
          </p>
          <Link href="/" className="mt-4 inline-block text-sm underline">
            Ver como inversor
          </Link>
        </section>
      )}
    </div>
  );
}
