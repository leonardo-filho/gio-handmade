"use client";

import {
  useEffect,
  useEffectEvent,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, animate, motion, useMotionValue, usePresence, useTransform } from "framer-motion";
import { useCart } from "@/components/cart/CartProvider";
import ComoFunciona from "@/components/loja/ComoFunciona";
import { formatBRLPreco } from "@/lib/format";
import { labelParcelamento, parcelamentoCartao } from "@/lib/parcelas";
import { isolarFundo, prenderTab, travarRolagem } from "@/lib/travaRolagem";
import { secaoVitrine, type Produto } from "@/data/produtos";
import { fotosDe, itemDoCarrinho } from "./dados";
import Galeria, { caixaDaFoto, type Zoom } from "./Galeria";
import { imagemDoSlide, lerHeroi, quadroDoCartao, slideDe, slideVisivel } from "./heroi";
import {
  CSS_EASE,
  EASE,
  EASE_SAIDA,
  criarClone,
  encaixar34,
  movimentoReduzido,
  naTela,
  transformDe,
} from "./movimento";
import { voarParaSacola } from "./voo";
import s from "./vitrine.module.css";

const WA = "559192982017";

type Motivo = "normal" | "arrasto" | "adicionou";
type Props = { produto: Produto; onFechar: () => void };

// Origem do site (link da peça), só no navegador. No servidor e na
// hidratação vem vazia e a folha não renderiza: ela só abre depois de um
// toque ou da leitura da URL.
const semAssinatura = () => () => {};
const lerOrigem = () => window.location.origin;
const origemServidor = () => "";

// Folha da peça. No celular, sobe da base e fecha arrastando para baixo
// (ou pelo X, Esc, fundo e o voltar do aparelho); no desktop, um painel
// central com a foto à esquerda. Quando abre por um cartão, a foto do
// cartão cresce até o lugar dela na folha e, ao fechar, volta para ele.
// Quem abre e fecha (e mexe na URL) é a loja.
export default function Folha(props: Props) {
  const origem = useSyncExternalStore(semAssinatura, lerOrigem, origemServidor);
  if (!origem) return null;
  // Portal no <body>: os itens da grade animam com transform (que viraria o
  // containing block de position:fixed) e o <main> fica inerte por trás.
  return createPortal(<Painel {...props} origem={origem} />, document.body);
}

