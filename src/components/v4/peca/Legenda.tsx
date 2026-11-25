import type { ReactNode } from "react";

// Legenda de prancha, como num lookbook impresso: o numeral, o título em
// itálico e, à direita, o contador ou as setas da prancha.
export default function Legenda({
  numeral,
  titulo,
  seta = false,
  className = "px-4 lg:px-1.5",
  children,
}: {
  numeral: string;
  titulo: string;
  /** Seta logo depois do título (quando a legenda está dentro de um link). */
  seta?: boolean;
  className?: string;
  children?: ReactNode;
}) {
  return (
    <div className={`flex h-11 shrink-0 items-center justify-between gap-4 ${className}`}>
      <p className="flex items-baseline gap-3 text-[#1B4965]">
        <span className="nums-preco w-6 font-serif text-[13px] tracking-[0.08em] text-brand-muted">{numeral}</span>
        <span className="font-serif text-[17px] italic leading-none">{titulo}</span>
        {seta && (
          <span aria-hidden className="text-[15px] leading-none transition-transform duration-200 group-hover:translate-x-1 motion-reduce:transition-none">
            →
          </span>
        )}
      </p>
      {children}
    </div>
  );
}
