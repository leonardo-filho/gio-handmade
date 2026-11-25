"use client";

import { useEffect, useState, type PointerEvent } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useCart } from "./CartProvider";

// Aviso de peça adicionada: barra no rodapé com a miniatura, "{nome} no
// carrinho" e o atalho "Ver carrinho". O carrinho continua sem abrir sozinho
// (decisão registrada no CartProvider); o aviso é só o convite.
//
// Fica à esquerda do botão flutuante do WhatsApp (right-4, 56 px) no celular
// e centralizado do sm para cima, sem cobrir esse botão. Fica abaixo do modal
// da peça (z-95) e do carrinho (z-90): adicionando pelo modal, o aviso aparece
// assim que o modal fecha.

// Tempo na tela. Um pouco acima de 4 s porque, pelo modal da peça, os
// primeiros 700 ms ficam atrás do modal que está fechando.
const DURACAO_MS = 4500;
const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;

export default function CartToast() {
  const reduce = useReducedMotion();
  const { ultimoAdicionado, isOpen, open, dispensarAviso } = useCart();

  // Pausa enquanto o mouse está em cima ou o foco está dentro (quem navega
  // pelo teclado não perde o botão no meio do caminho). Guarda a `vez` do
  // aviso pausado: um aviso novo nunca nasce pausado.
  const [pausadoNaVez, setPausadoNaVez] = useState<number | null>(null);

  const vez = ultimoAdicionado?.vez ?? null;
  const pausado = vez !== null && pausadoNaVez === vez;
  const visivel = ultimoAdicionado !== null && !isOpen;

  useEffect(() => {
    if (vez === null || pausado) return;
    const timer = window.setTimeout(() => dispensarAviso(vez), DURACAO_MS);
    return () => window.clearTimeout(timer);
  }, [vez, pausado, dispensarAviso]);

  const pausar = () => setPausadoNaVez(vez);
  const retomar = () => setPausadoNaVez(null);
  const soMouse = (fn: () => void) => (e: PointerEvent) => {
    if (e.pointerType === "mouse") fn();
  };

  return (
    // A região viva existe sempre (vazia quando não há aviso), para o leitor
    // de tela anunciar cada peça adicionada, inclusive a mesma de novo.
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 bottom-0 z-[80] flex pb-[max(1rem,env(safe-area-inset-bottom))] pl-4 pr-[84px] sm:justify-center sm:px-4"
    >
      <AnimatePresence>
        {visivel && ultimoAdicionado && (
          <motion.div
            key="aviso-carrinho"
            initial={reduce ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? { opacity: 0, transition: { duration: 0 } } : { opacity: 0, y: 12 }}
            transition={{ duration: reduce ? 0 : 0.35, ease: EASE_OUT_EXPO }}
            onPointerEnter={soMouse(pausar)}
            onPointerLeave={soMouse(retomar)}
            onFocus={pausar}
            onBlur={(e) => {
              if (!e.currentTarget.contains(e.relatedTarget as Node | null)) retomar();
            }}
            className="pointer-events-auto flex min-h-14 w-full max-w-sm items-center gap-3 rounded-sm bg-[#1B4965] py-1.5 pl-1.5 pr-1.5 text-[#EDE7D9] shadow-lg shadow-[#130209]/25 ring-1 ring-[#EDE7D9]/15"
          >
            {/* key = vez: a mesma peça adicionada de novo entra como conteúdo novo */}
            <div key={ultimoAdicionado.vez} className="flex min-w-0 flex-1 items-center gap-3">
              <div className="relative h-12 w-9 shrink-0 overflow-hidden rounded-[2px] bg-white">
                <Image src={ultimoAdicionado.foto} alt="" fill sizes="36px" className="object-cover" />
              </div>
              <p className="min-w-0 flex-1 leading-tight">
                <span className="block truncate font-[family-name:var(--font-serif)] text-base">
                  {ultimoAdicionado.nome}
                </span>{" "}
                <span className="mt-0.5 flex items-center gap-1 whitespace-nowrap text-xs tracking-[0.04em] text-[#EDE7D9]/85">
                  <svg className="h-3 w-3 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20 6 9 17l-5-5" />
                  </svg>
                  no carrinho
                </span>
              </p>
            </div>
            <button
              type="button"
              onClick={open}
              className="h-11 shrink-0 rounded-sm bg-[#EDE7D9] px-3 text-[11px] font-bold uppercase tracking-[0.12em] text-[#1B4965] transition-colors hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#EDE7D9] focus-visible:ring-offset-2 focus-visible:ring-offset-[#1B4965]"
            >
              Ver carrinho
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
