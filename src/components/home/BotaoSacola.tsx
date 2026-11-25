"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useCart } from "@/components/cart/CartProvider";
import { itemDoCarrinho } from "@/components/vitrine/dados";
import type { Caixa } from "@/components/vitrine/movimento";
import { voarParaSacola } from "@/components/vitrine/voo";
import type { Produto } from "@/data/produtos";

// O mesmo "+" da sacola dos cartões da /loja: o ícone vira um check, uma
// cópia da foto voa até a sacola do header e a peça entra no carrinho no
// pouso. Fica 1,8 s no estado de pronto, sem aceitar toque repetido; depois,
// um selo dourado mostra quantas dessa peça já estão no carrinho.
export default function BotaoSacola({
  produto,
  origem,
  className = "",
}: {
  produto: Produto;
  /** Onde a foto está agora e qual imagem mostra (para o voo). */
  origem: () => { caixa: Caixa | null; src: string | null };
  className?: string;
}) {
  const { add, lines } = useCart();
  const [feito, setFeito] = useState(false);
  const qtd = lines.find((l) => l.id === produto.id)?.qty ?? 0;

  function adicionar(e: React.MouseEvent) {
    e.stopPropagation();
    if (feito) return;
    setFeito(true);
    const { caixa, src } = origem();
    voarParaSacola(caixa, src, () => add(itemDoCarrinho(produto)));
    window.setTimeout(() => setFeito(false), 1800);
  }

  return (
    <button
      type="button"
      data-sacola-peca=""
      onClick={adicionar}
      aria-label={`Adicionar ao carrinho: ${produto.nome}${qtd > 0 ? ` (${qtd} no carrinho)` : ""}`}
      className={`absolute z-10 flex h-11 w-11 cursor-pointer items-center justify-center rounded-full shadow-[0_6px_18px_-6px_rgba(19,2,9,0.45)] backdrop-blur-md transition-[background-color,color,transform] duration-300 active:scale-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#EDE7D9] focus-visible:ring-offset-2 focus-visible:ring-offset-[#1B4965] md:h-12 md:w-12 ${
        feito
          ? "bg-[#1B4965] text-[#EDE7D9]"
          : "bg-[#EDE7D9]/92 text-[#1B4965] hover:scale-105 hover:bg-[#1B4965] hover:text-[#EDE7D9]"
      } ${className}`}
    >
      <AnimatePresence mode="popLayout" initial={false}>
        {feito ? (
          <motion.svg
            key="ok"
            viewBox="0 0 24 24"
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden
            initial={{ scale: 0.3, rotate: -40, opacity: 0 }}
            animate={{ scale: 1, rotate: 0, opacity: 1 }}
            exit={{ scale: 0.3, opacity: 0 }}
            transition={{ type: "spring", stiffness: 520, damping: 26 }}
          >
            <motion.path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 12.5 10 17.5 19 7"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.35, delay: 0.08 }}
            />
          </motion.svg>
        ) : (
          <motion.svg
            key="sacola"
            viewBox="0 0 24 24"
            className="h-[22px] w-[22px]"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            aria-hidden
            initial={{ scale: 0.4, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.4, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5.5 8h13l-1 12.5h-11z" />
            <path strokeLinecap="round" d="M9 8V6.5a3 3 0 0 1 6 0V8" />
            <path strokeLinecap="round" d="M12 11.5v5M9.5 14h5" />
          </motion.svg>
        )}
      </AnimatePresence>
      <AnimatePresence initial={false}>
        {qtd > 0 && (
          <motion.span
            key="qtd"
            aria-hidden
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            transition={{ type: "spring", stiffness: 560, damping: 22 }}
            className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center overflow-hidden rounded-full bg-[#b8902a] px-1 text-[10.5px] font-bold leading-none tabular-nums text-[#130209] ring-2 ring-[#EDE7D9]"
          >
            <motion.span key={qtd} initial={{ y: 8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.25 }}>
              {qtd}
            </motion.span>
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
}
