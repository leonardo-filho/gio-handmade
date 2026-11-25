"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useScroll, useSpring } from "framer-motion";
import { TOTAL_PECAS, VISTAS } from "@/components/loja/vistas";
import { OPCOES_ORDENACAO, SPRING_PILULA, type Ordenacao } from "./animacoes";
import { useReduzirMovimento } from "./useReduzirMovimento";

export type ChipFiltro = {
  id: string;
  rotulo: string;
  contagem: number;
};

const CHIPS: ChipFiltro[] = [
  { id: "todas", rotulo: "Todas", contagem: TOTAL_PECAS },
  ...VISTAS.map((v) => ({
    id: v.slug,
    rotulo: v.chip,
    contagem: v.itens.length,
  })),
];

type Props = {
  ativo: string;
  onEscolher: (id: string) => void;
  ordem: Ordenacao;
  onOrdenar: (ordem: Ordenacao) => void;
};

export default function BarraFiltros({ ativo, onEscolher, ordem, onOrdenar }: Props) {
  const reduzir = useReduzirMovimento();
  const [menuAberto, setMenuAberto] = useState(false);
  const trilhaRef = useRef<HTMLDivElement>(null);
  const menuWrapRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll();
  const progresso = useSpring(scrollYProgress, {
    stiffness: 280,
    damping: 32,
    restDelta: 0.001,
  });

  // Mantem o chip ativo visivel na rolagem horizontal do celular.
  useEffect(() => {
    const trilha = trilhaRef.current;
    if (!trilha) return;
    const botao = trilha.querySelector<HTMLElement>(`[data-chip="${CSS.escape(ativo)}"]`);
    if (!botao) return;
    const alvoLeft = botao.offsetLeft - trilha.clientWidth / 2 + botao.clientWidth / 2;
    trilha.scrollTo({
      left: Math.max(0, alvoLeft),
      behavior: reduzir ? "auto" : "smooth",
    });
  }, [ativo, reduzir]);

  // Fecha o popover de ordenacao ao clicar fora ou apertar Esc.
  useEffect(() => {
    if (!menuAberto) return;
    const aoClicarFora = (e: PointerEvent) => {
      const alvo = e.target as Node | null;
      if (menuWrapRef.current && alvo && !menuWrapRef.current.contains(alvo)) {
        setMenuAberto(false);
      }
    };
    const aoTeclar = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuAberto(false);
    };
    document.addEventListener("pointerdown", aoClicarFora);
    window.addEventListener("keydown", aoTeclar);
    return () => {
      document.removeEventListener("pointerdown", aoClicarFora);
      window.removeEventListener("keydown", aoTeclar);
    };
  }, [menuAberto]);

  const opcaoAtiva = OPCOES_ORDENACAO.find((o) => o.id === ordem) ?? OPCOES_ORDENACAO[0];

  return (
    <div
      data-loja-nav=""
      className="sticky top-[var(--header-h,102px)] z-40 border-y border-[#1B4965]/12 bg-[#EDE7D9]/95 backdrop-blur-md"
    >
      <div className="mx-auto flex max-w-6xl items-center">
        {/* Chips com rolagem horizontal e mascara suave na borda direita */}
        <nav
          ref={trilhaRef}
          aria-label="Filtrar peças por categoria"
          className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto py-1.5 pl-3 pr-7 [mask-image:linear-gradient(to_right,#000_0%,#000_calc(100%-28px),transparent_100%)] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:gap-1.5 md:pl-4 md:pr-8"
        >
          {CHIPS.map((chip) => {
            const selecionado = chip.id === ativo;
            const ehPronta = chip.id === "pronta-entrega";
            return (
              <button
                key={chip.id}
                type="button"
                data-chip={chip.id}
                onClick={() => onEscolher(chip.id)}
                aria-pressed={selecionado}
                className={`relative inline-flex min-h-11 shrink-0 cursor-pointer items-center gap-1.5 rounded-full px-3.5 text-[11px] font-medium uppercase tracking-[0.14em] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1B4965] focus-visible:ring-offset-2 focus-visible:ring-offset-[#EDE7D9] ${
                  selecionado
                    ? "text-[#EDE7D9]"
                    : "text-[#1B4965] hover:bg-[#1B4965]/[0.06]"
                }`}
              >
                {selecionado && (
                  <motion.span
                    layoutId="pilula-filtro-b"
                    transition={reduzir ? { duration: 0 } : SPRING_PILULA}
                    className="absolute inset-0 rounded-full bg-[#1B4965] shadow-sm"
                  />
                )}
                {ehPronta && (
                  <span
                    aria-hidden
                    className={`relative z-10 h-1.5 w-1.5 rounded-full ${
                      selecionado ? "bg-[#b8902a]" : "bg-[#b8902a]"
                    }`}
                  />
                )}
                <span className="relative z-10 whitespace-nowrap">{chip.rotulo}</span>
                <span
                  className={`relative z-10 text-[10px] tabular-nums ${
                    selecionado ? "text-[#C8E1E4]" : "text-brand-muted"
                  }`}
                >
                  {chip.contagem}
                </span>
              </button>
            );
          })}
        </nav>

        {/* Seletor de ordenacao por preco */}
        <div
          ref={menuWrapRef}
          className="relative shrink-0 border-l border-[#1B4965]/12 pl-1.5 pr-2.5 md:pl-2.5 md:pr-4"
        >
          <button
            type="button"
            onClick={() => setMenuAberto((v) => !v)}
            aria-expanded={menuAberto}
            aria-haspopup="listbox"
            aria-label={`Ordenar peças: ${opcaoAtiva.rotulo}`}
            className="inline-flex min-h-11 cursor-pointer items-center gap-1.5 rounded-full px-2.5 text-[11px] font-medium uppercase tracking-[0.13em] text-[#1B4965] transition-colors hover:bg-[#1B4965]/[0.06] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1B4965]"
          >
            <svg
              className="h-4 w-4 shrink-0"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.7}
              aria-hidden
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 7h11M3 12h7M3 17h4" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 6v12m0 0-3-3m3 3 3-3" />
            </svg>
            <span className="hidden sm:inline">{opcaoAtiva.curto}</span>
            {ordem !== "curadoria" && (
              <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-[#b8902a]" />
            )}
          </button>

          <AnimatePresence>
            {menuAberto && (
              <motion.ul
                role="listbox"
                aria-label="Ordenação das peças"
                initial={reduzir ? { opacity: 0 } : { opacity: 0, y: -6, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={reduzir ? { opacity: 0 } : { opacity: 0, y: -4, scale: 0.96 }}
                transition={{ duration: reduzir ? 0 : 0.18 }}
                className="absolute right-2.5 top-[calc(100%+6px)] z-50 w-44 overflow-hidden rounded-lg border border-[#1B4965]/15 bg-[#EDE7D9] p-1 shadow-xl shadow-[#130209]/15 md:right-4"
              >
                {OPCOES_ORDENACAO.map((op) => {
                  const ativa = op.id === ordem;
                  return (
                    <li key={op.id} role="option" aria-selected={ativa}>
                      <button
                        type="button"
                        onClick={() => {
                          onOrdenar(op.id);
                          setMenuAberto(false);
                        }}
                        className={`flex min-h-11 w-full cursor-pointer items-center justify-between rounded-md px-3 text-left text-xs transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1B4965] ${
                          ativa
                            ? "bg-[#1B4965] font-semibold text-[#EDE7D9]"
                            : "text-[#1B4965] hover:bg-[#1B4965]/8"
                        }`}
                      >
                        <span>{op.rotulo}</span>
                        {ativa && (
                          <svg
                            className="h-3.5 w-3.5 shrink-0"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={2.2}
                            aria-hidden
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M20 6 9 17l-5-5" />
                          </svg>
                        )}
                      </button>
                    </li>
                  );
                })}
              </motion.ul>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Fio dourado de progresso sempre presente no DOM para manter SSR igual */}
      <motion.div
        aria-hidden
        suppressHydrationWarning
        style={{ scaleX: progresso }}
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[1.5px] origin-left bg-[#b8902a]/80 motion-reduce:hidden"
      />
    </div>
  );
}
