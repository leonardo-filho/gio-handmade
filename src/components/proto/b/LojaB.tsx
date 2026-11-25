"use client";

import {
  Suspense,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useSearchParams } from "next/navigation";
import { AnimatePresence, LayoutGroup, motion } from "framer-motion";
import { useCart } from "@/components/cart/CartProvider";
import {
  SECOES_TODAS,
  TOTAL_PECAS,
  contagemPecas,
  produtoPorId,
  vistaPorSlug,
  type SecaoTodas,
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
import type { Produto } from "@/data/produtos";
import { EASE_ATELIER, faixaDePreco, ordenarProdutos, type Ordenacao } from "./animacoes";
import BarraFiltros from "./BarraFiltros";
import CartaoPecaB from "./CartaoPecaB";
import DestaqueEditorial from "./DestaqueEditorial";
import DetalhePeca from "./DetalhePeca";
import GuiaAtelie from "./GuiaAtelie";
import VooCarrinho, { type PulsoDestino, type VooItem } from "./VooCarrinho";
import { useReduzirMovimento } from "./useReduzirMovimento";

export type ChegadaB = {
  produto: string | null;
  ver: string | null;
};

const TODAS = "todas";
const RESPIRO = 12;

function encontrarBotaoCarrinhoVisivel(): { x: number; y: number } | null {
  const botoes = Array.from(document.querySelectorAll<HTMLElement>("[data-cart-button]"));
  const visivel = botoes.find((el) => el.offsetParent !== null);
  if (!visivel) return null;
  const r = visivel.getBoundingClientRect();
  return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
}

export default function LojaB({ chegada }: { chegada: ChegadaB }) {
  const { produto, ver } = useUrlLoja();
  const hidratado = useHidratado();
  const reduzir = useReduzirMovimento();
  const { add, lines } = useCart();

  const [chegadaPronta, setChegadaPronta] = useState(false);
  const [ordem, setOrdem] = useState<Ordenacao>("curadoria");
  const [voos, setVoos] = useState<VooItem[]>([]);
  const [pulsoDestino, setPulsoDestino] = useState<PulsoDestino | null>(null);

  const catalogoRef = useRef<HTMLDivElement>(null);
  const vooSeqRef = useRef(0);
  const timerPulsoRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    return () => clearTimeout(timerPulsoRef.current);
  }, []);

  const verEfetivo = chegadaPronta ? ver : chegada.ver;
  const vista = vistaPorSlug(verEfetivo);
  const chaveVista = vista?.slug ?? TODAS;
  const aberta = chegadaPronta && produto ? (produtoPorId.get(produto) ?? null) : null;

  const qtdPorId = useMemo(() => {
    const mapa = new Map<string, number>();
    for (const linha of lines) {
      mapa.set(linha.id, linha.qty);
    }
    return mapa;
  }, [lines]);

  // Chegada: normaliza URL antiga (#slug / #id), rola ate a peca do story e abre o detalhe.
  useEffect(() => {
    if (!hidratado) return;
    let timer: ReturnType<typeof setTimeout> | undefined;
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
      timer = setTimeout(() => setChegadaPronta(true), 240);
    });
    return () => {
      cancelAnimationFrame(quadro);
      clearTimeout(timer);
    };
  }, [hidratado]);

  const rolarParaInicioCatalogo = useCallback(() => {
    const catalogo = catalogoRef.current;
    if (!catalogo) return;
    const header = document.querySelector("header")?.getBoundingClientRect().height ?? 0;
    const barra = document.querySelector("[data-loja-nav]")?.getBoundingClientRect().height ?? 0;
    const y = catalogo.getBoundingClientRect().top + window.scrollY - header - barra - RESPIRO;
    if (window.scrollY > y + 1) {
      requestAnimationFrame(() => rolarAte(y, true));
    }
  }, []);

  const escolherFiltro = useCallback(
    (id: string) => {
      rolarParaInicioCatalogo();
      definirVer(id === TODAS ? null : id);
    },
    [rolarParaInicioCatalogo]
  );

  const escolherOrdem = useCallback(
    (novaOrdem: Ordenacao) => {
      rolarParaInicioCatalogo();
      setOrdem(novaOrdem);
    },
    [rolarParaInicioCatalogo]
  );

  const adicionarComVoo = useCallback(
    (p: Produto, origemEl: HTMLElement | null) => {
      add({
        id: p.id,
        nome: p.nome,
        preco: p.preco,
        foto: p.foto,
        categoria: p.categoria,
      });
      if (reduzir || !origemEl) return;
      const destino = encontrarBotaoCarrinhoVisivel();
      if (!destino) return;
      const r = origemEl.getBoundingClientRect();
      vooSeqRef.current += 1;
      const chave = vooSeqRef.current;
      setVoos((prev) => [
        ...prev,
        {
          chave,
          foto: p.foto,
          origem: { x: r.left + r.width / 2, y: r.top + r.height / 2 },
          destino,
        },
      ]);
    },
    [add, reduzir]
  );

  const adicionarDoDetalhe = useCallback(
    (p: Produto) => {
      add({
        id: p.id,
        nome: p.nome,
        preco: p.preco,
        foto: p.foto,
        categoria: p.categoria,
      });
    },
    [add]
  );

  const aoFimVoo = useCallback((chave: number, destino: { x: number; y: number }) => {
    setVoos((prev) => prev.filter((v) => v.chave !== chave));
    setPulsoDestino({ chave, x: destino.x, y: destino.y });
    clearTimeout(timerPulsoRef.current);
    timerPulsoRef.current = setTimeout(() => setPulsoDestino(null), 500);
  }, []);

  const todasEmOrdem = useMemo(() => SECOES_TODAS.flatMap((s) => s.itens), []);
  const listaPlana = useMemo(() => {
    const base = vista ? vista.itens : todasEmOrdem;
    return ordenarProdutos(base, ordem);
  }, [vista, todasEmOrdem, ordem]);

  const mostrarSecoesAgrupadas = !vista && ordem === "curadoria";
  const totalVisivel = vista ? vista.itens.length : TOTAL_PECAS;
  const tituloAtual = vista ? vista.titulo : null;

  const anuncio = vista
    ? `${vista.titulo}: ${contagemPecas(vista.itens.length)}`
    : `Todas as peças: ${contagemPecas(TOTAL_PECAS)}`;

  return (
    <div
      id="vitrine-b"
      tabIndex={-1}
      style={{ scrollMarginTop: "var(--header-h, 102px)" }}
      className="min-h-screen overflow-x-clip bg-[#EDE7D9] text-[#1B4965] outline-none"
    >
      <Suspense fallback={null}>
        <SeguirNavegacao />
      </Suspense>

      {/* Cabecalho editorial enxuto: mantem a primeira fileira de pecas na tela inicial do celular */}
      <header className="mx-auto max-w-6xl px-4 pb-2.5 pt-2.5 md:pb-5 md:pt-6">
        <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.26em] text-brand-gold-text">
          <span>Belém · PA</span>
          <span aria-hidden className="h-px flex-1 bg-[#b8902a]/45" />
          <span className="text-brand-muted tabular-nums">{contagemPecas(totalVisivel)}</span>
          {chaveVista === TODAS && (
            <button
              type="button"
              onClick={() => escolherFiltro("pronta-entrega")}
              className="hidden cursor-pointer items-center gap-1 text-[10px] font-bold uppercase tracking-[0.18em] text-[#1B4965] underline decoration-[#b8902a]/70 underline-offset-4 transition-colors hover:text-brand-gold-text md:inline-flex"
            >
              Pronta entrega
              <span aria-hidden>→</span>
            </button>
          )}
        </div>

        <div className="mt-1.5 overflow-hidden md:mt-2.5">
          <AnimatePresence mode="wait" initial={false}>
            <motion.h1
              key={chaveVista}
              initial={reduzir ? { opacity: 0 } : { y: "30%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={reduzir ? { opacity: 0 } : { y: "-22%", opacity: 0 }}
              transition={{ duration: reduzir ? 0 : 0.3, ease: EASE_ATELIER }}
              className="font-[family-name:var(--font-serif)] text-[32px] leading-[1.04] tracking-[-0.02em] text-[#1B4965] sm:text-[46px] md:text-[56px]"
            >
              {tituloAtual ? (
                <span className="italic font-normal">{tituloAtual}</span>
              ) : (
                <>
                  Bordado à mão,{" "}
                  <em className="italic font-normal text-[#1B4965]/85">um a um.</em>
                </>
              )}
            </motion.h1>
          </AnimatePresence>
        </div>

        <p className="mt-1 text-xs leading-snug text-brand-muted md:mt-1.5 md:text-sm">
          Sob medida ou à pronta entrega · Finalize pelo WhatsApp.
        </p>
      </header>

      <BarraFiltros
        ativo={chaveVista}
        onEscolher={escolherFiltro}
        ordem={ordem}
        onOrdenar={escolherOrdem}
      />

      <p role="status" className="sr-only">
        {anuncio}
      </p>

      <LayoutGroup id="loja-b">
        <div ref={catalogoRef} className="mx-auto max-w-6xl px-4 pb-16 pt-4 md:pb-24 md:pt-8">
          {mostrarSecoesAgrupadas ? (
            <div className="space-y-12 md:space-y-16">
              {SECOES_TODAS.map((secao, sIdx) => (
                <SecaoCuradoria
                  key={secao.slug}
                  secao={secao}
                  sIdx={sIdx}
                  reduzir={reduzir}
                  qtdPorId={qtdPorId}
                  onAbrir={abrirPeca}
                  onAdicionar={adicionarComVoo}
                />
              ))}
            </div>
          ) : (
            <section aria-label={tituloAtual ?? "Peças ordenadas"}>
              <div className="mb-4 flex items-baseline justify-between gap-3 border-b border-[#1B4965]/15 pb-2.5 md:mb-6">
                <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-brand-muted tabular-nums">
                  {contagemPecas(listaPlana.length)}
                </span>
                <span className="text-[11px] text-brand-muted tabular-nums">
                  {faixaDePreco(listaPlana)}
                </span>
              </div>

              <motion.div
                layout={reduzir ? false : true}
                className="grid grid-cols-2 gap-x-3.5 gap-y-7 sm:gap-x-5 sm:gap-y-9 md:grid-cols-3 lg:grid-cols-4 lg:gap-x-6 lg:gap-y-12"
              >
                <AnimatePresence mode="popLayout">
                  {listaPlana.map((p, idx) => (
                    <CartaoPecaB
                      key={p.id}
                      produto={p}
                      onAbrir={abrirPeca}
                      onAdicionar={adicionarComVoo}
                      qtdNoCarrinho={qtdPorId.get(p.id) ?? 0}
                      prioridade={idx < 4}
                      imediato={idx < 8}
                      indiceNaGrade={idx}
                    />
                  ))}
                </AnimatePresence>
              </motion.div>
            </section>
          )}
        </div>

        <AnimatePresence>
          {aberta && (
            <DetalhePeca
              key={aberta.id}
              produto={aberta}
              onClose={fecharPeca}
              onAdicionar={adicionarDoDetalhe}
            />
          )}
        </AnimatePresence>
      </LayoutGroup>

      <GuiaAtelie />
      <VooCarrinho voos={voos} pulsoDestino={pulsoDestino} onFimVoo={aoFimVoo} />
    </div>
  );
}

