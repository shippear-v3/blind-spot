"use client";

import { MessageSquare } from "lucide-react";
import { proyecto } from "@/lib/datos";
import { fechaLarga } from "@/lib/fechas";
import { useChat } from "./Shell";

export function TopBar() {
  const chat = useChat();

  return (
    <header className="sticky top-0 z-20 flex h-14 items-center justify-between gap-4 border-b border-line bg-bg/85 px-4 backdrop-blur sm:px-8">
      <p className="min-w-0 truncate text-sm">
        <span className="font-medium">{proyecto.obra}</span>
        <span className="text-muted"> / {proyecto.unidad.split(",")[0]}</span>
      </p>
      <div className="flex shrink-0 items-center gap-3">
        <p className="hidden text-xs text-muted tabular-nums sm:block">
          Al {fechaLarga(proyecto.fecha_demo)}
        </p>
        {!chat.abierto && (
          <button
            type="button"
            onClick={chat.alternar}
            className="inline-flex h-8 items-center gap-2 rounded-md border border-line bg-surface px-3 text-sm font-medium hover:bg-subtle"
          >
            <MessageSquare className="size-4" aria-hidden="true" />
            Consultar
          </button>
        )}
      </div>
    </header>
  );
}
