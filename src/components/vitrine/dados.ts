// Dados da vitrine da /loja, derivados das vistas da loja
// (src/components/loja/vistas).
//
// A grade é uma lista plana: títulos de seção, peças e a pausa editorial são
// itens da mesma lista, para o filtro e a ordem reorganizarem tudo com
// animação de layout (cada item tem uma chave lógica estável).
//
// Linha sem buraco: quando a última linha de uma seção ficaria incompleta, as
// últimas peças ocupam mais de uma coluna (díptico com duas fotos, ou faixa
// com as fotos e o texto ao lado). A conta é feita para as três grades da
// página: 2 colunas no celular, 3 no tablet e 4 do xl para cima.

import { SECOES_TODAS, TOTAL_PECAS, VISTAS, vistaPorSlug } from "@/components/loja/vistas";
import type { Produto } from "@/data/produtos";
import { formatBRLPreco } from "@/lib/format";
import { parcelamentoCartao } from "@/lib/parcelas";

export const TODAS = "todas";

export type Ordem = "relevancia" | "menor" | "maior";

export const ORDENS: { id: Ordem; rotulo: string }[] = [
  { id: "relevancia", rotulo: "Mais relevantes" },
  { id: "menor", rotulo: "Menor preço" },
  { id: "maior", rotulo: "Maior preço" },
];

export type Filtro = { id: string; rotulo: string; total: number };

export const FILTROS: Filtro[] = [
  { id: TODAS, rotulo: "Todas", total: TOTAL_PECAS },
  ...VISTAS.map((v) => ({ id: v.slug, rotulo: v.chip, total: v.itens.length })),
];

/** Colunas que a peça ocupa em cada grade (celular, tablet, xl). */
export type Largura = { base: 1 | 2; md: 1 | 2 | 3; xl: 1 | 2 | 4 };

export type Item =
  | { tipo: "secao"; chave: string; titulo: string; total: number; faixa: string; nota?: string }
  | { tipo: "peca"; chave: string; produto: Produto; largura: Largura }
  | { tipo: "pausa"; chave: string };

// Peça da pausa editorial: o texto dela no catálogo fala em "mais de 2.500
// miçangas e pedrarias", e a foto 5 é o bordado de perto.
export const PAUSA = {
  id: "top-maya",
  foto: "/colecao/top-maya-5.jpg",
};

const NOTAS: Record<string, string> = {
  "pronta-entrega": "Peças já finalizadas, com envio imediato.",
};

const precoNoCartao = (p: Produto) => parcelamentoCartao(p).total;

/** Faixa de preço no cartão de um grupo de peças ("R$ 950 a R$ 1.299,90"). */
function faixaDePreco(pecas: Produto[]) {
  if (pecas.length === 0) return "";
  const valores = pecas.map(precoNoCartao);
  const min = Math.min(...valores);
  const max = Math.max(...valores);
  return min === max ? formatBRLPreco(min) : `${formatBRLPreco(min)} a ${formatBRLPreco(max)}`;
}

// Quantas colunas a peça k (0 = primeira) de um grupo de n ocupa numa grade
// de c colunas. Sobrando uma peça na última linha, ela vira a linha inteira;
// sobrando mais, as últimas ocupam duas colunas até a linha fechar.
function colunas(n: number, k: number, c: number) {
  const resto = n % c;
  if (resto === 0) return 1;
  const daPonta = n - k;
  if (resto === 1) return daPonta === 1 ? c : 1;
  return daPonta <= c - resto ? 2 : 1;
}

function ordenar(lista: Produto[], ordem: Ordem) {
  if (ordem === "relevancia") return lista;
  const sinal = ordem === "menor" ? 1 : -1;
  return [...lista].sort((a, b) => sinal * (precoNoCartao(a) - precoNoCartao(b)));
}

function pecas(lista: Produto[]): Item[] {
  return lista.map((p, k, todas) => ({
    tipo: "peca",
    chave: `p:${p.id}`,
    produto: p,
    largura: {
      base: colunas(todas.length, k, 2) as Largura["base"],
      md: colunas(todas.length, k, 3) as Largura["md"],
      xl: colunas(todas.length, k, 4) as Largura["xl"],
    },
  }));
}

const secao = (chave: string, titulo: string, itens: Produto[], nota?: string): Item => ({
  tipo: "secao",
  chave,
  titulo,
  total: itens.length,
  faixa: faixaDePreco(itens),
  nota,
});

/** Itens da grade para o filtro (slug ou null = Todas) e a ordem. */
export function montarLista(ver: string | null, ordem: Ordem): Item[] {
  const vista = vistaPorSlug(ver);
  if (vista) {
    return [secao(`s:${vista.slug}`, vista.titulo, vista.itens, NOTAS[vista.slug]), ...pecas(ordenar(vista.itens, ordem))];
  }
  if (ordem !== "relevancia") {
    const todas = SECOES_TODAS.flatMap((s) => s.itens);
    return [secao("s:todas", "Todas as peças", todas), ...pecas(ordenar(todas, ordem))];
  }
  const lista: Item[] = [];
  SECOES_TODAS.forEach((grupo, i) => {
    lista.push(secao(`s:${grupo.slug}`, grupo.titulo, grupo.itens));
    lista.push(...pecas(grupo.itens));
    // A pausa entra depois da primeira seção: perto do começo, sem empurrar
    // as primeiras peças para baixo.
    if (i === 0) lista.push({ tipo: "pausa", chave: "pausa" });
  });
  return lista;
}

/** Todas as fotos da peça, na ordem do catálogo. */
export const fotosDe = (p: Produto) =>
  [p.foto, p.fotoHover, ...(p.fotosExtra ?? [])].filter((f): f is string => Boolean(f));

export const itemDoCarrinho = (p: Produto) => ({
  id: p.id,
  nome: p.nome,
  preco: p.preco,
  foto: p.foto,
  categoria: p.categoria,
});
