"use client";

import Image from "next/image";

export type ChamadaCapa = { rotulo: string; detalhe: string; acao: () => void };

// Capa da revista: a foto de campanha em preto e branco sangra a tela. O fundo
// da foto é o mesmo creme da marca, então ela se funde à página. Título em
// escala de capa e chamadas que levam direto às seções.
export default function Capa({ chamadas, total }: { chamadas: ChamadaCapa[]; total: number }) {
  return (
    <section
      aria-labelledby="capa-titulo"
      className="relative isolate overflow-hidden bg-[#EDE7D9]"
      // Quase a tela toda (sobra uma fresta do sumário, que avisa que tem mais).
      style={{ height: "clamp(560px, calc(100svh - var(--header-h-topo, 102px) - 36px), 980px)" }}
    >
      <Image
        src="/brilho-tropical.jpg"
        alt="Modelo deitada usando peça de correntes e cristais feita à mão, em foto preto e branco"
        fill
        priority
        sizes="100vw"
        className="-z-10 object-cover object-[58%_22%] lg:object-[100%_38%]"
      />
      {/* Véu creme: embaixo no celular e à esquerda no desktop, onde fica o texto. */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[linear-gradient(to_top,#EDE7D9_0%,#EDE7D9_30%,rgba(237,231,217,0.75)_44%,rgba(237,231,217,0)_62%)] lg:bg-[linear-gradient(to_right,#EDE7D9_0%,#EDE7D9_26%,rgba(237,231,217,0.6)_42%,rgba(237,231,217,0)_56%)]"
      />

      <div className="mx-auto flex h-full max-w-[1320px] flex-col justify-between px-4 pb-5 pt-3 lg:px-10 lg:pb-12 lg:pt-8">
        {/* Fio de capa, como o topo de uma revista. */}
        <div className="flex items-center justify-between border-b border-[#1B4965]/30 pb-2 text-[11px] font-bold uppercase tracking-[0.28em] text-[#1B4965]">
          <span>
            A loja<span className="hidden sm:inline"> · Edição de verão</span>
          </span>
          <span>Belém · PA</span>
        </div>

        <div className="max-w-[680px]">
          <h1
            id="capa-titulo"
            className="font-serif text-[clamp(3.6rem,17vw,9.5rem)] font-normal leading-[0.84] tracking-[-0.035em] text-[#1B4965]"
          >
            Bordado
            <br />
            à mão,
            <br />
            <em className="font-normal">um a um.</em>
          </h1>

          {/* Chamadas de capa: atalhos para as seções. */}
          <ul className="mt-5 border-t border-[#1B4965]/30 lg:mt-8 lg:max-w-[460px]">
            {chamadas.map((c) => (
              <li key={c.rotulo} className="border-b border-[#1B4965]/30">
                <button
                  type="button"
                  onClick={c.acao}
                  className="group/ch flex min-h-11 w-full items-center justify-between gap-4 py-2 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1B4965] focus-visible:ring-offset-2 focus-visible:ring-offset-[#EDE7D9]"
                >
                  <span className="font-serif text-[19px] leading-tight text-[#1B4965] lg:text-[22px]">
                    {c.rotulo}
                    <span className="ml-2 text-[11px] font-sans uppercase not-italic tracking-[0.18em] text-brand-muted">
                      {c.detalhe}
                    </span>
                  </span>
                  <svg
                    className="h-3 w-6 shrink-0 text-[#1B4965] transition-transform duration-300 group-hover/ch:translate-x-1 motion-reduce:transition-none"
                    viewBox="0 0 22 10"
                    fill="none"
                    aria-hidden
                  >
                    <path d="M1 5H20M20 5L16 1M20 5L16 9" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                  </svg>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Leitor de tela: o tamanho da loja logo na capa. */}
      <p className="sr-only">{total} peças feitas à mão.</p>
    </section>
  );
}
