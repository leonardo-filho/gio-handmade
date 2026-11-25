"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { abrirPeca } from "@/components/loja/urlLoja";
import { contagemPecas, vistaPorSlug } from "@/components/loja/vistas";
import { guardarHeroi, imagemDoSlide, slideDe } from "@/components/vitrine/heroi";
import { atraso, movimentoReduzido, type Caixa } from "@/components/vitrine/movimento";
import { useRevelar } from "@/components/vitrine/revelar";
import { secaoVitrine, type Produto } from "@/data/produtos";
import { formatBRLPreco } from "@/lib/format";
import { labelParcelamento, parcelamentoCartao } from "@/lib/parcelas";
import BotaoSacola from "./BotaoSacola";
import { Flecha } from "./Icones";
import Revela from "./Revela";
import m from "./home.module.css";

const VISTA = vistaPorSlug("pronta-entrega");
const LINK_VISTA = "/loja?ver=pronta-entrega";
const SIZES = "(min-width: 1280px) 320px, (min-width: 768px) 300px, 70vw";

// Pronta entrega: as peças já finalizadas num trilho de arrasto. No celular,
// o dedo arrasta (com encaixe em cada peça) e a próxima peça aparece na beira
// da tela; no computador, o mouse também arrasta, e há setas. O "+" de cada
// peça adiciona com o mesmo voo até a sacola da /loja, e a foto abre a folha
// da peça ali mesmo, crescendo do cartão.
export default function ProntaEntregaHome() {
  const trilhoRef = useRef<HTMLUListElement>(null);
  const progressoRef = useRef<HTMLSpanElement>(null);
  const [pontas, setPontas] = useState({ inicio: true, fim: false });

  const medir = useCallback(() => {
    const el = trilhoRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    const p = max > 0 ? Math.min(1, Math.max(0, el.scrollLeft / max)) : 1;
    // A costura de progresso cresce com o trilho (escrita direta, sem render).
    const barra = progressoRef.current;
    if (barra) {
      const visivel = el.clientWidth / Math.max(1, el.scrollWidth);
      const fim = visivel + (1 - visivel) * p;
      barra.style.clipPath = `inset(0 ${((1 - fim) * 100).toFixed(2)}% 0 0)`;
    }
    const inicio = el.scrollLeft <= 4;
    const fim = el.scrollLeft >= max - 4;
    setPontas((a) => (a.inicio === inicio && a.fim === fim ? a : { inicio, fim }));
  }, []);

  useEffect(() => {
    const el = trilhoRef.current;
    if (!el) return;
    const quadro = requestAnimationFrame(medir);
    const observador = new ResizeObserver(medir);
    observador.observe(el);
    return () => {
      cancelAnimationFrame(quadro);
      observador.disconnect();
    };
  }, [medir]);

  useArrasto(trilhoRef);

  // Setas: uma peça por vez, até a próxima parada do encaixe.
  function passo(direcao: 1 | -1) {
    const el = trilhoRef.current;
    if (!el) return;
    const paradas = paradasDo(el);
    const atual = el.scrollLeft;
    const alvo =
      direcao > 0 ? paradas.find((x) => x > atual + 8) : [...paradas].reverse().find((x) => x < atual - 8);
    el.scrollTo({ left: alvo ?? (direcao > 0 ? el.scrollWidth : 0), behavior: movimentoReduzido() ? "auto" : "smooth" });
  }

  if (!VISTA || VISTA.itens.length === 0) return null;
  const total = VISTA.itens.length;

  return (
    <section
      id="pronta-entrega"
      aria-labelledby="pronta-titulo"
      className="relative overflow-hidden bg-[#EDE7D9] pb-14 pt-20 md:pb-20 md:pt-28"
    >
      <div className="mx-auto max-w-[1380px] px-4 md:px-6 lg:px-10 xl:px-14">
        <Revela className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p
              className={`flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.26em] text-brand-gold-text md:text-[11px] ${m.surge}`}
            >
              <span aria-hidden className="h-[7px] w-[7px] rounded-full bg-[#b8902a]" />
              Disponível agora
            </p>
            <h2
              id="pronta-titulo"
              className="mt-3 font-[family-name:var(--font-serif)] text-[52px] leading-[0.95] tracking-[-0.015em] text-[#1B4965] min-[400px]:text-[56px] md:mt-5 md:text-[96px] xl:text-[112px]"
            >
              <span className={`${m.linha} ${m.linhaJunta}`}>
                <span className={m.sobe} style={atraso(60)}>
                  Pronta
                </span>
              </span>{" "}
              <span className={`${m.linha} ${m.linhaJunta}`}>
                <span className={`${m.sobe} italic`} style={atraso(140)}>
                  entrega
                </span>
              </span>
              <span
                className={`ml-2.5 inline-block font-[family-name:var(--font-serif)] text-[17px] italic tracking-normal text-brand-gold-text md:ml-4 md:text-[26px] ${m.surge}`}
                style={atraso(320)}
              >
                {contagemPecas(total)}
              </span>
            </h2>
            <div className="mt-4 flex items-center gap-4 md:mt-6">
              <span aria-hidden className={`h-[1.5px] w-12 shrink-0 md:w-24 ${m.ponto} ${m.costura}`} style={atraso(380)} />
              <p className={`text-[14px] leading-snug text-brand-muted md:text-[16px] ${m.surge}`} style={atraso(260)}>
                Peças já finalizadas, com envio imediato.
              </p>
            </div>
          </div>

          <div className={`hidden items-center gap-3 md:flex ${m.surge}`} style={atraso(300)}>
            <Seta direcao={-1} desligada={pontas.inicio} onClick={() => passo(-1)} />
            <Seta direcao={1} desligada={pontas.fim} onClick={() => passo(1)} />
          </div>
        </Revela>
      </div>

      <ul
        ref={trilhoRef}
        onScroll={medir}
        aria-label="Peças de pronta entrega"
        data-lenis-prevent-horizontal=""
        className={`${m.trilho} relative mt-9 gap-3 pb-2 md:mt-14 md:gap-6 xl:gap-7`}
      >
        {VISTA.itens.map((p) => (
          <li key={p.id} className="w-[70vw] max-w-[300px] shrink-0 md:w-[300px] md:max-w-none xl:w-[320px]">
            <CartaoPronta produto={p} />
          </li>
        ))}
        <li className="w-[70vw] max-w-[300px] shrink-0 md:w-[300px] md:max-w-none xl:w-[320px]">
          <FimDoTrilho total={total} />
        </li>
      </ul>

      <div className="mx-auto mt-7 flex max-w-[1380px] items-center gap-5 px-4 md:mt-10 md:px-6 lg:px-10 xl:px-14">
        <span aria-hidden className="relative h-[1.5px] flex-1">
          <span className="absolute inset-0 bg-[#1B4965]/12" />
          <span ref={progressoRef} className={`absolute inset-0 ${m.ponto}`} style={{ clipPath: "inset(0 70% 0 0)" }} />
        </span>
        <Link
          href={LINK_VISTA}
          className="group inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full text-[11px] font-bold uppercase tracking-[0.2em] text-[#1B4965] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1B4965] focus-visible:ring-offset-4 focus-visible:ring-offset-[#EDE7D9]"
        >
          Ver as {total} peças
          <Flecha className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
        </Link>
      </div>
    </section>
  );
}

