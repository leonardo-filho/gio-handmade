"use client";

// Folha de filtro do celular: sobe da base com as vistas da loja, cada uma
// com a foto da primeira peça e a contagem. Trava a rolagem, isola o fundo e
// prende o Tab enquanto está aberta; fecha no fundo, no X e no Esc.

import { useEffect, useEffectEvent, useId, useRef, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { motion } from "framer-motion";
import { isolarFundo, prenderTab, travarRolagem } from "@/lib/travaRolagem";
import { EASE_OUT_EXPO, IconeCheck } from "./comum";

export type OpcaoFiltro = { id: string; rotulo: string; n: number; foto: string };

type Props = {
  opcoes: OpcaoFiltro[];
  ativo: string;
  onEscolher: (id: string) => void;
  onFechar: () => void;
};

const semAssinatura = () => () => {};

export default function FolhaFiltro(props: Props) {
  const noNavegador = useSyncExternalStore(semAssinatura, () => true, () => false);
  if (!noNavegador) return null;
  return createPortal(<Folha {...props} />, document.body);
}

function Folha({ opcoes, ativo, onEscolher, onFechar }: Props) {
  const tituloId = useId();
  const painelRef = useRef<HTMLDivElement>(null);
  const ativoRef = useRef<HTMLButtonElement>(null);

  const aoTeclar = useEffectEvent((e: KeyboardEvent) => {
    if (e.key === "Escape") onFechar();
  });

  useEffect(() => {
    const anterior = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const liberarRolagem = travarRolagem();
    const liberarFundo = isolarFundo();
    ativoRef.current?.focus({ preventScroll: true });
    const onKey = (e: KeyboardEvent) => aoTeclar(e);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      liberarFundo();
      liberarRolagem();
      if (anterior?.isConnected) anterior.focus({ preventScroll: true });
    };
  }, []);

  return (
    <motion.div
      className="fixed inset-0 z-[90] flex items-end justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <button
        type="button"
        tabIndex={-1}
        aria-label="Fechar filtro"
        onClick={onFechar}
        className="absolute inset-0 cursor-default bg-[#130209]/60 backdrop-blur-sm"
      />
      <motion.div
        ref={painelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={tituloId}
        data-lenis-prevent
        onKeyDown={(e) => prenderTab(e, painelRef.current)}
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ duration: 0.4, ease: EASE_OUT_EXPO }}
        className="relative max-h-[85dvh] w-full max-w-lg overflow-y-auto overscroll-contain rounded-t-3xl bg-[#1d0f14] px-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-3 text-[#EDE7D9] shadow-2xl"
      >
        <div aria-hidden className="mx-auto h-1 w-10 rounded-full bg-[#EDE7D9]/25" />
        <div className="mt-3 flex items-center justify-between pl-2">
          <h2 id={tituloId} className="font-[family-name:var(--font-serif)] text-2xl">
            O que você quer ver?
          </h2>
          <button
            type="button"
            onClick={onFechar}
            aria-label="Fechar"
            className="flex h-11 w-11 items-center justify-center rounded-full text-[#EDE7D9]/85 transition-colors hover:bg-[#EDE7D9]/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#EDE7D9]"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <ul className="mt-2 space-y-1">
          {opcoes.map((o) => {
            const on = o.id === ativo;
            return (
              <li key={o.id}>
                <button
                  ref={on ? ativoRef : undefined}
                  type="button"
                  aria-pressed={on}
                  onClick={() => onEscolher(o.id)}
                  className={`flex min-h-16 w-full items-center gap-3.5 rounded-2xl px-2 py-2 text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#EDE7D9] ${
                    on ? "bg-[#EDE7D9]/10" : "hover:bg-[#EDE7D9]/5"
                  }`}
                >
                  <span className="relative h-14 w-11 shrink-0 overflow-hidden rounded-md bg-[#130209]">
                    <Image src={o.foto} alt="" fill sizes="44px" className="object-cover" />
                  </span>
                  <span
                    className={`flex-1 ${
                      o.id === "colecao-solaris"
                        ? "font-joliet text-[26px] leading-none text-[#f1d68c]"
                        : "font-[family-name:var(--font-serif)] text-[19px]"
                    }`}
                  >
                    {o.rotulo}
                  </span>
                  <span className="nums-preco text-[12px] font-bold tracking-[0.12em] text-[#EDE7D9]/75">{o.n}</span>
                  <span className={`flex h-6 w-6 items-center justify-center ${on ? "text-[#d2ad55]" : "text-transparent"}`}>
                    <IconeCheck className="h-5 w-5" />
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </motion.div>
    </motion.div>
  );
}
