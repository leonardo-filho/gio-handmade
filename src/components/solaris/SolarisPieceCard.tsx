"use client";

import { useState } from "react";
import Image from "next/image";
import { AnimatePresence } from "framer-motion";
import ProdutoModal from "../loja/ProdutoModal";
import { formatBRLCurto } from "@/lib/format";
import type { Produto } from "@/data/produtos";

// Card das peças da Coleção Solaris na home (seção creme/navy).
// Clicar abre o mesmo modal de detalhes usado na loja.
export default function SolarisPieceCard({ produto }: { produto: Produto }) {
  const [aberto, setAberto] = useState(false);
  const abrir = () => setAberto(true);
  const tipo = produto.nome.startsWith("Headpiece") ? "Headpiece" : "Top";

  return (
    <div className="group flex h-full w-full flex-col">
      <button
        type="button"
        onClick={abrir}
        aria-label={`Ver detalhes de ${produto.nome}`}
        className="block w-full cursor-pointer rounded-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1B4965] focus-visible:ring-offset-2 focus-visible:ring-offset-[#EDE7D9]"
      >
        <div className="relative aspect-[3/4] w-full overflow-hidden bg-[#f7efdc]">
          <Image
            src={produto.foto}
            alt={produto.nome}
            fill
            sizes="(min-width: 1024px) 280px, (min-width: 640px) 30vw, 45vw"
            className={`object-cover transition-[transform,opacity] duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04] ${
              produto.fotoHover ? "group-hover:opacity-0" : ""
            }`}
          />
          {produto.fotoHover && (
            <Image
              src={produto.fotoHover}
              alt=""
              fill
              sizes="(min-width: 1024px) 280px, (min-width: 640px) 30vw, 45vw"
              className="object-cover opacity-0 transition-[transform,opacity] duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04] group-hover:opacity-100"
            />
          )}
        </div>
      </button>

      <div className="mt-4 text-center">
        <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-[#b8902a]">
          Solaris · {tipo}
        </p>
        <button
          type="button"
          onClick={abrir}
          className="cursor-pointer rounded-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1B4965]"
        >
          <h3 className="mt-2 font-[family-name:var(--font-serif)] text-xl text-[#1B4965] transition-colors group-hover:text-[#b8902a]">
            {produto.nome}
          </h3>
        </button>
        <p className="mt-1 font-[family-name:var(--font-serif)] text-lg font-medium tabular-nums text-[#1B4965]">
          {formatBRLCurto(produto.preco)}
          <span className="ml-1 text-[11px] font-normal text-[#1B4965]/50">no pix</span>
        </p>
      </div>

      <AnimatePresence>
        {aberto && <ProdutoModal produto={produto} onClose={() => setAberto(false)} />}
      </AnimatePresence>
    </div>
  );
}
