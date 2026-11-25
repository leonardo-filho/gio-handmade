"use client";

import Lupa from "./Lupa";
import Preco from "./Preco";
import BotaoAdicionar from "./BotaoAdicionar";
import { notaDoAtelie, numeroDaPeca, rotuloCategoria } from "./dados";
import type { Produto } from "@/data/produtos";

// Cartão do celular e do tablet (abaixo de 1024 px): foto alta numa coluna,
// alternando o lado a cada peça. Na faixa estreita ao lado da foto fica a
// etiqueta do ateliê: o número da peça, um ponto de costura e a categoria.
//
// A foto abre a peça num toque curto e vira lupa quando a pessoa toca e
// segura (ou pelo botão do canto).

// A coluna tem até 560 px; a foto ocupa 80% dela.
const SIZES = "(min-width: 640px) 448px, calc(80vw - 26px)";

type Props = {
  produto: Produto;
  /** Posição na lista: os pares têm a foto à esquerda, os ímpares à direita. */
  ordem: number;
  prioridade?: boolean;
  dica?: boolean;
  onAbrir: (id: string) => void;
};

export default function CartaoPeca({ produto, ordem, prioridade = false, dica = false, onAbrir }: Props) {
  const esquerda = ordem % 2 === 0;
  const numero = String(numeroDaPeca.get(produto.id) ?? 0).padStart(2, "0");
  const abrir = () => onAbrir(produto.id);

  return (
    <article data-produto={produto.id} className="scroll-mt-[160px]">
      <div className={`flex items-stretch gap-3 ${esquerda ? "" : "flex-row-reverse"}`}>
        <Lupa
          src={produto.foto}
          alt={produto.nome}
          nome={produto.nome}
          sizes={SIZES}
          posicao="50% 32%"
          prioridade={prioridade}
          onAbrir={abrir}
          dica={dica}
          cantoBotao={esquerda ? "direita" : "esquerda"}
          className="aspect-[4/5] w-[80%] shrink-0"
        />

        {/* Etiqueta: número, costura e categoria */}
        <div
          aria-hidden
          className={`flex min-w-0 flex-1 flex-col items-center pb-1 pt-0.5 ${esquerda ? "" : ""}`}
        >
          <span className="text-[9px] uppercase tracking-[0.3em] text-brand-gold-text">Nº</span>
          <span className="nums-preco font-[family-name:var(--font-serif)] text-[30px] leading-none text-[#1B4965]">
            {numero}
          </span>
          <span className="my-3 w-px flex-1 border-l border-dashed border-[#b8902a]/70" />
          <span className="whitespace-nowrap text-[10px] uppercase tracking-[0.32em] text-brand-muted [writing-mode:vertical-rl] rotate-180">
            {rotuloCategoria(produto)}
          </span>
        </div>
      </div>

      <div className={`mt-4 w-[80%] ${esquerda ? "" : "ml-auto text-right"}`}>
        {produto.prontaEntrega && (
          <p
            className={`mb-1.5 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-[#1B4965] ${
              esquerda ? "" : "justify-end"
            }`}
          >
            <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-[#b8902a]" />
            Pronta entrega
          </p>
        )}
        <h3 className="font-[family-name:var(--font-serif)] text-[30px] leading-[1.05] text-[#1B4965]">
          <button
            type="button"
            data-abrir
            onClick={abrir}
            className="-my-1.5 rounded-sm py-1.5 text-balance [text-align:inherit] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1B4965] focus-visible:ring-offset-4 focus-visible:ring-offset-[#EDE7D9]"
          >
            {produto.nome}
          </button>
        </h3>
        <p className="nums-preco mt-1.5 line-clamp-2 font-[family-name:var(--font-serif)] text-[15px] italic leading-snug text-brand-muted">
          {notaDoAtelie(produto)}
        </p>
        <Preco produto={produto} alinhar={esquerda ? "esquerda" : "direita"} className="mt-3" />
        <BotaoAdicionar produto={produto} className="mt-4" />
      </div>
    </article>
  );
}