function CartaoPronta({ produto }: { produto: Produto }) {
  const raizRef = useRef<HTMLElement>(null);
  const quadroRef = useRef<HTMLDivElement>(null);
  useRevelar(raizRef);
  const parcelamento = parcelamentoCartao(produto);
  const temSegunda = Boolean(produto.fotoHover);

  // Com mouse, a segunda foto aparece no hover; no toque, fica a primeira.
  function fotoVisivel() {
    if (!temSegunda || !window.matchMedia("(hover: hover)").matches) return 0;
    return raizRef.current?.matches(":hover") ? 1 : 0;
  }

  function caixa(i: number): Caixa | null {
    const r = (slideDe(quadroRef.current, i) ?? quadroRef.current)?.getBoundingClientRect();
    return r ? { left: r.left, top: r.top, width: r.width, height: r.height } : null;
  }

  function abrir() {
    const i = fotoVisivel();
    const img = imagemDoSlide(quadroRef.current, i);
    const c = caixa(i);
    if (img && c) guardarHeroi({ id: produto.id, indice: i, caixa: c, src: img.currentSrc || img.src });
    abrirPeca(produto.id);
  }

  function origemDoVoo() {
    const i = fotoVisivel();
    const img = imagemDoSlide(quadroRef.current, i);
    return { caixa: caixa(i), src: img ? img.currentSrc || img.src : null };
  }

  return (
    <article
      ref={raizRef}
      data-produto={produto.id}
      className={`group ${m.revela}`}
    >
      <div
        ref={quadroRef}
        data-foto-peca={produto.id}
        data-indice={0}
        onClick={abrir}
        className={`relative aspect-[3/4] cursor-pointer overflow-hidden rounded-[3px] bg-[#e3dccb] ${m.cortina}`}
      >
        <div className={`absolute inset-0 ${m.respira}`}>
          <div data-slide className="absolute inset-0">
            <Image
              data-principal
              src={produto.foto}
              alt={produto.nome}
              fill
              sizes={SIZES}
              draggable={false}
              className="object-cover transition-transform duration-[1.2s] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.045]"
            />
          </div>
          {temSegunda && (
            <div
              data-slide
              className="absolute inset-0 opacity-0 transition-opacity duration-700 [@media(hover:hover)]:group-hover:opacity-100"
            >
              <Image
                data-principal
                src={produto.fotoHover as string}
                alt=""
                fill
                sizes={SIZES}
                draggable={false}
                className="object-cover transition-transform duration-[1.2s] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.045]"
              />
            </div>
          )}
        </div>
        <BotaoSacola produto={produto} origem={origemDoVoo} className="bottom-2 right-2 md:bottom-3 md:right-3" />
      </div>

      <div className={`pt-3 ${m.surge}`} style={atraso(120)}>
        <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-brand-gold-text">{secaoVitrine(produto)}</p>
        <h3 className="mt-1 font-[family-name:var(--font-serif)] text-[21px] leading-[1.12] text-[#1B4965] md:text-[23px]">
          <button
            type="button"
            onClick={abrir}
            className="cursor-pointer rounded-sm text-left decoration-[#b8902a] decoration-1 underline-offset-4 transition-colors hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1B4965] focus-visible:ring-offset-2 focus-visible:ring-offset-[#EDE7D9]"
          >
            {produto.nome}
          </button>
        </h3>
        <p className="mt-1.5 flex flex-wrap items-baseline gap-x-2 leading-tight">
          <span className="nums-preco font-[family-name:var(--font-serif)] text-[20px] font-medium text-[#1B4965] md:text-[21px]">
            {formatBRLPreco(parcelamento.total)}
          </span>
          <span className="text-[12.5px] text-brand-muted md:text-[13px]">{labelParcelamento(parcelamento)}</span>
        </p>
        <p className="mt-0.5 text-[12.5px] text-brand-muted md:text-[13px]">ou {formatBRLPreco(produto.preco)} no pix</p>
      </div>
    </article>
  );
}

