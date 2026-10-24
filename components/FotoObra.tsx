"use client";

import { useState } from "react";
import type { ObservacionConFoto } from "@/lib/tipos";
import { EscenaObra } from "./EscenaObra";

function esUrlFoto(foto: string) {
  return foto.startsWith("http://") || foto.startsWith("https://") || foto.startsWith("/obra/");
}

export function FotoObra({
  obs,
  className = "h-full w-full object-cover",
}: {
  obs: ObservacionConFoto;
  className?: string;
}) {
  const [rota, setRota] = useState<string | null>(null);
  if (!esUrlFoto(obs.foto) || rota === obs.foto) return <EscenaObra obs={obs} />;

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={obs.foto} alt="" className={className} onError={() => setRota(obs.foto)} />
  );
}
