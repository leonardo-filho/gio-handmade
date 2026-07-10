"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { useCart } from "../cart/CartProvider";
import { formatBRLPreco } from "@/lib/format";
import { labelParcelamento, parcelamentoCartao } from "@/lib/parcelas";
import type { Produto } from "@/data/produtos";

const WA = "559192982017";
const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;

// Modal de detalhes: abre quando o cliente clica numa peça, mostrando o texto
// completo (materiais, prazo, notas) e os botões de comprar.
export default function ProdutoModal({ produto, onClose }: { produto: Produto; onClose: () => void }) {
  const reduce = useReducedMotion();
  const { add } = useCart();
  const fotos = [produto.foto, produto.fotoHover, ...(produto.fotosExtra ?? [])].filter(Boolean) as string[];
  const [fotoAtiva, setFotoAtiva] = useState(0);
  const [linkCopiado, setLinkCopiado] = useState(false);
  const parcelamento = parcelamentoCartao(produto);

  // Link direto da peça (para stories/bio): abre a loja já com este modal.
  async function copiarLink() {
    const link = `${window.location.origin}/loja?produto=${produto.id}`;
    try {
      await navigator.clipboard.writeText(link);
      setLinkCopiado(true);
      setTimeout(() => setLinkCopiado(false), 2000);
    } catch {
      window.prompt("Copie o link da peça:", link);
    }
  }

  // Esc fecha + trava o scroll do fundo enquanto aberto
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  // Adiciona, mostra "Adicionado ✓" por um instante e fecha o modal — a
  // cliente volta pra loja e continua navegando (o badge do header atualiza).
  const [adicionado, setAdicionado] = useState(false);
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

  // Mensagem já pronta: pedido + convite para personalizar (upsell) e combinar (cross-sell)
  const whatsapp =
    `https://wa.me/${WA}?text=` +
    encodeURIComponent(
      `Oi Gio! Quero encomendar a ${produto.nome}. Também queria ver acabamentos extras (pingentes, franjas) e combinar com um headpiece, pulseira ou chocker. Pode me ajudar?`
    );

  // Portal no <body>: os cards da vitrine animam com transform (StaggerItem),
  // e um ancestral com transform vira o containing block de position:fixed —
  // sem o portal o modal renderia "dentro" do card durante a animação.
  return createPortal(
    <motion.div
      className="fixed inset-0 z-[95] flex items-end justify-center sm:items-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: reduce ? 0 : 0.25, ease: EASE_OUT_EXPO }}
    >
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Fechar detalhes"
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-[#130209]/55 backdrop-blur-sm"
      />

      {/* Painel */}
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label={produto.nome}
        className="relative flex max-h-[92vh] w-full max-w-3xl flex-col overflow-y-auto overflow-x-hidden rounded-t-2xl bg-[#EDE7D9] text-[#1B4965] shadow-2xl sm:rounded-2xl md:flex-row md:overflow-hidden"
        initial={{ y: reduce ? 0 : 40, opacity: reduce ? 1 : 0, scale: reduce ? 1 : 0.98 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: reduce ? 0 : 40, opacity: 0, scale: reduce ? 1 : 0.98 }}
        transition={{ duration: reduce ? 0 : 0.35, ease: EASE_OUT_EXPO }}
      >
        {/* Botão fechar */}
        <button
          type="button"
          aria-label="Fechar"
          onClick={onClose}
          className="absolute right-3 top-3 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-[#EDE7D9]/80 text-[#1B4965] backdrop-blur-sm transition-colors hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1B4965]"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Imagem */}
        <div className="shrink-0 flex flex-col md:w-1/2">
          <div className="relative w-full overflow-hidden transition-none flex-1 min-h-[400px]">
            <Image
              key={fotos[fotoAtiva]}
              src={fotos[fotoAtiva]}
              alt={produto.nome}
              fill
              sizes="(min-width: 768px) 384px, 100vw"
              className="object-contain"
            />
          </div>
          {fotos.length > 1 && (
            <div className="flex gap-2 p-3">
              {fotos.map((f, i) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFotoAtiva(i)}
                  aria-label={`Ver foto ${i + 1}`}
                  className={`relative aspect-square w-14 overflow-hidden rounded-sm ring-2 transition ${i === fotoAtiva ? "ring-[#1B4965]" : "ring-transparent hover:ring-[#1B4965]/40"
                    }`}
                >
                  <Image src={f} alt="" fill sizes="56px" className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Detalhes */}
        <div
          data-lenis-prevent
          className="flex min-h-0 flex-1 flex-col p-6 md:p-7 md:overflow-y-auto"
        >
          <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-[#b8902a]">
            {produto.categoria === "Coleção Solaris" ? "Coleção Solaris" : produto.categoria}
          </p>
          <h2 className="mt-2 font-[family-name:var(--font-serif)] text-3xl leading-tight text-[#1B4965]">
            {produto.nome}
          </h2>

          {/* Preço: cartão parcelado primeiro, pix como alternativa */}
          <div className="mt-4 border-t border-[#1B4965]/15 pt-4">
            <p className="font-[family-name:var(--font-serif)] text-2xl font-medium tabular-nums text-[#1B4965]">
              {formatBRLPreco(parcelamento.total)}{" "}
              <span className="text-sm font-normal text-[#1B4965]/55">
                {labelParcelamento(parcelamento)}
              </span>
            </p>
            <p className="mt-0.5 text-sm text-[#1B4965]/70">
              ou {formatBRLPreco(produto.preco)} no pix
            </p>
            <button
              type="button"
              onClick={copiarLink}
              className="mt-2 inline-flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.14em] text-[#1B4965]/55 underline-offset-4 transition-colors hover:text-[#1B4965] hover:underline"
            >
              {linkCopiado ? (
                <>
                  <svg className="h-3.5 w-3.5 text-[#2f7a45]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20 6 9 17l-5-5" />
                  </svg>
                  Link copiado!
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
          <p className="mt-4 text-sm leading-relaxed text-[#1B4965]/80">{produto.detalhes}</p>

          {/* Prazo */}
          {produto.producao && (
            <p className="mt-4 text-sm text-[#1B4965]/75">
              <span className="font-semibold">Confecção:</span> {produto.producao}.
            </p>
          )}
          <p className="mt-1 text-[13px] leading-relaxed text-[#1B4965]/55">
            Precisa para antes? Fale com a gente no WhatsApp para verificar a disponibilidade.
          </p>

          {/* Notas padrão */}
          <div className="mt-4 space-y-1 rounded-md bg-[#1B4965]/[0.05] p-3 text-[12px] leading-relaxed text-[#1B4965]/65">
            <p>Todas as peças podem ter as cores personalizadas.</p>
            <p>Cada peça é única: pequenas variações fazem parte da sua autenticidade.</p>
          </div>

          {/* Upsell + cross-sell */}
          <div className="mt-4 rounded-md border border-[#b8902a]/30 bg-[#b8902a]/[0.06] p-3.5">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#b8902a]">
              Deixe do seu jeito
            </p>
            <p className="mt-1.5 text-[13px] leading-relaxed text-[#1B4965]/75">
              Dá para personalizar a peça do jeito que vc quiser, chame no whatsapp que a gente monta com você.
            </p>
          </div>

          {/* Ações */}
          <div className="mt-6 flex flex-col gap-2.5">
            <button
              type="button"
              onClick={adicionar}
              className={`inline-flex items-center justify-center gap-2 rounded-sm px-6 py-3.5 text-xs font-bold uppercase tracking-[0.18em] text-[#EDE7D9] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1B4965] focus-visible:ring-offset-2 focus-visible:ring-offset-[#EDE7D9] ${
                adicionado ? "bg-[#2f7a45]" : "bg-[#1B4965] hover:bg-[#130209]"
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
              className="inline-flex items-center justify-center gap-2 rounded-sm border border-[#1B4965]/40 px-6 py-3 text-xs font-bold uppercase tracking-[0.18em] text-[#1B4965] transition-colors hover:border-[#1B4965] hover:bg-[#1B4965]/5"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className="h-4 w-4">
                <path d="M.057 24l1.687-6.163a11.867 11.867 0 01-1.587-5.945C.16 5.335 5.495 0 12.05 0a11.817 11.817 0 018.413 3.488 11.824 11.824 0 013.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 01-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.821 9.821 0 001.519 5.26l-.999 3.648 3.97-1.317zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
              </svg>
              Encomendar pelo WhatsApp
            </a>
          </div>
        </div>
      </motion.div>
    </motion.div>,
    document.body
  );
}
