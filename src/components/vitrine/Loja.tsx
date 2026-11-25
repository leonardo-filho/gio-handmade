"use client";

import { Suspense, useCallback, useDeferredValue, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AnimatePresence } from "framer-motion";
import { contagemPecas, produtoPorId, vistaPorSlug } from "@/components/loja/vistas";
import {
  abrirPeca,
  avisarUrl,
  definirVer,
  fecharPeca,
  normalizarUrlChegada,
  useHidratado,
  useUrlLoja,
} from "@/components/loja/urlLoja";
import { useCart } from "@/components/cart/CartProvider";
import { rolarAte } from "@/lib/travaRolagem";
import Abertura from "./Abertura";
import ComoComprar from "./ComoComprar";
import { BarraFiltros, IndiceFiltros } from "./Filtros";
import Folha from "./Folha";
import Grade from "./Grade";
import { TODAS, montarLista, type Ordem } from "./dados";

// Espaço entre a barra presa e o começo da grade quando a vista volta para lá.
const RESPIRO = 14;

// Vitrine da /loja. A URL manda (src/components/loja/urlLoja.ts): ?produto=<id>
// abre a peça e ?ver=<slug> escolhe o filtro. O servidor já recebe o filtro
// da URL (verInicial), então quem chega por story em ?ver=pronta-entrega vê a
// vitrine certa desde a primeira pintura, sem troca depois da hidratação.
export default function Loja({ verInicial }: { verInicial: string | null }) {
  const { produto, ver } = useUrlLoja();
  const hidratado = useHidratado();
  const [ordem, setOrdem] = useState<Ordem>("relevancia");
  // Chave da grade: segue o filtro da URL até a primeira troca feita aqui;
  // depois fica fixa e as trocas animam dentro da mesma grade.
  const [chaveFixa, setChaveFixa] = useState<string | null>(null);
  // Chave do React de cada item na grade nova (pedido = a troca que a gerou).
  const [chaves, setChaves] = useState<{ pedido: number; mapa: Record<string, string> }>({ pedido: 0, mapa: {} });
  const geracao = useRef(0);
  const destinoRef = useRef<{ pedido: number; y: number } | null>(null);
  const gradeRef = useRef<HTMLUListElement>(null);

  const verAtual = hidratado ? ver : verInicial;
  const chaveVista = verAtual ?? TODAS;
  const aberta = hidratado && produto ? (produtoPorId.get(produto) ?? null) : null;

  // A grade nova é montada sem travar o toque: o chip e a pílula respondem na
  // hora e as peças da vista nova vêm logo depois, num render que o React
  // pode fatiar (no celular lento, trocar de Todas para Tops montava 33
  // cartões de uma vez).
  const alvo = useMemo(() => ({ ver: verAtual, ordem, chaves }), [verAtual, ordem, chaves]);
  const grade = useDeferredValue(alvo);
  const lista = useMemo(() => montarLista(grade.ver, grade.ordem), [grade.ver, grade.ordem]);

  // Quem estava no meio da grade volta para o começo dela quando a grade nova
  // já está montada (antes da pintura), para não ver a vista antiga no lugar.
  useLayoutEffect(() => {
    const destino = destinoRef.current;
    if (!destino || grade.chaves.pedido < destino.pedido) return;
    destinoRef.current = null;
    rolarAte(destino.y, true);
  }, [grade]);

  // Chegada: links antigos (#id, #slug) viram parâmetro; valores inválidos saem.
  // Quem chega pelo link de uma peça (story, bio) ganha a loja por baixo dela
  // no histórico: a entrada atual vira a vitrine sem a peça e a peça entra por
  // cima, como se tivesse sido aberta pelo cartão. Assim o voltar do celular
  // fecha a peça e deixa a pessoa na loja (o segundo voltar sai). Os outros
  // parâmetros (utm etc.) ficam como estavam. Depois de recarregar a página a
  // entrada já é da peça (lojaProduto, a chave que o urlLoja grava) e nada se
  // repete.
  // Roda um instante depois da hidratação: só então o Next já passou a
  // acompanhar o histórico, e as entradas novas levam o estado dele. Antes
  // disso, o voltar caía numa entrada que o Next não conhece e recarregava a
  // página inteira.
  useEffect(() => {
    const timer = window.setTimeout(() => {
      const { produto: chegada } = normalizarUrlChegada();
      const estado = window.history.state as Record<string, unknown> | null;
      if (chegada && estado?.lojaProduto !== chegada) {
        fecharPeca();
        abrirPeca(chegada);
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  // Reserva o lugar da barra de rolagem enquanto a loja está aberta: a trava
  // de rolagem da folha esconde a barra e, sem a reserva, a grade pularia de
  // lado por trás do véu. Só onde a barra ocupa espaço (mouse): no celular a
  // barra flutua sobre a página, e a reserva deixava a página 2 px mais larga
  // que a tela.
  useEffect(() => {
    const raiz = document.documentElement;
    if (window.innerWidth - raiz.clientWidth <= 0) return;
    const antes = raiz.style.scrollbarGutter;
    raiz.style.scrollbarGutter = "stable";
    return () => {
      raiz.style.scrollbarGutter = antes;
    };
  }, []);

  // Troca de filtro ou de ordem. Com o começo da grade à vista, o que está na
  // tela e continua desliza para o lugar novo e o resto entra do zero (sem
  // cartão atravessando a página). Com a pessoa já no meio da grade, a vista
  // volta para o começo dela, logo abaixo da barra, e a grade nova entra em
  // sequência.
  const trocar = useCallback(
    (novoVer: string, novaOrdem: Ordem) => {
      if (novoVer === chaveVista && novaOrdem === ordem) return;
      const grade = gradeRef.current;
      const visiveis = new Set<string>();
      let destino: number | null = null;
      if (grade) {
        const header = document.querySelector("header")?.getBoundingClientRect().bottom ?? 0;
        const barra = document.querySelector("[data-barra-filtros]")?.getBoundingClientRect();
        const topo = Math.max(header, barra && barra.height > 0 ? barra.bottom : 0);
        const r = grade.getBoundingClientRect();
        if (r.top < topo - 1) {
          const alturaBarra = barra && barra.height > 0 ? barra.height : 0;
          destino = window.scrollY + r.top - header - alturaBarra - RESPIRO;
        } else {
          grade.querySelectorAll<HTMLElement>(":scope > [data-item]").forEach((el) => {
            const b = el.getBoundingClientRect();
            if (b.bottom > topo && b.top < window.innerHeight) visiveis.add(el.dataset.item ?? "");
          });
        }
      }
      geracao.current += 1;
      const g = geracao.current;
      const nova = montarLista(novoVer === TODAS ? null : novoVer, novaOrdem);
      setChaves((atual) => ({
        pedido: g,
        mapa: Object.fromEntries(
          nova.map((it) => [it.chave, visiveis.has(it.chave) ? (atual.mapa[it.chave] ?? it.chave) : `${it.chave}~${g}`])
        ),
      }));
      destinoRef.current = destino === null ? null : { pedido: g, y: destino };
      if (chaveFixa === null) setChaveFixa(chaveVista);
      if (novaOrdem !== ordem) setOrdem(novaOrdem);
      if (novoVer !== chaveVista) definirVer(novoVer === TODAS ? null : novoVer);
    },
    [chaveFixa, chaveVista, ordem]
  );

  const escolherFiltro = useCallback((id: string) => trocar(id, ordem), [trocar, ordem]);
  const escolherOrdem = useCallback((o: Ordem) => trocar(chaveVista, o), [trocar, chaveVista]);

  const vista = vistaPorSlug(grade.ver);
  const totalVisivel = lista.filter((it) => it.tipo === "peca").length;
  const anuncio = `${vista?.titulo ?? "Todas as peças"}: ${contagemPecas(totalVisivel)}`;

  return (
    <div className="bg-[#EDE7D9]">
      <Suspense fallback={null}>
        <SeguirNavegacao />
      </Suspense>
      <AvisoSaiDoCaminho />

      <div className="mx-auto max-w-[1380px] lg:grid lg:grid-cols-[210px_minmax(0,1fr)] lg:gap-14 lg:px-10 xl:gap-20 xl:px-14">
        <aside className="hidden lg:block">
          <IndiceFiltros ativo={chaveVista} ordem={ordem} onFiltro={escolherFiltro} onOrdem={escolherOrdem} />
        </aside>

        <div className="min-w-0">
          <Abertura />
          <BarraFiltros ativo={chaveVista} ordem={ordem} onFiltro={escolherFiltro} onOrdem={escolherOrdem} />
          <p role="status" className="sr-only">
            {anuncio}
          </p>
          <section
            id="pecas"
            tabIndex={-1}
            aria-labelledby="loja-titulo"
            style={{ scrollMarginTop: "calc(var(--header-h, 102px) + 60px)" }}
            className="px-4 pt-3 outline-none md:px-6 md:pt-8 lg:px-0 lg:pt-2"
          >
            <Grade
              key={chaveFixa ?? grade.ver ?? TODAS}
              lista={lista}
              chaves={grade.chaves.mapa}
              onAbrir={abrirPeca}
              gradeRef={gradeRef}
            />
          </section>
          <ComoComprar />
        </div>
      </div>

      {/* Uma folha só, para qualquer peça (o cartão só avisa qual abrir). */}
      <AnimatePresence>{aberta && <Folha key={aberta.id} produto={aberta} onFechar={fecharPeca} />}</AnimatePresence>
    </div>
  );
}

// O aviso "no carrinho" (CartToast, do layout) fica preso no rodapé da tela e
// pode ficar por cima da sacola de um cartão. Na vitrine ele sai do caminho
// assim que a pessoa segue adiante: ao rolar a página ou ao tocar em qualquer
// lugar que não seja o "Ver carrinho" (inclusive no próprio aviso). O
// contador do header e o selo dourado do cartão continuam mostrando o que
// está no carrinho.
function AvisoSaiDoCaminho() {
  const { ultimoAdicionado, dispensarAviso } = useCart();
  const vez = ultimoAdicionado?.vez ?? null;
  useEffect(() => {
    if (vez === null) return;
    let partida: number | null = null;
    // Espera a folha fechar e a página assentar antes de medir a partida.
    const espera = window.setTimeout(() => {
      partida = window.scrollY;
    }, 400);
    const aoRolar = () => {
      if (partida !== null && Math.abs(window.scrollY - partida) > 120) dispensarAviso(vez);
    };
    const aoTocar = (e: PointerEvent) => {
      const alvo = e.target instanceof Element ? e.target : null;
      const aviso = alvo?.closest("[role='status'][aria-live='polite']");
      if (aviso && alvo?.closest("button, a[href]")) return;
      dispensarAviso(vez);
    };
    window.addEventListener("scroll", aoRolar, { passive: true });
    document.addEventListener("pointerdown", aoTocar, true);
    return () => {
      window.clearTimeout(espera);
      window.removeEventListener("scroll", aoRolar);
      document.removeEventListener("pointerdown", aoTocar, true);
    };
  }, [vez, dispensarAviso]);
  return null;
}

// Segue a navegação do Next com a loja já aberta: o Next troca a URL no
// commit, sem evento do navegador. O efeito de layout roda depois de o Next
// gravar a URL e antes da pintura.
function SeguirNavegacao() {
  const busca = useSearchParams();
  useLayoutEffect(() => {
    avisarUrl();
  }, [busca]);
  return null;
}
