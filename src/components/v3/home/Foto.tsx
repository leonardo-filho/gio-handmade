"use client";

import { useState } from "react";
import Image from "next/image";

type Props = {
  src: string;
  alt: string;
  sizes: string;
  /** object-position da foto dentro da moldura (e a origem do zoom). */
  foco?: string;
  /** Aproxima a foto dentro da moldura; o `sizes` já deve vir multiplicado. */
  zoom?: number;
  /** Foto da primeira tela: carrega antes de tudo e aparece sem fade. */
  prioridade?: boolean;
};

// Foto que preenche a moldura (o pai é `relative` e dá a proporção). Enquanto
// carrega, fica o fundo navy a 5%, parado; ao carregar, a foto entra num fade
// de 0,2 s (instantâneo com movimento reduzido). A foto prioritária aparece
// direto, para não atrasar a primeira pintura.
export default function Foto({ src, alt, sizes, foco = "50% 50%", zoom = 1, prioridade = false }: Props) {
  const [carregou, setCarregou] = useState(prioridade);

  return (
    <div className="absolute inset-0 overflow-hidden bg-[#1B4965]/5">
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        loading={prioridade ? "eager" : "lazy"}
        fetchPriority={prioridade ? "high" : "auto"}
        onLoad={() => setCarregou(true)}
        className={`object-cover transition-opacity duration-200 ease-out motion-reduce:transition-none ${
          carregou ? "opacity-100" : "opacity-0"
        }`}
        style={zoom === 1 ? { objectPosition: foco } : { objectPosition: foco, transform: `scale(${zoom})`, transformOrigin: foco }}
      />
    </div>
  );
}
