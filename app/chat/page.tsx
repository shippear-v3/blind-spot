import type { Metadata } from "next";
import { ChatPanel } from "@/components/ChatPanel";
import { Shell } from "@/components/Shell";

export const metadata: Metadata = {
  title: "Preguntale a tu obra",
};

export default function Page() {
  return (
    <Shell>
      <ChatPanel />
    </Shell>
  );
}
