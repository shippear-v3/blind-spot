import type { Metadata } from "next";
import { CargarFoto } from "@/components/CargarFoto";

export const metadata: Metadata = {
  title: "Cargar foto",
};

export default function Page() {
  return <CargarFoto />;
}
