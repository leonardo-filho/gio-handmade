"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { TOTAL_PECAS, VISTAS, contagemPecas } from "@/components/loja/vistas";
import { atraso } from "@/components/vitrine/movimento";
import { useRevelar } from "@/components/vitrine/revelar";
import type { Produto } from "@/data/produtos";
import { formatBRLPreco } from "@/lib/format";
import { parcelamentoCartao } from "@/lib/parcelas";
import { useParado } from "./parado";
import Revela from "./Revela";
import m from "./home.module.css";

type Arte = {
  foto: string;
  posicao: string;
  /** Lugar do bloco na grade (celular: 2 colunas; computador: 12). */
  lugar: string;
  proporcao: string;
  grande?: boolean;
  sizes: string;
};

// Foto de campanha de cada categoria e o lugar do bloco na página. No
// computador, a composição é de revista: o bloco grande à esquerda, o título
// e Vestidos à direita, e a fileira de baixo com alturas desencontradas.
const ARTE: Record<string, Arte> = {
  conjuntos: {
    foto: "/conjuntos.jpeg",
    posicao: "50% 42%",
    lugar: "col-span-2 lg:col-span-6 lg:col-start-1 lg:row-span-2 lg:row-start-1",
    proporcao: "aspect-[4/5] lg:aspect-auto lg:h-[min(80vh,760px)]",
    grande: true,
    sizes: "(min-width: 1024px) 46vw, 100vw",
  },
  vestidos: {
    foto: "/vestido.jpg",
    posicao: "50% 40%",
    lugar: "col-span-1 lg:col-span-4 lg:col-start-8 lg:row-start-2",
    proporcao: "aspect-[3/4]",
    sizes: "(min-width: 1024px) 30vw, 48vw",
  },
  tops: {
    foto: "/tops.jpeg",
    posicao: "50% 38%",
    lugar: "col-span-1 mt-12 lg:col-span-4 lg:col-start-1 lg:row-start-3 lg:mt-24",
    proporcao: "aspect-[3/4]",
    sizes: "(min-width: 1024px) 30vw, 48vw",
  },
  saias: {
    foto: "/saias.jpeg",
    posicao: "50% 55%",
    lugar: "col-span-1 lg:col-span-4 lg:col-start-5 lg:row-start-3 lg:mt-48",
    proporcao: "aspect-[3/4]",
    sizes: "(min-width: 1024px) 30vw, 48vw",
  },
  acessorios: {
    foto: "/headpiece.jpeg",
    posicao: "50% 30%",
    lugar: "col-span-1 mt-12 lg:col-span-4 lg:col-start-9 lg:row-start-3 lg:mt-12",
    proporcao: "aspect-[3/4]",
    sizes: "(min-width: 1024px) 30vw, 48vw",
  },
};

const CATEGORIAS = VISTAS.filter((v) => v.slug in ARTE);

const EXTENSO = ["zero", "uma", "duas", "três", "quatro", "cinco", "seis", "sete", "oito", "nove"];
const porExtenso = (n: number) => EXTENSO[n] ?? String(n);

/** Faixa de preço no cartão ("R$ 950 a R$ 1.299,90"), como na /loja. */
function faixa(pecas: Produto[]) {
  const valores = pecas.map((p) => parcelamentoCartao(p).total);
  const min = Math.min(...valores);
  const max = Math.max(...valores);
  return min === max ? formatBRLPreco(min) : `${formatBRLPreco(min)} a ${formatBRLPreco(max)}`;
}

