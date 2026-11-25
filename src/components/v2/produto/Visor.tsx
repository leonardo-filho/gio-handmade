"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { isolarFundo, prenderTab, travarRolagem } from "@/lib/travaRolagem";
import { IconeFechar } from "@/components/v3/estrutura/Icones";

type Props = {
  fotos: string[];
  nome: string;
  inicial: number;
  aoFechar: (indice: number) => void;
};

// Visor editorial da galeria: tela cheia em creme, uma foto inteira por tela
// (sem corte), descendo com o dedo ou a roda do mouse, como uma revista. A
// legenda é mínima: o nome da peça e "2 / 5". Pinça nativa para aproximar.
// Esc fecha; as setas do teclado rolam (o foco fica na lista).
// Só monta depois de um toque, então o portal no body é seguro.
export default function Visor({ fotos, nome, inicial, aoFechar }: Props) {
  const [indice, setIndice] = useState(inicial);
  const indiceRef = useRef(inicial);
  const painelRef = useRef<HTMLDivElement>(null);
  const listaRef = useRef<HTMLDivElement>(null);
  const total = fotos.length;

  useEffect(() => {
    const lista = listaRef.current;
    if (lista) {
      lista.scrollTop = inicial * lista.clientHeight;
      lista.focus({ preventScroll: true });
    }
    const liberarRolagem = travarRolagem();
    const liberarFundo = isolarFundo();
    return () => {
      liberarFundo();
      liberarRolagem();
    };
  }, [inicial]);

  function aoRolar() {
    const lista = listaRef.current;
    if (!lista || lista.clientHeight === 0) return;
    const i = Math.min(total - 1, Math.round(lista.scrollTop / lista.clientHeight));
    indiceRef.current = i;
    if (i !== indice) setIndice(i);
  }

  const fechar = () => aoFechar(indiceRef.current);

  return createPortal(
    <div
      ref={painelRef}
      role="dialog"
      aria-modal="true"
      aria-label={`Fotos de ${nome}`}
      onKeyDown={(e) => {
        if (e.key === "Escape") fechar();
        else prenderTab(e, painelRef.current);
      }}
      className="fixed inset-0 z-[100] bg-[#EDE7D9] text-[#1B4965] opacity-100 transition-opacity duration-200 starting:opacity-0 motion-reduce:transition-none"
    >
      <div
        ref={listaRef}
        tabIndex={-1}
        onScroll={aoRolar}
        aria-label="Fotos, uma por tela"
        className="h-full snap-y snap-mandatory overflow-y-auto overscroll-contain outline-none [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {fotos.map((f, i) => (
          <figure key={f} className="relative flex h-[100svh] w-full snap-start snap-always flex-col pb-3 pt-14 md:px-16 md:pb-6">
            <div className="relative min-h-0 flex-1">
              <Image
                src={f}
                alt={total > 1 ? `${nome}, foto ${i + 1} de ${total}` : nome}
                fill
                sizes="100vw"
                loading={Math.abs(i - inicial) <= 1 ? "eager" : "lazy"}
                className="object-contain"
              />
            </div>
            <figcaption className="flex h-9 shrink-0 items-end justify-between px-4 text-[12px] leading-4 md:px-0">
              <span className="font-[family-name:var(--font-serif)] text-[15px] italic">{nome}</span>
              <span className="nums-preco tracking-[0.12em] text-brand-muted">
                {i + 1} / {total}
              </span>
            </figcaption>
          </figure>
        ))}
      </div>

      <p className="sr-only" aria-live="polite">
        Foto {indice + 1} de {total}
      </p>
      <button
        type="button"
        onClick={fechar}
        aria-label="Fechar fotos"
        className="absolute right-1.5 top-1.5 flex h-11 w-11 items-center justify-center rounded-[4px] transition-opacity duration-200 hover:opacity-70 focus-visible:outline-2 focus-visible:outline-[#b8902a] motion-reduce:transition-none"
      >
        <IconeFechar className="h-[22px] w-[22px]" />
      </button>
    </div>,
    document.body,
  );
}
