export function Bloque({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2 border-t border-line px-5 py-4">
      <h3 className="text-xs font-medium uppercase tracking-wide text-pizarra">{titulo}</h3>
      {children}
    </div>
  );
}