// Categorias como blocos editoriais grandes: a foto abre como cortina quando
// entra na tela e corre devagar dentro da moldura enquanto a página rola. No
// computador, o bloco inclina de leve na direção do mouse e a luz segue o
// cursor; no toque, o bloco no meio da tela acorda sozinho. Cada bloco leva
// para a vitrine da categoria (/loja?ver=<slug>).
export default function CategoriasHome() {
  return (
    <section
      id="categorias"
      aria-labelledby="categorias-titulo"
      className="relative bg-[#EDE7D9] pb-20 pt-14 md:pb-28 md:pt-20"
    >
      <div className="mx-auto grid max-w-[1380px] grid-cols-2 items-start gap-x-3 gap-y-9 px-4 md:gap-x-6 md:px-6 lg:grid-cols-12 lg:gap-x-7 lg:gap-y-0 lg:px-10 xl:px-14">
        <Revela className="col-span-2 lg:col-span-5 lg:col-start-8 lg:row-start-1 lg:self-end lg:pb-12">
          <p className={`text-[10px] font-bold uppercase tracking-[0.26em] text-brand-gold-text md:text-[11px] ${m.surge}`}>
            Categorias
          </p>
          <h2
            id="categorias-titulo"
            className="mt-3 font-[family-name:var(--font-serif)] text-[50px] leading-[0.95] tracking-[-0.015em] text-[#1B4965] min-[400px]:text-[54px] md:text-[84px] xl:text-[96px]"
          >
            <span className={m.linha}>
              <span className={m.sobe} style={atraso(60)}>
                O que você
              </span>
            </span>
            <span className={m.linha}>
              <span className={`${m.sobe} italic`} style={atraso(140)}>
                procura?
              </span>
            </span>
          </h2>
          <div className="mt-5 flex items-center gap-4">
            <span aria-hidden className={`h-[1.5px] w-12 shrink-0 md:w-24 ${m.ponto} ${m.costura}`} style={atraso(360)} />
            <p className={`text-[14px] leading-snug text-brand-muted md:text-[16px] ${m.surge}`} style={atraso(240)}>
              {contagemPecas(TOTAL_PECAS)} feitas à mão, em {porExtenso(CATEGORIAS.length)} categorias.
            </p>
          </div>
        </Revela>

        {CATEGORIAS.map((c) => (
          <Bloco
            key={c.slug}
            slug={c.slug}
            titulo={c.titulo}
            total={c.itens.length}
            faixa={faixa(c.itens)}
            arte={ARTE[c.slug]}
          />
        ))}

        <div className="col-span-2 mt-4 flex justify-center lg:col-span-12 lg:mt-20">
          <Link
            href="/loja"
            className="group inline-flex min-h-12 items-center gap-3 rounded-full border border-[#1B4965] px-7 text-[11px] font-bold uppercase tracking-[0.2em] text-[#1B4965] transition-[background-color,color,transform] duration-300 hover:bg-[#1B4965] hover:text-[#EDE7D9] active:scale-[0.97] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1B4965] focus-visible:ring-offset-2 focus-visible:ring-offset-[#EDE7D9]"
          >
            Ver todas as {TOTAL_PECAS} peças
            <svg className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14m-5-5 5 5-5 5" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}

function Bloco({
  slug,
  titulo,
  total,
  faixa,
  arte,
}: {
  slug: string;
  titulo: string;
  total: number;
  faixa: string;
  arte: Arte;
}) {
  const raizRef = useRef<HTMLDivElement>(null);
  const linkRef = useRef<HTMLAnchorElement>(null);
  useRevelar(raizRef);

  // A foto corre um pouco dentro da moldura enquanto o bloco atravessa a tela.
  const parado = useParado();
  const { scrollYProgress } = useScroll({ target: raizRef, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, (v) => (parado() ? "0%" : `${((v - 0.5) * 10).toFixed(2)}%`));

  // Inclinação e luz seguindo o mouse (só com mouse e sem movimento reduzido).
  useEffect(() => {
    const el = linkRef.current;
    if (!el) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let quadro = 0;
    const mover = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width;
      const py = (e.clientY - r.top) / r.height;
      cancelAnimationFrame(quadro);
      quadro = requestAnimationFrame(() => {
        el.dataset.movendo = "";
        el.style.setProperty("--ry", `${((px - 0.5) * 5).toFixed(2)}deg`);
        el.style.setProperty("--rx", `${((0.5 - py) * 4).toFixed(2)}deg`);
        el.style.setProperty("--mx", `${(px * 100).toFixed(1)}%`);
        el.style.setProperty("--my", `${(py * 100).toFixed(1)}%`);
      });
    };
    const sair = () => {
      cancelAnimationFrame(quadro);
      delete el.dataset.movendo;
      el.style.setProperty("--rx", "0deg");
      el.style.setProperty("--ry", "0deg");
    };
    el.addEventListener("pointermove", mover);
    el.addEventListener("pointerleave", sair);
    return () => {
      cancelAnimationFrame(quadro);
      el.removeEventListener("pointermove", mover);
      el.removeEventListener("pointerleave", sair);
    };
  }, []);

  // No toque não há hover: o bloco que passa pelo meio da tela acorda.
  useEffect(() => {
    const el = linkRef.current;
    if (!el || window.matchMedia("(hover: hover)").matches) return;
    const observador = new IntersectionObserver(
      ([entrada]) => {
        if (entrada.isIntersecting) el.dataset.ativo = "";
        else delete el.dataset.ativo;
      },
      { rootMargin: "-38% 0px -38% 0px" }
    );
    observador.observe(el);
    return () => observador.disconnect();
  }, []);

  const grande = Boolean(arte.grande);

  return (
    <div ref={raizRef} className={`${arte.lugar} ${m.revela}`}>
      <Link
        ref={linkRef}
        href={`/loja?ver=${slug}`}
        aria-label={`${titulo}: ${contagemPecas(total)}, de ${faixa}`}
        className={`group block rounded-[3px] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1B4965] focus-visible:ring-offset-4 focus-visible:ring-offset-[#EDE7D9] ${m.bloco}`}
      >
        <div className={`relative overflow-hidden rounded-[3px] bg-[#e3dccb] ${arte.proporcao} ${m.cortina}`}>
          <div className={`absolute inset-0 ${m.respira}`}>
            <motion.div style={{ y }} className="absolute -inset-y-[6%] inset-x-0">
              <div className={`absolute inset-0 ${m.blocoFoto}`}>
                <Image
                  src={arte.foto}
                  alt=""
                  fill
                  sizes={arte.sizes}
                  className="object-cover"
                  style={{ objectPosition: arte.posicao }}
                />
              </div>
            </motion.div>
          </div>
          {/* Véu para o nome em creme ler bem sobre qualquer foto. */}
          <div aria-hidden className="absolute inset-x-0 bottom-0 h-[62%] bg-gradient-to-t from-[#130209]/72 via-[#130209]/28 to-transparent" />
          <div aria-hidden className={`absolute inset-0 bg-[#1B4965]/15 opacity-0 ${m.blocoVeu}`} />
          <div aria-hidden className={`pointer-events-none absolute inset-0 ${m.brilho}`} />

          <span
            aria-hidden
            className={`absolute right-3 top-3 flex items-center justify-center rounded-full bg-[#EDE7D9] text-[#1B4965] shadow-[0_8px_20px_-8px_rgba(19,2,9,0.5)] md:right-5 md:top-5 ${
              grande ? "h-12 w-12 md:h-14 md:w-14" : "h-10 w-10 md:h-12 md:w-12"
            } ${m.blocoSeta}`}
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M7 17 17 7m-8 0h8v8" />
            </svg>
          </span>

          <div className={`absolute inset-x-0 bottom-0 text-[#EDE7D9] ${grande ? "p-5 md:p-8" : "p-3.5 md:p-6"}`}>
            <p className={`flex items-baseline gap-2 ${m.blocoNome}`}>
              <span
                className={`font-[family-name:var(--font-serif)] leading-[0.95] tracking-[-0.01em] ${
                  grande ? "text-[44px] md:text-[64px] xl:text-[76px]" : "text-[25px] min-[400px]:text-[27px] md:text-[40px] xl:text-[46px]"
                }`}
              >
                {titulo}
              </span>
              <span className={`font-[family-name:var(--font-serif)] italic text-[#e6cf8f] ${grande ? "text-[18px] md:text-[22px]" : "text-[14px] md:text-[18px]"}`}>
                {total}
              </span>
            </p>
            <span aria-hidden className={`mt-2.5 block h-[1.5px] md:mt-3.5 ${grande ? "w-28 md:w-40" : "w-16 md:w-24"} ${m.pontoClaro} ${m.blocoLinha}`} />
          </div>
        </div>

        <p className={`mt-2.5 flex flex-wrap items-baseline gap-x-2 text-[12.5px] leading-snug text-brand-muted md:mt-3.5 md:text-[14px] ${m.surge}`} style={atraso(180)}>
          <span className="font-[family-name:var(--font-serif)] text-[15px] italic text-brand-gold-text md:text-[17px]">{contagemPecas(total)}</span>
          <span className="nums-preco">{faixa}</span>
        </p>
      </Link>
    </div>
  );
}
