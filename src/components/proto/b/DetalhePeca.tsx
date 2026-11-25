"use client";

import {
  useEffect,
  useEffectEvent,
  useId,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import {
  AnimatePresence,
  motion,
  useDragControls,
  useMotionValue,
  useTransform,
  type PanInfo,
} from "framer-motion";
import ComoFunciona from "@/components/loja/ComoFunciona";
import { formatBRLPreco } from "@/lib/format";
import { labelParcelamento, parcelamentoCartao } from "@/lib/parcelas";
import { isolarFundo, prenderTab, travarRolagem } from "@/lib/travaRolagem";
import { secaoVitrine, type Produto } from "@/data/produtos";
import { EASE_ATELIER, SPRING_BOTAO, SPRING_FOLHA, SPRING_PILULA, fotosDoProduto } from "./animacoes";
import LupaBordado from "./LupaBordado";
import { useReduzirMovimento } from "./useReduzirMovimento";

const WA = "559192982017";

const semAssinatura = () => () => {};
const lerOrigem = () => window.location.origin;
const origemNoServidor = () => "";

type Props = {
  produto: Produto;
  onClose: () => void;
  onAdicionar: (produto: Produto) => void;
};

function botaoDoCard(id: string) {
  return document.querySelector<HTMLElement>(`[data-produto="${CSS.escape(id)}"] h3 button`);
}

export default function DetalhePeca(props: Props) {
  const origem = useSyncExternalStore(semAssinatura, lerOrigem, origemNoServidor);
  if (!origem) return null;
  return createPortal(<PainelDetalhe {...props} origem={origem} />, document.body);
}

function PainelDetalhe({
  produto,
  onClose,
  onAdicionar,
  origem,
}: Props & { origem: string }) {
  const reduzir = useReduzirMovimento();
  const tituloId = useId();
  const painelRef = useRef<HTMLDivElement>(null);
  const fecharRef = useRef<HTMLButtonElement>(null);
  const timerFecharRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const timerCopiadoRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const fotos = fotosDoProduto(produto);
  const [fotoAtiva, setFotoAtiva] = useState(0);
  const [linkCopiado, setLinkCopiado] = useState(false);
  const [adicionado, setAdicionado] = useState(false);

  const dragControls = useDragControls();
  const dragY = useMotionValue(0);
  const opacidadeArrasto = useTransform(dragY, [0, 260], [1, 0.25]);

  const parcelamento = parcelamentoCartao(produto);
  const linkPeca = `${origem}/loja?produto=${produto.id}`;

  const aoTeclar = useEffectEvent((e: KeyboardEvent) => {
    if (e.key === "Escape") onClose();
  });

  const idPeca = produto.id;
  useEffect(() => {
    const anterior =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const liberarRolagem = travarRolagem();
    const liberarFundo = isolarFundo();
    fecharRef.current?.focus({ preventScroll: true });
    const onKey = (e: KeyboardEvent) => aoTeclar(e);
    window.addEventListener("keydown", onKey);
    return () => {
      clearTimeout(timerFecharRef.current);
      clearTimeout(timerCopiadoRef.current);
      window.removeEventListener("keydown", onKey);
      liberarFundo();
      liberarRolagem();
      const destino =
        anterior && anterior !== document.body && anterior.isConnected
          ? anterior
          : botaoDoCard(idPeca);
      destino?.focus({ preventScroll: true });
    };
  }, [idPeca]);

  function prenderFoco(e: React.KeyboardEvent<HTMLDivElement>) {
    if (e.key === "Tab" && e.target === painelRef.current) {
      e.preventDefault();
      fecharRef.current?.focus();
      return;
    }
    prenderTab(e, painelRef.current);
  }

  async function copiarLink() {
    try {
      await navigator.clipboard.writeText(linkPeca);
      setLinkCopiado(true);
      clearTimeout(timerCopiadoRef.current);
      timerCopiadoRef.current = setTimeout(() => setLinkCopiado(false), 2000);
    } catch {
      window.prompt("Copie o link da peça:", linkPeca);
    }
  }

  function adicionar() {
    if (adicionado) return;
    onAdicionar(produto);
    setAdicionado(true);
    clearTimeout(timerFecharRef.current);
    timerFecharRef.current = setTimeout(onClose, 550);
  }

  function aoSoltarFolha(_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) {
    if (info.offset.y > 105 || info.velocity.y > 420) {
      onClose();
    }
  }

  const precoTexto = `${formatBRLPreco(parcelamento.total)} ${labelParcelamento(
    parcelamento
  )} ou ${formatBRLPreco(produto.preco)} no pix`;

  const mensagem = [
    `Oi, Gio! Quero encomendar esta peça: ${produto.nome} (${precoTexto}).`,
    linkPeca,
    (produto.prontaEntrega ? "Vi que ela tem pronta entrega: qual tamanho está disponível? " : "") +
      "Também queria ver acabamentos extras (pingentes, franjas) e o que combina com ela. Pode me ajudar?",
  ].join("\n");
  const whatsapp = `https://wa.me/${WA}?text=${encodeURIComponent(mensagem)}`;

  return (
    <motion.div
      className="fixed inset-0 z-[95] flex items-end justify-center sm:items-center sm:p-4 md:p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: reduzir ? 0 : 0.22, ease: EASE_ATELIER }}
    >
      {/* Fundo escurecido com opacidade ligada ao arrasto da folha no celular */}
      <motion.div
        style={{ opacity: reduzir ? 1 : opacidadeArrasto }}
        className="absolute inset-0"
      >
        <button
          type="button"
          tabIndex={-1}
          aria-label="Fechar detalhes"
          onClick={onClose}
          className="h-full w-full cursor-default bg-[#130209]/55 backdrop-blur-sm"
        />
      </motion.div>

      {/* Painel solido: folha arrastavel no celular, caixa editorial dividida no desktop */}
      <motion.div
        ref={painelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={tituloId}
        data-lenis-prevent
        tabIndex={-1}
        onKeyDown={prenderFoco}
        drag={reduzir ? false : "y"}
        dragControls={dragControls}
        dragListener={false}
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={{ top: 0, bottom: 0.45 }}
        onDragEnd={aoSoltarFolha}
        style={reduzir ? undefined : { y: dragY }}
        initial={reduzir ? { opacity: 0 } : { y: 64, opacity: 1, scale: 0.99 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={reduzir ? { opacity: 0 } : { y: 64, opacity: 0 }}
        transition={reduzir ? { duration: 0 } : SPRING_FOLHA}
        className="relative w-full overflow-hidden rounded-t-2xl bg-[#EDE7D9] text-[#1B4965] shadow-2xl focus:outline-none sm:max-w-lg sm:rounded-2xl md:h-[min(88dvh,760px)] md:max-w-5xl"
      >
        {/* Alca de arrasto para baixo no celular */}
        <div
          onPointerDown={(e) => {
            if (!reduzir) dragControls.start(e);
          }}
          className="flex touch-none cursor-grab items-center justify-center bg-white py-2.5 active:cursor-grabbing md:hidden"
        >
          <span aria-hidden className="h-1 w-10 rounded-full bg-[#1B4965]/25" />
        </div>

        {/* Botao fechar */}
        <button
          ref={fecharRef}
          type="button"
          aria-label="Fechar"
          onClick={onClose}
          className="absolute right-2.5 top-2.5 z-30 flex h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-white/95 text-[#1B4965] shadow-sm ring-1 ring-[#1B4965]/10 backdrop-blur-sm transition-colors hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1B4965]"
        >
          <svg
            className="h-5 w-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="max-h-[calc(93dvh_-_24px)] overflow-y-auto overscroll-contain md:flex md:h-full md:max-h-none md:overflow-hidden">
          {/* Coluna da foto com galeria e lupa do bordado */}
          <div className="bg-white md:flex md:w-[55%] md:shrink-0 md:flex-col">
            <LupaBordado
              fotos={fotos}
              fotoAtiva={fotoAtiva}
              onTrocarFoto={setFotoAtiva}
              nome={produto.nome}
            />

            {fotos.length > 1 && (
              <div className="flex gap-2 overflow-x-auto border-t border-[#1B4965]/8 bg-white px-4 py-2.5 [scrollbar-width:none] md:px-5 md:py-3">
                {fotos.map((f, i) => {
                  const ativa = i === fotoAtiva;
                  return (
                    <button
                      key={f}
                      type="button"
                      onClick={() => setFotoAtiva(i)}
                      aria-label={`Ver foto ${i + 1} de ${fotos.length}`}
                      aria-pressed={ativa}
                      className="relative h-12 w-12 shrink-0 cursor-pointer overflow-hidden rounded-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1B4965] md:h-14 md:w-14"
                    >
                      <Image
                        src={f}
                        alt=""
                        fill
                        loading="eager"
                        sizes="56px"
                        className="object-cover"
                      />
                      {ativa && (
                        <motion.span
                          layoutId="miniatura-ativa-b"
                          transition={reduzir ? { duration: 0 } : SPRING_PILULA}
                          className="pointer-events-none absolute inset-0 rounded-sm ring-2 ring-inset ring-[#1B4965]"
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Coluna de detalhes e compra */}
          <div className="px-5 pt-4 md:flex md:min-h-0 md:flex-1 md:flex-col md:overflow-y-auto md:overscroll-contain md:px-7 md:pt-7">
            <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 md:pr-12">
              <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-brand-gold-text">
                {secaoVitrine(produto)}
              </p>
              {produto.prontaEntrega && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#1B4965] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.14em] text-[#EDE7D9]">
                  <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-[#b8902a]" />
                  Pronta entrega
                </span>
              )}
            </div>

            <h2
              id={tituloId}
              className="mt-1.5 font-[family-name:var(--font-serif)] text-[1.75rem] leading-tight text-[#1B4965] md:mt-2 md:text-[2.1rem]"
            >
              {produto.nome}
            </h2>

            {/* Preco e atalho de link lado a lado: mantem a descricao limpa acima da barra */}
            <div className="mt-3 flex items-start justify-between gap-3 border-t border-[#1B4965]/15 pt-3 md:mt-4 md:pt-4">
              <div className="min-w-0">
                <p className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                  <span className="nums-preco font-[family-name:var(--font-serif)] text-[1.75rem] font-medium leading-none text-[#1B4965]">
                    {formatBRLPreco(parcelamento.total)}
                  </span>
                  <span className="text-[13px] text-[#1B4965]">
                    {labelParcelamento(parcelamento)}
                  </span>
                </p>
                <p className="mt-1.5 text-sm text-brand-muted">
                  ou {formatBRLPreco(produto.preco)} no pix
                </p>
              </div>

              <button
                type="button"
                onClick={copiarLink}
                aria-label="Copiar link da peça"
                className="inline-flex min-h-11 shrink-0 cursor-pointer items-center gap-1.5 rounded-full border border-[#1B4965]/18 bg-[#F7F3EB] px-3 text-[11px] font-medium uppercase tracking-[0.12em] text-[#1B4965] transition-colors hover:border-[#1B4965]/40 hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1B4965]"
              >
                {linkCopiado ? (
                  <>
                    <svg
                      className="h-3.5 w-3.5 text-[#2f7a45]"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2.2}
                      aria-hidden
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M20 6 9 17l-5-5" />
                    </svg>
                    Copiado
                  </>
                ) : (
                  <>
                    <svg
                      className="h-3.5 w-3.5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={1.8}
                      aria-hidden
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"
                      />
                    </svg>
                    Copiar link
                  </>
                )}
              </button>
            </div>

            <p className="mt-3 text-sm leading-relaxed text-[#1B4965]/90">{produto.detalhes}</p>
            <p className="mt-2 text-xs leading-relaxed text-brand-muted">
              Cada peça é única: pequenas variações fazem parte da sua autenticidade.
            </p>

            <ComoFunciona
              className="mt-5"
              producao={produto.producao}
              prontaEntrega={produto.prontaEntrega}
            />

            <div className="mt-5 rounded-md border border-[#b8902a]/30 bg-[#b8902a]/[0.06] p-3.5">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-brand-gold-text">
                Deixe do seu jeito
              </p>
              <p className="mt-1.5 text-[13px] leading-relaxed text-brand-muted">
                Dá para personalizar a peça do seu jeito, inclusive as cores. Chame no WhatsApp que
                a gente monta com você.
              </p>
            </div>

            <div aria-hidden className="hidden md:block md:flex-1" />

            {/* Barra de compra sempre visivel na base com sombra suave */}
            <div className="sticky bottom-0 z-10 -mx-5 mt-5 grid grid-cols-[1fr_auto] gap-2 border-t border-[#1B4965]/12 bg-[#EDE7D9]/98 px-5 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 shadow-[0_-10px_18px_-8px_rgba(237,231,217,0.95)] backdrop-blur-sm md:-mx-7 md:flex md:flex-col md:gap-2.5 md:px-7 md:pb-6 md:pt-4">
              <motion.button
                type="button"
                onClick={adicionar}
                whileTap={reduzir ? undefined : { scale: 0.98 }}
                transition={SPRING_BOTAO}
                className={`inline-flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-sm px-5 text-xs font-bold uppercase tracking-[0.18em] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1B4965] focus-visible:ring-offset-2 focus-visible:ring-offset-[#EDE7D9] ${
                  adicionado
                    ? "bg-[#2f7a45] text-white ring-1 ring-[#b8902a]/50"
                    : "bg-[#1B4965] text-[#EDE7D9] hover:bg-[#130209]"
                }`}
              >
                <AnimatePresence mode="wait" initial={false}>
                  {adicionado ? (
                    <motion.span
                      key="ok"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: reduzir ? 0 : 0.15 }}
                      className="inline-flex items-center gap-2"
                    >
                      <svg
                        className="h-4 w-4"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2.2}
                        aria-hidden
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M20 6 9 17l-5-5" />
                      </svg>
                      Adicionado
                    </motion.span>
                  ) : (
                    <motion.span
                      key="add"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: reduzir ? 0 : 0.15 }}
                    >
                      Adicionar ao carrinho
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>

              <a
                href={whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Encomendar pelo WhatsApp"
                className="inline-flex h-12 w-12 items-center justify-center gap-2 rounded-sm border border-[#1B4965]/60 text-[#1B4965] transition-colors hover:border-[#1B4965] hover:bg-[#1B4965]/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1B4965] md:h-auto md:min-h-11 md:w-auto md:px-6 md:py-3"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden
                  className="h-5 w-5 md:h-4 md:w-4"
                >
                  <path d="M.057 24l1.687-6.163a11.867 11.867 0 01-1.587-5.945C.16 5.335 5.495 0 12.05 0a11.817 11.817 0 018.413 3.488 11.824 11.824 0 013.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 01-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.821 9.821 0 001.519 5.26l-.999 3.648 3.97-1.317zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                </svg>
                <span className="hidden text-xs font-bold uppercase tracking-[0.18em] md:inline">
                  Encomendar pelo WhatsApp
                </span>
              </a>
            </div>

            <p className="sr-only" aria-live="polite">
              {linkCopiado ? "Link da peça copiado" : ""}
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
