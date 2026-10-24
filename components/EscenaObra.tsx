"use client";

import { useId } from "react";
import type { ObservacionConFoto } from "@/lib/tipos";

function modoDe(obs: ObservacionConFoto) {
  if (obs.etapa === "terreno") return "lote" as const;
  if (obs.etapa === "excavacion_y_fundaciones") {
    const texto = obs.elementos_visibles.join(" ").toLowerCase();
    if (texto.includes("hormig") || texto.includes("fundac")) return "fundacion" as const;
    return "pozo" as const;
  }
  return "estructura" as const;
}

export function EscenaObra({ obs }: { obs: ObservacionConFoto }) {
  const filtro = `grano${useId().replace(/:/g, "")}`;
  const modo = modoDe(obs);
  const pisos = modo === "estructura" ? (obs.pisos_con_estructura_visibles ?? 0) : 0;
  const grua = modo !== "lote";
  const mixer = obs.elementos_visibles.some((item) => item.toLowerCase().includes("mixer"));
  const x = 214;
  const ancho = 206;
  const base = 308;
  const alto = 34;
  const tope = base - pisos * alto;
  const columnas = [18, 54, 90, 126, 162];

  return (
    <svg viewBox="0 0 640 400" className="h-full w-full" aria-hidden="true">
      <defs>
        <linearGradient id={`${filtro}-cielo`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#c5d0d4" />
          <stop offset="1" stopColor="#e6e2d8" />
        </linearGradient>
        <filter id={filtro}>
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
      </defs>
      <rect width="640" height="400" fill={`url(#${filtro}-cielo)`} />
      <rect x="24" y="188" width="78" height="78" fill="#8b9296" />
      <rect x="46" y="168" width="34" height="22" fill="#7c8388" />
      <rect x="548" y="176" width="70" height="90" fill="#767e82" />
      <rect x="0" y="266" width="640" height="134" fill="#b7ae9e" />
      <rect x="168" y="236" width="304" height="78" fill="#a89478" />
      <rect x="112" y="268" width="8" height="48" fill="#5c4632" />
      <circle cx="116" cy="258" r="20" fill="#4d6148" />
      <rect x="0" y="322" width="640" height="78" fill="#c9c3b6" />
      <rect x="0" y="314" width="640" height="10" fill="#b3ad9f" />

      {modo === "lote" && (
        <g stroke="#3e4744" strokeWidth="3" fill="none">
          {Array.from({ length: 8 }, (_, i) => (
            <line key={i} x1={188 + i * 34} y1="250" x2={188 + i * 34} y2="312" />
          ))}
          <line x1="188" y1="270" x2="426" y2="270" />
          <line x1="188" y1="292" x2="426" y2="292" />
        </g>
      )}

      {(modo === "pozo" || modo === "fundacion") && (
        <polygon points="196,312 438,312 408,248 226,248" fill="#4e453c" />
      )}
      {modo === "fundacion" && (
        <polygon points="206,312 428,312 406,286 228,286" fill="#d5cec2" />
      )}
      {modo === "pozo" && <ellipse cx="250" cy="292" rx="36" ry="10" fill="#6a5c4c" />}

      {pisos > 0 && (
        <g>
          <ellipse cx="330" cy="318" rx="130" ry="8" fill="#1c1915" opacity="0.18" />
          {Array.from({ length: pisos }, (_, piso) => {
            const y = base - (piso + 1) * alto;
            return (
              <g key={piso}>
                {columnas.map((columna) => (
                  <rect
                    key={columna}
                    x={x + columna}
                    y={y + 8}
                    width="11"
                    height={alto - 8}
                    fill="#8f8b83"
                  />
                ))}
                <rect x={x + ancho - 40} y={y + 8} width="24" height={alto - 8} fill="#7c7872" />
                <rect x={x} y={y} width={ancho} height="8" fill="#e4dfd6" />
              </g>
            );
          })}
          {Array.from({ length: 8 }, (_, i) => (
            <rect key={i} x={x + 16 + i * 24} y={tope - 14} width="3" height="14" fill="#6d6248" />
          ))}
        </g>
      )}

      {grua && (
        <g fill="#2c3330" stroke="#2c3330" strokeWidth="3">
          <line x1="486" y1="312" x2="486" y2="78" />
          <line x1="430" y1="92" x2="548" y2="118" />
          <line x1="360" y1="86" x2="360" y2="168" strokeDasharray="2 4" />
          <rect x="480" y="304" width="16" height="10" fill="#2c3330" stroke="none" />
        </g>
      )}

      {mixer && (
        <g>
          <rect x="132" y="292" width="46" height="22" fill="#d8d2c6" />
          <circle cx="144" cy="316" r="5" fill="#2c3330" />
          <circle cx="166" cy="316" r="5" fill="#2c3330" />
        </g>
      )}

      <rect width="640" height="400" filter={`url(#${filtro})`} opacity="0.28" />
    </svg>
  );
}
