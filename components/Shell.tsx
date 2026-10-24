"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { ChatPanel } from "./ChatPanel";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";

type ChatContexto = { abierto: boolean; alternar: () => void; cerrar: () => void };

const ChatCtx = createContext<ChatContexto | null>(null);

export function useChat() {
  const ctx = useContext(ChatCtx);
  if (!ctx) throw new Error("useChat fuera de Shell");
  return ctx;
}

export function Shell({ children }: { children: ReactNode }) {
  const [expandido, setExpandido] = useState(false);
  const [chatAbierto, setChatAbierto] = useState(false);

  useEffect(() => {
    if (!chatAbierto && !expandido) return;
    function onKey(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      setChatAbierto(false);
      setExpandido(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [chatAbierto, expandido]);

  const chat: ChatContexto = {
    abierto: chatAbierto,
    alternar: () => setChatAbierto((v) => !v),
    cerrar: () => setChatAbierto(false),
  };

  return (
    <ChatCtx.Provider value={chat}>
      <Sidebar expandido={expandido} onAlternar={() => setExpandido((v) => !v)} />
      <div
        className={`flex min-h-screen pl-14 transition-[padding] duration-200 ${expandido ? "md:pl-56" : ""}`}
      >
        <div className="flex min-w-0 flex-1 flex-col">
          <TopBar />
          <main id="contenido" className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-8">
            {children}
          </main>
          <footer className="border-t border-line px-4 py-4 text-center text-xs text-muted sm:px-8">
            Obra, constructora y esquemas ficticios. No es asesoramiento legal ni financiero.
          </footer>
        </div>
        <ChatPanel />
      </div>
    </ChatCtx.Provider>
  );
}
