"use client";

import { Suspense, useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AnimatePresence } from "framer-motion";
import Abertura from "./Abertura";
import Abas from "./Abas";
import CartaoPeca from "./CartaoPeca";
import Indice from "./Indice";
import Amostra from "./Amostra";
import ModalPeca from "./ModalPeca";
import { GRUPOS_TODAS, TODAS, type Grupo } from "./dados";
import { TOTAL_PECAS, contagemPecas, produtoPorId, seloDaVista, vistaPorSlug } from "@/components/loja/vistas";
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

// Loja na direção "Ateliê": o valor está no feito à mão, então a loja mostra o
// bordado de perto. Abertura com o recorte de um bordado, filtro em palavras,
// cartões altos com lupa no celular e lookbook dividido no desktop.
//
// A URL manda, como na /loja: ?produto=<id> abre a peça e ?ver=<slug> filtra
// (infra em components/loja/urlLoja.ts, reaproveitada sem mudança).

const RESPIRO = 12;

// Elemento da peça que está à vista (o celular e o desktop têm listas
// próprias, e só uma aparece).
function pecaVisivel(id: string) {
  const els = document.querySelectorAll<HTMLElement>(`[data-produto="${CSS.escape(id)}"]`);
  return Array.from(els).find((el) => el.offsetParent !== null) ?? null;
}

export default function Atelie() {
  const { produto, ver } = useUrlLoja();
  const hidratado = useHidratado();
  const [chegadaPronta, setChegadaPronta] = useState(false);
  const listaRef = useRef<HTMLDivElement>(null);

  const vista = vistaPorSlug(ver);
  const chave = vista?.slug ?? TODAS;
  const aberta = chegadaPronta && produto ? (produtoPorId.get(produto) ?? null) : null;

  const grupos: Grupo[] = vista
    ? [{ slug: vista.slug, titulo: vista.titulo, selo: seloDaVista(vista.slug), itens: vista.itens }]
    : GRUPOS_TODAS;
  const total = vista ? vista.itens.length : TOTAL_PECAS;

  // Chegada: links antigos viram parâmetro; com peça na URL, a página rola até
  // ela e o detalhe abre logo depois, por cima.
  useEffect(() => {
    if (!hidratado) return;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const quadro = requestAnimationFrame(() => {
      const { produto: alvo } = normalizarUrlChegada();
      if (!alvo) {
        setChegadaPronta(true);
        return;
      }
      const el = pecaVisivel(alvo);
      if (el) {
        const r = el.getBoundingClientRect();
        rolarAte(r.top + window.scrollY + r.height / 2 - window.innerHeight / 2, true);
      }
      timer = setTimeout(() => setChegadaPronta(true), 350);
    });
    return () => {
      cancelAnimationFrame(quadro);
      clearTimeout(timer);
    };
  }, [hidratado]);

  // Troca de filtro: se a pessoa já passou do começo da lista, volta para ele.
  const escolher = useCallback((id: string) => {
    let destino: number | null = null;
    const lista = listaRef.current;
    if (lista) {
      const header = document.querySelector("header")?.getBoundingClientRect().height ?? 0;
      const barra = document.querySelector<HTMLElement>("[data-atelie-barra]");
      const alturaBarra = barra && barra.offsetParent !== null ? barra.getBoundingClientRect().height : 0;
      const y = lista.getBoundingClientRect().top + window.scrollY - header - alturaBarra - RESPIRO;
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

  // Posição de cada grupo na lista corrida (alternância do lado da foto).
  const inicios = grupos.map((_, gi) => grupos.slice(0, gi).reduce((n, g) => n + g.itens.length, 0));

  return (
    <div className="bg-[#EDE7D9] text-[#1B4965]">
      <Suspense fallback={null}>
        <SeguirNavegacao />
      </Suspense>

      <Abertura onVerPeca={abrirPeca} />

      <section
        id="pecas"
        tabIndex={-1}
        aria-label="Peças"
        style={{ scrollMarginTop: "var(--header-h, 102px)" }}
        className="outline-none"
      >
        {/* Filtro do celular e do tablet: barra presa sob o header */}
        <div
          data-atelie-barra
          className="sticky top-[var(--header-h,102px)] z-40 border-y border-[#1B4965]/12 bg-[#EDE7D9]/95 backdrop-blur-md lg:hidden"
        >
          <Abas
            ativo={chave}
            onEscolher={escolher}
            className="mx-auto max-w-xl gap-x-5 px-5 [mask-image:linear-gradient(to_right,transparent,#000_1.25rem,#000_calc(100%-2rem),transparent)] sm:px-8"
          />
        </div>

        <p role="status" className="sr-only">
          {anuncio}
        </p>

        <div ref={listaRef} key={chave}>
          {/* Celular e tablet: cartões altos, uma coluna */}
          <div className="mx-auto max-w-xl px-4 pb-24 pt-8 sm:px-8 lg:hidden">
            {grupos.map((g, gi) => (
              <section key={g.slug} aria-labelledby={`cartoes-${g.slug}`} className={gi > 0 ? "mt-20" : ""}>
                <header className="mb-8 flex items-end gap-4 border-b border-[#1B4965] pb-3">
                  <Amostra slug={g.slug} className="mb-0.5 h-14 w-14" />
                  <div className="min-w-0 flex-1">
                    <p className="mb-1 text-[10px] uppercase tracking-[0.3em] text-brand-gold-text">
                      {g.selo ?? `Capítulo ${String(gi + 1).padStart(2, "0")}`}
                    </p>
                    <div className="flex items-baseline justify-between gap-3">
                      <h2
                        id={`cartoes-${g.slug}`}
                        className="font-[family-name:var(--font-serif)] text-[30px] italic leading-none text-[#1B4965]"
                      >
                        {g.titulo}
                      </h2>
                      <span className="shrink-0 text-[11px] uppercase tracking-[0.22em] text-brand-muted">
                        {contagemPecas(g.itens.length)}
                      </span>
                    </div>
                  </div>
                </header>
                <div className="space-y-16">
                  {g.itens.map((p, pi) => {
                    const i = inicios[gi] + pi;
                    return (
                      <CartaoPeca
                        key={p.id}
                        produto={p}
                        ordem={i}
                        dica={i === 0}
                        onAbrir={abrirPeca}
                      />
                    );
                  })}
                </div>
              </section>
            ))}
          </div>

          {/* Desktop: lookbook dividido */}
          <Indice
            grupos={grupos}
            titulo={vista?.titulo ?? null}
            total={total}
            ativo={chave}
            onEscolher={escolher}
            onAbrir={abrirPeca}
          />
        </div>
      </section>

      <AnimatePresence>
        {aberta && <ModalPeca key={aberta.id} produto={aberta} onClose={fecharPeca} />}
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
