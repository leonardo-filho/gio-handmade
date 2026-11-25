"use client";

// Desfile do celular: uma peça por tela, como nos stories e reels.
//
// Rolagem vertical com snap num contêiner próprio (data-lenis-prevent: o
// Lenis da página não mexe nele). Cada look tem um trilho horizontal com as
// fotos da peça (arrastar para o lado, ou tocar nas bordas como nos stories) e
// as barrinhas de progresso no topo. Por cima, em degradê, nome, preço e as
// ações de compra.
//
// Desempenho: só os looks vizinhos do atual montam a foto. No look atual, as
// fotos seguintes entram uma de cada vez, conforme a cliente passa.

import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import type { Produto } from "@/data/produtos";
import {
  AcoesLook,
  EASE_OUT_EXPO,
  SeloPronta,
  doisDigitos,
  fotosDe,
  partesDoNome,
  precoDe,
  preferirSemMovimento,
} from "./comum";

// No desktop esta versão fica escondida (e some depois da hidratação): o
// tamanho mínimo evita baixar a foto grande à toa no HTML do servidor.
const SIZES = "(min-width: 1024px) 16px, 100vw";

type Props = {
  lista: Produto[];
  /** Look em que o desfile abre (link de story ou toque na grade). */
  inicio: number;
  /** Nome da vista, para a tela final. */
  tituloVista: string;
  /**
   * HTML do servidor e hidratação: os looks antes do inicial ficam fora do
   * fluxo, para a primeira pintura já ser o look do link (o contêiner ainda
   * não rolou). Depois da hidratação eles voltam e o contêiner rola até ele.
   */
  preChegada: boolean;
  filtrada: boolean;
  onAtual: (id: string) => void;
  onDetalhes: (id: string) => void;
  onVerGrade: () => void;
  onVerTodas: () => void;
};

export default function DesfileCelular({
  lista,
  inicio,
  tituloVista,
  preChegada,
  filtrada,
  onAtual,
  onDetalhes,
  onVerGrade,
  onVerTodas,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const quadro = useRef(0);
  // Só o look da montagem conta: depois, quem manda é a rolagem (a página
  // segue o look atual por onAtual, e `inicio` acompanha).
  const [inicioMontagem] = useState(inicio);
  const [atual, setAtual] = useState(inicio);
  const [rolou, setRolou] = useState(inicio > 0);
  const total = lista.length;

  // Abre já no look pedido, antes da primeira pintura.
  useLayoutEffect(() => {
    const el = ref.current;
    if (el && !preChegada && inicioMontagem > 0) el.scrollTop = inicioMontagem * el.clientHeight;
  }, [inicioMontagem, preChegada]);

  // A dica de "deslize" sai sozinha depois de um tempo.
  useEffect(() => {
    if (rolou) return;
    const t = window.setTimeout(() => setRolou(true), 4200);
    return () => window.clearTimeout(t);
  }, [rolou]);

  useEffect(() => () => cancelAnimationFrame(quadro.current), []);

  function aoRolar() {
    cancelAnimationFrame(quadro.current);
    quadro.current = requestAnimationFrame(() => {
      const el = ref.current;
      if (!el || el.clientHeight === 0) return;
      const i = Math.min(total, Math.max(0, Math.round(el.scrollTop / el.clientHeight)));
      setAtual(i);
      if (i > 0) setRolou(true);
      if (i < total) onAtual(lista[i].id);
    });
  }

  function irLook(i: number) {
    const el = ref.current;
    if (!el) return;
    el.scrollTo({ top: i * el.clientHeight, behavior: preferirSemMovimento() ? "auto" : "smooth" });
  }
  const voltarAoComeco = () => irLook(0);

  return (
    <div className="relative">
      <div
        ref={ref}
        onScroll={aoRolar}
        data-lenis-prevent
        aria-label={`Desfile: ${tituloVista}`}
        role="region"
        className="h-[var(--palco-h)] snap-y snap-mandatory overflow-y-auto bg-[#130209] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {lista.map((p, i) => (
          <LookCelular
            key={p.id}
            produto={p}
            indice={i}
            total={total}
            perto={Math.abs(i - atual) <= 1}
            ehAtual={i === atual}
            prioridade={i === inicioMontagem}
            oculto={preChegada && i < inicioMontagem}
            onDetalhes={onDetalhes}
            onProximoLook={() => irLook(i + 1)}
          />
        ))}
        <FimDoDesfile
          total={total}
          tituloVista={tituloVista}
          filtrada={filtrada}
          onVerGrade={onVerGrade}
          onVerTodas={onVerTodas}
          onVoltar={voltarAoComeco}
        />
      </div>

      {/* Dica da primeira visita: some ao rolar ou depois de uns segundos. */}
      <AnimatePresence>
        {!rolou && atual === 0 && total > 1 && (
          <motion.p
            aria-hidden
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: EASE_OUT_EXPO, delay: 0.6 }}
            className="pointer-events-none absolute left-4 top-[88px] flex items-center gap-1.5 whitespace-nowrap rounded-full bg-[#130209]/55 py-1.5 pl-2 pr-3 text-[10px] font-bold uppercase tracking-[0.2em] text-[#EDE7D9] backdrop-blur-md"
          >
            <svg className="h-3.5 w-3.5 motion-safe:animate-bounce" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 19V5m0 0-6 6m6-6 6 6" />
            </svg>
            Deslize para o próximo look
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