// Última parada do trilho: o convite para a vitrine inteira da pronta entrega.
function FimDoTrilho({ total }: { total: number }) {
  return (
    <Link
      href={LINK_VISTA}
      className="group relative flex aspect-[3/4] flex-col justify-between overflow-hidden rounded-[3px] bg-[#1B4965] p-6 text-[#EDE7D9] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1B4965] focus-visible:ring-offset-2 focus-visible:ring-offset-[#EDE7D9] md:p-8"
    >
      <span className="text-[10px] font-bold uppercase tracking-[0.26em] text-[#C8E1E4]">Pronta entrega</span>
      <span>
        <span className="block font-[family-name:var(--font-serif)] text-[40px] leading-[0.98] md:text-[46px]">
          Ver as {total}
          <br />
          <em className="text-[#e6cf8f]">peças</em>
        </span>
        <span aria-hidden className={`mt-5 block h-[1.5px] w-24 ${m.pontoClaro}`} />
        <span className="mt-5 flex h-12 w-12 items-center justify-center rounded-full bg-[#EDE7D9] text-[#1B4965] transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-2">
          <Flecha className="h-5 w-5" />
        </span>
      </span>
    </Link>
  );
}

function Seta({ direcao, desligada, onClick }: { direcao: 1 | -1; desligada: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={desligada}
      aria-label={direcao > 0 ? "Próximas peças" : "Peças anteriores"}
      className="flex h-12 w-12 cursor-pointer items-center justify-center rounded-full border border-[#1B4965]/30 text-[#1B4965] transition-[background-color,color,border-color,opacity,transform] duration-300 hover:border-[#1B4965] hover:bg-[#1B4965] hover:text-[#EDE7D9] active:scale-95 disabled:cursor-default disabled:opacity-30 disabled:hover:border-[#1B4965]/30 disabled:hover:bg-transparent disabled:hover:text-[#1B4965] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1B4965] focus-visible:ring-offset-2 focus-visible:ring-offset-[#EDE7D9]"
    >
      <Flecha className={`h-5 w-5 ${direcao < 0 ? "rotate-180" : ""}`} />
    </button>
  );
}

