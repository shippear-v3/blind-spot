import type { Metadata } from "next";
import { Suspense } from "react";
import { connection } from "next/server";
import { ChatPanel } from "@/components/ChatPanel";
import { Shell } from "@/components/Shell";
import { listarObservaciones } from "@/lib/store";

export const metadata: Metadata = {
  title: "Preguntale a tu obra",
};

async function Contenido() {
  await connection();
  const fotos = await listarObservaciones();
  return <ChatPanel fotos={fotos} />;
}

export default function Page() {
  return (
    <Shell>
      <Suspense fallback={<p className="font-mono text-sm text-pendiente">Cargando el chat…</p>}>
        <Contenido />
      </Suspense>
    </Shell>
  );
}