function LookCelular({
  produto,
  indice,
  total,
  perto,
  ehAtual,
  prioridade,
  oculto,
  onDetalhes,
  onProximoLook,
}: {
  produto: Produto;
  indice: number;
  total: number;
  perto: boolean;
  ehAtual: boolean;
  prioridade: boolean;
  oculto: boolean;
  onDetalhes: (id: string) => void;
  /** Toque na borda direita na última foto: segue para o próximo look, como nos stories. */
  onProximoLook: () => void;
}) {
  const fotos = fotosDe(produto);
  const preco = precoDe(produto);
  const nomeId = useId();
  const trilhoRef = useRef<HTMLDivElement>(null);
  const [foto, setFoto] = useState(0);
  // Até onde a cliente já passou: as fotos até a seguinte a essa ficam montadas.
  const [vistaAte, setVistaAte] = useState(0);
  const solaris = produto.categoria === "Coleção Solaris";
  const nome = partesDoNome(produto.nome);

  function aoRolarFotos() {
    const el = trilhoRef.current;
    if (!el || el.clientWidth === 0) return;
    const j = Math.round(el.scrollLeft / el.clientWidth);
    setFoto(j);
    setVistaAte((v) => Math.max(v, j));
  }

  function irFoto(j: number) {
    const el = trilhoRef.current;
    if (!el) return;
    const alvo = Math.max(0, Math.min(fotos.length - 1, j));
    setVistaAte((v) => Math.max(v, alvo));
    el.scrollTo({ left: alvo * el.clientWidth, behavior: preferirSemMovimento() ? "auto" : "smooth" });
  }

  // Toque nas bordas passa a foto, como nos stories; na última foto, a borda
  // direita leva ao próximo look.
  function aoTocar(e: React.MouseEvent<HTMLDivElement>) {
    const r = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    if (x > 0.66) {
      if (foto >= fotos.length - 1) onProximoLook();
      else irFoto(foto + 1);
    } else if (x < 0.34) irFoto(foto - 1);
  }

  const abrir = () => onDetalhes(produto.id);

  return (
    <article
      aria-labelledby={nomeId}
      data-look={produto.id}
      hidden={oculto || undefined}
      className="relative h-full w-full snap-start snap-always overflow-hidden bg-[#130209]"
    >
      {/* Trilho das fotos */}
      <div
        ref={trilhoRef}
        onScroll={aoRolarFotos}
        onClick={aoTocar}
        className="absolute inset-0 flex snap-x snap-mandatory overflow-x-auto overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {fotos.map((f, j) => {
          const montar = perto && (j === 0 || (ehAtual && j <= vistaAte + 1));
          return (
            <div key={f} className="relative h-full w-full shrink-0 snap-center snap-always bg-[#1d0f14]">
              {montar && (
                <Image
                  src={f}
                  alt={fotos.length > 1 ? `${produto.nome}, foto ${j + 1} de ${fotos.length}` : produto.nome}
                  fill
                  sizes={SIZES}
                  // Só monta perto do look atual: carrega já, para a próxima
                  // tela estar pronta antes do gesto.
                  loading="eager"
                  fetchPriority={prioridade && j === 0 ? "high" : undefined}
                  className="object-cover"
                  draggable={false}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Degradês: topo (barras e número) e base (legenda e ações) */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-36 bg-gradient-to-b from-[#130209]/80 via-[#130209]/45 to-transparent" />
      <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-[56%] bg-gradient-to-t from-[#130209] from-15% via-[#130209]/70 via-50% to-transparent" />

      {/* Topo: barrinhas das fotos e número do look */}
      <div className="pointer-events-none absolute inset-x-0 top-0 px-3">
        {fotos.length > 1 && (
          <div className="pointer-events-auto flex gap-1" role="group" aria-label="Fotos da peça">
            {fotos.map((f, j) => (
              <button
                key={f}
                type="button"
                onClick={() => irFoto(j)}
                aria-label={`Foto ${j + 1} de ${fotos.length}`}
                aria-current={j === foto ? "true" : undefined}
                className="group flex h-11 flex-1 items-center focus:outline-none"
              >
                <span className="relative h-[3px] w-full overflow-hidden rounded-full bg-[#EDE7D9]/35 group-focus-visible:outline group-focus-visible:outline-2 group-focus-visible:outline-offset-4 group-focus-visible:outline-[#EDE7D9]">
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
        <div
          className={`flex items-center justify-between px-1 text-[#EDE7D9] [text-shadow:0_1px_10px_rgba(19,2,9,0.6)] ${
            fotos.length > 1 ? "" : "pt-4"
          }`}
        >
          <p className="flex items-baseline gap-1.5">
            <span className="text-[10px] font-bold uppercase tracking-[0.28em]">Look</span>
            <span className="nums-preco font-[family-name:var(--font-serif)] text-[30px] italic leading-none">
              {doisDigitos(indice + 1)}
            </span>
            <span className="text-[12px] text-[#EDE7D9]/85">/ {total}</span>
          </p>
          {/* O tipo já está no nome; a coleção Solaris ganha a assinatura dela. */}
          {solaris && <p className="font-joliet text-[28px] leading-none text-[#f3dc9a]">Solaris</p>}
        </div>
      </div>

      {/* Legenda e ações. A camada deixa o toque passar para o trilho de
          fotos, menos nos botões. */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] md:px-6 md:pb-6">
        {/* A legenda entra quando o look chega à tela, como a modelo no fim da passarela. */}
        <motion.div
          className="max-w-lg"
          initial={false}
          animate={ehAtual ? { opacity: 1, y: 0 } : { opacity: 0, y: 18 }}
          transition={{ duration: 0.55, ease: EASE_OUT_EXPO, delay: ehAtual ? 0.08 : 0 }}
        >
          {produto.prontaEntrega && <SeloPronta className="mb-3" />}
          <h2 id={nomeId} className="text-[#EDE7D9]">
            <button
              type="button"
              onClick={abrir}
              className="pointer-events-auto block rounded-sm text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#EDE7D9] focus-visible:ring-offset-4 focus-visible:ring-offset-[#130209]"
            >
              {nome.tipo && (
                <span className="block text-[11px] font-bold uppercase tracking-[0.32em] text-[#EDE7D9]/85">
                  {nome.tipo}{" "}
                </span>
              )}
              <span className="mt-0.5 block font-[family-name:var(--font-serif)] text-[44px] italic leading-[0.98] [text-wrap:balance]">
                {nome.proprio}
              </span>
            </button>
          </h2>
          <p className="mt-2 flex flex-wrap items-baseline gap-x-2 text-[#EDE7D9]">
            <span className="nums-preco font-[family-name:var(--font-serif)] text-[22px] font-medium leading-none">
              {preco.cartao}
            </span>
            <span className="text-[13px]">{preco.parcelas}</span>
          </p>
          <p className="mt-1 text-[13px] text-[#EDE7D9]/80">ou {preco.pix} no pix</p>
          <div className="pointer-events-auto mt-4">
            <AcoesLook produto={produto} onDetalhes={abrir} />
          </div>
        </motion.div>
      </div>
    </article>
  );
}

function FimDoDesfile({
  total,
  tituloVista,
  filtrada,
  onVerGrade,
  onVerTodas,
  onVoltar,
}: {
  total: number;
  tituloVista: string;
  filtrada: boolean;
  onVerGrade: () => void;
  onVerTodas: () => void;
  onVoltar: () => void;
}) {
  const botao =
    "inline-flex min-h-12 w-full items-center justify-center rounded-full px-6 text-xs font-bold uppercase tracking-[0.18em] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#EDE7D9] focus-visible:ring-offset-2 focus-visible:ring-offset-[#130209]";
  return (
    <section
      aria-label="Fim do desfile"
      className="relative flex h-full w-full snap-start snap-always flex-col items-center justify-center overflow-hidden bg-[#130209] px-8 text-center text-[#EDE7D9]"
    >
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-2/3 bg-[radial-gradient(ellipse_at_top,rgba(237,231,217,0.12),transparent_65%)]" />
      <Image src="/logo-cream.png" alt="" width={90} height={64} className="relative h-16 w-auto opacity-90" />
      <p className="relative mt-8 text-[11px] font-bold uppercase tracking-[0.3em] text-[#b8902a]">Fim do desfile</p>
      <p className="relative mt-3 max-w-xs font-[family-name:var(--font-serif)] text-[28px] leading-tight">
        {filtrada ? (
          <>
            <em>{tituloVista}</em>: você viu {total === 1 ? "a peça" : `as ${total} peças`}.
          </>
        ) : (
          <>
            Você viu as <em>{total} peças</em>, feitas à mão ponto a ponto.
          </>
        )}
      </p>
      <div className="relative mt-8 flex w-full max-w-xs flex-col gap-2.5">
        {filtrada && (
          <button type="button" onClick={onVerTodas} className={`${botao} bg-[#EDE7D9] text-[#130209] hover:bg-white`}>
            Ver todas as peças
          </button>
        )}
        <button
          type="button"
          onClick={onVerGrade}
          className={`${botao} ${filtrada ? "border border-[#EDE7D9]/45 text-[#EDE7D9] hover:bg-[#EDE7D9]/10" : "bg-[#EDE7D9] text-[#130209] hover:bg-white"}`}
        >
          Ver tudo em grade
        </button>
        <button type="button" onClick={onVoltar} className={`${botao} border border-[#EDE7D9]/45 text-[#EDE7D9] hover:bg-[#EDE7D9]/10`}>
          Voltar ao primeiro look
        </button>
      </div>
    </section>
  );
}
