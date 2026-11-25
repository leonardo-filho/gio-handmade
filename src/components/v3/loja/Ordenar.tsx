"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ORDENS, hrefLoja, type Ordem } from "./vistas";

// Select nativo de ordem. O que se vê é a caixa de 32 px com o texto em 12 px,
// caixa alta; por cima dela, o select de verdade, transparente, com 44 px de
// altura (a área de toque) e fonte de 16 px (abaixo disso o iPhone dá zoom na
// página ao tocar). A ordem vai para a URL (?ordem=) e a grade vem pronta do
// servidor.
export default function Ordenar({ ordem, ver }: { ordem: Ordem; ver: string | null }) {
  // key: se a URL mudar por fora (voltar do navegador), a caixa segue a URL.
  return <Caixa key={ordem} ordem={ordem} ver={ver} />;
}

function Caixa({ ordem, ver }: { ordem: Ordem; ver: string | null }) {
  const router = useRouter();
  const [, iniciar] = useTransition();
  const [valor, setValor] = useState(ordem);
  const rotulo = ORDENS.find((o) => o.id === valor)?.rotulo ?? ORDENS[0].rotulo;

  return (
    <div className="relative flex h-11 shrink-0 items-center">
      <label htmlFor="ordenar-pecas" className="sr-only">
        Ordenar peças
      </label>
      <select
        id="ordenar-pecas"
        value={valor}
        onChange={(e) => {
          const nova = e.target.value as Ordem;
          setValor(nova);
          iniciar(() => router.replace(hrefLoja(ver, nova), { scroll: false }));
        }}
        className="peer absolute inset-0 h-11 w-full cursor-pointer appearance-none text-[16px] opacity-0"
      >
        {ORDENS.map((o) => (
          <option key={o.id} value={o.id}>
            {o.rotulo}
          </option>
        ))}
      </select>
      <span
        aria-hidden
        className="pointer-events-none flex h-8 items-center gap-3 rounded border border-[#1B4965]/40 pl-3 pr-2.5 text-[12px] uppercase tracking-[0.12em] text-[#1B4965] peer-hover:opacity-70 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[#b8902a] motion-safe:transition-opacity motion-safe:duration-200"
      >
        {rotulo}
        <svg viewBox="0 0 12 12" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth={1.2}>
          <path d="M2.5 4.5 6 8l3.5-3.5" />
        </svg>
      </span>
    </div>
  );
}
