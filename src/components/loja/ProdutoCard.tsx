"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence } from "framer-motion";
import AddToCartButton from "../cart/AddToCartButton";
import ProdutoModal from "./ProdutoModal";
import { formatBRLPreco } from "@/lib/format";
import { labelParcelamento, parcelamentoCartao } from "@/lib/parcelas";
import type { Produto } from "@/data/produtos";

export default function ProdutoCard({ produto }: { produto: Produto }) {
  const [aberto, setAberto] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const parcelamento = parcelamentoCartao(produto);

  // Sincroniza a URL ao abrir/fechar: cada peça ganha um link compartilhável
  // (/loja?produto=top-lourdes) que a Gio pode usar nos stories e na bio.
  const abrir = () => {
    setAberto(true);
    window.history.replaceState(null, "", `?produto=${produto.id}`);
  };
  const fechar = () => {
    setAberto(false);
    window.history.replaceState(null, "", window.location.pathname);
  };

  // Deep link: se a página abriu com ?produto=<id> (ou #<id>), posiciona na
  // peça na hora e abre o modal um instante depois — em dois tempos a chegada
  // fica suave (a pessoa vê o card e o modal entra animando por cima).
  useEffect(() => {
    const url = new URL(window.location.href);
    const alvo = url.searchParams.get("produto") ?? url.hash.replace(/^#/, "");
    if (alvo !== produto.id) return;
    cardRef.current?.scrollIntoView({ block: "center" });
    const timer = setTimeout(() => setAberto(true), 350);
    return () => clearTimeout(timer);
  }, [produto.id]);

  return (
    <div ref={cardRef} id={produto.id} className="group flex h-full scroll-mt-[150px] flex-col">
      {/* Foto (clique abre os detalhes) */}
      <button
        type="button"
        onClick={abrir}
        aria-label={`Ver detalhes de ${produto.nome}`}
        className="block w-full cursor-pointer rounded-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1B4965] focus-visible:ring-offset-2"
      >
        <div className="relative aspect-[3/4] w-full overflow-hidden bg-white">
          <Image
            src={produto.foto}
            alt={produto.nome}
            fill
            sizes="(min-width: 1024px) 280px, (min-width: 640px) 45vw, 90vw"
            className={`object-cover transition-[transform,opacity] duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04] ${
              produto.fotoHover ? "group-hover:opacity-0" : ""
            }`}
          />
          {produto.fotoHover && (
            <Image
              src={produto.fotoHover}
              alt=""
              fill
              sizes="(min-width: 1024px) 280px, (min-width: 640px) 45vw, 90vw"
              className="object-cover opacity-0 transition-[transform,opacity] duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04] group-hover:opacity-100"
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

      <div className="mt-4 flex flex-1 flex-col text-center">
        <button
          type="button"
          onClick={abrir}
          className="cursor-pointer rounded-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1B4965]"
        >
          <h3 className="font-[family-name:var(--font-serif)] text-xl text-[#1B4965] transition-colors group-hover:text-[#b8902a]">
            {produto.nome}
          </h3>
        </button>

        <div className="mt-2">
          <p className="font-[family-name:var(--font-serif)] text-lg font-medium tabular-nums text-[#1B4965]">
            {formatBRLPreco(parcelamento.total)}
            <span className="ml-1 text-[11px] font-normal text-[#1B4965]/50">
              {labelParcelamento(parcelamento)}
            </span>
          </p>
          <p className="mt-0.5 text-[11px] text-[#1B4965]/55">
            ou {formatBRLPreco(produto.preco)} no pix
          </p>
          {produto.producao && (
            <p className="mt-0.5 text-[11px] text-[#1B4965]/45">{produto.producao} de confecção</p>
          )}
        </div>

        {/* Ações fixadas na base do card (mt-auto alinha entre si) */}
        <div className="mt-auto flex flex-col items-center gap-2 pt-4">
          <AddToCartButton
            className="w-full"
            item={{
              id: produto.id,
              nome: produto.nome,
              preco: produto.preco,
              foto: produto.foto,
              categoria: produto.categoria,
            }}
          />
          <button
            type="button"
            onClick={abrir}
            className="text-[11px] font-medium uppercase tracking-[0.16em] text-[#1B4965]/55 underline-offset-4 transition-colors hover:text-[#1B4965] hover:underline"
          >
            Ver detalhes
          </button>
        </div>
      </div>

      <AnimatePresence>
        {aberto && <ProdutoModal produto={produto} onClose={fechar} />}
      </AnimatePresence>
    </div>
  );
}
