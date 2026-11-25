"use client";

import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { formatBRLPreco } from "@/lib/format";
import { labelParcelamento, parcelamentoCartao } from "@/lib/parcelas";
import type { Produto } from "@/data/produtos";
import { EASE_ATELIER, SPRING_BOTAO, fotosDoProduto } from "./animacoes";
import { useReduzirMovimento } from "./useReduzirMovimento";

const SIZES = "(min-width: 1280px) 270px, (min-width: 768px) 31vw, calc(50vw - 24px)";

type Props = {
  produto: Produto;
  onAbrir: (id: string) => void;
  onAdicionar: (produto: Produto, origemEl: HTMLElement | null) => void;
  qtdNoCarrinho: number;
  prioridade?: boolean;
  imediato?: boolean;
  indiceNaGrade: number;
};

export default function CartaoPecaB({
  produto,
  onAbrir,
  onAdicionar,
  qtdNoCarrinho,
  prioridade = false,
  imediato = false,
  indiceNaGrade,
}: Props) {
  const reduzir = useReduzirMovimento();
  const fotos = fotosDoProduto(produto);
  const [fotoIdx, setFotoIdx] = useState(0);
  const [recemAdicionado, setRecemAdicionado] = useState(false);

  const fotoCaixaRef = useRef<HTMLDivElement>(null);
  const gestoRef = useRef<{ x: number; y: number } | null>(null);
  const suprimirCliqueRef = useRef(false);
  const timerAdicionadoRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    return () => clearTimeout(timerAdicionadoRef.current);
  }, []);

  const parcelamento = parcelamentoCartao(produto);
  const fotoAtual = fotos[fotoIdx] ?? produto.foto;
  const mostrarHoverDesktop = Boolean(produto.fotoHover) && fotoIdx === 0;

  function aoDescerPonteiro(e: ReactPointerEvent<HTMLDivElement>) {
    if (fotos.length <= 1 || e.pointerType === "mouse") return;
    gestoRef.current = { x: e.clientX, y: e.clientY };
    suprimirCliqueRef.current = false;
  }

  function aoSoltarPonteiro(e: ReactPointerEvent<HTMLDivElement>) {
    const inicio = gestoRef.current;
    gestoRef.current = null;
    if (!inicio || fotos.length <= 1) return;
    const dx = e.clientX - inicio.x;
    const dy = e.clientY - inicio.y;
    if (Math.abs(dx) > 34 && Math.abs(dx) > Math.abs(dy) * 1.15) {
      suprimirCliqueRef.current = true;
      setFotoIdx((atual) =>
        dx < 0 ? (atual + 1) % fotos.length : (atual - 1 + fotos.length) % fotos.length
      );
    }
  }

  function clicarFoto() {
    if (suprimirCliqueRef.current) {
      suprimirCliqueRef.current = false;
      return;
    }
    onAbrir(produto.id);
  }

  function clicarAdicionar() {
    onAdicionar(produto, fotoCaixaRef.current);
    setRecemAdicionado(true);
    clearTimeout(timerAdicionadoRef.current);
    timerAdicionadoRef.current = setTimeout(() => setRecemAdicionado(false), 1400);
  }

  const atrasoEntrada = reduzir ? 0 : Math.min((indiceNaGrade % 4) * 0.04, 0.14);

  return (
    <motion.article
      id={produto.id}
      data-produto={produto.id}
      suppressHydrationWarning
      layout={reduzir ? false : "position"}
      initial={imediato || reduzir ? false : { opacity: 0, y: 14 }}
      animate={imediato ? { opacity: 1, y: 0 } : undefined}
      whileInView={imediato ? undefined : { opacity: 1, y: 0 }}
      viewport={imediato ? undefined : { once: true, margin: "120px 0px 180px 0px" }}
      exit={reduzir ? { opacity: 0 } : { opacity: 0, scale: 0.96 }}
      transition={{ duration: reduzir ? 0 : 0.34, delay: atrasoEntrada, ease: EASE_ATELIER }}
      className="group flex h-full scroll-mt-[168px] flex-col"
    >
      {/* Palco da foto: nunca recebe carimbo de pronta entrega */}
      <motion.div
        ref={fotoCaixaRef}
        whileTap={reduzir ? undefined : { scale: 0.985 }}
        transition={SPRING_BOTAO}
        onPointerDown={aoDescerPonteiro}
        onPointerUp={aoSoltarPonteiro}
        onPointerCancel={() => {
          gestoRef.current = null;
        }}
        className="relative touch-pan-y"
      >
        <button
          type="button"
          onClick={clicarFoto}
          tabIndex={-1}
          aria-hidden
          className="block w-full cursor-pointer text-left focus:outline-none"
        >
          <div className="relative aspect-[3/4] w-full overflow-hidden rounded-[3px] bg-white ring-1 ring-[#1B4965]/10 transition-shadow duration-500 group-hover:shadow-md group-hover:shadow-[#130209]/10 group-hover:ring-[#b8902a]/45">
            <Image
              src={fotoAtual}
              alt={produto.nome}
              fill
              sizes={SIZES}
              loading={prioridade ? "eager" : undefined}
              fetchPriority={prioridade ? "high" : undefined}
              className={`object-cover transition-[transform,opacity] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.035] ${
                mostrarHoverDesktop ? "group-hover:opacity-0" : ""
              }`}
            />

            {produto.fotoHover && (
              <Image
                src={produto.fotoHover}
                alt=""
                fill
                sizes={SIZES}
                className={`hidden object-cover transition-[transform,opacity] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.035] [@media(hover:hover)]:block ${
                  mostrarHoverDesktop ? "opacity-0 group-hover:opacity-100" : "opacity-0"
                }`}
              />
            )}

            {/* Indicador discreto de multiplas fotos em pontos */}
            {fotos.length > 1 && (
              <span
                aria-hidden
                className="pointer-events-none absolute bottom-2 left-1/2 z-10 inline-flex -translate-x-1/2 items-center gap-1 rounded-full bg-[#130209]/35 px-2 py-1 backdrop-blur-[2px]"
              >
                {fotos.map((f, i) => (
                  <span
                    key={f}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      i === fotoIdx ? "w-3 bg-[#EDE7D9]" : "w-1.5 bg-[#EDE7D9]/55"
                    }`}
                  />
                ))}
              </span>
            )}

            {/* Dica sutil de detalhe no hover do desktop */}
            <span
              aria-hidden
              className="pointer-events-none absolute bottom-3 left-3 z-10 hidden translate-y-1 rounded-full bg-[#EDE7D9]/95 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#1B4965] opacity-0 shadow-sm backdrop-blur-sm transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 [@media(hover:hover)]:inline-flex"
            >
              Ver bordado
            </span>
          </div>
        </button>
      </motion.div>

      {/* Informacoes e acao rapida abaixo da foto */}
      <div className="mt-2.5 flex flex-1 flex-col sm:mt-3">
        {/* Status artesanal (na interface, nunca sobre a foto) */}
        <div className="flex min-h-[18px] items-center gap-1.5">
          {produto.prontaEntrega ? (
            <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.15em] text-[#1B4965]">
              <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-[#b8902a]" />
              Pronta entrega
            </span>
          ) : produto.producao ? (
            <span className="text-[10px] uppercase tracking-[0.1em] text-brand-muted">
              {produto.producao}
            </span>
          ) : null}
        </div>

        <h3 className="mt-0.5 font-[family-name:var(--font-serif)] text-[18px] leading-snug tracking-[-0.005em] text-[#1B4965] transition-colors group-hover:text-brand-gold-text sm:text-[21px]">
          <button
            type="button"
            onClick={() => onAbrir(produto.id)}
            className="cursor-pointer rounded-sm text-left text-balance focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1B4965] focus-visible:ring-offset-2 focus-visible:ring-offset-[#EDE7D9]"
          >
            {produto.nome}
          </button>
        </h3>

        <div className="mt-auto flex items-end justify-between gap-2 pt-2">
          <div className="min-w-0">
            <p className="flex flex-wrap items-baseline gap-x-1.5">
              <span className="nums-preco font-[family-name:var(--font-serif)] text-[19px] font-semibold leading-none text-[#1B4965] sm:text-[21px]">
                {formatBRLPreco(parcelamento.total)}
              </span>
              <span className="text-[11px] leading-tight text-brand-muted">
                {labelParcelamento(parcelamento)}
              </span>
            </p>
            <p className="mt-1 text-[11px] text-brand-muted">
              ou {formatBRLPreco(produto.preco)} no pix
            </p>
          </div>

          <motion.button
            type="button"
            onClick={clicarAdicionar}
            whileTap={reduzir ? undefined : { scale: 0.9 }}
            transition={SPRING_BOTAO}
            aria-label={`Adicionar ${produto.nome} ao carrinho`}
            className={`relative flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-full border transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1B4965] focus-visible:ring-offset-2 focus-visible:ring-offset-[#EDE7D9] ${
              recemAdicionado
                ? "border-[#1B4965] bg-[#1B4965] text-[#EDE7D9]"
                : "border-[#1B4965]/22 bg-[#F7F3EB] text-[#1B4965] hover:border-[#1B4965] hover:bg-[#1B4965] hover:text-[#EDE7D9]"
            }`}
          >
            <AnimatePresence mode="wait" initial={false}>
              {recemAdicionado ? (
                <motion.svg
                  key="check"
                  initial={reduzir ? { opacity: 0 } : { opacity: 0, scale: 0.6 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.6 }}
                  transition={{ duration: reduzir ? 0 : 0.16 }}
                  className="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2.4}
                  aria-hidden
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20 6 9 17l-5-5" />
                </motion.svg>
              ) : (
                <motion.svg
                  key="plus"
                  initial={reduzir ? { opacity: 0 } : { opacity: 0, scale: 0.7 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.7 }}
                  transition={{ duration: reduzir ? 0 : 0.16 }}
                  className="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.9}
                  aria-hidden
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14M5 12h14" />
                </motion.svg>
              )}
            </AnimatePresence>

            {qtdNoCarrinho > 0 && (
              <span
                aria-hidden
                className="absolute -right-1 -top-1 flex h-[17px] min-w-[17px] items-center justify-center rounded-full bg-[#b8902a] px-1 text-[9px] font-bold leading-none tabular-nums text-white ring-2 ring-[#EDE7D9]"
              >
                {qtdNoCarrinho}
              </span>
            )}
          </motion.button>
        </div>
      </div>
    </motion.article>
  );
}
