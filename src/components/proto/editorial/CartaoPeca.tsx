"use client";

import FotosPeca from "./FotosPeca";
import BotaoMais from "./BotaoMais";
import { fotosDaPeca, resumo, temModelo } from "./plano";
import { formatBRLPreco } from "@/lib/format";
import { labelParcelamento, parcelamentoCartao } from "@/lib/parcelas";
import type { Produto } from "@/data/produtos";

// Card editorial: a foto domina, nome e preço numa linha em serif, parcelas e
// pix pequenos embaixo. O "+" sobre a foto adiciona; a foto e o nome abrem.
//
// Grade: 2 colunas no celular (px-4, gap 12) e 4 no desktop dentro de 1320 px
// (px-10, gap 24). Normal: 312 px no teto. Destaque e dupla: 2 colunas no
// desktop e a largura da tela no celular.
const SIZES_NORMAL = "(min-width: 1400px) 312px, (min-width: 1024px) calc(25vw - 38px), calc(50vw - 22px)";
const SIZES_GRANDE = "(min-width: 1400px) 648px, (min-width: 1024px) calc(50vw - 52px), 100vw";

export type Variante = "normal" | "destaque" | "dupla";

export default function CartaoPeca({
  produto,
  variante = "normal",
  fotoInicial = 0,
  sangra = true,
  marcarPronta = true,
  onAbrir,
  prioridade = false,
}: {
  produto: Produto;
  variante?: Variante;
  fotoInicial?: number;
  /** Grande no celular: a foto vai de ponta a ponta da tela. */
  sangra?: boolean;
  marcarPronta?: boolean;
  onAbrir: (id: string) => void;
  prioridade?: boolean;
}) {
  const parcelamento = parcelamentoCartao(produto);
  const abrir = () => onAbrir(produto.id);
  const grande = variante !== "normal";
  const fotos = fotosDaPeca(produto, fotoInicial);

  // Foto: 3:4 no card normal; grande, 4:5 sangrando no celular. O destaque, no
  // desktop, ocupa a altura das duas linhas ao lado (a primeira linha da grade
  // do card estica).
  const bordaCelular = grande && sangra ? "-mx-4 sm:mx-0" : "";
  const formaFoto =
    variante === "destaque"
      ? `aspect-[4/5] lg:aspect-auto lg:h-full lg:min-h-[420px] ${bordaCelular}`
      : variante === "dupla"
        ? `aspect-[4/5] lg:aspect-[3/4] ${bordaCelular}`
        : "aspect-[3/4]";

  return (
    // Grade de uma coluna: a foto e o "+" dividem a primeira linha. O "+" vem
    // depois do nome no DOM, então o Tab passa primeiro pelo nome.
    <article
      data-produto={produto.id}
      className={`group grid h-full grid-cols-1 ${
        variante === "destaque" ? "grid-rows-[auto_auto] lg:grid-rows-[minmax(0,1fr)_auto]" : "grid-rows-[auto_1fr]"
      }`}
    >
      <div className={`relative col-start-1 row-start-1 ${formaFoto}`}>
        <FotosPeca
          fotos={fotos}
          nome={produto.nome}
          sizes={grande ? SIZES_GRANDE : SIZES_NORMAL}
          onAbrir={abrir}
          prioridade={prioridade}
          // Foto de modelo no card grande: corta embaixo, nunca o rosto.
          foco={grande && temModelo(produto.id) ? "50% 6%" : undefined}
        />
      </div>

      <div className={`col-start-1 row-start-2 flex flex-col ${grande ? "mt-4 lg:mt-5" : "mt-3"}`}>
        {/* Nome e preço: uma linha (no card pequeno do celular, o preço desce). */}
        <div
          className={`flex items-baseline justify-between gap-x-3 ${grande ? "" : "flex-col gap-y-1 sm:flex-row"}`}
        >
          <h3
            className={`min-w-0 text-balance font-serif leading-[1.15] text-[#1B4965] ${
              grande ? "text-[26px] lg:text-[34px]" : "text-[17px] lg:text-[19px]"
            }`}
          >
            <button
              type="button"
              onClick={abrir}
              className="cursor-pointer rounded-sm text-left decoration-[#1B4965]/40 underline-offset-[5px] hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1B4965] focus-visible:ring-offset-2 focus-visible:ring-offset-[#EDE7D9]"
            >
              {produto.nome}
            </button>
          </h3>
          <p
            className={`nums-preco shrink-0 whitespace-nowrap font-serif font-medium leading-none text-[#1B4965] ${
              grande ? "text-[22px] lg:text-[28px]" : "text-[17px] lg:text-[18px]"
            }`}
          >
            {formatBRLPreco(parcelamento.total)}
          </p>
        </div>
        {produto.tamanho && <p className="sr-only">Tamanho {produto.tamanho}</p>}

        <p className={`mt-1 leading-snug text-brand-muted ${grande ? "text-[13px] lg:text-sm" : "text-xs"}`}>
          <span className={grande ? "" : "block lg:inline"}>{labelParcelamento(parcelamento)}</span>
          <span aria-hidden className={grande ? "" : "hidden lg:inline"}>
            {" · "}
          </span>
          <span className={grande ? "" : "block lg:inline"}>ou {formatBRLPreco(produto.preco)} no pix</span>
        </p>

        {grande && (
          <p className="mt-3 max-w-[34rem] font-serif text-[17px] italic leading-snug text-[#1B4965]/85 lg:text-lg">
            {resumo(produto)}
          </p>
        )}

        {/* Pronta entrega: no fim da legenda, para os nomes ficarem alinhados. */}
        {produto.prontaEntrega && marcarPronta && (
          <p className="mt-2 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-brand-gold-text">
            <span aria-hidden className="h-1.5 w-1.5 shrink-0 rotate-45 bg-[#b8902a]" />
            Pronta entrega
          </p>
        )}
      </div>

      <div className="pointer-events-none z-10 col-start-1 row-start-1 self-end justify-self-end p-2.5 lg:p-3">
        <BotaoMais produto={produto} />
      </div>
    </article>
  );
}
