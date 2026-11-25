"use client";

import { useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import Lupa from "./Lupa";
import Abas from "./Abas";
import BotaoAdicionar from "./BotaoAdicionar";
import Amostra from "./Amostra";
import { notaDoAtelie, rotuloCategoria, rotuloNumero, type Grupo } from "./dados";
import { contagemPecas } from "@/components/loja/vistas";
import { formatBRLPreco } from "@/lib/format";
import { labelParcelamento, parcelamentoCartao } from "@/lib/parcelas";
import type { Produto } from "@/data/produtos";

// Desktop (1024 px para cima): lookbook dividido. À esquerda, presa na tela,
// a peça em foco em tamanho grande, com lupa. À direita, o índice
// tipográfico: número, nome grande em serif, categoria, preço e miniatura.
// Passar o mouse (ou o foco do teclado) numa linha troca a foto da esquerda;
// clicar abre a peça.

type Props = {
  grupos: Grupo[];
  /** Título da vista (null = todas). */
  titulo: string | null;
  total: number;
  ativo: string;
  onEscolher: (id: string) => void;
  onAbrir: (id: string) => void;
};

const EASE = [0.16, 1, 0.3, 1] as const;

export default function Indice({ grupos, titulo, total, ativo, onEscolher, onAbrir }: Props) {
  const pecas = grupos.flatMap((g) => g.itens);
  const [focoId, setFocoId] = useState<string | null>(null);
  const foco = pecas.find((p) => p.id === focoId) ?? pecas[0];
  // Foto escolhida nas miniaturas do painel (volta para a primeira quando a
  // peça em foco muda).
  const [fotoEscolhida, setFotoEscolhida] = useState<{ id: string; i: number } | null>(null);

  if (!foco) return null;
  const fotos = [foco.foto, foco.fotoHover, ...(foco.fotosExtra ?? [])].filter(Boolean) as string[];
  const iFoto = fotoEscolhida?.id === foco.id ? Math.min(fotoEscolhida.i, fotos.length - 1) : 0;

  return (
    <div className="hidden lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      {/* Painel da peça em foco */}
      <aside
        aria-label="Peça em foco"
        className="sticky top-[var(--header-h,109px)] h-[calc(100svh-var(--header-h,109px))] self-start"
      >
        <div className="flex h-full flex-col">
          <div className="relative min-h-0 flex-1 bg-white">
            <AnimatePresence initial={false}>
              <motion.div
                key={`${foco.id}:${iFoto}`}
                className="absolute inset-0"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.45, ease: EASE }}
              >
                <Lupa
                  src={fotos[iFoto]}
                  alt={fotos.length > 1 ? `${foco.nome}, foto ${iFoto + 1} de ${fotos.length}` : foco.nome}
                  nome={foco.nome}
                  sizes="(min-width: 1024px) 50vw, 1px"
                  posicao="50% 30%"
                  zoom={2.4}
                  lente={220}
                  dica
                  onAbrir={() => onAbrir(foco.id)}
                  className="h-full w-full"
                />
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Legenda: número, nome, outras fotos e abrir */}
          <div className="flex items-center gap-5 border-t border-[#1B4965]/15 bg-[#EDE7D9] px-8 py-3.5 xl:px-10">
            <div className="min-w-0 flex-1">
              <p className="text-[10px] uppercase tracking-[0.28em] text-brand-gold-text">
                {rotuloNumero(foco.id)} <span aria-hidden>·</span> {rotuloCategoria(foco)}
              </p>
              <p className="truncate font-[family-name:var(--font-serif)] text-[22px] italic leading-tight text-[#1B4965]">
                {foco.nome}
              </p>
              <p className="mt-0.5 line-clamp-1 text-[12px] text-brand-muted" title={notaDoAtelie(foco)}>
                {notaDoAtelie(foco)}
              </p>
            </div>
            {fotos.length > 1 && (
              <div className="flex shrink-0 gap-1.5" role="group" aria-label={`Fotos de ${foco.nome}`}>
                {fotos.slice(0, 5).map((f, i) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setFotoEscolhida({ id: foco.id, i })}
                    aria-label={`Ver foto ${i + 1} de ${fotos.length}`}
                    aria-pressed={i === iFoto}
                    className={`relative h-14 w-11 overflow-hidden bg-white ring-1 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1B4965] ${
                      i === iFoto ? "ring-[#1B4965]" : "ring-[#1B4965]/10 opacity-70 hover:opacity-100"
                    }`}
                  >
                    <Image src={f} alt="" fill sizes="44px" className="object-cover" />
                  </button>
                ))}
              </div>
            )}
            <button
              type="button"
              onClick={() => onAbrir(foco.id)}
              className="inline-flex min-h-11 shrink-0 items-center rounded-full border border-[#1B4965]/50 px-5 text-[11px] uppercase tracking-[0.2em] text-[#1B4965] transition-colors hover:border-[#1B4965] hover:bg-[#1B4965] hover:text-[#EDE7D9] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#b8902a]"
            >
              Abrir a peça
            </button>
          </div>
        </div>
      </aside>

      {/* Índice */}
      <div className="min-w-0 pb-28 pl-10 pr-20 xl:pl-12 xl:pr-24">
        <div className="flex items-baseline justify-between gap-4 pt-10">
          <p className="font-[family-name:var(--font-serif)] text-[44px] leading-none text-[#1B4965]">Índice</p>
          <p className="text-[11px] uppercase tracking-[0.22em] text-brand-muted">
            {titulo ? `${titulo}: ` : ""}
            {contagemPecas(total)}
          </p>
        </div>
        {/* Só o filtro fica preso sob o header */}
        <div className="sticky top-[var(--header-h,109px)] z-20 -ml-10 -mr-20 border-b border-[#1B4965]/15 bg-[#EDE7D9]/95 py-1 pl-10 pr-10 backdrop-blur-md xl:-ml-12 xl:-mr-24 xl:pl-12 xl:pr-12">
          <Abas ativo={ativo} onEscolher={onEscolher} className="-mx-1 flex-wrap gap-x-3.5 px-1" />
        </div>

        {grupos.map((g) => (
          <section key={g.slug} aria-labelledby={`indice-${g.slug}`} className="pt-12 first-of-type:pt-8">
            {titulo === null && (
              <div className="flex items-end gap-4 border-b border-[#1B4965] pb-3">
                <Amostra slug={g.slug} className="mb-0.5 h-12 w-12" />
                <h2
                  id={`indice-${g.slug}`}
                  className="font-[family-name:var(--font-serif)] text-[28px] italic leading-none text-[#1B4965]"
                >
                  {g.titulo}
                </h2>
                {g.selo && (
                  <span className="text-[10px] uppercase tracking-[0.26em] text-brand-gold-text">{g.selo}</span>
                )}
                <span className="ml-auto text-[11px] uppercase tracking-[0.22em] text-brand-muted">
                  {contagemPecas(g.itens.length)}
                </span>
              </div>
            )}
            {titulo !== null && (
              <h2 id={`indice-${g.slug}`} className="sr-only">
                {g.titulo}
              </h2>
            )}
            <ul>
              {g.itens.map((p) => (
                <Linha
                  key={p.id}
                  produto={p}
                  emFoco={p.id === foco.id}
                  onFoco={() => setFocoId(p.id)}
                  onAbrir={() => onAbrir(p.id)}
                />
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}

function Linha({
  produto,
  emFoco,
  onFoco,
  onAbrir,
}: {
  produto: Produto;
  emFoco: boolean;
  onFoco: () => void;
  onAbrir: () => void;
}) {
  const parcelamento = parcelamentoCartao(produto);
  return (
    <li
      data-produto={produto.id}
      onPointerEnter={onFoco}
      onClick={onAbrir}
      className="group relative flex cursor-pointer items-center gap-6 border-b border-dashed border-[#1B4965]/25 py-5"
    >
      {/* Fio dourado da linha em foco */}
      <span
        aria-hidden
        className={`absolute -left-5 top-5 bottom-5 w-px bg-[#b8902a] transition-opacity duration-300 ${
          emFoco ? "opacity-100" : "opacity-0"
        }`}
      />
      <div
        className={`relative h-[92px] w-[72px] shrink-0 overflow-hidden bg-white transition-[filter,opacity] duration-300 ${
          emFoco ? "" : "opacity-85 saturate-[0.8]"
        }`}
      >
        <Image src={produto.foto} alt="" fill sizes="72px" className="object-cover object-[50%_30%]" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="flex flex-wrap items-center gap-x-2 text-[10px] uppercase tracking-[0.26em] text-brand-muted">
          <span className="text-brand-gold-text">{rotuloNumero(produto.id)}</span>
          <span aria-hidden>·</span>
          <span>{rotuloCategoria(produto)}</span>
          {produto.prontaEntrega && (
            <>
              <span aria-hidden>·</span>
              <span className="inline-flex items-center gap-1.5 font-bold text-[#1B4965]">
                <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-[#b8902a]" />
                Pronta entrega
              </span>
            </>
          )}
        </p>
        <h3
          className={`mt-1 font-[family-name:var(--font-serif)] text-[clamp(2rem,2.7vw,2.6rem)] leading-[1.04] text-[#1B4965] transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none ${
            emFoco ? "translate-x-2 italic" : ""
          }`}
        >
          <button
            type="button"
            data-abrir
            onFocus={onFoco}
            onClick={(e) => {
              e.stopPropagation();
              onAbrir();
            }}
            className="-my-1 rounded-sm py-1 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1B4965] focus-visible:ring-offset-4 focus-visible:ring-offset-[#EDE7D9]"
          >
            {produto.nome}
          </button>
        </h3>
        <p className="mt-1.5 flex flex-wrap items-baseline gap-x-2 text-[13px] text-[#1B4965]">
          <span className="nums-preco font-[family-name:var(--font-serif)] text-[19px] font-medium">
            {formatBRLPreco(parcelamento.total)}
          </span>
          <span>{labelParcelamento(parcelamento)}</span>
          <span className="text-brand-muted">ou {formatBRLPreco(produto.preco)} no pix</span>
        </p>
      </div>
      <BotaoAdicionar produto={produto} variante="redondo" />
    </li>
  );
}
