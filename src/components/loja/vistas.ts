// Vistas da vitrine (/loja): o que cada chip da barra de categorias mostra.
//
// "Todas" mostra as categorias em ordem, cada peça uma vez (nenhum id de card
// se repete). As outras vistas são uma grade só: a categoria inclui as peças
// da antiga Coleção Solaris que pertencem a ela (secaoVitrine), e "Pronta
// entrega" junta as peças com prontaEntrega.
//
// A Coleção Solaris saiu do destaque em 24/11/2026 (a coleção já passou): sem
// chip, sem bloco no topo e sem selo de "nova coleção". As peças seguem à venda
// nas categorias delas. O link antigo ?ver=colecao-solaris cai em "Todas".
//
// O slug de cada vista vai na URL (/loja?ver=<slug>, como nas categorias da
// home) e também responde ao link antigo /loja#<slug>.

import {
  produtos,
  categoriasOrdem,
  secaoVitrine,
  secaoId,
  type Produto,
} from "@/data/produtos";

export type Vista = {
  slug: string;
  /** Texto do chip na barra. */
  chip: string;
  /** Título da página quando a vista está ativa. */
  titulo: string;
  itens: Produto[];
};

export type SecaoTodas = {
  slug: string;
  titulo: string;
  selo?: string;
  itens: Produto[];
};

// Ordem dos chips: Pronta entrega e as categorias (só as que têm peça).
export const VISTAS: Vista[] = [
  {
    slug: "pronta-entrega",
    chip: "Pronta entrega",
    titulo: "Pronta entrega",
    itens: produtos.filter((p) => p.prontaEntrega),
  },
  ...categoriasOrdem.map((cat) => ({
    slug: secaoId[cat],
    chip: cat,
    titulo: cat,
    itens: produtos.filter((p) => secaoVitrine(p) === cat),
  })),
].filter((v) => v.itens.length > 0);

// Vista "Todas": as categorias em ordem, cada uma com todas as suas peças.
export const SECOES_TODAS: SecaoTodas[] = categoriasOrdem
  .map((cat) => ({
    slug: secaoId[cat],
    titulo: cat,
    itens: produtos.filter((p) => secaoVitrine(p) === cat),
  }))
  .filter((s) => s.itens.length > 0);

export const TOTAL_PECAS = produtos.length;

// Selo ao lado do título da vista (ex.: "nova coleção"). Vazio hoje: o da
// Solaris saiu com a coleção. A próxima coleção em destaque entra aqui.
const SELOS: Record<string, string> = {};

export const seloDaVista = (slug: string): string | undefined => SELOS[slug];

export const produtoPorId = new Map(produtos.map((p) => [p.id, p]));

export const slugsDeVista = new Set(VISTAS.map((v) => v.slug));

export const vistaPorSlug = (slug: string | null) =>
  slug ? (VISTAS.find((v) => v.slug === slug) ?? null) : null;

export const contagemPecas = (n: number) => `${n} ${n === 1 ? "peça" : "peças"}`;
