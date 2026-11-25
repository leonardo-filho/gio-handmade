"use client";

// Loja em dois modos, com a troca no topo:
//   Desfile: uma peça por vez, no ritmo do Instagram. No celular, rolagem
//            vertical em tela cheia (./DesfileCelular); no desktop, passarela
//            com a peça grande no centro (./Passarela).
//   Grade:   quadro de looks compacto; tocar leva ao desfile já na peça.
//
// A URL manda, pela infra da loja (../../loja/urlLoja): ?ver=<slug> filtra os
// dois modos e ?produto=<id> abre o detalhe da peça (ProdutoModal). Quem chega
// por link de story (?produto=<id>) cai no desfile já naquela peça; o detalhe
// fica a um toque, em "Detalhes".

import { Suspense, useCallback, useEffect, useLayoutEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import ProdutoModal from "@/components/loja/ProdutoModal";
import { useCart } from "@/components/cart/CartProvider";
import { SECOES_TODAS, TOTAL_PECAS, VISTAS, contagemPecas, produtoPorId, vistaPorSlug } from "@/components/loja/vistas";
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
import type { Proporcoes } from "./proporcoes";
import { TODAS, TODAS_EM_ORDEM, useTelaLarga } from "./comum";
import DesfileCelular from "./DesfileCelular";
import Passarela from "./Passarela";
import GradeLookbook, { type BlocoGrade } from "./GradeLookbook";
import FolhaFiltro, { type OpcaoFiltro } from "./FolhaFiltro";

type Modo = "desfile" | "grade";
/**
 * Peça e filtro do link, lidos pela rota no servidor. Só valem até a chegada
 * ser tratada no navegador: servem para o HTML do servidor já nascer na peça
 * do story (foto certa na primeira pintura), sem passar pela primeira peça.
 */
export type Chegada = { produto: string | null; ver: string | null };

// Opções do filtro, cada uma com a foto de uma peça dela (sem repetir a foto
// de uma opção anterior, para a folha não mostrar a mesma peça três vezes).
const OPCOES: OpcaoFiltro[] = (() => {
  const usadas = new Set<string>();
  const capa = (itens: { foto: string }[]) => {
    const p = itens.find((i) => !usadas.has(i.foto)) ?? itens[0];
    usadas.add(p.foto);
    return p.foto;
  };
  return [
    { id: TODAS, rotulo: "Todas", n: TOTAL_PECAS, foto: capa(TODAS_EM_ORDEM) },
    ...VISTAS.map((v) => ({ id: v.slug, rotulo: v.chip, n: v.itens.length, foto: capa(v.itens) })),
  ];
})();

export default function LojaDesfile({ proporcoes, chegada }: { proporcoes: Proporcoes; chegada: Chegada }) {
  const { produto, ver } = useUrlLoja();
  const hidratado = useHidratado();
  const largo = useTelaLarga();
  const { isOpen: carrinhoAberto } = useCart();

  const [chegadaPronta, setChegadaPronta] = useState(false);
  const [modo, setModo] = useState<Modo>("desfile");
  // Peça na tela agora. O desfile (celular ou passarela) que monta, ao voltar
  // da grade ou ao cruzar a largura de 1024 px, abre nela.
  const [vivo, setVivo] = useState<string | null>(null);
  const [folha, setFolha] = useState(false);

  // Até a chegada ser tratada, valem a peça e o filtro que a rota leu.
  const vista = vistaPorSlug(chegadaPronta ? ver : chegada.ver);
  const chaveVista = vista?.slug ?? TODAS;
  const lista = vista ? vista.itens : TODAS_EM_ORDEM;
  const tituloVista = vista?.titulo ?? "Todas as peças";
  const aberta = chegadaPronta && produto ? (produtoPorId.get(produto) ?? null) : null;
  const idInicio = vivo ?? (chegadaPronta ? null : chegada.produto);
  const inicio = idInicio ? Math.max(0, lista.findIndex((p) => p.id === idInicio)) : 0;

  // Chegada (uma vez, depois da hidratação). Links antigos viram parâmetro; se
  // a URL traz uma peça, o desfile abre nela (trocando para "Todas" se o
  // filtro da URL não tiver a peça) e o parâmetro sai da URL, para o detalhe
  // não abrir por cima.
  useEffect(() => {
    if (!hidratado) return;
    const quadro = requestAnimationFrame(() => {
      const { produto: alvo, ver: verChegada } = normalizarUrlChegada();
      if (alvo) {
        const daVista = vistaPorSlug(verChegada);
        if (daVista && !daVista.itens.some((p) => p.id === alvo)) definirVer(null);
        fecharPeca();
        setVivo(alvo);
        setModo("desfile");
      }
      setChegadaPronta(true);
    });
    return () => cancelAnimationFrame(quadro);
  }, [hidratado]);

  const aoAtual = useCallback((id: string) => setVivo(id), []);

  function trocarModo(novo: Modo) {
    if (novo === modo) return;
    setModo(novo);
    requestAnimationFrame(() => rolarAte(0, true));
  }

  function verNoDesfile(id: string) {
    setVivo(id);
    setModo("desfile");
    requestAnimationFrame(() => rolarAte(0, true));
  }

  // Filtro novo começa do primeiro look dele.
  function escolherVista(id: string) {
    setFolha(false);
    setVivo(null);
    definirVer(id === TODAS ? null : id);
    requestAnimationFrame(() => rolarAte(0, true));
  }

  // Grade: blocos por categoria em "Todas", um bloco só numa vista.
  const blocos: BlocoGrade[] = vista
    ? [{ slug: vista.slug, titulo: vista.titulo, itens: vista.itens }]
    : SECOES_TODAS.map((s) => ({ slug: s.slug, titulo: s.titulo, itens: s.itens }));
  const numero = new Map(lista.map((p, i) => [p.id, i + 1]));

  const anuncio = `${tituloVista}: ${contagemPecas(lista.length)}, modo ${modo}`;

  return (
    <section
      aria-labelledby="desfile-titulo"
      className="bg-[#130209] [--palco-h:calc(100dvh_-_var(--header-h-topo,102px)_-_52px)] md:[--palco-h:calc(100dvh_-_var(--header-h-topo,109px)_-_52px)] lg:[--palco-h:calc(100dvh_-_var(--header-h-topo,109px)_-_60px)]"
    >
      <Suspense fallback={null}>
        <SeguirNavegacao />
      </Suspense>
      <h1 id="desfile-titulo" tabIndex={-1} className="sr-only">
        Loja Gio Handmade: {tituloVista}
      </h1>
      <p role="status" className="sr-only">
        {anuncio}
      </p>

      <BarraModo
        modo={modo}
        onModo={trocarModo}
        ativo={chaveVista}
        rotuloAtivo={vista?.chip ?? "Todas"}
        nAtivo={lista.length}
        onAbrirFolha={() => setFolha(true)}
        onEscolher={escolherVista}
      />

      {modo === "desfile" ? (
        <>
          {largo !== true && (
            <div className={largo === null ? "lg:hidden" : undefined}>
              <DesfileCelular
                key={chaveVista}
                lista={lista}
                inicio={inicio}
                tituloVista={tituloVista}
                preChegada={!hidratado}
                filtrada={!!vista}
                onAtual={aoAtual}
                onDetalhes={abrirPeca}
                onVerGrade={() => trocarModo("grade")}
                onVerTodas={() => escolherVista(TODAS)}
              />
            </div>
          )}
          {largo !== false && (
            <div className={largo === null ? "hidden lg:block" : undefined}>
              <Passarela
                key={chaveVista}
                lista={lista}
                inicio={inicio}
                proporcoes={proporcoes}
                adiantar={largo === true}
                bloqueado={!!aberta || carrinhoAberto || folha}
                onAtual={aoAtual}
                onDetalhes={abrirPeca}
              />
            </div>
          )}
        </>
      ) : (
        <GradeLookbook
          key={chaveVista}
          titulo={tituloVista}
          blocos={blocos}
          numero={numero}
          destaque={vivo}
          onAbrir={verNoDesfile}
        />
      )}

      <AnimatePresence>
        {folha && (
          <FolhaFiltro
            key="folha"
            opcoes={OPCOES}
            ativo={chaveVista}
            onEscolher={escolherVista}
            onFechar={() => setFolha(false)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {aberta && <ProdutoModal key={aberta.id} produto={aberta} onClose={fecharPeca} />}
      </AnimatePresence>
    </section>
  );
}

// Segue a navegação do Next com a página já aberta (mesmo padrão da Vitrine).
function SeguirNavegacao() {
  const busca = useSearchParams();
  useLayoutEffect(() => {
    avisarUrl();
  }, [busca]);
  return null;
}

function BarraModo({
  modo,
  onModo,
  ativo,
  rotuloAtivo,
  nAtivo,
  onAbrirFolha,
  onEscolher,
}: {
  modo: Modo;
  onModo: (m: Modo) => void;
  ativo: string;
  rotuloAtivo: string;
  nAtivo: number;
  onAbrirFolha: () => void;
  onEscolher: (id: string) => void;
}) {
  const foco =
    "focus:outline-none focus-visible:ring-2 focus-visible:ring-[#EDE7D9] focus-visible:ring-offset-2 focus-visible:ring-offset-[#130209]";
  return (
    <div className="sticky top-[var(--header-h,102px)] z-30 border-b border-[#EDE7D9]/10 bg-[#130209]/95 backdrop-blur-md md:top-[var(--header-h,109px)]">
      <div className="mx-auto flex h-[52px] max-w-7xl items-center gap-3 px-3 sm:px-5 lg:h-[60px] lg:px-8">
        {/* Troca de modo */}
        <div role="group" aria-label="Modo de ver as peças" className="relative flex shrink-0 rounded-full border border-[#EDE7D9]/20 p-0.5">
          {(["desfile", "grade"] as const).map((m) => {
            const on = modo === m;
            return (
              <button
                key={m}
                type="button"
                aria-pressed={on}
                onClick={() => onModo(m)}
                className={`relative flex h-10 items-center gap-2 rounded-full px-3.5 text-[11px] font-bold uppercase tracking-[0.16em] transition-colors max-[400px]:px-3 after:absolute after:inset-x-0 after:-inset-y-1 after:content-[''] ${foco} ${
                  on ? "text-[#130209]" : "text-[#EDE7D9]/85 hover:text-[#EDE7D9]"
                }`}
              >
                {on && (
                  <motion.span
                    layoutId="desfile-modo-ativo"
                    aria-hidden
                    className="absolute inset-0 rounded-full bg-[#EDE7D9]"
                    transition={{ type: "spring", bounce: 0.18, duration: 0.5 }}
                  />
                )}
                <span className="relative max-[400px]:hidden">{m === "desfile" ? <IconeDesfile /> : <IconeGrade />}</span>
                <span className="relative">{m === "desfile" ? "Desfile" : "Grade"}</span>
              </button>
            );
          })}
        </div>

        {/* Celular e tablet: filtro numa folha */}
        <button
          type="button"
          onClick={onAbrirFolha}
          aria-haspopup="dialog"
          data-desfile-filtro
          className={`ml-auto flex h-11 min-w-0 items-center gap-2 rounded-full border border-[#EDE7D9]/20 pl-4 pr-3 text-[#EDE7D9] transition-colors hover:border-[#EDE7D9]/60 lg:hidden ${foco}`}
        >
          <span className="sr-only">Filtrar peças. Agora: </span>
          <span className="truncate font-[family-name:var(--font-serif)] text-[16px] leading-none">{rotuloAtivo}</span>
          <span className="nums-preco rounded-full bg-[#EDE7D9]/12 px-1.5 py-0.5 text-[10px] font-bold text-[#EDE7D9]/85">
            {nAtivo}
          </span>
          <svg className="h-4 w-4 shrink-0 text-[#EDE7D9]/80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" d="m6 9 6 6 6-6" />
          </svg>
        </button>

        {/* Desktop: as vistas em linha */}
        <div
          role="group"
          aria-label="Filtrar peças"
          className="ml-auto hidden min-w-0 gap-1 overflow-x-auto [scrollbar-width:none] lg:flex [&::-webkit-scrollbar]:hidden"
        >
          {OPCOES.map((o) => {
            const on = o.id === ativo;
            return (
              <button
                key={o.id}
                type="button"
                aria-pressed={on}
                onClick={() => onEscolher(o.id)}
                className={`flex h-11 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 text-[11px] font-bold uppercase tracking-[0.16em] transition-colors ${foco} ${
                  on ? "bg-[#EDE7D9]/12 text-[#EDE7D9]" : "text-[#EDE7D9]/75 hover:text-[#EDE7D9]"
                }`}
              >
                {o.rotulo}
                <span className={`nums-preco text-[10px] ${on ? "text-[#d2ad55]" : "text-[#EDE7D9]/55"}`}>{o.n}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function IconeDesfile() {
  return (
    <svg className="h-3.5 w-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden>
      <rect x="4" y="1.5" width="8" height="13" rx="1.5" />
    </svg>
  );
}

function IconeGrade() {
  return (
    <svg className="h-3.5 w-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden>
      <rect x="1.5" y="1.5" width="5" height="5" rx="1" />
      <rect x="9.5" y="1.5" width="5" height="5" rx="1" />
      <rect x="1.5" y="9.5" width="5" height="5" rx="1" />
      <rect x="9.5" y="9.5" width="5" height="5" rx="1" />
    </svg>
  );
}
