"use client";

import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useScroll, useTransform } from "framer-motion";
import { useHidratado } from "@/components/loja/urlLoja";
import { formatBRLPreco } from "@/lib/format";
import { labelParcelamento, parcelamentoCartao } from "@/lib/parcelas";
import type { Produto } from "@/data/produtos";
import { EASE_ATELIER, SPRING_BOTAO, fotosDoProduto } from "./animacoes";
import { useReduzirMovimento } from "./useReduzirMovimento";

type Props = {
  produto: Produto;
  onAbrir: (id: string) => void;
  onAdicionar: (produto: Produto, origemEl: HTMLElement | null) => void;
  qtdNoCarrinho: number;
  etiqueta: string;
  variante: "faixa" | "diptico";
};

export default function DestaqueEditorial({
  produto,
  onAbrir,
  onAdicionar,
  qtdNoCarrinho,
  etiqueta,
  variante,
}: Props) {
  const hidratado = useHidratado();
  const reduzir = useReduzirMovimento();
  const fotos = fotosDoProduto(produto);
  const [fotoIdx, setFotoIdx] = useState(0);
  const [recemAdicionado, setRecemAdicionado] = useState(false);

  const palcoRef = useRef<HTMLDivElement>(null);
  const gestoRef = useRef<{ x: number; y: number } | null>(null);
  const suprimirCliqueRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    return () => clearTimeout(timerRef.current);
  }, []);

  const { scrollYProgress } = useScroll({
    target: palcoRef,
    offset: ["start end", "end start"],
  });
  const parallaxY = useTransform(scrollYProgress, [0, 1], [-12, 12]);

  const parcelamento = parcelamentoCartao(produto);
  const fotoAtual = fotos[fotoIdx] ?? produto.foto;
  const mostrarHoverDesktop = Boolean(produto.fotoHover) && fotoIdx === 0;
  const ehFaixa = variante === "faixa";

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
    onAdicionar(produto, palcoRef.current);
    setRecemAdicionado(true);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setRecemAdicionado(false), 1400);
  }

  return (
    <motion.article
      id={produto.id}
      data-produto={produto.id}
      suppressHydrationWarning
      initial={reduzir ? false : { opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "100px 0px 160px 0px" }}
      transition={{ duration: reduzir ? 0 : 0.42, ease: EASE_ATELIER }}
      className={`group scroll-mt-[168px] overflow-hidden rounded-[4px] border border-[#1B4965]/12 bg-[#F7F3EB]/70 ${
        ehFaixa ? "grid grid-cols-1 md:grid-cols-12" : "flex h-full flex-col"
      }`}
    >
      {/* Palco fotografico com parallax sutil */}
      <div
        ref={palcoRef}
        onPointerDown={aoDescerPonteiro}
        onPointerUp={aoSoltarPonteiro}
        onPointerCancel={() => {
          gestoRef.current = null;
        }}
        className={`relative touch-pan-y overflow-hidden bg-white ${
          ehFaixa
            ? "aspect-[4/5] md:col-span-6 md:aspect-[4/4.6]"
            : "aspect-[4/5]"
        }`}
      >
        <button
          type="button"
          onClick={clicarFoto}
          tabIndex={-1}
          aria-hidden
          className="block h-full w-full cursor-pointer text-left focus:outline-none"
        >
          <motion.div
            suppressHydrationWarning
            style={hidratado && !reduzir ? { y: parallaxY } : undefined}
            className="relative -top-[4%] h-[108%] w-full"
          >
            <Image
              src={fotoAtual}
              alt={produto.nome}
              fill
              sizes={
                ehFaixa
                  ? "(min-width: 1024px) 540px, 100vw"
                  : "(min-width: 1024px) 540px, (min-width: 640px) 48vw, 100vw"
              }
              className={`object-cover transition-[transform,opacity] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.03] ${
                mostrarHoverDesktop ? "group-hover:opacity-0" : ""
              }`}
            />

            {produto.fotoHover && (
              <Image
                src={produto.fotoHover}
                alt=""
                fill
                sizes={
                  ehFaixa
                    ? "(min-width: 1024px) 540px, 100vw"
                    : "(min-width: 1024px) 540px, (min-width: 640px) 48vw, 100vw"
                }
                className={`hidden object-cover transition-[transform,opacity] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.03] [@media(hover:hover)]:block ${
                  mostrarHoverDesktop ? "opacity-0 group-hover:opacity-100" : "opacity-0"
                }`}
              />
            )}
          </motion.div>

          {fotos.length > 1 && (
            <span
              aria-hidden
              className="pointer-events-none absolute bottom-3 left-1/2 z-10 inline-flex -translate-x-1/2 items-center gap-1 rounded-full bg-[#130209]/35 px-2.5 py-1 backdrop-blur-[2px]"
            >
              {fotos.map((f, i) => (
                <span
                  key={f}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === fotoIdx ? "w-3.5 bg-[#EDE7D9]" : "w-1.5 bg-[#EDE7D9]/55"
                  }`}
                />
              ))}
            </span>
          )}
        </button>
      </div>

      {/* Painel editorial com tipografia ampla */}
      <div
        className={`flex flex-1 flex-col justify-between p-5 sm:p-6 ${
          ehFaixa ? "md:col-span-6 md:p-8 lg:p-10" : ""
        }`}
      >
        <div>
          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
            <span className="text-[10px] font-bold uppercase tracking-[0.24em] text-brand-gold-text">
              {etiqueta}
            </span>
            {produto.prontaEntrega ? (
              <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-[#1B4965]">
                <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-[#b8902a]" />
                Pronta entrega
              </span>
            ) : produto.producao ? (
              <span className="text-[10px] uppercase tracking-[0.14em] text-brand-muted">
                · {produto.producao}
              </span>
            ) : null}
          </div>

          <h3
            className={`mt-2 font-[family-name:var(--font-serif)] italic leading-[1.06] text-[#1B4965] transition-colors group-hover:text-brand-gold-text ${
              ehFaixa ? "text-[28px] sm:text-[34px] lg:text-[40px]" : "text-[25px] sm:text-[29px]"
            }`}
          >
            <button
              type="button"
              onClick={() => onAbrir(produto.id)}
              className="cursor-pointer rounded-sm text-left text-balance focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1B4965] focus-visible:ring-offset-2 focus-visible:ring-offset-[#F7F3EB]"
            >
              {produto.nome}
            </button>
          </h3>

          <p className="mt-2.5 line-clamp-3 text-[13px] leading-relaxed text-brand-muted md:mt-3 md:text-sm">
            {produto.detalhes}
          </p>
        </div>

        <div className="mt-5 border-t border-[#1B4965]/12 pt-4">
          <p className="flex flex-wrap items-baseline gap-x-2">
            <span className="nums-preco font-[family-name:var(--font-serif)] text-[24px] font-semibold leading-none text-[#1B4965] md:text-[28px]">
              {formatBRLPreco(parcelamento.total)}
            </span>
            <span className="text-xs text-brand-muted">{labelParcelamento(parcelamento)}</span>
          </p>
          <p className="mt-1 text-xs text-brand-muted">
            ou {formatBRLPreco(produto.preco)} no pix
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <motion.button
              type="button"
              onClick={clicarAdicionar}
              whileTap={reduzir ? undefined : { scale: 0.97 }}
              transition={SPRING_BOTAO}
              className={`relative inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-full px-5 text-[11px] font-bold uppercase tracking-[0.16em] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1B4965] focus-visible:ring-offset-2 focus-visible:ring-offset-[#F7F3EB] ${
                recemAdicionado
                  ? "bg-[#2f7a45] text-white"
                  : "bg-[#1B4965] text-[#EDE7D9] hover:bg-[#130209]"
              }`}
            >
              <AnimatePresence mode="wait" initial={false}>
                {recemAdicionado ? (
                  <motion.span
                    key="ok"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: reduzir ? 0 : 0.15 }}
                    className="inline-flex items-center gap-1.5"
                  >
                    <svg
                      className="h-3.5 w-3.5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2.4}
                      aria-hidden
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M20 6 9 17l-5-5" />
                    </svg>
                    No carrinho
                  </motion.span>
                ) : (
                  <motion.span
                    key="add"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: reduzir ? 0 : 0.15 }}
                    className="inline-flex items-center gap-1.5"
                  >
                    Adicionar
                    {qtdNoCarrinho > 0 && (
                      <span className="rounded-full bg-[#b8902a] px-1.5 py-0.5 text-[9px] tabular-nums text-white">
                        {qtdNoCarrinho}
                      </span>
                    )}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>

            <button
              type="button"
              onClick={() => onAbrir(produto.id)}
              className="inline-flex min-h-11 cursor-pointer items-center gap-1.5 px-2 text-xs font-medium uppercase tracking-[0.14em] text-[#1B4965] underline decoration-[#b8902a]/60 underline-offset-4 transition-colors hover:text-brand-gold-text focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1B4965]"
            >
              Ver bordado
              <span aria-hidden>→</span>
            </button>
          </div>
        </div>
      </div>
    </motion.article>
  );
}
