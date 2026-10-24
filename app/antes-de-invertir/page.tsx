import type { Metadata } from "next";
import { Fichas } from "@/components/Fichas";
import { Shell } from "@/components/Shell";

export const metadata: Metadata = {
  title: "Antes de invertir",
};

export default function Page() {
  return (
    <Shell>
      <Fichas />
    </Shell>
  );
}
