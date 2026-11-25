"use client";

import { useRef, useState, type RefObject } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { useCart } from "@/components/cart/CartProvider";
import { formatBRLPreco } from "@/lib/format";
import { labelParcelamento, parcelamentoCartao } from "@/lib/parcelas";
import type { Produto } from "@/data/produtos";
import { fotosDe, itemDoCarrinho, type Largura } from "./dados";
import { guardarHeroi, imagemDoSlide, modoLargo, slideDe } from "./heroi";
import { atraso, type Caixa } from "./movimento";
import { useRevelar } from "./revelar";
import { voarParaSacola } from "./voo";
import s from "./vitrine.module.css";

// Grade: 2 colunas no celular (cerca de 173 px em 390), 3 no tablet e 4 do
// xl para cima (cerca de 225 px em 1440, ao lado do índice). No díptico e na
// faixa cada foto continua do tamanho de uma coluna.
const SIZES = "(min-width: 1280px) 250px, (min-width: 1024px) 26vw, (min-width: 768px) 31vw, 47vw";
const SIZES_DETALHE = "(min-width: 1280px) 500px, (min-width: 768px) 62vw, 94vw";

type Props = {
  produto: Produto;
  largura: Largura;
  onAbrir: (id: string) => void;
  /** Posição na primeira tela (entrada por CSS no HTML do servidor) ou null. */
  entrada: number | null;
  /** Foto da primeira dobra: carrega na hora. */
  prioridade: boolean;
};

// Classes do modo de cada grade (ver vitrine.module.css).
function classesDoModo(l: Largura) {
  return [
    l.base > 1 ? s.largoBase : "",
    l.md > 1 ? s.largoMd : "",
    l.md > 2 ? s.faixaMd : "",
    l.xl > 1 ? s.largoXl : "",
    l.xl > 2 ? s.faixaXl : "",
  ].join(" ");
}

const primeiraMaiuscula = (t: string) => t.charAt(0).toUpperCase() + t.slice(1);