function SecaoCuradoria({
  secao,
  sIdx,
  reduzir,
  qtdPorId,
  onAbrir,
  onAdicionar,
}: {
  secao: SecaoTodas;
  sIdx: number;
  reduzir: boolean;
  qtdPorId: Map<string, number>;
  onAbrir: (id: string) => void;
  onAdicionar: (produto: Produto, origemEl: HTMLElement | null) => void;
}) {
  const primeiraSecao = sIdx === 0;
  const cabecalho = (
    <motion.div
      suppressHydrationWarning
      initial={primeiraSecao || reduzir ? false : { opacity: 0, y: 12 }}
      whileInView={primeiraSecao ? undefined : { opacity: 1, y: 0 }}
      viewport={primeiraSecao ? undefined : { once: true, margin: "60px 0px 140px 0px" }}
      transition={{ duration: reduzir ? 0 : 0.36, ease: EASE_ATELIER }}
      className="mb-4 flex items-baseline gap-3 border-b border-[#1B4965]/15 pb-2.5 md:mb-6"
    >
      <span className="text-[10px] font-bold tracking-[0.24em] text-brand-gold-text">
        {String(sIdx + 1).padStart(2, "0")}
      </span>
      <h2
        id={`sec-b-${secao.slug}`}
        className="font-[family-name:var(--font-serif)] text-2xl italic text-[#1B4965] md:text-3xl"
      >
        {secao.titulo}
      </h2>
      <span aria-hidden className="hidden h-px flex-1 bg-[#1B4965]/12 sm:block" />
      <span className="ml-auto text-[11px] uppercase tracking-[0.14em] text-brand-muted tabular-nums">
        {contagemPecas(secao.itens.length)}
        <span className="hidden md:inline"> · {faixaDePreco(secao.itens)}</span>
      </span>
    </motion.div>
  );

  // Vestidos (2 pecas): diptico editorial sem buracos no desktop.
  if (secao.slug === "vestidos") {
    return (
      <section key={secao.slug} aria-labelledby={`sec-b-${secao.slug}`}>
        {cabecalho}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:gap-8">
          {secao.itens.map((p) => (
            <DestaqueEditorial
              key={p.id}
              produto={p}
              onAbrir={onAbrir}
              onAdicionar={onAdicionar}
              qtdNoCarrinho={qtdPorId.get(p.id) ?? 0}
              etiqueta="Sob medida"
              variante="diptico"
            />
          ))}
        </div>
      </section>
    );
  }

  // Tops (33 pecas) e Saias (5 pecas): abertura em faixa editorial + grades fechadas (4 cols desktop / 2 celular).
  if (secao.slug === "tops" || secao.slug === "saias") {
    const [destaque, ...restante] = secao.itens;
    const primeiroBloco = secao.slug === "tops" ? restante.slice(0, 16) : restante;
    const segundoBloco = secao.slug === "tops" ? restante.slice(16) : [];

    return (
      <section key={secao.slug} aria-labelledby={`sec-b-${secao.slug}`}>
        {cabecalho}
        <div className="space-y-8 md:space-y-12">
          {destaque && (
            <DestaqueEditorial
              produto={destaque}
              onAbrir={onAbrir}
              onAdicionar={onAdicionar}
              qtdNoCarrinho={qtdPorId.get(destaque.id) ?? 0}
              etiqueta={
                destaque.prontaEntrega ? "Pronta entrega · Destaque" : "Destaque da coleção"
              }
              variante="faixa"
            />
          )}

          {primeiroBloco.length > 0 && (
            <div className="grid grid-cols-2 gap-x-3.5 gap-y-7 sm:gap-x-5 sm:gap-y-9 md:grid-cols-3 lg:grid-cols-4 lg:gap-x-6 lg:gap-y-12">
              {primeiroBloco.map((p, idx) => (
                <CartaoPecaB
                  key={p.id}
                  produto={p}
                  onAbrir={onAbrir}
                  onAdicionar={onAdicionar}
                  qtdNoCarrinho={qtdPorId.get(p.id) ?? 0}
                  indiceNaGrade={idx}
                />
              ))}
            </div>
          )}

          {segundoBloco.length > 0 && (
            <>
              <div className="flex items-center gap-4 py-2 text-center">
                <span aria-hidden className="h-px flex-1 bg-[#b8902a]/35" />
                <p className="max-w-md font-[family-name:var(--font-serif)] text-base italic text-[#1B4965]/85 md:text-lg">
                  Cada peça é única: pequenas variações fazem parte da sua autenticidade.
                </p>
                <span aria-hidden className="h-px flex-1 bg-[#b8902a]/35" />
              </div>

              <div className="grid grid-cols-2 gap-x-3.5 gap-y-7 sm:gap-x-5 sm:gap-y-9 md:grid-cols-3 lg:grid-cols-4 lg:gap-x-6 lg:gap-y-12">
                {segundoBloco.map((p, idx) => (
                  <CartaoPecaB
                    key={p.id}
                    produto={p}
                    onAbrir={onAbrir}
                    onAdicionar={onAdicionar}
                    qtdNoCarrinho={qtdPorId.get(p.id) ?? 0}
                    indiceNaGrade={idx}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </section>
    );
  }

  // Conjuntos (6 pecas) e Acessorios (6 pecas): 3 colunas no desktop = 2 fileiras cheias sem orfaos.
  const tresColunasDesktop = secao.itens.length === 6;

  return (
    <section key={secao.slug} aria-labelledby={`sec-b-${secao.slug}`}>
      {cabecalho}
      <div
        className={
          tresColunasDesktop
            ? "grid grid-cols-2 gap-x-3.5 gap-y-7 sm:gap-x-5 sm:gap-y-9 lg:grid-cols-3 lg:gap-x-7 lg:gap-y-12"
            : "grid grid-cols-2 gap-x-3.5 gap-y-7 sm:gap-x-5 sm:gap-y-9 md:grid-cols-3 lg:grid-cols-4 lg:gap-x-6 lg:gap-y-12"
        }
      >
        {secao.itens.map((p, idx) => (
          <CartaoPecaB
            key={p.id}
            produto={p}
            onAbrir={onAbrir}
            onAdicionar={onAdicionar}
            qtdNoCarrinho={qtdPorId.get(p.id) ?? 0}
            prioridade={primeiraSecao && idx < 4}
            imediato={primeiraSecao}
            indiceNaGrade={idx}
          />
        ))}
      </div>
    </section>
  );
}

function SeguirNavegacao() {
  const busca = useSearchParams();
  useLayoutEffect(() => {
    avisarUrl();
  }, [busca]);
  return null;
}
