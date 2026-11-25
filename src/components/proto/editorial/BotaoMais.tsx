"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useCart } from "@/components/cart/CartProvider";
import type { Produto } from "@/data/produtos";

// "+" redondo sobre a foto: adiciona a peça ao carrinho sem abrir o detalhe.
// O retorno é o próprio botão (vira um check por um instante) e o aviso
// "no carrinho" do rodapé, que o carrinho já mostra a cada peça adicionada.
// No desktop, ao passar o mouse, o botão abre e mostra "Adicionar".
export default function BotaoMais({
  produto,
  className = "",
  escuro = false,
}: {
  produto: Produto;
  className?: string;
  /** Sobre fundo navy (faixa de pronta entrega). */
  escuro?: boolean;
}) {
  const { add } = useCart();
  const [feito, setFeito] = useState(0);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  function adicionar(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    add({ id: produto.id, nome: produto.nome, preco: produto.preco, foto: produto.foto, categoria: produto.categoria });
    setFeito((n) => n + 1);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setFeito(0), 1600);
  }

  const ok = feito > 0;
  const cores = ok
    ? "bg-[#1B4965] text-[#EDE7D9] ring-[#EDE7D9]/30"
    : escuro
      ? "bg-[#EDE7D9] text-[#1B4965] ring-[#130209]/10 hover:bg-white"
      : "bg-[#EDE7D9]/92 text-[#1B4965] ring-[#1B4965]/10 hover:bg-[#1B4965] hover:text-[#EDE7D9]";

  return (
    <button
      type="button"
      onClick={adicionar}
      aria-label={`Adicionar ao carrinho: ${produto.nome}`}
      className={`group/mais pointer-events-auto relative inline-flex h-11 min-w-11 items-center overflow-hidden rounded-full shadow-[0_6px_18px_-8px_rgba(19,2,9,0.55)] ring-1 backdrop-blur-sm transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1B4965] focus-visible:ring-offset-2 focus-visible:ring-offset-[#EDE7D9] ${cores} ${className}`}
    >
      <span className="relative flex h-11 w-11 shrink-0 items-center justify-center">
        <AnimatePresence initial={false} mode="popLayout">
          {ok ? (
            <motion.svg
              key={`ok-${feito}`}
              initial={{ scale: 0.4, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.4, opacity: 0 }}
              transition={{ type: "spring", bounce: 0.45, duration: 0.45 }}
              className="h-[18px] w-[18px]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.2}
              aria-hidden
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M20 6 9 17l-5-5" />
            </motion.svg>
          ) : (
            <motion.svg
              key="mais"
              initial={{ scale: 0.4, opacity: 0, rotate: -90 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              exit={{ scale: 0.4, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="h-[18px] w-[18px]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.6}
              aria-hidden
            >
              <path strokeLinecap="round" d="M12 5v14M5 12h14" />
            </motion.svg>
          )}
        </AnimatePresence>
      </span>
      {/* Rótulo que abre no hover (só com mouse; no toque fica o círculo). */}
      <span
        aria-hidden
        className="max-w-0 whitespace-nowrap text-[11px] font-bold uppercase tracking-[0.16em] opacity-0 transition-[max-width,opacity,padding] duration-300 ease-out motion-reduce:transition-none [@media(hover:hover)]:group-hover/mais:max-w-[9rem] [@media(hover:hover)]:group-hover/mais:pr-4 [@media(hover:hover)]:group-hover/mais:opacity-100"
      >
        {ok ? "No carrinho" : "Adicionar"}
      </span>
    </button>
  );
}
