"use client";

import { useEffect, useState } from "react";
import { cupons, cupomValido } from "@/lib/cupons";

// Letreiro de anúncio no topo do site — divulga frete grátis e o cupom ativo.
// O texto "roda" em loop contínuo (marquee). Em prefers-reduced-motion, fica
// estático e centralizado.

const FRETE = "Frete grátis em compras acima de R$ 600";

export default function AnnouncementBar() {
  // A mensagem do cupom só entra se houver um cupom no prazo. A checagem é feita
  // após o mount (evita divergência de SSR e some sozinha quando o cupom expira).
  const [mensagens, setMensagens] = useState<string[]>([FRETE]);

  useEffect(() => {
    const ativo = cupons.find((c) => cupomValido(c));
    if (ativo) {
      const desconto = ativo.descricao ?? `${ativo.percentual}% OFF`;
      setMensagens([FRETE, `Use o cupom ${ativo.codigo}: ${desconto}`]);
    }
  }, []);

  // Repete as mensagens para preencher a largura e garantir loop sem emendas.
  const items = Array.from({ length: 4 }).flatMap(() => mensagens);

  return (
    <div className="w-full overflow-hidden bg-[#1B4965] text-[#EDE7D9]">
      <div className="marquee flex w-max">
        {[0, 1].map((track) => (
          <div
            key={track}
            aria-hidden={track === 1}
            className="flex shrink-0 items-center"
          >
            {items.map((mensagem, i) => (
              <span
                key={i}
                className="flex items-center whitespace-nowrap px-5 py-1.5 text-[11px] font-bold uppercase tracking-[0.28em] md:text-xs"
              >
                {mensagem}
                <span aria-hidden className="ml-5 text-[#C8E1E4]">
                  ✦
                </span>
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
