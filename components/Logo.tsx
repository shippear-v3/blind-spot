export function MarcaLogo({ className = "size-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden="true">
      <path d="M44 50 L86 26 A44 44 0 0 1 86 74 Z" className="fill-marron" />
      <circle cx="50" cy="50" r="44" fill="none" strokeWidth="8" className="stroke-fg" />
      <circle cx="40" cy="50" r="8" className="fill-fg" />
    </svg>
  );
}

export function Logotipo({ className = "" }: { className?: string }) {
  return (
    <span className={`font-display text-lg font-bold leading-none tracking-tight ${className}`}>
      Blind <span className="text-marron">Spot</span>
    </span>
  );
}
