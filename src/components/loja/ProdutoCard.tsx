"use client";

import Image from "next/image";
import AddToCartButton from "../cart/AddToCartButton";
import { formatBRLPreco } from "@/lib/format";
import { labelParcelamento, parcelamentoCartao } from "@/lib/parcelas";
import type { Produto } from "@/data/produtos";

// Grade da vitrine: 2 colunas no celular e no tablet, 4 a partir de 1024 px,
// dentro de max-w-6xl (1152 px) com px-4. O card mede 262 px no teto.
const SIZES = "(min-width: 1152px) 262px, (min-width: 1024px) 23vw, calc(50vw - 30px)";

const TRANSICAO_FOTO =
  "object-cover transition-[transform,opacity] duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04]";

type Props = {
  produto: Produto;
  /** Abre a peça (o modal e a URL ficam com a vitrine). */
  onAbrir: (id: string) => void;
  /** Primeira ocorrência da peça na página: recebe o id usado pelo link #<id>. */
  ancora?: boolean;
  /** Foto na primeira tela: carrega na hora e com prioridade alta. */
  prioridade?: boolean;
};

export default function ProdutoCard({ produto, onAbrir, ancora = true, prioridade = false }: Props) {
  const parcelamento = parcelamentoCartao(produto);
  const abrir = () => onAbrir(produto.id);

  const prazo = produto.prontaEntrega
    ? "Envio imediato"
    : produto.producao
      ? `${produto.producao} de confecção`
      : null;

  return (
    <div
      id={ancora ? produto.id : undefined}
      data-produto={produto.id}
      className="group flex h-full scroll-mt-[150px] flex-col"
    >
      {/* Foto: abre a peça no clique e no toque, mas fica fora da ordem de Tab
          (o nome logo abaixo é o mesmo atalho, e já é um botão focável). */}
      <button
        type="button"
        onClick={abrir}
        tabIndex={-1}
        aria-hidden
        className="block w-full cursor-pointer focus:outline-none"
      >
        <div className="relative aspect-[3/4] w-full overflow-hidden bg-white">
          <Image
            src={produto.foto}
            alt={produto.nome}
            fill
            sizes={SIZES}
            loading={prioridade ? "eager" : undefined}
            fetchPriority={prioridade ? "high" : undefined}
            className={`${TRANSICAO_FOTO} ${produto.fotoHover ? "group-hover:opacity-0" : ""}`}
          />
          {/* Foto de hover: some em tela de toque, onde nunca apareceria,
              e assim nem é baixada (imagem lazy com display none). */}
          {produto.fotoHover && (
            <Image
              src={produto.fotoHover}
              alt=""
              fill
              sizes={SIZES}
              className={`${TRANSICAO_FOTO} hidden opacity-0 group-hover:opacity-100 [@media(hover:hover)]:block`}
            />
          )}
          {produto.prontaEntrega && (
            <span className="absolute left-2 top-2 z-10 bg-[#1B4965] px-2 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-[#EDE7D9]">
              Pronta entrega
            </span>
          )}
          {produto.tamanho && (
            <span className="absolute right-2 top-2 z-10 bg-[#EDE7D9] px-2 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-[#1B4965]">
              {produto.tamanho}
            </span>
          )}
        </div>
      </button>

      <div className="mt-3 flex flex-1 flex-col text-center sm:mt-4">
        <h3 className="font-[family-name:var(--font-serif)] text-lg leading-snug text-[#1B4965] transition-colors group-hover:text-brand-gold-text md:text-xl">
          <button
            type="button"
            onClick={abrir}
            className="cursor-pointer rounded-sm text-balance focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1B4965] focus-visible:ring-offset-2"
          >
            {produto.nome}
          </button>
        </h3>
        {produto.tamanho && <p className="sr-only">Tamanho {produto.tamanho}</p>}

        {/* Ordem decidida: valor no cartão, parcelas, pix e prazo. */}
        <div className="mt-1.5">
          <p className="flex flex-col items-center sm:flex-row sm:flex-wrap sm:items-baseline sm:justify-center sm:gap-x-1.5">
            <span className="nums-preco font-[family-name:var(--font-serif)] text-xl font-semibold leading-tight text-[#1B4965] md:text-[22px]">
              {formatBRLPreco(parcelamento.total)}
            </span>
            <span className="whitespace-nowrap text-xs text-brand-muted">
              {labelParcelamento(parcelamento)}
            </span>
          </p>
          <p className="mt-0.5 text-xs text-brand-muted">ou {formatBRLPreco(produto.preco)} no pix</p>
          {prazo && <p className="mt-0.5 text-balance text-xs text-brand-muted">{prazo}</p>}
        </div>

        {/* Ações fixadas na base do card (mt-auto alinha entre si) */}
        <div className="mt-auto flex flex-col items-center gap-1.5 pt-3 sm:pt-4">
          <AddToCartButton
            className="w-full"
            label="Adicionar ao carrinho"
            labelCurto="Adicionar"
            item={{
              id: produto.id,
              nome: produto.nome,
              preco: produto.preco,
              foto: produto.foto,
              categoria: produto.categoria,
            }}
          />
          {/* Atalho discreto no desktop; no celular a foto e o nome já abrem a peça. */}
          <button
            type="button"
            onClick={abrir}
            tabIndex={-1}
            className="hidden cursor-pointer py-1 text-xs text-brand-muted underline decoration-[#1B4965]/25 underline-offset-4 transition-colors hover:text-[#1B4965] hover:decoration-current sm:inline-block"
          >
            Ver detalhes
          </button>
        </div>
      </div>
    </div>
  );
}
