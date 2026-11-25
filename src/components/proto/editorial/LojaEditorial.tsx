"use client";

import { Suspense, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AnimatePresence } from "framer-motion";
import Capa, { type ChamadaCapa } from "./Capa";
import Sumario, { type ItemIndice } from "./Sumario";
import NavTipografica from "./NavTipografica";
import FaixaProntaEntrega from "./FaixaProntaEntrega";
import Secao, { type CabecalhoSecao } from "./Secao";
import ComoComprar from "./ComoComprar";
import { criarFila, faixaDePreco, planejar, type Bloco } from "./plano";
import ProdutoModal from "@/components/loja/ProdutoModal";
import {
  SECOES_TODAS,
  TOTAL_PECAS,
  VISTAS,
  contagemPecas,
  produtoPorId,
  vistaPorSlug,
} from "@/components/loja/vistas";
import {
  abrirPeca,
  avisarUrl,
  definirVer,
  fecharPeca,
  normalizarUrlChegada,
  useHidratado,
  useUrlLoja,
} from "@/components/loja/urlLoja";
import { rolarAte } from "@/lib/travaRolagem";
import { secaoId } from "@/data/produtos";

const TODAS = "todas";
const PRONTA = "pronta-entrega";
const SOLARIS = secaoId["Coleção Solaris"];

// Número de cada seção (o mesmo no sumário, na barra e na abertura).
const NUMEROS: Record<string, string> = {
  [PRONTA]: "✦",
  [SOLARIS]: "01",
  [secaoId.Conjuntos]: "02",
  [secaoId.Vestidos]: "03",
  [secaoId.Tops]: "04",
  [secaoId.Saias]: "05",
  [secaoId.Acessórios]: "06",
};

const INDICE: ItemIndice[] = [
  { id: TODAS, rotulo: "Todas as peças", numero: "00", contagem: TOTAL_PECAS },
  ...VISTAS.map((v) => ({
    id: v.slug,
    rotulo: v.slug === SOLARIS ? "Solaris" : v.chip,
    numero: NUMEROS[v.slug] ?? "",
    contagem: v.itens.length,
  })),
];

const INDICE_BARRA: ItemIndice[] = INDICE.map((it) => (it.id === TODAS ? { ...it, rotulo: "Todas" } : it));

const PRONTA_ITENS = vistaPorSlug(PRONTA)?.itens ?? [];

// Respiro entre a barra fixa e o começo das seções quando a página é levada até lá.
const RESPIRO = 20;

function cabecalhoDe(slug: string, titulo: string, itens: Parameters<typeof faixaDePreco>[0]): CabecalhoSecao {
  const base: CabecalhoSecao = {
    slug,
    numero: NUMEROS[slug] ?? "",
    titulo,
    contagem: contagemPecas(itens.length),
    faixa: faixaDePreco(itens),
  };
  if (slug === SOLARIS) {
    return {
      ...base,
      tituloCurto: "Solaris",
      joliet: true,
      chapeu: "Nova coleção",
      linhaFina: "Banhada pela atmosfera do verão.",
    };
  }
  if (slug === PRONTA) {
    return { ...base, chapeu: "Destaque", linhaFina: "Peças já finalizadas, com envio imediato." };
  }
  return base;
}

type SecaoPlanejada = { cabecalho: CabecalhoSecao; blocos: Bloco[] };

// Posição (px do topo do documento) em que as seções começam logo abaixo do
// header e da barra fixa (a barra conta mesmo escondida: ela entra ao rolar).
function inicioDasSecoes(el: HTMLElement | null): number | null {
  if (!el) return null;
  // A primeira seção (a faixa da pronta entrega ou a abertura da vista), e
  // não o contêiner, que tem respiro em cima.
  const alvo = el.querySelector("section") ?? el;
  const header = document.querySelector("header")?.getBoundingClientRect().height ?? 0;
  const barra = document.querySelector<HTMLElement>("[data-loja-nav]")?.offsetHeight ?? 0;
  return alvo.getBoundingClientRect().top + window.scrollY - header - barra - RESPIRO;
}