function Painel({ produto, onFechar, origem }: Props & { origem: string }) {
  const [presente, remover] = usePresence();
  const { add } = useCart();
  const tituloId = useId();
  const fotos = useMemo(() => fotosDe(produto), [produto]);
  const [desktop] = useState(() => window.matchMedia("(min-width: 1024px)").matches);
  const [heroi] = useState(() => lerHeroi(produto.id));
  const [indiceInicial] = useState(() => Math.min(heroi?.indice ?? 0, fotos.length - 1));
  const [indice, setIndice] = useState(indiceInicial);
  const [zoom, setZoom] = useState<Zoom | null>(null);
  const [adicionado, setAdicionado] = useState(false);
  const [linkCopiado, setLinkCopiado] = useState(false);

  const painelRef = useRef<HTMLDivElement>(null);
  const rolagemRef = useRef<HTMLDivElement>(null);
  const quadroRef = useRef<HTMLDivElement>(null);
  const trilhoRef = useRef<HTMLDivElement>(null);
  const motivoRef = useRef<Motivo>("normal");
  const saiuRef = useRef(false);
  const proporcoes = useRef<Record<string, number>>({});

  // y: deslocamento da folha do celular (abre, arrasta, fecha). fundo: o véu.
  const y = useMotionValue(0);
  const fundo = useMotionValue(0);
  const opacidade = useMotionValue(1);
  const escala = useMotionValue(1);
  const veu = useTransform([fundo, y], ([f, d]: number[]) => f * (1 - Math.min(1, d / Math.max(1, window.innerHeight)) * 0.9));

  const parcelamento = parcelamentoCartao(produto);
  const linkPeca = `${origem}/loja?produto=${produto.id}`;

  function fechar(motivo: Motivo = "normal") {
    motivoRef.current = motivo;
    onFechar();
  }

  // --- Abrir -----------------------------------------------------------------
  // Antes da primeira pintura: a galeria vai para a foto que o cartão mostrava,
  // mede o destino da foto com a folha já no lugar e só então põe a folha no
  // ponto de partida. A cópia da foto voa do cartão até o destino e, quando
  // a foto grande já carregou, se dissolve nela.
  useLayoutEffect(() => {
    const painel = painelRef.current;
    const quadro = quadroRef.current;
    const trilho = trilhoRef.current;
    if (!painel) return;
    if (trilho) trilho.scrollLeft = indiceInicial * trilho.clientWidth;
    const paradas: Array<() => void> = [];
    const guardar = (c: { stop: () => void }) => paradas.push(() => c.stop());

    if (movimentoReduzido()) {
      opacidade.set(0);
      guardar(animate(opacidade, 1, { duration: 0.2 }));
      guardar(animate(fundo, 1, { duration: 0.2 }));
      return () => paradas.forEach((p) => p());
    }

    const destino = quadro ? encaixar34(quadro.getBoundingClientRect()) : null;
    if (desktop) {
      opacidade.set(0);
      escala.set(0.97);
      guardar(animate(opacidade, 1, { duration: 0.32, ease: EASE }));
      guardar(animate(escala, 1, { duration: 0.6, ease: EASE }));
    } else {
      y.set(painel.offsetHeight);
      guardar(animate(y, 0, { duration: 0.62, ease: EASE }));
    }
    guardar(animate(fundo, 1, { duration: 0.4, ease: EASE }));

    let clone: HTMLElement | null = null;
    // Só a foto que voa some do cartão; o resto dele fica no lugar.
    const fotoCartao = heroi ? slideDe(quadroDoCartao(produto.id), heroi.indice) : null;
    if (heroi && destino && quadro) {
      quadro.style.opacity = "0";
      if (fotoCartao) fotoCartao.style.opacity = "0";
      const copia = criarClone(heroi.src, destino);
      clone = copia;
      const voo = copia.animate([{ transform: transformDe(heroi.caixa, destino) }, { transform: "none" }], {
        duration: 640,
        easing: CSS_EASE,
        fill: "both",
      });
      const dissolver = () => {
        quadro.style.opacity = "";
        const fim = copia.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 280, easing: "ease-out", fill: "forwards" });
        fim.onfinish = () => copia.remove();
      };
      voo.onfinish = () => {
        const grande = imagemDoSlide(quadro, indiceInicial);
        if (!grande || (grande.complete && grande.naturalWidth > 0)) return dissolver();
        let feito = false;
        const uma = () => {
          if (feito) return;
          feito = true;
          dissolver();
        };
        grande.addEventListener("load", uma, { once: true });
        window.setTimeout(uma, 1200);
      };
    }
    return () => {
      paradas.forEach((p) => p());
      clone?.remove();
      if (quadro) quadro.style.opacity = "";
      if (fotoCartao) fotoCartao.style.opacity = "";
    };
  }, [desktop, escala, fundo, heroi, indiceInicial, opacidade, produto.id, y]);

  // --- Fechar ----------------------------------------------------------------
  // A folha desce (ou o painel some) e, se a foto do cartão está à vista e é
  // a mesma, a foto volta voando para ele. Depois de adicionar, quem voa é a
  // miniatura até a sacola, então a foto não volta.
  useEffect(() => {
    if (presente || saiuRef.current) return;
    saiuRef.current = true;
    const painel = painelRef.current;
    const quadro = quadroRef.current;
    const motivo = motivoRef.current;
    const reduz = movimentoReduzido();
    const esperas: Promise<unknown>[] = [];
    const cartao = quadroDoCartao(produto.id);
    const destinoFoto = slideVisivel(cartao, indice);
    const img = imagemDoSlide(cartao, indice);
    const src = img ? img.currentSrc || img.src : "";

    if (!reduz && motivo === "normal" && destinoFoto && quadro && src && naTela(destinoFoto)) {
      const proporcao = proporcoes.current[fotos[indice]] ?? 0.75;
      const r = quadro.getBoundingClientRect();
      const c = caixaDaFoto(quadro, proporcao);
      const de = encaixar34({ left: r.left + c.left, top: r.top + c.top, width: c.w, height: c.h });
      const para = destinoFoto.getBoundingClientRect();
      const copia = criarClone(src, para);
      mostrarFotosDoCartao(cartao, destinoFoto);
      destinoFoto.style.opacity = "0";
      quadro.style.opacity = "0";
      const voo = copia.animate([{ transform: transformDe(de, para) }, { transform: "none" }], {
        duration: 560,
        easing: CSS_EASE,
        fill: "both",
      });
      esperas.push(
        voo.finished
          .catch(() => undefined)
          .then(() => {
            destinoFoto.style.opacity = "";
            copia.remove();
          })
      );
    } else {
      mostrarFotosDoCartao(cartao, null);
    }

    if (reduz) {
      esperas.push(animate(opacidade, 0, { duration: 0.18 }).finished);
    } else if (desktop) {
      esperas.push(animate(opacidade, 0, { duration: 0.26, ease: EASE_SAIDA }).finished);
      esperas.push(animate(escala, 0.98, { duration: 0.26, ease: EASE_SAIDA }).finished);
    } else if (painel) {
      esperas.push(
        animate(y, painel.offsetHeight, {
          duration: motivo === "arrasto" ? 0.32 : 0.46,
          ease: motivo === "arrasto" ? EASE : [0.32, 0, 0.18, 1],
        }).finished
      );
    }
    esperas.push(animate(fundo, 0, { duration: reduz ? 0.18 : 0.4 }).finished);
    Promise.all(esperas).finally(() => remover());
  }, [presente, desktop, escala, fotos, fundo, indice, opacidade, produto.id, remover, y]);

  // --- Foco, trava de rolagem e teclado --------------------------------------
  const aoTeclar = useEffectEvent((e: KeyboardEvent) => {
    if (e.key !== "Escape") return;
    if (zoom) setZoom(null);
    else fechar();
  });

  const idPeca = produto.id;
  useEffect(() => {
    const anterior = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const liberarRolagem = travarRolagem();
    const liberarFundo = isolarFundo();
    painelRef.current?.focus({ preventScroll: true });
    const onKey = (e: KeyboardEvent) => aoTeclar(e);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      liberarFundo();
      liberarRolagem();
      const doCartao = document.querySelector<HTMLElement>(`[data-produto="${CSS.escape(idPeca)}"] h3 button`);
      // Volta para quem abriu quando era um controle (o nome no cartão, o botão
      // da pausa); um toque na foto deixava o foco num contêiner, e aí o foco
      // vai para o nome da peça no cartão.
      const interativo = anterior?.isConnected && anterior.matches("button, a[href], [role='button']");
      const destino = interativo ? anterior : (doCartao ?? anterior);
      destino?.focus({ preventScroll: true });
    };
  }, [idPeca]);

  // --- Arrastar para fechar (celular) ----------------------------------------
  // Com a folha no topo da rolagem, puxar para baixo leva a folha junto com o
  // dedo; soltar depois de um quarto do caminho (ou com velocidade) fecha, e
  // antes disso ela volta com mola. Arrasto de lado é da galeria; com o zoom
  // ligado, o dedo é do zoom.
  const podeArrastar = useEffectEvent(() => zoom === null);
  const fecharPorArrasto = useEffectEvent(() => fechar("arrasto"));

  useEffect(() => {
    if (desktop) return;
    const painel = painelRef.current;
    const rolagem = rolagemRef.current;
    if (!painel || !rolagem) return;
    let estado: "livre" | "arrastando" | "ignorar" = "livre";
    let x0 = 0;
    let y0 = 0;
    let ultimoY = 0;
    let ultimoT = 0;
    let velocidade = 0;

    const inicio = (e: TouchEvent) => {
      if (e.touches.length !== 1 || !podeArrastar()) {
        estado = "ignorar";
        return;
      }
      const t = e.touches[0];
      x0 = t.clientX;
      y0 = t.clientY;
      ultimoY = t.clientY;
      ultimoT = e.timeStamp;
      velocidade = 0;
      estado = "livre";
    };
    const mover = (e: TouchEvent) => {
      if (estado === "ignorar") return;
      const t = e.touches[0];
      if (estado === "livre") {
        const dx = t.clientX - x0;
        const dy = t.clientY - y0;
        if (Math.abs(dx) < 6 && Math.abs(dy) < 6) return;
        if (dy > 0 && Math.abs(dy) > Math.abs(dx) * 1.2 && rolagem.scrollTop <= 0) {
          estado = "arrastando";
          y0 = t.clientY;
        } else {
          estado = "ignorar";
          return;
        }
      }
      if (e.cancelable) e.preventDefault();
      y.set(Math.max(0, t.clientY - y0));
      const dt = Math.max(1, e.timeStamp - ultimoT);
      velocidade = (t.clientY - ultimoY) / dt;
      ultimoY = t.clientY;
      ultimoT = e.timeStamp;
    };
    const fim = () => {
      if (estado !== "arrastando") {
        estado = "livre";
        return;
      }
      estado = "livre";
      const d = y.get();
      if (d > Math.min(170, painel.offsetHeight * 0.25) || (velocidade > 0.6 && d > 30)) fecharPorArrasto();
      else animate(y, 0, { type: "spring", stiffness: 420, damping: 36 });
    };

    painel.addEventListener("touchstart", inicio, { passive: true });
    painel.addEventListener("touchmove", mover, { passive: false });
    painel.addEventListener("touchend", fim);
    painel.addEventListener("touchcancel", fim);
    return () => {
      painel.removeEventListener("touchstart", inicio);
      painel.removeEventListener("touchmove", mover);
      painel.removeEventListener("touchend", fim);
      painel.removeEventListener("touchcancel", fim);
    };
  }, [desktop, y]);

  // --- Ações -------------------------------------------------------------------
  function prenderFoco(e: React.KeyboardEvent<HTMLDivElement>) {
    prenderTab(e, painelRef.current);
  }

  async function copiarLink() {
    try {
      await navigator.clipboard.writeText(linkPeca);
      setLinkCopiado(true);
      window.setTimeout(() => setLinkCopiado(false), 2000);
    } catch {
      window.prompt("Copie o link da peça:", linkPeca);
    }
  }

  // A miniatura da foto à vista voa até a sacola; a folha fecha logo depois e
  // o aviso "no carrinho" (CartToast) aparece quando a peça pousa.
  function adicionar() {
    if (adicionado) return;
    setAdicionado(true);
    const quadro = quadroRef.current;
    const img = imagemDoSlide(quadro, indice);
    let origemVoo: { left: number; top: number; width: number; height: number } | null = null;
    if (quadro) {
      const r = quadro.getBoundingClientRect();
      const c = caixaDaFoto(quadro, proporcoes.current[fotos[indice]] ?? 0.75);
      origemVoo = { left: r.left + c.left, top: r.top + c.top, width: c.w, height: c.h };
    }
    voarParaSacola(origemVoo, img ? img.currentSrc || img.src : null, () => add(itemDoCarrinho(produto)));
    window.setTimeout(() => fechar("adicionou"), movimentoReduzido() ? 650 : 160);
  }

  const precoTexto = `${formatBRLPreco(parcelamento.total)} ${labelParcelamento(parcelamento)} ou ${formatBRLPreco(produto.preco)} no pix`;
  const mensagem = [
    `Oi, Gio! Quero encomendar esta peça: ${produto.nome} (${precoTexto}).`,
    linkPeca,
    (produto.prontaEntrega ? "Vi que ela tem pronta entrega: qual tamanho está disponível? " : "") +
      "Também queria ver acabamentos extras (pingentes, franjas) e o que combina com ela. Pode me ajudar?",
  ].join("\n");
  const whatsapp = `https://wa.me/${WA}?text=${encodeURIComponent(mensagem)}`;

  const galeria = (
    <Galeria
      fotos={fotos}
      nome={produto.nome}
      desktop={desktop}
      indice={indice}
      indiceInicial={indiceInicial}
      onIndice={setIndice}
      quadroRef={quadroRef}
      trilhoRef={trilhoRef}
      proporcoes={proporcoes}
      zoom={zoom}
      onZoom={setZoom}
      className={desktop ? "h-full w-full" : "aspect-[3/4] max-h-[calc(94dvh-16.5rem)] w-full"}
    />
  );

  const conteudo = (
    <div className="px-5 pb-8 pt-5 md:px-8 lg:px-10 lg:pb-10 lg:pt-14">
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: EASE, delay: 0.18 }}
      >
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 pr-12 lg:pr-14">
          <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-brand-gold-text">{secaoVitrine(produto)}</p>
          {produto.prontaEntrega && (
            <span className="rounded-full bg-[#1B4965] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-[#EDE7D9]">
              Pronta entrega
            </span>
          )}
        </div>
        <h2
          id={tituloId}
          className="mt-2 font-[family-name:var(--font-serif)] text-[34px] leading-[1.02] tracking-[-0.01em] text-[#1B4965] lg:mt-3 lg:text-[50px]"
        >
          {produto.nome}
        </h2>
        <div className="mt-3 lg:mt-5">
          <p className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
            <span className="nums-preco font-[family-name:var(--font-serif)] text-[28px] font-medium leading-none text-[#1B4965] lg:text-[34px]">
              {formatBRLPreco(parcelamento.total)}
            </span>
            <span className="text-[13px] text-[#1B4965]">{labelParcelamento(parcelamento)}</span>
          </p>
          <p className="mt-1.5 text-sm text-brand-muted">ou {formatBRLPreco(produto.preco)} no pix</p>
          {produto.producao && (
            <p className="mt-3 flex items-center gap-2 text-[13px] text-[#1B4965]">
              <span aria-hidden className="h-[7px] w-[7px] shrink-0 rounded-full border border-[#1B4965]/60" />
              Sob medida: confecção em {produto.producao}
            </p>
          )}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: EASE, delay: 0.28 }}
      >
        <span aria-hidden className={`mt-6 block h-[1.5px] w-20 ${s.ponto}`} />
        <p className="mt-5 text-[15px] leading-relaxed text-[#1B4965]/90">{produto.detalhes}</p>
        <p className="mt-2 text-xs leading-relaxed text-brand-muted">
          Cada peça é única: pequenas variações fazem parte da sua autenticidade.
        </p>

        {/* O prazo de confecção já está junto do preço, lá em cima. */}
        <ComoFunciona className="mt-6" prontaEntrega={produto.prontaEntrega} />

        <div className="mt-6 rounded-[4px] border border-[#b8902a]/35 bg-[#b8902a]/[0.06] p-4">
          <p className="font-[family-name:var(--font-serif)] text-[20px] leading-tight text-[#1B4965]">
            Deixe do <em>seu jeito</em>
          </p>
          <p className="mt-1.5 text-[13px] leading-relaxed text-brand-muted">
            Dá para personalizar a peça do seu jeito, inclusive as cores. Chame no WhatsApp que a gente monta com você.
          </p>
        </div>

        <button
          type="button"
          onClick={copiarLink}
          className="-ml-2 mt-3 inline-flex min-h-11 cursor-pointer items-center gap-1.5 rounded-sm px-2 text-[11px] font-medium uppercase tracking-[0.14em] text-brand-muted underline-offset-4 transition-colors hover:text-[#1B4965] hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1B4965]"
        >
          {linkCopiado ? (
            <>
              <svg className="h-3.5 w-3.5 text-[#2f7a45]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20 6 9 17l-5-5" />
              </svg>
              Link copiado
            </>
          ) : (
            <>
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
              </svg>
              Copiar link da peça
            </>
          )}
        </button>
        <p className="sr-only" aria-live="polite">
          {linkCopiado ? "Link da peça copiado" : ""}
        </p>
      </motion.div>
    </div>
  );

  // Barra de compra: fora da área que rola, sempre à vista.
  const barra = (
    <div className="shrink-0 border-t border-[#1B4965]/10 bg-[#EDE7D9]/95 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur-md md:px-8 lg:px-10 lg:pb-7 lg:pt-5">
      <div className="flex gap-2.5">
        <button
          type="button"
          onClick={adicionar}
          className={`relative flex h-12 min-w-0 flex-1 cursor-pointer items-center justify-center overflow-hidden rounded-full px-5 text-[12px] font-bold uppercase tracking-[0.16em] text-[#EDE7D9] transition-[background-color,transform] duration-300 active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1B4965] focus-visible:ring-offset-2 focus-visible:ring-offset-[#EDE7D9] lg:h-14 ${
            adicionado ? "bg-[#130209]" : "bg-[#1B4965] hover:bg-[#130209]"
          }`}
        >
          <AnimatePresence mode="popLayout" initial={false}>
            {adicionado ? (
              <motion.span
                key="ok"
                className="flex items-center gap-2"
                initial={{ y: 18, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.3, ease: EASE }}
              >
                <svg className="h-4 w-4 text-[#e6cf8f]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 12.5 10 17.5 19 7" />
                </svg>
                Adicionada
              </motion.span>
            ) : (
              <motion.span
                key="add"
                className="flex items-center gap-2"
                exit={{ y: -18, opacity: 0 }}
                transition={{ duration: 0.25, ease: EASE }}
              >
                <svg className="h-[18px] w-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5.5 8h13l-1 12.5h-11z" />
                  <path strokeLinecap="round" d="M9 8V6.5a3 3 0 0 1 6 0V8" />
                </svg>
                Adicionar ao carrinho
              </motion.span>
            )}
          </AnimatePresence>
        </button>
        <a
          href={whatsapp}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Encomendar pelo WhatsApp"
          className="inline-flex h-12 w-12 shrink-0 items-center justify-center gap-2 rounded-full border border-[#1B4965]/50 text-[#1B4965] transition-[background-color,border-color,transform] duration-300 hover:border-[#1B4965] hover:bg-[#1B4965]/5 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1B4965] lg:h-14 lg:w-auto lg:px-6"
        >
          <IconeWhatsApp className="h-5 w-5 lg:h-4 lg:w-4" />
          <span className="hidden text-xs font-bold uppercase tracking-[0.16em] lg:inline">WhatsApp</span>
        </a>
      </div>
    </div>
  );

  const botaoFechar = (
    <button
      type="button"
      onClick={() => fechar()}
      aria-label="Fechar"
      className="absolute right-3 top-9 z-30 flex h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-[#EDE7D9]/88 text-[#1B4965] shadow-sm backdrop-blur-md transition-[background-color,transform] duration-200 hover:bg-white active:scale-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1B4965] lg:right-5 lg:top-5"
    >
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
      </svg>
    </button>
  );

  return (
    <div className="fixed inset-0 z-[95] flex items-end justify-center lg:items-center lg:p-8">
      <motion.button
        type="button"
        tabIndex={-1}
        aria-label="Fechar detalhes"
        onClick={() => fechar()}
        style={{ opacity: veu }}
        className="absolute inset-0 cursor-default bg-[#130209]/60 backdrop-blur-[3px]"
      />
      <motion.div
        ref={painelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={tituloId}
        tabIndex={-1}
        data-lenis-prevent
        onKeyDown={prenderFoco}
        style={desktop ? { opacity: opacidade, scale: escala } : { y, opacity: opacidade }}
        className="relative flex h-[94dvh] w-full max-w-[680px] flex-col overflow-hidden rounded-t-[22px] bg-[#EDE7D9] shadow-[0_-20px_60px_-20px_rgba(19,2,9,0.5)] focus:outline-none lg:h-[min(86vh,820px)] lg:w-[min(1180px,94vw)] lg:max-w-none lg:flex-row lg:rounded-[6px]"
      >
        {desktop ? (
          <>
            <div className="relative aspect-[3/4] h-full shrink-0">{galeria}</div>
            <div className="flex min-w-0 flex-1 flex-col">
              <div ref={rolagemRef} className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
                {conteudo}
              </div>
              {barra}
            </div>
          </>
        ) : (
          <>
            <div ref={rolagemRef} className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
              {galeria}
              {conteudo}
            </div>
            {barra}
            <span
              aria-hidden
              className="pointer-events-none absolute left-1/2 top-2 z-30 h-[5px] w-10 -translate-x-1/2 rounded-full bg-white/90 shadow-[0_1px_4px_rgba(19,2,9,0.35)]"
            />
          </>
        )}
        {botaoFechar}
      </motion.div>
    </div>
  );
}

// Devolve ao cartão a foto que tinha voado para a folha (menos a que está
// voltando agora), com um fade curto quando ela fica à vista.
function mostrarFotosDoCartao(cartao: HTMLElement | null, exceto: HTMLElement | null) {
  cartao?.querySelectorAll<HTMLElement>("[data-slide]").forEach((foto) => {
    if (foto === exceto || foto.style.opacity !== "0") return;
    foto.style.opacity = "";
    if (getComputedStyle(foto).opacity !== "0" && !movimentoReduzido()) {
      foto.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 300, easing: "ease-out" });
    }
  });
}

function IconeWhatsApp({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className={className}>
      <path d="M.057 24l1.687-6.163a11.867 11.867 0 01-1.587-5.945C.16 5.335 5.495 0 12.05 0a11.817 11.817 0 018.413 3.488 11.824 11.824 0 013.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 01-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.821 9.821 0 001.519 5.26l-.999 3.648 3.97-1.317zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
    </svg>
  );
}
