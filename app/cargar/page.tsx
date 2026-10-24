import type { Metadata } from "next";
import { CargarFoto } from "@/components/CargarFoto";
import { Shell } from "@/components/Shell";

export const metadata: Metadata = {
  title: "Cargar foto",
};

export default function Page() {
  return (
    <Shell>
      <CargarFoto />
    </Shell>
  );
}
