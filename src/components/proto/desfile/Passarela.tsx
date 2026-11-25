"use client";

// Passarela do desktop: o look atual grande no centro e os vizinhos menores
// dos lados, todos de pé na mesma linha de chão. Setas do teclado, roda do
// mouse (ou o arrasto de lado do trackpad), as setas da tela e o clique num
// vizinho passam os looks. Clicar na foto passa as fotos da peça, como nos
// stories; na última foto, segue para o próximo look.
//
// Cada foto aparece inteira, com a moldura no formato dela (a proporção vem
// do servidor, em ./proporcoes.ts).

import { useEffect, useEffectEvent, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import type { Produto } from "@/data/produtos";
import type { Proporcoes } from "./proporcoes";
import {
  AcoesLook,
  EASE_OUT_EXPO,
  SeloPronta,
  doisDigitos,
  fotosDe,
  partesDoNome,
  precoDe,
} from "./comum";

// Altura do palco que não é foto: respiro de cima, legenda e respiro de baixo.
const FORA_DA_FOTO = 254;
const RESPIRO_TOPO = 46;
// Altura do palco no HTML do servidor (1440 x 900), até a medida real chegar.
const PALCO_PADRAO = 731;

// Escala e opacidade por distância do centro. O terceiro vizinho fica
// invisível, esperando a vez na coxia.
const ESCALA = [1, 0.62, 0.44, 0.32];
const OPACIDADE = [1, 0.5, 0.24, 0];
const VAO = [0, 44, 32, 26];
const ALCANCE = 3;

type Props = {
  lista: Produto[];
  /** Look em que a passarela abre (depois, o estado é dela). */
  inicio: number;
  proporcoes: Proporcoes;
  /**
   * Tela larga confirmada: as fotos montadas carregam já. Antes disso (HTML
   * do servidor, que também vai ao celular, escondido), só a foto do centro.
   */
  adiantar: boolean;
  /** Modal ou carrinho aberto: o teclado e a roda não passam looks. */
  bloqueado: boolean;
  onAtual: (id: string) => void;
  onDetalhes: (id: string) => void;
};

export default function Passarela({ lista, inicio, proporcoes, adiantar, bloqueado, onAtual, onDetalhes }: Props) {
  const palcoRef = useRef<HTMLDivElement>(null);
  const [atual, setAtual] = useState(inicio);
  const [palcoH, setPalcoH] = useState(PALCO_PADRAO);
  // Foto escolhida no look atual (volta para a primeira ao trocar de look).
  const [fotoSel, setFotoSel] = useState<{ indice: number; foto: number }>({ indice: inicio, foto: 0 });
  const total = lista.length;
  const produto = lista[atual];
  const fotos = fotosDe(produto);
  const foto = fotoSel.indice === atual ? Math.min(fotoSel.foto, fotos.length - 1) : 0;
  const preco = precoDe(produto);
  const nome = partesDoNome(produto.nome);

  const H = Math.round(Math.max(280, Math.min(660, palcoH - FORA_DA_FOTO)));
  const proporcao = (src: string) => proporcoes[src] ?? 0.75;

  // Mede o palco (a foto acompanha a altura da janela).
  useEffect(() => {
    const el = palcoRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entrada]) => {
      const h = entrada.contentRect.height;
      if (h > 0) setPalcoH(h);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  function ir(i: number) {
    const destino = Math.max(0, Math.min(total - 1, i));
    if (destino === atual) return;
    setAtual(destino);
    onAtual(lista[destino].id);
  }

  function irFoto(j: number) {
    if (j >= fotos.length) return ir(atual + 1);
    if (j < 0) return;
    setFotoSel({ indice: atual, foto: j });
  }

  // Teclado: setas para os lados, fora de campos de texto e com o palco à vista.
  const aoTeclar = useEffectEvent((e: KeyboardEvent) => {
    if (bloqueado || e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    const alvo = e.target as HTMLElement | null;
    if (alvo?.closest("input, textarea, select, [contenteditable='true'], [role='dialog']")) return;
    const r = palcoRef.current?.getBoundingClientRect();
    if (!r || r.bottom < window.innerHeight * 0.4 || r.top > window.innerHeight * 0.6) return;
    e.preventDefault();
    ir(atual + (e.key === "ArrowRight" ? 1 : -1));
  });

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => aoTeclar(e);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Roda e trackpad: um gesto passa um look. Enquanto o gesto continua (a
  // inércia do trackpad manda eventos por quase um segundo), nada mais passa.
  // Na ponta da passarela, ou com a página já rolada, a roda volta a rolar a
  // página normalmente (pelo Lenis).
  const gesto = useRef({ acumulado: 0, travado: false, timer: 0, passo: 0 });
  const aoRodar = useEffectEvent((e: WheelEvent) => {
    if (bloqueado || e.ctrlKey) return;
    const d = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
    if (d === 0) return;
    const g = gesto.current;
    const destino = atual + Math.sign(d);
    const paginaNoTopo = window.scrollY < 40;
    if (!paginaNoTopo || (!g.travado && (destino < 0 || destino >= total))) {
      g.acumulado = 0;
      return;
    }
    e.preventDefault();
    (e as WheelEvent & { lenisStopPropagation?: boolean }).lenisStopPropagation = true;
    window.clearTimeout(g.timer);
    g.timer = window.setTimeout(() => {
      g.travado = false;
      g.acumulado = 0;
    }, 220);
    // Roda de mouse girando sem pausa: cada dente grande, depois de um
    // intervalo, conta como gesto novo (a inércia do trackpad já é miúda aí).
    const agora = performance.now();
    if (g.travado && !(Math.abs(d) >= 50 && agora - g.passo > 450)) return;
    g.acumulado += d;
    if (Math.abs(g.acumulado) >= 36) {
      g.travado = true;
      g.acumulado = 0;
      g.passo = agora;
      ir(destino);
    }
  });

  useEffect(() => {
    const el = palcoRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => aoRodar(e);
    el.addEventListener("wheel", onWheel, { passive: false });
    const g = gesto.current;
    return () => {
      el.removeEventListener("wheel", onWheel);
      window.clearTimeout(g.timer);
    };
  }, []);

  // Posição de cada vizinho: encostados uns nos outros, com o vão da tabela.
  const largura = (i: number) => {
    const p = lista[i];
    const src = i === atual ? fotos[foto] : p.foto;
    return H * proporcao(src);
  };
  const posicao = (i: number) => {
    const k = i - atual;
    const passo = Math.sign(k);
    let x = 0;
    for (let d = 1; d <= Math.abs(k); d++) {
      const anterior = atual + passo * (d - 1);
      const este = atual + passo * d;
      const meiaAnterior = (lista[anterior] ? largura(anterior) : H * 0.75) * ESCALA[d - 1] * 0.5;
      const meiaEste = (lista[este] ? largura(este) : H * 0.75) * ESCALA[d] * 0.5;
      x += passo * (meiaAnterior + VAO[d] + meiaEste);
    }
    return x;
  };

  // Toque (tablet deitado também vê a passarela): arrastar para o lado passa
  // o look. O clique que o navegador manda no fim do arrasto é descartado.
  const toque = useRef<{ x: number; y: number; id: number } | null>(null);
  const arrastou = useRef(false);
  function aoTocar(e: React.PointerEvent) {
    if (e.pointerType === "mouse") return;
    toque.current = { x: e.clientX, y: e.clientY, id: e.pointerId };
  }
  function aoSoltar(e: React.PointerEvent) {
    const t = toque.current;
    toque.current = null;
    if (!t || t.id !== e.pointerId) return;
    const dx = e.clientX - t.x;
    const dy = e.clientY - t.y;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.3) {
      arrastou.current = true;
      ir(atual + (dx < 0 ? 1 : -1));
    }
  }
  function engolirClique(e: React.MouseEvent) {
    if (!arrastou.current) return;
    arrastou.current = false;
    e.preventDefault();
    e.stopPropagation();
  }

  const transicao = { duration: 0.7, ease: EASE_OUT_EXPO };

  return (
    <div
      ref={palcoRef}
      role="region"
      aria-roledescription="passarela"
      aria-label="Desfile das peças"
      onPointerDown={aoTocar}
      onPointerUp={aoSoltar}
      onPointerCancel={() => (toque.current = null)}
      onClickCapture={engolirClique}
      className="relative h-[var(--palco-h)] min-h-[540px] touch-pan-y overflow-hidden bg-[#130209] text-[#EDE7D9]"
    >
      {/* Luz de palco e chão */}
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_55%_70%_at_50%_0%,rgba(237,231,217,0.13),transparent_70%)]" />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 bg-[linear-gradient(to_bottom,rgba(184,144,42,0.07),transparent_60%)]"
        style={{ top: RESPIRO_TOPO + H }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-[#b8902a]/55 to-transparent"
        style={{ top: RESPIRO_TOPO + H }}
      />

      {/* Número do look, grande, atrás das fotos */}
      <AnimatePresence initial={false}>
        <motion.p
          key={atual}
          aria-hidden
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="nums-preco pointer-events-none absolute left-[6%] top-2 select-none font-[family-name:var(--font-serif)] text-[clamp(10rem,22vw,20rem)] italic leading-none text-[#EDE7D9]/[0.05]"
        >
          {doisDigitos(atual + 1)}
        </motion.p>
      </AnimatePresence>

      {/* Os looks */}
      <div className="absolute inset-x-0" style={{ top: RESPIRO_TOPO, height: H }}>
        {lista.map((p, i) => {
          const k = i - atual;
          const dist = Math.abs(k);
          if (dist > ALCANCE) return null;
          const centro = k === 0;
          const w = largura(i);
          const fotosLook = centro ? fotos : [p.foto];
          const larguraExibida = Math.round(w * ESCALA[dist]);
          return (
            <motion.div
              key={p.id}
              className="absolute bottom-0 left-1/2 w-0"
              style={{ height: H, transformOrigin: "50% 100%", zIndex: 10 - dist }}
              initial={{ opacity: 0, x: posicao(i), scale: ESCALA[dist] }}
              animate={{ opacity: OPACIDADE[dist], x: posicao(i), scale: ESCALA[dist] }}
              transition={transicao}
            >
              <motion.div
                className="absolute bottom-0 left-0 h-full -translate-x-1/2"
                initial={false}
                animate={{ width: w }}
                transition={transicao}
              >
                <div className="absolute inset-0 overflow-hidden bg-[#1d0f14] shadow-[0_30px_80px_-30px_rgba(0,0,0,0.9)]">
                {dist < ALCANCE &&
                  fotosLook.map((f, j) => {
                    const ativa = centro ? j === foto : true;
                    return (
                      <Image
                        key={f}
                        src={f}
                        alt={centro && ativa ? (fotos.length > 1 ? `${p.nome}, foto ${j + 1} de ${fotos.length}` : p.nome) : ""}
                        fill
                        sizes={`(min-width: 1024px) ${Math.max(larguraExibida, 60)}px, 16px`}
                        loading={adiantar || (centro && j === 0) ? "eager" : "lazy"}
                        fetchPriority={centro && j === 0 && i === inicio ? "high" : undefined}
                        draggable={false}
                        className={`object-cover transition-opacity duration-500 ${ativa ? "opacity-100" : "opacity-0"}`}
                      />
                    );
                  })}

                {centro ? (
                  <>
                    {/* Clique na foto: terço esquerdo volta, o resto avança */}
                    <button
                      type="button"
                      tabIndex={-1}
                      aria-hidden
                      onClick={() => irFoto(foto - 1)}
                      className="absolute inset-y-0 left-0 w-1/3 cursor-w-resize focus:outline-none"
                    />
                    <button
                      type="button"
                      tabIndex={-1}
                      aria-hidden
                      onClick={() => irFoto(foto + 1)}
                      className="absolute inset-y-0 right-0 w-2/3 cursor-e-resize focus:outline-none"
                    />
                  </>
                ) : (
                  <button
                    type="button"
                    tabIndex={-1}
                    aria-hidden
                    onClick={() => ir(i)}
                    className="absolute inset-0 cursor-pointer bg-[#130209]/0 transition-colors hover:bg-[#EDE7D9]/10 focus:outline-none"
                  />
                )}
                </div>

                {/* Barrinhas das fotos, logo acima da moldura */}
                {centro && fotos.length > 1 && (
                      <div className="absolute inset-x-0 bottom-full flex gap-1" role="group" aria-label="Fotos da peça">
                        {fotos.map((f, j) => (
                          <button
                            key={f}
                            type="button"
                            onClick={() => irFoto(j)}
                            aria-label={`Foto ${j + 1} de ${fotos.length}`}
                            aria-current={j === foto ? "true" : undefined}
                            className="group flex h-11 flex-1 items-center focus:outline-none"
                          >
                            <span className="relative h-[3px] w-full overflow-hidden rounded-full bg-[#EDE7D9]/40 group-focus-visible:outline group-focus-visible:outline-2 group-focus-visible:outline-offset-4 group-focus-visible:outline-[#EDE7D9]">
                              <span
                                className={`absolute inset-y-0 left-0 rounded-full bg-[#EDE7D9] transition-[width] duration-300 ${
                                  j <= foto ? "w-full" : "w-0"
                                }`}
                              />
                            </span>
                          </button>
                        ))}
                      </div>
                )}
              </motion.div>
            </motion.div>
          );
        })}
      </div>

      {/* Setas */}
      <BotaoSeta lado="esq" disabled={atual === 0} onClick={() => ir(atual - 1)} top={RESPIRO_TOPO + H / 2} />
      <BotaoSeta lado="dir" disabled={atual === total - 1} onClick={() => ir(atual + 1)} top={RESPIRO_TOPO + H / 2} />

      {/* Legenda do look */}
      <div className="absolute inset-x-0 px-6 text-center" style={{ top: RESPIRO_TOPO + H + 16 }}>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={produto.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.28, ease: EASE_OUT_EXPO }}
          >
            <p className="flex items-center justify-center gap-3 text-[11px] font-bold uppercase tracking-[0.28em] text-[#d2ad55]">
              <span>
                Look <span className="nums-preco">{doisDigitos(atual + 1)}</span>
                <span className="text-[#EDE7D9]/75"> de {total}</span>
              </span>
              {produto.categoria === "Coleção Solaris" && (
                <>
                  <span aria-hidden className="h-px w-6 bg-[#b8902a]/60" />
                  <span>Coleção Solaris</span>
                </>
              )}
              {produto.prontaEntrega && <SeloPronta className="ml-1" />}
            </p>
            <h2 className="mt-1.5 flex items-baseline justify-center gap-3 text-[#EDE7D9]">
              {nome.tipo && (
                <span className="text-[12px] font-bold uppercase tracking-[0.32em] text-[#EDE7D9]/80">{nome.tipo} </span>
              )}
              <span className="font-[family-name:var(--font-serif)] text-[52px] italic leading-[1.05]">{nome.proprio}</span>
            </h2>
            <p className="flex flex-wrap items-baseline justify-center gap-x-2 text-[15px]">
              <span className="nums-preco font-[family-name:var(--font-serif)] text-[24px] font-medium">{preco.cartao}</span>
              <span>{preco.parcelas}</span>
              <span aria-hidden className="text-[#EDE7D9]/50">·</span>
              <span className="text-[#EDE7D9]/80">ou {preco.pix} no pix</span>
            </p>
            <div className="mt-4">
              <AcoesLook produto={produto} onDetalhes={() => onDetalhes(produto.id)} largo />
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <p className="pointer-events-none absolute bottom-5 left-6 hidden text-[11px] uppercase tracking-[0.22em] text-[#EDE7D9]/70 xl:block">
        <span aria-hidden>← →</span> ou role para passar os looks
      </p>

      {/* Leitor de tela: anuncia o look novo */}
      <p className="sr-only" aria-live="polite">
        {`Look ${atual + 1} de ${total}: ${produto.nome}`}
      </p>
    </div>
  );
}

function BotaoSeta({
  lado,
  disabled,
  onClick,
  top,
}: {
  lado: "esq" | "dir";
  disabled: boolean;
  onClick: () => void;
  top: number;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={lado === "esq" ? "Look anterior" : "Próximo look"}
      style={{ top }}
      className={`absolute z-20 flex h-14 w-14 -translate-y-1/2 items-center justify-center rounded-full border border-[#EDE7D9]/35 bg-[#130209]/50 text-[#EDE7D9] backdrop-blur-sm transition-colors hover:border-[#EDE7D9] hover:bg-[#EDE7D9]/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#EDE7D9] disabled:pointer-events-none disabled:opacity-25 ${
        lado === "esq" ? "left-6" : "right-6"
      }`}
    >
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} aria-hidden>
        {lado === "esq" ? (
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 5l-7 7 7 7" />
        ) : (
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        )}
      </svg>
    </button>
  );
}