/**
 * Onde o encaixe para: o começo de cada item, descontado o respiro do trilho
 * (o scroll-padding é igual ao padding, que o navegador devolve já em px).
 */
function paradasDo(el: HTMLElement) {
  const respiro = parseFloat(getComputedStyle(el).paddingLeft) || 0;
  const max = el.scrollWidth - el.clientWidth;
  return Array.from(el.children).map((c) => Math.min(max, Math.max(0, (c as HTMLElement).offsetLeft - respiro)));
}

// Arrastar com o mouse (o toque já arrasta sozinho). Durante o arrasto o
// encaixe fica desligado; ao soltar, o trilho desliza até a parada mais
// perto do ponto para onde o impulso levaria. Um arrasto não vira clique.
function useArrasto(ref: React.RefObject<HTMLElement | null>) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let ativo = false;
    let moveu = false;
    let x0 = 0;
    let s0 = 0;
    let ultimoX = 0;
    let ultimoT = 0;
    let velocidade = 0;
    let timer = 0;

    const descer = (e: PointerEvent) => {
      if (e.pointerType !== "mouse" || e.button !== 0) return;
      ativo = true;
      moveu = false;
      x0 = e.clientX;
      s0 = el.scrollLeft;
      ultimoX = e.clientX;
      ultimoT = e.timeStamp;
      velocidade = 0;
    };
    const mover = (e: PointerEvent) => {
      if (!ativo) return;
      const dx = e.clientX - x0;
      if (!moveu) {
        if (Math.abs(dx) < 6) return;
        moveu = true;
        window.clearTimeout(timer);
        el.style.scrollSnapType = "none";
        el.dataset.arrastando = "";
      }
      el.scrollLeft = s0 - dx;
      const dt = Math.max(1, e.timeStamp - ultimoT);
      velocidade = (e.clientX - ultimoX) / dt;
      ultimoX = e.clientX;
      ultimoT = e.timeStamp;
    };
    const soltar = () => {
      if (!ativo) return;
      ativo = false;
      if (!moveu) return;
      delete el.dataset.arrastando;
      const alvo = el.scrollLeft - velocidade * 260;
      const paradas = paradasDo(el);
      const destino = paradas.reduce((a, b) => (Math.abs(b - alvo) < Math.abs(a - alvo) ? b : a), paradas[0] ?? 0);
      el.scrollTo({ left: destino, behavior: movimentoReduzido() ? "auto" : "smooth" });
      timer = window.setTimeout(() => {
        el.style.scrollSnapType = "";
      }, 650);
    };
    // O clique que encerra um arrasto não abre a peça nem adiciona.
    const clicar = (e: MouseEvent) => {
      if (!moveu) return;
      moveu = false;
      e.preventDefault();
      e.stopPropagation();
    };

    el.addEventListener("pointerdown", descer);
    window.addEventListener("pointermove", mover);
    window.addEventListener("pointerup", soltar);
    window.addEventListener("pointercancel", soltar);
    el.addEventListener("click", clicar, true);
    // Sem o arrasto nativo de link e de imagem, que brigaria com o do trilho.
    const semArrastoNativo = (e: DragEvent) => e.preventDefault();
    el.addEventListener("dragstart", semArrastoNativo);
    return () => {
      el.removeEventListener("dragstart", semArrastoNativo);
      window.clearTimeout(timer);
      el.removeEventListener("pointerdown", descer);
      window.removeEventListener("pointermove", mover);
      window.removeEventListener("pointerup", soltar);
      window.removeEventListener("pointercancel", soltar);
      el.removeEventListener("click", clicar, true);
    };
  }, [ref]);
}