// Loja em forma de revista: capa, sumário (que filtra), a página da pronta
// entrega e as seções numeradas com grade assimétrica. A URL manda, pela
// mesma infra da /loja: ?produto=<id> abre a peça e ?ver=<slug> filtra.
export default function LojaEditorial() {
  const { produto, ver } = useUrlLoja();
  const hidratado = useHidratado();
  const [chegadaPronta, setChegadaPronta] = useState(false);
  const [barraVisivel, setBarraVisivel] = useState(false);
  const sumarioRef = useRef<HTMLElement>(null);
  const secoesRef = useRef<HTMLDivElement>(null);

  const vista = vistaPorSlug(ver);
  const chaveVista = vista?.slug ?? TODAS;
  const aberta = chegadaPronta && produto ? (produtoPorId.get(produto) ?? null) : null;

  // Diagramação da vista atual (pura: o servidor e o navegador chegam à mesma).
  const secoes: SecaoPlanejada[] = useMemo(() => {
    const fila = criarFila();
    if (vista) {
      return [{ cabecalho: cabecalhoDe(vista.slug, vista.titulo, vista.itens), blocos: planejar(vista.slug, vista.itens, fila) }];
    }
    return SECOES_TODAS.map((s) => ({
      cabecalho: cabecalhoDe(s.slug, s.titulo, s.itens),
      blocos: planejar(s.slug, s.itens, fila),
    }));
  }, [vista]);

  // Chegada (uma vez, depois da hidratação): links antigos viram parâmetro e,
  // se a URL traz uma peça, a página rola até o card dela e o detalhe abre por
  // cima um instante depois (mesmo comportamento da /loja).
  useEffect(() => {
    if (!hidratado) return;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const quadro = requestAnimationFrame(() => {
      const { produto: alvo, ver: filtro } = normalizarUrlChegada();
      if (!alvo) {
        // Link com filtro (?ver=, de um story): a página abre já nas peças, e
        // a capa fica logo acima.
        const y = filtro ? inicioDasSecoes(secoesRef.current) : null;
        if (y !== null) rolarAte(y, true);
        setChegadaPronta(true);
        return;
      }
      const card = document.querySelector<HTMLElement>(`[data-produto="${CSS.escape(alvo)}"]`);
      if (card) {
        const r = card.getBoundingClientRect();
        rolarAte(r.top + window.scrollY + r.height / 2 - window.innerHeight / 2, true);
      }
      timer = setTimeout(() => setChegadaPronta(true), 350);
    });
    return () => {
      cancelAnimationFrame(quadro);
      clearTimeout(timer);
    };
  }, [hidratado]);

  // A barra de seções aparece quando o sumário já passou para cima do header.
  // Um IntersectionObserver não basta: num salto (link direto, filtro), o
  // sumário vai de "abaixo" para "acima" da tela sem cruzar a borda.
  useEffect(() => {
    const alvo = sumarioRef.current;
    if (!alvo) return;
    let quadro = 0;
    const medir = () => {
      quadro = 0;
      // Mede a lista do sumário (não a seção, que tem respiro embaixo): a barra
      // entra quando a última linha some atrás do header e da própria barra.
      const lista = alvo.querySelector("ol") ?? alvo;
      const header = document.querySelector("header")?.getBoundingClientRect().height ?? 0;
      setBarraVisivel(lista.getBoundingClientRect().bottom < header + 56);
    };
    const aoRolar = () => {
      if (!quadro) quadro = requestAnimationFrame(medir);
    };
    aoRolar();
    window.addEventListener("scroll", aoRolar, { passive: true });
    window.addEventListener("resize", aoRolar);
    return () => {
      cancelAnimationFrame(quadro);
      window.removeEventListener("scroll", aoRolar);
      window.removeEventListener("resize", aoRolar);
    };
  }, []);

  // Troca de filtro: a vista nova começa logo abaixo da barra fixa.
  const escolher = useCallback((id: string) => {
    const destino = inicioDasSecoes(secoesRef.current);
    definirVer(id === TODAS ? null : id);
    if (destino !== null) {
      const y = destino;
      const reduz = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      // Perto (já na região das seções): pula na hora; vindo da capa ou do
      // sumário, desce com a rolagem suave.
      const longe = Math.abs(window.scrollY - y) > window.innerHeight * 2.5;
      requestAnimationFrame(() => rolarAte(y, reduz || longe));
    }
  }, []);

  const chamadas: ChamadaCapa[] = [
    { rotulo: "Solaris", detalhe: "nova coleção", acao: () => escolher(SOLARIS) },
    { rotulo: "Pronta entrega", detalhe: `${PRONTA_ITENS.length} peças`, acao: () => escolher(PRONTA) },
    { rotulo: "Todas as peças", detalhe: `${TOTAL_PECAS} bordadas à mão`, acao: () => escolher(TODAS) },
  ];

  const anuncio = vista
    ? `${vista.titulo}: ${contagemPecas(vista.itens.length)}`
    : `Todas as peças: ${contagemPecas(TOTAL_PECAS)}`;

  return (
    <div className="bg-[#EDE7D9] text-[#1B4965]">
      <Suspense fallback={null}>
        <SeguirNavegacao />
      </Suspense>

      <Capa chamadas={chamadas} total={TOTAL_PECAS} />

      <Sumario ref={sumarioRef} itens={INDICE} ativo={chaveVista} onEscolher={escolher} />

      <NavTipografica itens={INDICE_BARRA} ativo={chaveVista} visivel={barraVisivel} onEscolher={escolher} />

      <p role="status" className="sr-only">
        {anuncio}
      </p>

      {/* A key remonta as seções a cada vista (as animações de entrada recomeçam). */}
      <div ref={secoesRef} key={chaveVista}>
        {!vista && <FaixaProntaEntrega itens={PRONTA_ITENS} onAbrir={abrirPeca} onVerTodas={() => escolher(PRONTA)} />}

        <div className="mx-auto max-w-[1320px] space-y-24 px-4 pb-24 pt-14 lg:space-y-40 lg:px-10 lg:pb-36 lg:pt-24">
          {secoes.map((s) => (
            <Secao
              key={s.cabecalho.slug}
              cabecalho={s.cabecalho}
              blocos={s.blocos}
              onAbrir={abrirPeca}
              marcarPronta={s.cabecalho.slug !== PRONTA}
            />
          ))}

          {vista && (
            <div className="flex justify-center">
              <button
                type="button"
                onClick={() => escolher(TODAS)}
                className="inline-flex min-h-12 items-center gap-3 border-b border-[#1B4965] font-serif text-2xl italic text-[#1B4965] transition-colors hover:text-[#130209] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1B4965] focus-visible:ring-offset-4 focus-visible:ring-offset-[#EDE7D9] lg:text-3xl"
              >
                Ver todas as {TOTAL_PECAS} peças
                <svg width="22" height="10" viewBox="0 0 22 10" fill="none" aria-hidden>
                  <path d="M1 5H20M20 5L16 1M20 5L16 9" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>

      <ComoComprar />

      {/* Um modal só, para qualquer peça (o card só avisa qual abrir). */}
      <AnimatePresence>
        {aberta && <ProdutoModal key={aberta.id} produto={aberta} onClose={fecharPeca} />}
      </AnimatePresence>
    </div>
  );
}

// Segue a navegação do Next com a página já aberta (mesmo motivo da Vitrine).
function SeguirNavegacao() {
  const busca = useSearchParams();
  useLayoutEffect(() => {
    avisarUrl();
  }, [busca]);
  return null;
}