// Cartão da peça. A foto troca por arrasto no celular (trilho com encaixe) e
// por hover no desktop; o botão redondo da sacola adiciona sem abrir a peça;
// a foto e o nome abrem a folha da peça, e a foto cresce até ela. Em cima do
// nome, o prazo de confecção (ou o selo de pronta entrega), para a cliente
// saber antes de tocar se a peça é feita sob medida.
export default function Cartao({ produto, largura, onAbrir, entrada, prioridade }: Props) {
  const todas = fotosDe(produto);
  const fotos = todas.slice(0, 3);
  const largo = largura.base > 1 || largura.md > 1 || largura.xl > 1;
  const [indice, setIndice] = useState(0);
  const raizRef = useRef<HTMLElement>(null);
  const quadroRef = useRef<HTMLDivElement>(null);
  const trilhoRef = useRef<HTMLDivElement>(null);
  useRevelar(raizRef, entrada === null);
  const parcelamento = parcelamentoCartao(produto);

  // Foto que a pessoa está vendo (ou tocou, no díptico): no desktop, a do
  // hover; no celular, a do trilho.
  function fotoVisivel(alvo?: EventTarget | null) {
    const quadro = quadroRef.current;
    if (!quadro) return 0;
    if (modoLargo(quadro)) {
      const slide = alvo instanceof Element ? alvo.closest("[data-slide]") : null;
      const i = slide ? Array.from(quadro.querySelectorAll("[data-slide]")).indexOf(slide) : 0;
      return i === 1 ? 1 : 0;
    }
    if (window.matchMedia("(hover: hover)").matches) {
      // A segunda foto aparece com o mouse em qualquer parte do cartão.
      return fotos.length > 1 && raizRef.current?.matches(":hover") ? 1 : 0;
    }
    return indice;
  }

  function caixaDaFoto(i: number): Caixa | null {
    const slide = slideDe(quadroRef.current, i);
    const r = (slide ?? quadroRef.current)?.getBoundingClientRect();
    return r ? { left: r.left, top: r.top, width: r.width, height: r.height } : null;
  }

  function abrir(e?: React.MouseEvent) {
    const quadro = quadroRef.current;
    const i = fotoVisivel(e?.target);
    const img = imagemDoSlide(quadro, i);
    const caixa = caixaDaFoto(i);
    if (img && caixa) guardarHeroi({ id: produto.id, indice: i, caixa, src: img.currentSrc || img.src });
    onAbrir(produto.id);
  }

  function aoRolar() {
    const trilho = trilhoRef.current;
    if (!trilho || trilho.clientWidth === 0) return;
    const i = Math.round(trilho.scrollLeft / trilho.clientWidth);
    if (i !== indice) setIndice(i);
  }

  const comEntrada = entrada !== null;

  return (
    <article
      ref={raizRef}
      data-produto={produto.id}
      className={`group ${s.cartao} ${s.revela} ${classesDoModo(largura)}`}
      style={comEntrada ? atraso(140 + entrada * 80) : undefined}
    >
      <div
        ref={quadroRef}
        data-foto-peca={produto.id}
        data-indice={indice}
        onClick={abrir}
        className={`${s.quadro} ${s.foto} ${comEntrada ? s.entradaFoto : ""}`}
      >
        <div className={s.miolo}>
          <div ref={trilhoRef} onScroll={aoRolar} className={`${s.trilho} ${s.semBarra}`}>
            {fotos.map((f, i) => (
              <div key={f} data-slide className={i === 0 ? s.slide : i === 1 ? s.slideHover : s.slideExtra}>
                <Image
                  data-principal
                  src={f}
                  alt={i === 0 ? produto.nome : ""}
                  fill
                  sizes={SIZES}
                  draggable={false}
                  loading={prioridade && i === 0 ? "eager" : undefined}
                  fetchPriority={prioridade && i === 0 ? "high" : undefined}
                  className="object-cover transition-transform duration-[1.2s] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.045]"
                />
              </div>
            ))}
            {/* Díptico de peça com uma foto só: a mesma foto, de perto. */}
            {largo && fotos.length === 1 && (
              <div aria-hidden className={s.detalhe}>
                <Image
                  src={fotos[0]}
                  alt=""
                  fill
                  sizes={SIZES_DETALHE}
                  draggable={false}
                  className="scale-[1.9] object-cover transition-transform duration-[1.2s] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[2]"
                  style={{ objectPosition: "50% 38%" }}
                />
              </div>
            )}
          </div>
        </div>

        {/* Quantas fotos tem e em qual está (só no toque, onde há trilho). A
            pílula escura garante o contraste em foto de estúdio branca. */}
        {fotos.length > 1 && (
          <div
            aria-hidden
            className={`pointer-events-none absolute bottom-2.5 left-2.5 flex gap-1 rounded-full bg-[#130209]/30 px-1.5 py-[5px] backdrop-blur-sm ${s.indicadores}`}
          >
            {fotos.map((f, i) => (
              <span
                key={f}
                className={`block h-[3px] w-3.5 origin-left rounded-full bg-white transition-[transform,opacity] duration-300 ${
                  i === indice ? "scale-x-100 opacity-100" : "scale-x-[0.4] opacity-60"
                }`}
              />
            ))}
          </div>
        )}

        <BotaoSacola produto={produto} fotoVisivel={fotoVisivel} caixaDaFoto={caixaDaFoto} quadroRef={quadroRef} />
      </div>

      <div className={`pt-2.5 md:pt-3.5 ${s.info} ${s.texto} ${comEntrada ? s.entradaTexto : ""}`}>
        <Prazo produto={produto} />
        <h3
          className={`mt-1 font-[family-name:var(--font-serif)] text-[19px] leading-[1.15] text-[#1B4965] md:text-[22px] xl:text-[20px] ${s.nome}`}
        >
          <button
            type="button"
            onClick={() => abrir()}
            className="cursor-pointer rounded-sm text-left decoration-[#b8902a] decoration-1 underline-offset-4 transition-colors hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1B4965] focus-visible:ring-offset-2 focus-visible:ring-offset-[#EDE7D9]"
          >
            {produto.nome}
          </button>
        </h3>
        <p className={`mt-2 line-clamp-3 max-w-md text-[14px] leading-relaxed text-brand-muted ${s.resumo}`}>{produto.detalhes}</p>
        <p className="mt-1.5 leading-tight md:flex md:flex-wrap md:items-baseline md:gap-x-2">
          <span className="nums-preco block font-[family-name:var(--font-serif)] text-[19px] font-medium text-[#1B4965] md:inline md:text-[20px] xl:text-[19px]">
            {formatBRLPreco(parcelamento.total)}
          </span>
          <span className="mt-0.5 block text-[12px] text-brand-muted md:mt-0 md:inline md:text-[13px]">
            {labelParcelamento(parcelamento)}
          </span>
        </p>
        <p className="mt-0.5 text-[12px] text-brand-muted md:text-[13px]">ou {formatBRLPreco(produto.preco)} no pix</p>
        <button
          type="button"
          onClick={() => abrir()}
          className={`group/ver mt-4 inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-sm text-[11px] font-bold uppercase tracking-[0.18em] text-[#1B4965] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1B4965] focus-visible:ring-offset-2 focus-visible:ring-offset-[#EDE7D9] ${s.verPeca}`}
        >
          <span className="inline-flex items-center gap-2">
            Ver a peça
            <svg
              className="h-4 w-4 transition-transform duration-300 group-hover/ver:translate-x-1"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.8}
              aria-hidden
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14m-5-5 5 5-5 5" />
            </svg>
          </span>
        </button>
      </div>
    </article>
  );
}

