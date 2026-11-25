"use client";

import { memo, useRef, useState, type Ref } from "react";
import { AnimatePresence, motion, type Variants } from "framer-motion";
import { contagemPecas } from "@/components/loja/vistas";
import { useHidratado } from "@/components/loja/urlLoja";
import type { Item, Largura } from "./dados";
import Cartao from "./Cartao";
import Interludio from "./Interludio";
import { EASE, EASE_SAIDA, atraso } from "./movimento";
import { useRevelar } from "./revelar";
import s from "./vitrine.module.css";

// Quantos cartões entram pela coreografia de CSS na primeira pintura.
const PRIMEIRA_TELA = 6;

// Colunas de cada peça nas três grades (classes literais, para o Tailwind).
const SPAN_BASE = { 1: "", 2: "col-span-2" } as const;
const SPAN_MD = { 1: "md:col-span-1", 2: "md:col-span-2", 3: "md:col-span-3" } as const;
const SPAN_XL = { 1: "xl:col-span-1", 2: "xl:col-span-2", 4: "xl:col-span-4" } as const;
const spans = (l: Largura) => `${SPAN_BASE[l.base]} ${SPAN_MD[l.md]} ${SPAN_XL[l.xl]}`;

// Entrada e saída dos itens quando o filtro ou a ordem mudam. O que estava à
// vista e continua desliza para o lugar novo (layout); o que chega entra com
// fade, subida curta e um escalonamento pequeno; o que sai encolhe e some.
const VARIANTES: Variants = {
  entra: { opacity: 0, y: 26, scale: 0.97 },
  parado: (ordem: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.6, ease: EASE, delay: 0.06 + Math.min(ordem, 8) * 0.045 },
  }),
  sai: { opacity: 0, scale: 0.94, transition: { duration: 0.18, ease: EASE_SAIDA } },
};

// Títulos de seção trocam sem se sobrepor: o que sai some rápido e o novo
// sobe um instante depois.
const VARIANTES_TITULO: Variants = {
  entra: { opacity: 0, y: 18 },
  parado: { opacity: 1, y: 0, transition: { duration: 0.55, ease: EASE, delay: 0.14 } },
  sai: { opacity: 0, transition: { duration: 0.1 } },
};

type Props = {
  lista: Item[];
  /** Chave do React por item (a lógica, ou uma nova para entrar do zero). */
  chaves: Record<string, string>;
  onAbrir: (id: string) => void;
  gradeRef: Ref<HTMLUListElement>;
};

function Grade({ lista, chaves, onAbrir, gradeRef }: Props) {
  const hidratado = useHidratado();
  // Montada no HTML do servidor: os itens já nascem no lugar (a entrada da
  // primeira tela é do CSS). Remontada depois (chegada com outro filtro na
  // URL): os itens entram com a coreografia do framer.
  const [doServidor] = useState(!hidratado);

  const ordemPeca = new Map<string, number>();
  lista.forEach((it) => {
    if (it.tipo === "peca") ordemPeca.set(it.chave, ordemPeca.size);
  });

  return (
    <ul
      ref={gradeRef}
      // --gx: o espaço entre colunas, que o díptico repete entre as duas fotos.
      className="relative grid grid-cols-2 gap-x-[var(--gx)] gap-y-9 [--gx:12px] md:grid-cols-3 md:gap-y-14 md:[--gx:24px] xl:grid-cols-4 xl:gap-y-12 xl:[--gx:28px]"
    >
      <AnimatePresence mode="popLayout" initial={!doServidor}>
        {lista.map((item, i) => (
          <ItemGrade
            key={chaves[item.chave] ?? item.chave}
            item={item}
            ordem={i}
            ordemPeca={ordemPeca.get(item.chave) ?? -1}
            onAbrir={onAbrir}
          />
        ))}
      </AnimatePresence>
    </ul>
  );
}

export default memo(Grade);

function ItemGrade({
  ref,
  item,
  ordem,
  ordemPeca,
  onAbrir,
}: {
  ref?: Ref<HTMLLIElement>;
  item: Item;
  ordem: number;
  ordemPeca: number;
  onAbrir: (id: string) => void;
}) {
  const hidratado = useHidratado();
  const [doServidor] = useState(!hidratado);
  const entrada = doServidor && item.tipo === "peca" && ordemPeca < PRIMEIRA_TELA ? ordemPeca : null;

  return (
    <motion.li
      ref={ref}
      layout="position"
      data-item={item.chave}
      custom={ordem}
      variants={item.tipo === "peca" ? VARIANTES : VARIANTES_TITULO}
      initial="entra"
      animate="parado"
      exit="sai"
      transition={{ layout: { duration: 0.65, ease: EASE } }}
      className={
        item.tipo === "peca"
          ? `min-w-0 ${spans(item.largura)}`
          : item.tipo === "pausa"
            ? "col-span-full -mx-4 md:mx-0"
            : "col-span-full -mb-5 md:-mb-6 xl:-mb-4"
      }
    >
      {item.tipo === "peca" && (
        <Cartao
          produto={item.produto}
          largura={item.largura}
          onAbrir={onAbrir}
          entrada={entrada}
          prioridade={doServidor && ordemPeca < 2}
        />
      )}
      {item.tipo === "secao" && (
        <Cabecalho
          titulo={item.titulo}
          total={item.total}
          faixa={item.faixa}
          nota={item.nota}
          primeira={doServidor && ordem === 0}
        />
      )}
      {item.tipo === "pausa" && <Interludio onAbrir={onAbrir} />}
    </motion.li>
  );
}

// Título de seção: nome grande, contagem em itálico dourado, a faixa de preço
// (do tablet para cima) e uma costura que se desenha até a borda quando o
// título entra na tela.
function Cabecalho({
  titulo,
  total,
  faixa,
  nota,
  primeira,
}: {
  titulo: string;
  total: number;
  faixa: string;
  nota?: string;
  primeira: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useRevelar(ref, !primeira);
  return (
    <div ref={ref} className={`pt-1 md:pt-4 ${s.revela}`}>
      <div className="flex items-baseline gap-3">
        <h2
          className={`font-[family-name:var(--font-serif)] text-[32px] leading-none tracking-[-0.01em] text-[#1B4965] md:text-[46px] ${s.texto} ${
            primeira ? s.surgir : ""
          }`}
          style={primeira ? atraso(140) : undefined}
        >
          {titulo}
        </h2>
        <span
          className={`shrink-0 font-[family-name:var(--font-serif)] text-[16px] italic text-brand-gold-text md:text-[19px] ${s.texto} ${
            primeira ? s.surgir : ""
          }`}
          style={primeira ? atraso(190) : undefined}
        >
          {contagemPecas(total)}
        </span>
        {faixa && (
          <span
            className={`nums-preco hidden shrink-0 text-[13px] text-brand-muted md:inline ${s.texto} ${primeira ? s.surgir : ""}`}
            style={primeira ? atraso(220) : undefined}
          >
            <span aria-hidden className="mr-2 text-[#b8902a]">
              ·
            </span>
            <span className="sr-only">preços no cartão: </span>
            {faixa}
          </span>
        )}
        <span
          aria-hidden
          className={`h-[1.5px] min-w-6 flex-1 self-center ${s.ponto} ${primeira ? s.costurar : ""}`}
          style={primeira ? atraso(280) : undefined}
        />
      </div>
      {nota && <p className={`mt-2 text-[13px] text-brand-muted md:text-sm ${s.texto}`}>{nota}</p>}
    </div>
  );
}
