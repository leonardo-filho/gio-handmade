"use client";

// Grade: o quadro de looks do backstage. Miniaturas pequenas, numeradas na
// ordem do desfile, com nome e preço. Tocar numa peça leva ao desfile já nela.

import { useEffect } from "react";
import Image from "next/image";
import type { Produto } from "@/data/produtos";
import { contagemPecas } from "@/components/loja/vistas";
import { rolarAte } from "@/lib/travaRolagem";
import { doisDigitos, precoDe } from "./comum";

const SIZES = "(min-width: 1280px) 190px, (min-width: 1024px) 15vw, (min-width: 768px) 24vw, 33vw";

export type BlocoGrade = { slug: string; titulo: string; itens: Produto[] };

type Props = {
  titulo: string;
  blocos: BlocoGrade[];
  /** Posição de cada peça no desfile desta vista (para o número do look). */
  numero: Map<string, number>;
  /** Peça em que o desfile estava: marcada e trazida para a tela. */
  destaque: string | null;
  onAbrir: (id: string) => void;
};

export default function GradeLookbook({ titulo, blocos, numero, destaque, onAbrir }: Props) {
  const total = numero.size;

  // Ao chegar do desfile, a peça em que a cliente estava fica à vista.
  useEffect(() => {
    if (!destaque) return;
    const el = document.querySelector<HTMLElement>(`[data-grade-look="${CSS.escape(destaque)}"]`);
    if (!el) return;
    const r = el.getBoundingClientRect();
    if (r.bottom > window.innerHeight - 24) {
      const quadro = requestAnimationFrame(() =>
        rolarAte(r.top + window.scrollY - window.innerHeight / 2 + r.height / 2, true)
      );
      return () => cancelAnimationFrame(quadro);
    }
  }, [destaque]);

  return (
    <div className="mx-auto max-w-7xl px-3 pb-20 pt-7 sm:px-5 lg:px-8 lg:pt-10">
      <div className="flex flex-col items-center text-center">
        <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-[#d2ad55]">Quadro de looks</p>
        <h2 className="mt-2 font-[family-name:var(--font-serif)] text-[34px] leading-tight text-[#EDE7D9] lg:text-5xl">
          {titulo}
        </h2>
        <p className="mt-2 text-[13px] text-[#EDE7D9]/75">
          {contagemPecas(total)}. Toque numa peça para vê-la no desfile.
        </p>
      </div>

      <div className="mt-8 space-y-12 lg:mt-12 lg:space-y-16">
        {blocos.map((b) => (
          <section key={b.slug} aria-label={b.titulo}>
            {blocos.length > 1 && (
              <div className="mb-4 flex items-center gap-3 px-1 lg:mb-6">
                <h3
                  className={`shrink-0 text-[#EDE7D9] ${
                    b.slug === "colecao-solaris"
                      ? "font-joliet text-[28px] leading-none text-[#f1d68c] lg:text-[34px]"
                      : "font-[family-name:var(--font-serif)] text-2xl lg:text-3xl"
                  }`}
                >
                  {b.slug === "colecao-solaris" ? "Solaris" : b.titulo}
                </h3>
                <span className="nums-preco shrink-0 text-[11px] font-bold uppercase tracking-[0.2em] text-[#EDE7D9]/70">
                  {b.itens.length}
                </span>
                <span aria-hidden className="h-px flex-1 bg-[#EDE7D9]/15" />
              </div>
            )}
            <ul className="grid grid-cols-3 gap-x-2 gap-y-6 md:grid-cols-4 lg:grid-cols-6 lg:gap-x-5 lg:gap-y-10">
              {b.itens.map((p) => (
                <li key={p.id}>
                  <CelulaLook
                    produto={p}
                    numero={numero.get(p.id) ?? 0}
                    marcada={p.id === destaque}
                    onAbrir={onAbrir}
                  />
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}

function CelulaLook({
  produto,
  numero,
  marcada,
  onAbrir,
}: {
  produto: Produto;
  numero: number;
  marcada: boolean;
  onAbrir: (id: string) => void;
}) {
  const preco = precoDe(produto);
  return (
    <button
      type="button"
      data-grade-look={produto.id}
      onClick={() => onAbrir(produto.id)}
      className="group block w-full rounded-sm text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#EDE7D9] focus-visible:ring-offset-4 focus-visible:ring-offset-[#130209]"
    >
      <span
        className={`relative block aspect-[3/4] w-full overflow-hidden bg-[#1d0f14] ${
          marcada ? "ring-2 ring-[#d2ad55] ring-offset-2 ring-offset-[#130209]" : ""
        }`}
      >
        <Image
          src={produto.foto}
          alt=""
          fill
          sizes={SIZES}
          className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04]"
        />
      </span>
      <span className="mt-2 flex items-baseline gap-1.5">
        <span className="nums-preco shrink-0 text-[10px] font-bold tracking-[0.14em] text-[#d2ad55]">
          {doisDigitos(numero)}
        </span>
        <span className="line-clamp-2 font-[family-name:var(--font-serif)] text-[14px] leading-tight text-[#EDE7D9] lg:text-[17px]">
          {produto.nome}
        </span>
      </span>
      <span className="mt-1 block text-[#EDE7D9]">
        <span className="nums-preco font-[family-name:var(--font-serif)] text-[15px] font-medium lg:text-[17px]">
          {preco.cartao}
        </span>{" "}
        <span className="block text-[11px] leading-snug text-[#EDE7D9]/85 lg:inline">{preco.parcelas}</span>
      </span>
      <span className="block text-[11px] leading-snug text-[#EDE7D9]/75">ou {preco.pix} no pix</span>
      {produto.prontaEntrega && (
        <span className="mt-1 flex items-center gap-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[#C8E1E4]">
          <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-[#C8E1E4]" />
          Pronta entrega
        </span>
      )}
      <span className="sr-only">. Ver no desfile</span>
    </button>
  );
}