// Linha de cima do nome: pronta entrega (selo dourado) ou o prazo de
// confecção da peça sob medida. Toda peça tem a linha, então nome e preço
// ficam alinhados entre os cartões da mesma fileira.
function Prazo({ produto }: { produto: Produto }) {
  if (produto.prontaEntrega) {
    return (
      <p className="flex min-h-[18px] items-center gap-1.5 text-[12px] leading-none text-brand-gold-text">
        <span aria-hidden className="h-[7px] w-[7px] shrink-0 rounded-full bg-[#b8902a]" />
        Pronta entrega
      </p>
    );
  }
  if (!produto.producao) return <p aria-hidden className="min-h-[18px]" />;
  return (
    <p className="flex min-h-[18px] items-center gap-1.5 text-[12px] leading-none text-brand-muted">
      <span aria-hidden className="h-[7px] w-[7px] shrink-0 rounded-full border border-[#3f6178]/70" />
      <span className="md:hidden">
        <span className="sr-only">Sob medida, </span>
        {primeiraMaiuscula(produto.producao)}
      </span>
      <span className="hidden md:inline">Sob medida · {produto.producao}</span>
    </p>
  );
}

// Botão da sacola no canto da foto: o ícone de sacola com "+" vira um check,
// uma cópia da foto voa até a sacola do header e a peça entra no carrinho no
// pouso. Fica 1,8 s no estado de pronto, sem aceitar toque repetido. Depois,
// um selo dourado mostra quantas dessa peça já estão no carrinho.
function BotaoSacola({
  produto,
  fotoVisivel,
  caixaDaFoto,
  quadroRef,
}: {
  produto: Produto;
  fotoVisivel: () => number;
  caixaDaFoto: (i: number) => Caixa | null;
  quadroRef: RefObject<HTMLDivElement | null>;
}) {
  const { add, lines } = useCart();
  const [feito, setFeito] = useState(false);
  const qtd = lines.find((l) => l.id === produto.id)?.qty ?? 0;

  function adicionar(e: React.MouseEvent) {
    e.stopPropagation();
    if (feito) return;
    setFeito(true);
    const i = fotoVisivel();
    const img = imagemDoSlide(quadroRef.current, i);
    voarParaSacola(caixaDaFoto(i), img ? img.currentSrc || img.src : null, () => add(itemDoCarrinho(produto)));
    window.setTimeout(() => setFeito(false), 1800);
  }

  return (
    <button
      type="button"
      onClick={adicionar}
      aria-label={`Adicionar ao carrinho: ${produto.nome}${qtd > 0 ? ` (${qtd} no carrinho)` : ""}`}
      className={`absolute bottom-1.5 right-1.5 z-10 flex h-11 w-11 cursor-pointer items-center justify-center rounded-full shadow-[0_6px_18px_-6px_rgba(19,2,9,0.45)] backdrop-blur-md transition-[background-color,color,transform] duration-300 active:scale-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#EDE7D9] focus-visible:ring-offset-2 focus-visible:ring-offset-[#1B4965] md:bottom-3 md:right-3 md:h-12 md:w-12 ${
        feito
          ? "bg-[#1B4965] text-[#EDE7D9]"
          : "bg-[#EDE7D9]/92 text-[#1B4965] hover:scale-105 hover:bg-[#1B4965] hover:text-[#EDE7D9]"
      }`}
    >
      <AnimatePresence mode="popLayout" initial={false}>
        {feito ? (
          <motion.svg
            key="ok"
            viewBox="0 0 24 24"
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden
            initial={{ scale: 0.3, rotate: -40, opacity: 0 }}
            animate={{ scale: 1, rotate: 0, opacity: 1 }}
            exit={{ scale: 0.3, opacity: 0 }}
            transition={{ type: "spring", stiffness: 520, damping: 26 }}
          >
            <motion.path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 12.5 10 17.5 19 7"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.35, delay: 0.08 }}
            />
          </motion.svg>
        ) : (
          <motion.svg
            key="sacola"
            viewBox="0 0 24 24"
            className="h-[22px] w-[22px]"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            aria-hidden
            initial={{ scale: 0.4, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.4, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5.5 8h13l-1 12.5h-11z" />
            <path strokeLinecap="round" d="M9 8V6.5a3 3 0 0 1 6 0V8" />
            <path strokeLinecap="round" d="M12 11.5v5M9.5 14h5" />
          </motion.svg>
        )}
      </AnimatePresence>
      <AnimatePresence initial={false}>
        {qtd > 0 && (
          <motion.span
            key="qtd"
            aria-hidden
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            transition={{ type: "spring", stiffness: 560, damping: 22 }}
            className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center overflow-hidden rounded-full bg-[#b8902a] px-1 text-[10.5px] font-bold leading-none tabular-nums text-[#130209] ring-2 ring-[#EDE7D9]"
          >
            <motion.span key={qtd} initial={{ y: 8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.25 }}>
              {qtd}
            </motion.span>
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
}
