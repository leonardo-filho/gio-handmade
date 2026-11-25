"use client";

import { useEffect, useRef, useState } from "react";
import { useCart } from "@/components/cart/CartProvider";
import type { Produto } from "@/data/produtos";

// Adicionar ao carrinho sem cara de formulário: um fio de contorno com um "+"
// desenhado. Ao adicionar, o "+" gira e vira um visto por um instante; o aviso
// "no carrinho" do rodapé (CartToast) faz o resto.
//
//   linha:   pílula de contorno com o texto (cartão do celular)
//   redondo: só o "+" num círculo de 44 px (linha do índice no desktop)

type Props = {
  produto: Produto;
  variante?: "linha" | "redondo";
  className?: string;
};

export default function BotaoAdicionar({ produto, variante = "linha", className = "" }: Props) {
  const { add } = useCart();
  const [feito, setFeito] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  function adicionar(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    add({
      id: produto.id,
      nome: produto.nome,
      preco: produto.preco,
      foto: produto.foto,
      categoria: produto.categoria,
    });
    setFeito(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setFeito(false), 1600);
  }

  const icone = (
    <span aria-hidden className="relative block h-3.5 w-3.5">
      {/* "+" de dois fios, que gira e some quando vira o visto */}
      <span
        className={`absolute inset-0 transition-[opacity,rotate] duration-300 motion-reduce:transition-none ${
          feito ? "rotate-90 opacity-0" : "rotate-0 opacity-100"
        }`}
      >
        <span className="absolute left-0 top-1/2 h-px w-full -translate-y-1/2 bg-current" />
        <span className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-current" />
      </span>
      <svg
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.4}
        className={`absolute inset-0 h-full w-full transition-opacity duration-300 motion-reduce:transition-none ${
          feito ? "opacity-100" : "opacity-0"
        }`}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.5 8.5 6.2 12 13.5 4" />
      </svg>
    </span>
  );

  if (variante === "redondo") {
    return (
      <button
        type="button"
        onClick={adicionar}
        aria-label={feito ? `${produto.nome} no carrinho` : `Adicionar ao carrinho: ${produto.nome}`}
        className={`inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#b8902a] focus-visible:ring-offset-2 focus-visible:ring-offset-[#EDE7D9] ${
          feito
            ? "border-[#1B4965] bg-[#1B4965] text-[#EDE7D9]"
            : "border-[#1B4965]/45 text-[#1B4965] hover:border-[#1B4965] hover:bg-[#1B4965] hover:text-[#EDE7D9]"
        } ${className}`}
      >
        {icone}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={adicionar}
      className={`group/add inline-flex min-h-11 items-center gap-2.5 rounded-full border px-4 text-[11px] uppercase tracking-[0.2em] transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#b8902a] focus-visible:ring-offset-2 focus-visible:ring-offset-[#EDE7D9] ${
        feito
          ? "border-[#1B4965] bg-[#1B4965] text-[#EDE7D9]"
          : "border-[#1B4965]/50 text-[#1B4965] hover:border-[#1B4965] hover:bg-[#1B4965] hover:text-[#EDE7D9]"
      } ${className}`}
    >
      {icone}
      <span>{feito ? "No carrinho" : "Adicionar"}</span>
      <span className="sr-only">{feito ? "" : `: ${produto.nome}`}</span>
    </button>
  );
}
