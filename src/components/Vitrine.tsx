"use client";

import { Suspense, useCallback, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { useSearchParams } from "next/navigation";
import { AnimatePresence } from "framer-motion";
import { Reveal, StaggerGroup, StaggerItem } from "./Reveal";
import ProdutoCard from "./loja/ProdutoCard";
import ProdutoModal from "./loja/ProdutoModal";
import LojaNav, { type ChipLoja } from "./loja/LojaNav";
import {
  SECOES_TODAS,
  TOTAL_PECAS,
  VISTAS,
  contagemPecas,
  produtoPorId,
  seloDaVista,
  vistaPorSlug,
} from "./loja/vistas";
import {
  abrirPeca,
  avisarUrl,
  definirVer,
  fecharPeca,
  normalizarUrlChegada,
  useHidratado,
  useUrlLoja,
} from "./loja/urlLoja";
import { rolarAte } from "@/lib/travaRolagem";
import type { Produto } from "@/data/produtos";

const TODAS = "todas";

const CHIPS: ChipLoja[] = [
  { id: TODAS, rotulo: "Todas" },
  ...VISTAS.map((v) => ({ id: v.slug, rotulo: v.chip })),
];

// Espaço entre a barra fixa e o começo da grade quando a vista é levada até lá.
const RESPIRO = 12;

// Vitrine da loja: filtro (barra fixa), grades e o único modal de peça.
// A URL manda: ?produto=<id> abre a peça e ?ver=<slug> escolhe a vista
// (ver ./loja/urlLoja.ts).
export default function Vitrine() {
  const { produto, ver } = useUrlLoja();
  const hidratado = useHidratado();
  // Na chegada por link direto o modal espera a página rolar até o card.
  const [chegadaPronta, setChegadaPronta] = useState(false);
  const gradesRef = useRef<HTMLDivElement>(null);

  const vista = vistaPorSlug(ver);
  const chaveVista = vista?.slug ?? TODAS;
  const aberta = chegadaPronta && produto ? (produtoPorId.get(produto) ?? null) : null;

  // Chegada (uma vez, depois da hidratação): links antigos viram parâmetro e,
  // se a URL traz uma peça, a página rola até o card dela (no centro da tela) e
  // o modal entra um instante depois, por cima do card.
  useEffect(() => {
    if (!hidratado) return;
    let timer: ReturnType<typeof setTimeout> | undefined;
    // Um quadro depois: a vista da URL já está no DOM.
    const quadro = requestAnimationFrame(() => {
      const { produto: alvo } = normalizarUrlChegada();
      if (!alvo) {
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

  // Troca de filtro. Se a pessoa já passou do começo das grades, a vista volta
  // para o começo da grade nova, logo abaixo da barra fixa.
  const escolher = useCallback((id: string) => {
    let destino: number | null = null;
    const grades = gradesRef.current;
    if (grades) {
      const header = document.querySelector("header")?.getBoundingClientRect().height ?? 0;
      const barra = document.querySelector("[data-loja-nav]")?.getBoundingClientRect().height ?? 0;
      const y = grades.getBoundingClientRect().top + window.scrollY - header - barra - RESPIRO;
      if (window.scrollY > y + 1) destino = y;
    }
    definirVer(id === TODAS ? null : id);
    if (destino !== null) {
      const y = destino;
      requestAnimationFrame(() => rolarAte(y, true));
    }
  }, []);

  const anuncio = vista
    ? `${vista.titulo}: ${contagemPecas(vista.itens.length)}`
    : `Todas as peças: ${contagemPecas(TOTAL_PECAS)}`;

  return (
    <section
      id="vitrine"
      tabIndex={-1}
      aria-labelledby="vitrine-titulo"
      // O skip link sem o Lenis (movimento reduzido) usa o pulo nativo, que
      // respeita esta margem: a seção para logo abaixo do header.
      style={{ scrollMarginTop: "var(--header-h, 102px)" }}
      className="bg-white pb-20 outline-none md:pb-24"
    >
      {/* Só no navegador: no HTML do servidor o Suspense fica vazio e a
          vitrine continua estática. */}
      <Suspense fallback={null}>
        <SeguirNavegacao />
      </Suspense>

      <LojaNav itens={CHIPS} ativo={chaveVista} onEscolher={escolher} />

      <div className="mx-auto max-w-6xl px-4 pt-6 md:pt-8">
        {/* Abertura */}
        <Reveal imediato className="mx-auto max-w-2xl text-center">
          <h1
            id="vitrine-titulo"
            className="font-[family-name:var(--font-serif)] text-[30px] leading-tight text-[#1B4965] md:text-5xl"
          >
            {vista?.titulo ?? "Todas as peças"}
          </h1>
          <p className="mx-auto mt-2 max-w-md text-[13px] leading-relaxed text-brand-muted md:mt-3 md:max-w-xl md:text-sm">
            Monte seu carrinho, calcule o frete e finalize pelo WhatsApp. Peças feitas à mão em
            Belém, sob medida ou à pronta entrega, com envio para todo o Brasil.
          </p>
        </Reveal>

        {/* Leitor de tela: anuncia a troca de filtro. */}
        <p role="status" className="sr-only">
          {anuncio}
        </p>

        {/* A key remonta as grades a cada vista: a primeira grade aparece na
            hora e as de baixo animam ao entrar na tela. */}
        <div ref={gradesRef} key={chaveVista} className="mt-7 space-y-14 md:mt-9 md:space-y-16">
          {vista ? (
            <Grade
              idTitulo={`grade-${vista.slug}`}
              itens={vista.itens}
              primeira
              cabecalho={
                <>
                  <h2
                    id={`grade-${vista.slug}`}
                    className="shrink-0 text-[11px] font-bold uppercase tracking-[0.2em] text-brand-muted"
                  >
                    <span className="sr-only">{vista.titulo}: </span>
                    {contagemPecas(vista.itens.length)}
                  </h2>
                  <Selo texto={seloDaVista(vista.slug)} />
                  <span aria-hidden className="h-px flex-1 bg-[#1B4965]/15" />
                </>
              }
            />
          ) : (
            SECOES_TODAS.map((secao, i) => (
              <Grade
                key={secao.slug}
                idTitulo={`secao-${secao.slug}`}
                itens={secao.itens}
                primeira={i === 0}
                cabecalho={
                  <>
                    <h2
                      id={`secao-${secao.slug}`}
                      className="shrink-0 font-[family-name:var(--font-serif)] text-2xl text-[#1B4965] md:text-3xl"
                    >
                      {secao.titulo}
                    </h2>
                    <Selo texto={secao.selo} />
                    <span aria-hidden className="h-px flex-1 bg-[#1B4965]/15" />
                  </>
                }
              />
            ))
          )}
        </div>
      </div>

      {/* Um modal só, para qualquer peça (o card só avisa qual abrir). */}
      <AnimatePresence>
        {aberta && <ProdutoModal key={aberta.id} produto={aberta} onClose={fecharPeca} />}
      </AnimatePresence>
    </section>
  );
}

// Segue a navegação do Next com a loja já aberta (o "Loja" do header, por
// exemplo): o Next troca a URL no commit, sem evento do navegador, e a vitrine
// ficava na vista antiga. O efeito de layout roda depois de o Next gravar a
// URL e antes da pintura, então a vista nova entra sem quadro errado.
function SeguirNavegacao() {
  const busca = useSearchParams();
  useLayoutEffect(() => {
    avisarUrl();
  }, [busca]);
  return null;
}

function Selo({ texto }: { texto?: string }) {
  if (!texto) return null;
  return (
    <span className="shrink-0 rounded-full bg-[#b8902a]/15 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-brand-gold-text">
      {texto}
    </span>
  );
}

function Grade({
  idTitulo,
  cabecalho,
  itens,
  primeira,
}: {
  idTitulo: string;
  cabecalho: ReactNode;
  itens: Produto[];
  /** Primeira grade da vista: vem pintada do servidor e as 2 primeiras fotos têm prioridade. */
  primeira: boolean;
}) {
  return (
    <section aria-labelledby={idTitulo}>
      <Reveal imediato={primeira} className="mb-4 flex items-center gap-3 md:mb-6">
        {cabecalho}
      </Reveal>
      <StaggerGroup
        imediato={primeira}
        className="grid grid-cols-2 gap-x-5 gap-y-10 sm:gap-x-6 lg:grid-cols-4"
      >
        {itens.map((p, i) => (
          <StaggerItem key={p.id} className="h-full">
            <ProdutoCard produto={p} onAbrir={abrirPeca} prioridade={primeira && i < 2} />
          </StaggerItem>
        ))}
      </StaggerGroup>
    </section>
  );
}
