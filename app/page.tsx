import { Suspense } from "react";
import { connection } from "next/server";
import { Inversion } from "@/components/Inversion";
import { Shell } from "@/components/Shell";
import { listarObservaciones } from "@/lib/store";

async function Contenido() {
  await connection();
  const fotos = await listarObservaciones();
  return <Inversion fotos={fotos} />;
}

export default function Page() {
  return (
    <Shell>
      <Suspense fallback={<p className="font-mono text-sm text-pendiente">Cargando la obra…</p>}>
        <Contenido />
      </Suspense>
    </Shell>
  );
}
