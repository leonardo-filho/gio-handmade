"use client";

// Peças compartilhadas pelo desfile do celular, pela passarela do desktop e
// pela grade: ordem das peças, fotos, preço, botões de compra e leitura da
// tela (celular ou desktop).

import { useState, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import { useCart } from "@/components/cart/CartProvider";
import { SECOES_TODAS } from "@/components/loja/vistas";
import { formatBRLPreco } from "@/lib/format";
import { labelParcelamento, parcelamentoCartao } from "@/lib/parcelas";
import type { Produto } from "@/data/produtos";

export const WA = "559192982017";
export const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;
export const TODAS = "todas";

/** Vista "Todas": Solaris primeiro e depois as categorias, cada peça uma vez. */
export const TODAS_EM_ORDEM: Produto[] = SECOES_TODAS.flatMap((s) => s.itens);

/** Todas as fotos da peça, na ordem da galeria. */
export function fotosDe(p: Produto): string[] {
  const lista = [p.foto, p.fotoHover, ...(p.fotosExtra ?? [])].filter(Boolean) as string[];
  return Array.from(new Set(lista));
}

/** "03": número do look com dois dígitos, como no cartão de desfile. */
export const doisDigitos = (n: number) => String(n).padStart(2, "0");

/**
 * Nome da peça em duas partes, como legenda de revista: o tipo ("Top",
 * "Conjunto", "Saia"...) pequeno e o nome próprio grande. Todos os nomes do
 * catálogo seguem "Tipo Nome"; um nome de uma palavra só fica inteiro.
 */
export function partesDoNome(nome: string): { tipo: string | null; proprio: string } {
  const i = nome.indexOf(" ");
  if (i < 0) return { tipo: null, proprio: nome };
  return { tipo: nome.slice(0, i), proprio: nome.slice(i + 1) };
}


export function precoDe(p: Produto) {
  const parcelamento = parcelamentoCartao(p);
  return {
    cartao: formatBRLPreco(parcelamento.total),
    parcelas: labelParcelamento(parcelamento),
    vezes: parcelamento.vezes,
    pix: formatBRLPreco(p.preco),
  };
}

// Tela larga (passarela) ou celular (desfile vertical). No servidor e na
// hidratação não se sabe: vale null e as duas versões vão no HTML, cada uma
// escondida por CSS na tela que não é a dela.
const CONSULTA_LARGA = "(min-width: 1024px)";
function assinarTela(aviso: () => void) {
  const m = window.matchMedia(CONSULTA_LARGA);
  m.addEventListener("change", aviso);
  return () => m.removeEventListener("change", aviso);
}
export function useTelaLarga(): boolean | null {
  return useSyncExternalStore(
    assinarTela,
    () => window.matchMedia(CONSULTA_LARGA).matches,
    () => null
  );
}

const semAssinatura = () => () => {};
/** Origem do site, só no navegador (no servidor vem vazia). */
export function useOrigem() {
  return useSyncExternalStore(
    semAssinatura,
    () => window.location.origin,
    () => ""
  );
}

/** Movimento reduzido, lido na hora do gesto (para o scroll nativo). */
export function preferirSemMovimento() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Link do WhatsApp com a peça, o preço e o link direto dela. */
export function useLinkWhatsApp(p: Produto) {
  const origem = useOrigem();
  const rota = usePathname();
  const preco = precoDe(p);
  const linkPeca = `${origem}${rota}?produto=${p.id}`;
  const mensagem = [
    `Oi, Gio! Quero encomendar esta peça: ${p.nome} (${preco.cartao} ${preco.parcelas} ou ${preco.pix} no pix).`,
    linkPeca,
    (p.prontaEntrega ? "Vi que ela tem pronta entrega: qual tamanho está disponível? " : "") +
      "Também queria ver acabamentos extras e o que combina com ela.",
  ].join("\n");
  return `https://wa.me/${WA}?text=${encodeURIComponent(mensagem)}`;
}

/** Adicionar ao carrinho com o "Adicionada" por um instante. */
export function useAdicionar(p: Produto) {
  const { add } = useCart();
  const [adicionada, setAdicionada] = useState(false);
  function adicionar() {
    add({ id: p.id, nome: p.nome, preco: p.preco, foto: p.foto, categoria: p.categoria });
    setAdicionada(true);
    window.setTimeout(() => setAdicionada(false), 1600);
  }
  return { adicionada, adicionar };
}

export function IconeWhatsApp({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className={className}>
      <path d="M.057 24l1.687-6.163a11.867 11.867 0 01-1.587-5.945C.16 5.335 5.495 0 12.05 0a11.817 11.817 0 018.413 3.488 11.824 11.824 0 013.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 01-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.821 9.821 0 001.519 5.26l-.999 3.648 3.97-1.317zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
    </svg>
  );
}

export function IconeCheck({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M20 6 9 17l-5-5" />
    </svg>
  );
}

/** Ações de compra do look: Adicionar, Detalhes e WhatsApp. */
export function AcoesLook({
  produto,
  onDetalhes,
  largo = false,
}: {
  produto: Produto;
  onDetalhes: () => void;
  /** Desktop: botões com texto inteiro. */
  largo?: boolean;
}) {
  const { adicionada, adicionar } = useAdicionar(produto);
  const whatsapp = useLinkWhatsApp(produto);
  const foco =
    "focus:outline-none focus-visible:ring-2 focus-visible:ring-[#EDE7D9] focus-visible:ring-offset-2 focus-visible:ring-offset-[#130209]";

  return (
    <div className={`flex items-stretch gap-2 ${largo ? "justify-center" : ""}`}>
      <button
        type="button"
        onClick={adicionar}
        className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-5 text-xs font-bold uppercase tracking-[0.18em] transition-colors ${foco} ${
          largo ? "min-w-[15rem]" : "flex-1"
        } ${adicionada ? "bg-[#C8E1E4] text-[#130209]" : "bg-[#EDE7D9] text-[#130209] hover:bg-white"}`}
      >
        {adicionada ? (
          <>
            <IconeCheck />
            Adicionada
          </>
        ) : (
          <>
            {largo ? "Adicionar ao carrinho" : "Adicionar"}
            <span className="sr-only">{`: ${produto.nome}`}</span>
          </>
        )}
      </button>
      <button
        type="button"
        onClick={onDetalhes}
        className={`inline-flex min-h-12 items-center justify-center rounded-full border border-[#EDE7D9]/45 px-4 text-xs font-bold uppercase tracking-[0.18em] text-[#EDE7D9] transition-colors hover:border-[#EDE7D9] hover:bg-[#EDE7D9]/10 ${foco} ${
          largo ? "px-6" : ""
        }`}
      >
        Detalhes
        <span className="sr-only">{` de ${produto.nome}`}</span>
      </button>
      <a
        href={whatsapp}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Encomendar ${produto.nome} pelo WhatsApp`}
        className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-[#EDE7D9]/45 text-[#EDE7D9] transition-colors hover:border-[#EDE7D9] hover:bg-[#EDE7D9]/10 ${foco} ${
          largo ? "px-6" : "w-12 shrink-0"
        }`}
      >
        <IconeWhatsApp className={largo ? "h-4 w-4" : "h-5 w-5"} />
        {largo && <span className="text-xs font-bold uppercase tracking-[0.18em]">WhatsApp</span>}
      </a>
    </div>
  );
}

/** Selo de pronta entrega na legenda (fora da foto). */
export function SeloPronta({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full bg-[#C8E1E4] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-[#130209] ${className}`}
    >
      <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-[#1B4965]" />
      Pronta entrega
    </span>
  );
}
