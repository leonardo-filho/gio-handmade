// Vistas e ordem da /loja (v3). Os filtros e os slugs de ?ver= vêm de
// components/loja/vistas.ts; aqui ficam só a ordem da linha de categorias, a
// vista "Todas" como grade corrida e as três ordens do select.

import { SECOES_TODAS, VISTAS } from "@/components/loja/vistas";
import { produtos, secaoId, secaoVitrine, type Produto } from "@/data/produtos";
import { parcelamentoCartao } from "@/lib/parcelas";

/** Ordem da linha de categorias, depois de "Todas" (a do menu). */
const ORDEM_LINHA = ["pronta-entrega", "tops", "conjuntos", "saias", "vestidos", "acessorios"];

export type ItemLinha = { slug: string | null; rotulo: string };

export const LINHA: ItemLinha[] = [
  { slug: null, rotulo: "Todas" },
  ...ORDEM_LINHA.flatMap((slug) => {
    const vista = VISTAS.find((v) => v.slug === slug);
    return vista ? [{ slug: vista.slug, rotulo: vista.chip }] : [];
  }),
];

// "Todas": as peças na ordem que a loja já usava (categorias em sequência,
// cada peça uma vez), agora numa grade só, sem títulos no meio.
const TODAS: Produto[] = SECOES_TODAS.flatMap((s) => s.itens);

export type VistaLoja = { slug: string | null; titulo: string; itens: Produto[] };

export function vistaDaLoja(slug: string | null): VistaLoja {
  const vista = slug ? VISTAS.find((v) => v.slug === slug) : undefined;
  if (!vista) return { slug: null, titulo: "Loja", itens: TODAS };
  return { slug: vista.slug, titulo: vista.titulo, itens: vista.itens };
}

export type Ordem = "destaques" | "menor-preco" | "maior-preco";

export const ORDENS: { id: Ordem; rotulo: string }[] = [
  { id: "destaques", rotulo: "Destaques" },
  { id: "menor-preco", rotulo: "Menor preço" },
  { id: "maior-preco", rotulo: "Maior preço" },
];

export function lerOrdem(valor: string | undefined): Ordem {
  return ORDENS.some((o) => o.id === valor) ? (valor as Ordem) : "destaques";
}

const valorNoCartao = (p: Produto) => parcelamentoCartao(p).total;

/** Ordena pelo valor no cartão (o que o card mostra primeiro). */
export function ordenar(itens: Produto[], ordem: Ordem): Produto[] {
  if (ordem === "destaques") return itens;
  const sinal = ordem === "menor-preco" ? 1 : -1;
  return [...itens].sort((a, b) => sinal * (valorNoCartao(a) - valorNoCartao(b)));
}

/** Link da loja com a vista e a ordem (a ordem padrão não vai na URL). */
export function hrefLoja(ver: string | null, ordem: Ordem = "destaques"): string {
  const busca = new URLSearchParams();
  if (ver) busca.set("ver", ver);
  if (ordem !== "destaques") busca.set("ordem", ordem);
  const q = busca.toString();
  return q ? `/loja?${q}` : "/loja";
}

/** Categoria da peça na loja (a da linha de categorias) e o slug dela. */
export function categoriaDe(p: Produto): { nome: string; slug: string } {
  const nome = secaoVitrine(p);
  return { nome, slug: secaoId[nome] };
}

/** Até `max` peças da mesma categoria, sem a própria. */
export function relacionadas(p: Produto, max = 8): Produto[] {
  const nome = secaoVitrine(p);
  return produtos.filter((o) => o.id !== p.id && secaoVitrine(o) === nome).slice(0, max);
}
