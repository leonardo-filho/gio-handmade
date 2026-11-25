"use client";

import { useRef, type CSSProperties, type ReactNode } from "react";
import { useRevelar } from "@/components/vitrine/revelar";
import m from "./home.module.css";

// Bloco que se revela ao entrar na tela (o mesmo observador da /loja). Os
// filhos escolhem como entram com as classes do home.module.css: sobe
// (título por máscara), surge, cortina, respira, costura e assina.
export default function Revela({
  children,
  className = "",
  style,
  id,
}: {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  id?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useRevelar(ref);
  return (
    <div ref={ref} id={id} style={style} className={`${m.revela} ${className}`}>
      {children}
    </div>
  );
}
