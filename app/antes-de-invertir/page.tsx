import type { Metadata } from "next";
import { Checklist } from "@/components/Checklist";

export const metadata: Metadata = {
  title: "Antes de invertir",
};

export default function Page() {
  return <Checklist />;
}
