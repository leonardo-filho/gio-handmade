"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { isolarFundo, prenderTab, travarRolagem } from "@/lib/travaRolagem";

type Props = {
  fotos: string[];
  nome: string;
  /** Foto que abre primeiro. */
  inicial: number;
  /** Fecha devolvendo a foto em que a pessoa parou. */
  onFechar: (indice: number) => void;
};

const movimentoReduzido = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Lightbox da galeria: fundo de tinta a 95%, foto inteira (sem corte), troca
// com o dedo (encaixe nativo) ou pelas setas e pelo teclado, contador "1 / 5"
// em creme. A pinça é a do próprio navegador. Abre com fade de 0,2 s.
// Só é montada depois de um toque, então o portal no body é seguro.
export default function Lightbox({ fotos, nome, inicial, onFechar }: Props) {
  const [indice, setIndice] = useState(inicial);
  const indiceRef = useRef(inicial);
  const painelRef = useRef<HTMLDivElement>(null);
  const trilhoRef = useRef<HTMLDivElement>(null);
  const fecharRef = useRef<HTMLButtonElement>(null);
  const total = fotos.length;

  // Abre na foto certa, trava a rolagem da página e deixa o fundo inerte.
  useEffect(() => {
    const trilho = trilhoRef.current;
    if (trilho) trilho.scrollLeft = inicial * trilho.clientWidth;
    const liberarRolagem = travarRolagem();
    const liberarFundo = isolarFundo();
    fecharRef.current?.focus();
    // O foco volta para a foto em que a pessoa parou (quem faz é a galeria).
    return () => {
      liberarFundo();
      liberarRolagem();
    };
  }, [inicial]);

  function ir(i: number) {
    const trilho = trilhoRef.current;
    if (!trilho) return;
    const alvo = Math.max(0, Math.min(total - 1, i));
    trilho.scrollTo({ left: alvo * trilho.clientWidth, behavior: movimentoReduzido() ? "auto" : "smooth" });
    indiceRef.current = alvo;
    setIndice(alvo);
  }

  function aoRolar() {
    const trilho = trilhoRef.current;
    if (!trilho || trilho.clientWidth === 0) return;
    const i = Math.round(trilho.scrollLeft / trilho.clientWidth);
    indiceRef.current = i;
    if (i !== indice) setIndice(i);
  }

  const fechar = () => onFechar(indiceRef.current);

  return createPortal(
    <div
      ref={painelRef}
      role="dialog"
      aria-modal="true"
      aria-label={`Fotos de ${nome}`}
      // Focável por script: um clique na foto deixa o foco no painel (e não no
      // body), então o Esc, as setas e o Tab preso continuam valendo.
      tabIndex={-1}
      onKeyDown={(e) => {
        if (e.key === "Escape") fechar();
        else if (e.key === "ArrowRight") ir(indice + 1);
        else if (e.key === "ArrowLeft") ir(indice - 1);
        else prenderTab(e, painelRef.current);
      }}
      className="fixed inset-0 z-[100] bg-[#130209]/95 opacity-100 outline-none transition-opacity duration-200 starting:opacity-0 motion-reduce:transition-none"
    >
      <div
        ref={trilhoRef}
        onScroll={aoRolar}
        className="flex h-full snap-x snap-mandatory overflow-x-auto overscroll-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {fotos.map((f, i) => (
          <div key={f} className="relative h-full w-full shrink-0 snap-center snap-always px-0 py-14 lg:px-20">
            <div className="relative h-full w-full">
              <Image
                src={f}
                alt={total > 1 ? `${nome}, foto ${i + 1} de ${total}` : nome}
                fill
                sizes="100vw"
                loading={Math.abs(i - inicial) <= 1 ? "eager" : "lazy"}
                className="object-contain"
              />
            </div>
          </div>
        ))}
      </div>

      <p
        aria-live="polite"
        className="nums-preco pointer-events-none absolute left-4 top-0 flex h-14 items-center text-[12px] tracking-[0.12em] text-[#EDE7D9]"
      >
        {indice + 1} / {total}
      </p>
      <button
        ref={fecharRef}
        type="button"
        onClick={fechar}
        aria-label="Fechar fotos"
        className="absolute right-1.5 top-1.5 flex h-11 w-11 items-center justify-center text-[#EDE7D9] transition-opacity duration-200 hover:opacity-70 focus-visible:outline-2 focus-visible:outline-[#b8902a] motion-reduce:transition-none"
      >
        <svg
          aria-hidden
          viewBox="0 0 24 24"
          className="h-[22px] w-[22px]"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.4}
        >
          <path d="M5 5l14 14M19 5 5 19" />
        </svg>
      </button>

      {total > 1 && (
        <>
          <button
            type="button"
            onClick={() => ir(indice - 1)}
            aria-disabled={indice === 0 || undefined}
            aria-label="Foto anterior"
            className="absolute left-3 top-1/2 hidden h-11 w-11 -translate-y-1/2 items-center justify-center text-[#EDE7D9] transition-opacity duration-200 hover:opacity-70 focus-visible:outline-2 focus-visible:outline-[#b8902a] aria-disabled:opacity-25 motion-reduce:transition-none lg:flex"
          >
            <svg
              aria-hidden
              viewBox="0 0 24 24"
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.4}
            >
              <path d="M15 5 8 12l7 7" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => ir(indice + 1)}
            aria-disabled={indice === total - 1 || undefined}
            aria-label="Próxima foto"
            className="absolute right-3 top-1/2 hidden h-11 w-11 -translate-y-1/2 items-center justify-center text-[#EDE7D9] transition-opacity duration-200 hover:opacity-70 focus-visible:outline-2 focus-visible:outline-[#b8902a] aria-disabled:opacity-25 motion-reduce:transition-none lg:flex"
          >
            <svg
              aria-hidden
              viewBox="0 0 24 24"
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.4}
            >
              <path d="m9 5 7 7-7 7" />
            </svg>
          </button>
        </>
      )}
    </div>,
    document.body,
  );
}
