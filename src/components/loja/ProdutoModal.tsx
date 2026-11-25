"use client";

import { useEffect, useEffectEvent, useId, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { useCart } from "../cart/CartProvider";
import ComoFunciona from "./ComoFunciona";
import { formatBRLPreco } from "@/lib/format";
import { labelParcelamento, parcelamentoCartao } from "@/lib/parcelas";
import { isolarFundo, prenderTab, travarRolagem } from "@/lib/travaRolagem";
import { secaoVitrine, type Produto } from "@/data/produtos";

const WA = "559192982017";
const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;

// Origem do site (para o link da peça), lida só no navegador. No servidor e na
// hidratação vem vazia e o modal não renderiza: ele só abre depois de um
// clique ou da leitura da URL, então nada se perde.
const semAssinatura = () => () => {};
const lerOrigem = () => window.location.origin;
const origemNoServidor = () => "";

type Props = { produto: Produto; onClose: () => void };

// Sem quem abriu (peça aberta por link direto), o foco volta para o nome da
// peça no card da vitrine, e não para o começo da página.
function botaoDoCard(id: string) {
  return document.querySelector<HTMLElement>(`[data-produto="${CSS.escape(id)}"] h3 button`);
}

// Modal de detalhes: abre quando a cliente toca numa peça (ou chega pelo link
// /loja?produto=<id>), com o texto completo, o passo a passo e os botões de
// compra. Quem abre e fecha (e mexe na URL) é a vitrine.
export default function ProdutoModal(props: Props) {
  const origem = useSyncExternalStore(semAssinatura, lerOrigem, origemNoServidor);
  if (!origem) return null;
  // Portal no <body>: os cards da vitrine animam com transform, e um ancestral
  // com transform vira o containing block de position:fixed. Fora do <main>,
  // o modal também escapa do inert que isola o fundo.
  return createPortal(<PainelPeca {...props} origem={origem} />, document.body);
}

function PainelPeca({ produto, onClose, origem }: Props & { origem: string }) {
  const reduce = useReducedMotion();
  const { add } = useCart();
  const tituloId = useId();
  const painelRef = useRef<HTMLDivElement>(null);
  const fecharRef = useRef<HTMLButtonElement>(null);
  const fotos = [produto.foto, produto.fotoHover, ...(produto.fotosExtra ?? [])].filter(Boolean) as string[];
  const [fotoAtiva, setFotoAtiva] = useState(0);
  const [linkCopiado, setLinkCopiado] = useState(false);
  const [adicionado, setAdicionado] = useState(false);
  const parcelamento = parcelamentoCartao(produto);
  const linkPeca = `${origem}/loja?produto=${produto.id}`;

  const aoTeclar = useEffectEvent((e: KeyboardEvent) => {
    if (e.key === "Escape") onClose();
  });

  // Ao abrir: trava a rolagem da página (Lenis incluso), deixa o fundo inerte e
  // leva o foco para o Fechar. Ao fechar: desfaz tudo e devolve o foco a quem
  // abriu (o card), sem rolar a página.
  const idPeca = produto.id;
  useEffect(() => {
    const anterior = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const liberarRolagem = travarRolagem();
    const liberarFundo = isolarFundo();
    fecharRef.current?.focus({ preventScroll: true });
    const onKey = (e: KeyboardEvent) => aoTeclar(e);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      liberarFundo();
      liberarRolagem();
      const destino =
        anterior && anterior !== document.body && anterior.isConnected ? anterior : botaoDoCard(idPeca);
      destino?.focus({ preventScroll: true });
    };
  }, [idPeca]);

  // Tab preso no painel. Um clique em área sem botão deixa o foco no próprio
  // painel (tabIndex -1); dali o Tab volta para o Fechar.
  function prenderFoco(e: React.KeyboardEvent<HTMLDivElement>) {
    if (e.key === "Tab" && e.target === painelRef.current) {
      e.preventDefault();
      fecharRef.current?.focus();
      return;
    }
    prenderTab(e, painelRef.current);
  }

  // Link direto da peça (para stories e bio): abre a loja já com este modal.
  async function copiarLink() {
    try {
      await navigator.clipboard.writeText(linkPeca);
      setLinkCopiado(true);
      setTimeout(() => setLinkCopiado(false), 2000);
    } catch {
      window.prompt("Copie o link da peça:", linkPeca);
    }
  }

  // Adiciona, mostra "Adicionado" por um instante e fecha o modal: a cliente
  // volta para a loja e continua navegando (o contador do carrinho atualiza).
  function adicionar() {
    if (adicionado) return;
    add({
      id: produto.id,
      nome: produto.nome,
      preco: produto.preco,
      foto: produto.foto,
      categoria: produto.categoria,
    });
    setAdicionado(true);
    setTimeout(onClose, 700);
  }

  // Mensagem pronta: peça, preço e link (a Gio sabe na hora de qual peça se
  // trata), mais o convite para acabamentos e combinações.
  const precoTexto = `${formatBRLPreco(parcelamento.total)} ${labelParcelamento(parcelamento)} ou ${formatBRLPreco(produto.preco)} no pix`;
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
      transition={{ duration: reduce ? 0 : 0.25, ease: EASE_OUT_EXPO }}
    >
      {/* Fundo escurecido: fecha no clique, fora da ordem de Tab */}
      <button
        type="button"
        tabIndex={-1}
        aria-label="Fechar detalhes"
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-[#130209]/55 backdrop-blur-sm"
      />

      {/* Painel. No celular é uma folha que rola inteira, com a barra de compra
          presa embaixo; no desktop, foto à esquerda e detalhes que rolam à direita. */}
      <motion.div
        ref={painelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={tituloId}
        data-lenis-prevent
        tabIndex={-1}
        onKeyDown={prenderFoco}
        className="relative w-full overflow-hidden rounded-t-2xl focus:outline-none bg-[#EDE7D9] text-[#1B4965] shadow-2xl sm:max-w-lg sm:rounded-2xl md:h-[min(88dvh,760px)] md:max-w-4xl"
        initial={{ y: reduce ? 0 : 40, opacity: reduce ? 1 : 0, scale: reduce ? 1 : 0.98 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: reduce ? 0 : 40, opacity: 0, scale: reduce ? 1 : 0.98 }}
        transition={{ duration: reduce ? 0 : 0.35, ease: EASE_OUT_EXPO }}
      >
        {/* Fechar: fora da área que rola, fica sempre à mão */}
        <button
          ref={fecharRef}
          type="button"
          aria-label="Fechar"
          onClick={onClose}
          className="absolute right-2 top-2 z-20 flex h-11 w-11 items-center justify-center rounded-full bg-white/85 text-[#1B4965] shadow-sm backdrop-blur-sm transition-colors hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1B4965]"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="max-h-[92dvh] overflow-y-auto overscroll-contain md:flex md:h-full md:max-h-none md:overflow-hidden">
          {/* Foto: inteira (sem corte) sobre branco, o mesmo fundo do estúdio. No
              celular, a altura deixa nome, preço e barra de compra na primeira tela
              (19rem = miniaturas, nome, preço, pix e a barra). */}
          <div className="bg-white md:flex md:w-[55%] md:shrink-0 md:flex-col">
            <div className="relative aspect-[3/4] max-h-[min(56dvh,calc(92dvh_-_19rem))] w-full md:aspect-auto md:max-h-none md:min-h-0 md:flex-1">
              <Image
                key={fotos[fotoAtiva]}
                src={fotos[fotoAtiva]}
                alt={fotos.length > 1 ? `${produto.nome}, foto ${fotoAtiva + 1} de ${fotos.length}` : produto.nome}
                fill
                loading="eager"
                sizes="(min-width: 768px) 500px, (min-width: 640px) 512px, 100vw"
                className="object-contain"
              />
            </div>
            {fotos.length > 1 && (
              <div className="flex gap-2 overflow-x-auto px-4 py-2 [scrollbar-width:none] md:px-5 md:py-3">
                {fotos.map((f, i) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setFotoAtiva(i)}
                    aria-label={`Ver foto ${i + 1} de ${fotos.length}`}
                    aria-pressed={i === fotoAtiva}
                    className={`relative h-12 w-12 shrink-0 overflow-hidden rounded-sm ring-2 transition focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1B4965] md:h-14 md:w-14 ${
                      i === fotoAtiva ? "ring-[#1B4965]" : "ring-transparent hover:ring-[#1B4965]/40"
                    }`}
                  >
                    {/* eager: a miniatura aparece junto com a foto. Com lazy, o
                        Next em dev confundia a miniatura com a foto grande (mesmo
                        endereço) e acusava LCP sem prioridade. */}
                    <Image src={f} alt="" fill loading="eager" sizes="56px" className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Detalhes */}
          <div className="px-6 pt-5 md:flex md:min-h-0 md:flex-1 md:flex-col md:overflow-y-auto md:overscroll-contain md:px-7 md:pt-7">
            <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 md:pr-10">
              <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-brand-gold-text">{secaoVitrine(produto)}</p>
              {produto.prontaEntrega && (
                <span className="bg-[#1B4965] px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.14em] text-[#EDE7D9]">
                  Pronta entrega
                </span>
              )}
            </div>
            <h2
              id={tituloId}
              className="mt-1.5 font-[family-name:var(--font-serif)] text-[1.75rem] leading-tight text-[#1B4965] md:mt-2 md:text-3xl"
            >
              {produto.nome}
            </h2>

            {/* Preço: cartão parcelado primeiro, pix como alternativa */}
            <div className="mt-3 border-t border-[#1B4965]/15 pt-3 md:mt-4 md:pt-4">
              <p className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                <span className="nums-preco font-[family-name:var(--font-serif)] text-[1.75rem] font-medium leading-none text-[#1B4965]">
                  {formatBRLPreco(parcelamento.total)}
                </span>
                <span className="text-[13px] text-[#1B4965]">{labelParcelamento(parcelamento)}</span>
              </p>
              <p className="mt-1.5 text-sm text-brand-muted">ou {formatBRLPreco(produto.preco)} no pix</p>
              <button
                type="button"
                onClick={copiarLink}
                className="-ml-2 inline-flex min-h-11 items-center gap-1.5 rounded-sm px-2 text-[11px] font-medium uppercase tracking-[0.14em] text-brand-muted underline-offset-4 transition-colors hover:text-[#1B4965] hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1B4965]"
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
            </div>

            {/* Descrição completa */}
            <p className="mt-2 text-sm leading-relaxed text-[#1B4965]/90">{produto.detalhes}</p>
            <p className="mt-2 text-xs leading-relaxed text-brand-muted">
              Cada peça é única: pequenas variações fazem parte da sua autenticidade.
            </p>

            {/* Prazo, medidas e sinal (o que a home já promete) */}
            <ComoFunciona className="mt-5" producao={produto.producao} prontaEntrega={produto.prontaEntrega} />

            {/* O único convite para o WhatsApp antes dos botões */}
            <div className="mt-5 rounded-md border border-[#b8902a]/30 bg-[#b8902a]/[0.06] p-3.5">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-brand-gold-text">Deixe do seu jeito</p>
              <p className="mt-1.5 text-[13px] leading-relaxed text-brand-muted">
                Dá para personalizar a peça do seu jeito, inclusive as cores. Chame no WhatsApp que a gente monta com você.
              </p>
            </div>

            {/* No desktop, empurra as ações para a base quando o texto é curto */}
            <div aria-hidden className="hidden md:block md:flex-1" />

            {/* Ações, presas na base da área que rola: sempre visíveis, sem rolar.
                No celular, carrinho largo e WhatsApp só com o ícone; no desktop,
                os dois botões empilhados no fim da coluna. */}
            <div className="sticky bottom-0 z-10 -mx-6 mt-6 grid grid-cols-[1fr_auto] gap-2 border-t border-[#1B4965]/10 bg-[#EDE7D9] px-6 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 md:-mx-7 md:flex md:flex-col md:gap-2.5 md:px-7 md:pb-6 md:pt-4">
              <button
                type="button"
                onClick={adicionar}
                className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-sm px-5 text-xs font-bold uppercase tracking-[0.18em] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1B4965] focus-visible:ring-offset-2 focus-visible:ring-offset-[#EDE7D9] ${
                  adicionado ? "bg-[#2f7a45] text-white" : "bg-[#1B4965] text-[#EDE7D9] hover:bg-[#130209]"
                }`}
              >
                {adicionado ? (
                  <>
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} aria-hidden>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M20 6 9 17l-5-5" />
                    </svg>
                    Adicionado
                  </>
                ) : (
                  "Adicionar ao carrinho"
                )}
              </button>
              <a
                href={whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Encomendar pelo WhatsApp"
                className="inline-flex h-12 w-12 items-center justify-center gap-2 rounded-sm border border-[#1B4965]/60 text-[#1B4965] transition-colors hover:border-[#1B4965] hover:bg-[#1B4965]/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1B4965] md:h-auto md:min-h-11 md:w-auto md:px-6 md:py-3"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className="h-5 w-5 md:h-4 md:w-4">
                  <path d="M.057 24l1.687-6.163a11.867 11.867 0 01-1.587-5.945C.16 5.335 5.495 0 12.05 0a11.817 11.817 0 018.413 3.488 11.824 11.824 0 013.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 01-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.821 9.821 0 001.519 5.26l-.999 3.648 3.97-1.317zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                </svg>
                <span className="hidden text-xs font-bold uppercase tracking-[0.18em] md:inline">Encomendar pelo WhatsApp</span>
              </a>
            </div>

            {/* Leitor de tela: avisa a cópia do link. A peça adicionada quem
                anuncia é o aviso do carrinho (CartToast), uma vez só. */}
            <p className="sr-only" aria-live="polite">
              {linkCopiado ? "Link da peça copiado" : ""}
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
