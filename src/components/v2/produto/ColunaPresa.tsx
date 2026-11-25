"use client";

import { useEffect, useRef, type ReactNode } from "react";

// Coluna de compra que acompanha a galeria no computador (lg). Se ela cabe na
// tela, fica presa logo abaixo do cabeçalho; se é mais alta que a tela, rola
// junto até o fim dela aparecer e só então fica presa (top negativo). Abaixo
// do lg, é uma coluna comum. A conta roda no observador de tamanho, fora do
// render, e escreve direto no estilo (sem estado).
const TOPO = 100;
const FOLGA = 24;

export default function ColunaPresa({ children, className = "" }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ajustar = () => {
      const top = Math.min(TOPO, window.innerHeight - el.offsetHeight - FOLGA);
      el.style.top = `${top}px`;
    };
    const observador = new ResizeObserver(ajustar);
    observador.observe(el);
    window.addEventListener("resize", ajustar);
    return () => {
      observador.disconnect();
      window.removeEventListener("resize", ajustar);
    };
  }, []);

  return (
    <div ref={ref} className={`lg:sticky lg:top-[100px] lg:self-start ${className}`}>
      {children}
    </div>
  );
}
