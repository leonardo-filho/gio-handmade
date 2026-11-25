"use client";

import { useCallback, useEffect, useRef } from "react";
import { motion, useMotionValueEvent, useScroll, useTransform } from "framer-motion";
import { atraso, movimentoReduzido } from "@/components/vitrine/movimento";
import { IconeWhatsApp } from "./Icones";
import { useParado } from "./parado";
import Revela from "./Revela";
import m from "./home.module.css";
import { PAGAMENTO, PASSOS, WA_ORCAMENTO } from "./textos";

// Do pedido à entrega numa linha do tempo que se costura, sobre um painel
// navy que se abre até as bordas quando chega (a pausa escura da página, como
// o "De perto" da /loja). Um fio dourado desce pelos passos acompanhando a
// rolagem, com a agulha na ponta, e cada passo acende quando o fio chega
// nele. Não prende a rolagem: a página segue no ritmo de quem rola. No
// computador, o título e as formas de pagamento ficam presos ao lado.
export default function ProcessoHome() {
  const secaoRef = useRef<HTMLElement>(null);
  const listaRef = useRef<HTMLOListElement>(null);
  const guiaRef = useRef<HTMLSpanElement>(null);
  const fioRef = useRef<HTMLSpanElement>(null);
  const agulhaRef = useRef<HTMLSpanElement>(null);
  const medidas = useRef<{ topo: number; fim: number; altura: number; nos: number[] }>({
    topo: 0,
    fim: 0,
    altura: 1,
    nos: [],
  });

  // O painel chega recolhido, com cantos redondos, se abre até as bordas e
  // volta a se recolher quando sai por cima.
  const { scrollYProgress: chegada } = useScroll({ target: secaoRef, offset: ["start end", "start 15%"] });
  const { scrollYProgress: saida } = useScroll({ target: secaoRef, offset: ["end 70%", "end start"] });
  const parado = useParado();
  const recorte = useTransform([chegada, saida], ([c, s]: number[]) => {
    if (parado()) return "inset(0px 0px 0px 0px round 0px)";
    const f = Math.max(1 - Math.min(1, Math.max(0, c)), Math.min(1, Math.max(0, s)));
    return `inset(0px ${(f * 4).toFixed(2)}% 0px ${(f * 4).toFixed(2)}% round ${(f * 28).toFixed(1)}px)`;
  });

  // A ponta do fio segue a linha de 62% da altura da tela.
  const { scrollYProgress } = useScroll({ target: listaRef, offset: ["start 62%", "end 62%"] });

  const desenhar = useCallback((p: number) => {
    const lista = listaRef.current;
    const fio = fioRef.current;
    const agulha = agulhaRef.current;
    if (!lista || !fio || !agulha) return;
    const { topo, fim, altura, nos } = medidas.current;
    const parado = movimentoReduzido();
    const ponta = parado ? fim : Math.min(fim, Math.max(topo, p * altura));
    const feito = fim > topo ? (ponta - topo) / (fim - topo) : 1;
    fio.style.clipPath = `inset(0 0 ${((1 - feito) * 100).toFixed(2)}% 0)`;
    agulha.style.transform = `translate3d(-50%, ${(ponta - topo).toFixed(1)}px, 0)`;
    agulha.style.opacity = parado || feito >= 0.999 || feito <= 0.001 ? "0" : "1";
    lista.querySelectorAll<HTMLElement>("[data-passo]").forEach((el, i) => {
      if (ponta >= (nos[i] ?? 0) - 6) el.dataset.ativo = "";
      else delete el.dataset.ativo;
    });
  }, []);

  useMotionValueEvent(scrollYProgress, "change", desenhar);

  // Mede onde fica o centro de cada nó (o fio vai do primeiro ao último).
  useEffect(() => {
    const lista = listaRef.current;
    const guia = guiaRef.current;
    const fio = fioRef.current;
    if (!lista || !guia || !fio) return;
    lista.dataset.fio = "";
    const medir = () => {
      const base = lista.getBoundingClientRect().top;
      const nos = Array.from(lista.querySelectorAll<HTMLElement>("[data-no]")).map((n) => {
        const r = n.getBoundingClientRect();
        return r.top - base + r.height / 2;
      });
      const topo = nos[0] ?? 0;
      const fim = nos[nos.length - 1] ?? 0;
      medidas.current = { topo, fim, altura: Math.max(1, lista.offsetHeight), nos };
      for (const el of [guia, fio]) {
        el.style.top = `${topo}px`;
        el.style.height = `${Math.max(0, fim - topo)}px`;
      }
      const agulha = agulhaRef.current;
      if (agulha) agulha.style.top = `${topo}px`;
      desenhar(scrollYProgress.get());
    };
    const observador = new ResizeObserver(medir);
    observador.observe(lista);
    return () => {
      observador.disconnect();
      delete lista.dataset.fio;
    };
  }, [desenhar, scrollYProgress]);

  return (
    <section ref={secaoRef} id="processo" aria-labelledby="processo-titulo" className="relative bg-[#EDE7D9]">
      <motion.div style={{ clipPath: recorte }} className="bg-[#1B4965] pb-24 pt-20 text-[#EDE7D9] md:pb-36 md:pt-32">
        <div className="mx-auto max-w-[1380px] px-4 md:px-6 lg:grid lg:grid-cols-12 lg:gap-x-7 lg:px-10 xl:px-14">
          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-[calc(var(--header-h,93px)+48px)]">
              <Revela>
                <p className={`text-[10px] font-bold uppercase tracking-[0.26em] text-[#e6cf8f] md:text-[11px] ${m.surge}`}>
                  Como funciona
                </p>
                <h2
                  id="processo-titulo"
                  className="mt-3 font-[family-name:var(--font-serif)] text-[50px] leading-[0.95] tracking-[-0.015em] min-[400px]:text-[54px] md:text-[84px] xl:text-[96px]"
                >
                  <span className={m.linha}>
                    <span className={m.sobe} style={atraso(60)}>
                      Do pedido
                    </span>
                  </span>
                  <span className={m.linha}>
                    <span className={m.sobe} style={atraso(140)}>
                      à <em className="text-[#e6cf8f]">entrega</em>
                    </span>
                  </span>
                </h2>
                <div className="mt-5 flex items-center gap-4 md:mt-7">
                  <span aria-hidden className={`h-[1.5px] w-12 shrink-0 md:w-24 ${m.pontoClaro} ${m.costura}`} style={atraso(360)} />
                  <p className={`max-w-sm text-[15px] leading-relaxed text-[#C8E1E4] md:text-[17px] ${m.surge}`} style={atraso(260)}>
                    Cada detalhe importa. Feito para quem entende detalhes.
                  </p>
                </div>
              </Revela>
              <Pagamento className="mt-12 hidden lg:block" />
            </div>
          </div>

          <ol ref={listaRef} className="relative mt-14 lg:col-span-6 lg:col-start-7 lg:mt-3">
            {/* O caminho do fio (claro) e o fio já costurado (dourado). */}
            <span aria-hidden ref={guiaRef} className="absolute left-[22px] w-px -translate-x-1/2 bg-[#EDE7D9]/20 md:left-[28px]" />
            <span
              aria-hidden
              ref={fioRef}
              className={`absolute left-[22px] w-[2px] -translate-x-1/2 md:left-[28px] ${m.pontoVertical}`}
            />
            <span aria-hidden ref={agulhaRef} className="pointer-events-none absolute left-[22px] z-10 opacity-0 md:left-[28px]">
              <Agulha />
            </span>

            {PASSOS.map((p, i) => (
              <li
                key={p.titulo}
                data-passo
                className={`relative pb-16 pl-16 last:pb-0 md:min-h-[38vh] md:pl-24 lg:min-h-[44vh] md:last:min-h-0 ${m.passo}`}
              >
                <span
                  data-no
                  aria-hidden
                  className={`absolute left-0 top-0 flex h-11 w-11 items-center justify-center rounded-full border font-[family-name:var(--font-serif)] text-[20px] italic md:h-14 md:w-14 md:text-[24px] ${m.no}`}
                >
                  {i + 1}
                </span>
                <div className={m.passoTexto}>
                  <p className="pt-1.5 text-[10px] font-bold uppercase tracking-[0.24em] text-[#e6cf8f] md:pt-3 md:text-[11px]">
                    Passo {String(i + 1).padStart(2, "0")}
                  </p>
                  <h3 className="mt-1.5 font-[family-name:var(--font-serif)] text-[32px] leading-[1.02] md:text-[46px]">{p.titulo}</h3>
                  <p className="mt-3 max-w-md text-[15px] leading-relaxed text-[#EDE7D9]/85 md:text-[17px]">{p.texto}</p>
                  {"destaque" in p && (
                    <span className="mt-4 inline-flex items-center gap-2 rounded-full border border-[#e6cf8f]/55 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-[#e6cf8f]">
                      <span aria-hidden className="h-[6px] w-[6px] rounded-full bg-[#d8b860]" />
                      {p.destaque}
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ol>

          <Pagamento className="mt-16 lg:hidden" />
        </div>
      </motion.div>
    </section>
  );
}

function Pagamento({ className = "" }: { className?: string }) {
  return (
    <Revela className={className}>
      <div className={`rounded-[4px] border border-[#EDE7D9]/20 p-5 md:p-7 ${m.surge}`}>
        <p className="text-[10px] font-bold uppercase tracking-[0.26em] text-[#C8E1E4] md:text-[11px]">Formas de pagamento</p>
        <dl className="mt-3 divide-y divide-[#EDE7D9]/14">
          {PAGAMENTO.map((f) => (
            <div key={f.titulo} className="flex items-baseline gap-4 py-3.5 md:gap-6">
              <dt className="w-16 shrink-0 font-[family-name:var(--font-serif)] text-[24px] leading-none md:w-20 md:text-[28px]">{f.titulo}</dt>
              <dd className="text-[14px] leading-relaxed text-[#EDE7D9]/82 md:text-[15px]">{f.texto}</dd>
            </div>
          ))}
        </dl>
        <a
          href={WA_ORCAMENTO}
          target="_blank"
          rel="noopener noreferrer"
          className="group mt-4 inline-flex min-h-12 w-full items-center justify-center gap-3 rounded-full bg-[#EDE7D9] px-6 text-[11px] font-bold uppercase tracking-[0.2em] text-[#1B4965] transition-[background-color,transform] duration-300 hover:bg-white active:scale-[0.97] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#e6cf8f] focus-visible:ring-offset-2 focus-visible:ring-offset-[#1B4965] sm:w-auto"
        >
          <IconeWhatsApp className="h-[18px] w-[18px]" />
          Pedir orçamento
        </a>
      </div>
    </Revela>
  );
}

// Agulha na ponta do fio: o fio passa pelo buraco e a ponta segue na frente.
function Agulha() {
  return (
    <svg width="14" height="46" viewBox="0 0 14 46" className="-mt-[9px] block drop-shadow-[0_2px_4px_rgba(19,2,9,0.45)]">
      <path d="M7 45.5 5.5 14C5.4 8 5.6 3.5 7 1.5c1.4 2 1.6 6.5 1.5 12.5z" fill="#EDE7D9" />
      <path d="M7 45.5 7 14c0-6 .3-10.5 0-12.5 1.4 2 1.6 6.5 1.5 12.5z" fill="#C8E1E4" />
      <ellipse cx="7" cy="9" rx="0.85" ry="3.1" fill="#1B4965" />
    </svg>
  );
}
