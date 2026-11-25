// Dados derivados da vitrine para a direção "Ateliê" (/loja/atelie).
//
// Reaproveita as vistas da loja (./loja/vistas) e acrescenta só o que esta
// direção mostra a mais: o número de catálogo de cada peça (Nº 01 a Nº 52,
// na ordem da vista "Todas") e as contagens dos filtros.

import { SECOES_TODAS, VISTAS, TOTAL_PECAS, type SecaoTodas } from "@/components/loja/vistas";
import type { Produto } from "@/data/produtos";

export const TODAS = "todas";

/** Número de catálogo: a peça mantém o mesmo número em qualquer filtro. */
export const numeroDaPeca = new Map<string, number>();
SECOES_TODAS.flatMap((s) => s.itens).forEach((p, i) => {
  if (!numeroDaPeca.has(p.id)) numeroDaPeca.set(p.id, i + 1);
});

export const rotuloNumero = (id: string) => {
  const n = numeroDaPeca.get(id) ?? 0;
  return `Nº ${String(n).padStart(2, "0")}`;
};

export type Aba = { id: string; rotulo: string; total: number };

export const ABAS: Aba[] = [
  { id: TODAS, rotulo: "Todas", total: TOTAL_PECAS },
  ...VISTAS.map((v) => ({ id: v.slug, rotulo: v.chip, total: v.itens.length })),
];

/** Grupo da lista: uma seção na vista "Todas", ou a vista filtrada inteira. */
export type Grupo = {
  slug: string;
  titulo: string;
  selo?: string;
  itens: Produto[];
};

export const GRUPOS_TODAS: Grupo[] = SECOES_TODAS.map((s: SecaoTodas) => ({ ...s }));

// Rótulo curto da categoria para a linha de apoio (a coleção aparece como
// "Solaris", como no filtro).
export const rotuloCategoria = (p: Produto) =>
  p.categoria === "Coleção Solaris" ? "Coleção Solaris" : p.categoria;

// Peça e recorte da abertura: o Top Maya, que tem mais de 2.500 miçangas e
// pedrarias (texto do próprio catálogo). A foto é a de detalhe da galeria.
export const ABERTURA = {
  id: "top-maya",
  foto: "/colecao/top-maya-5.jpg",
  // Ponto de foco do recorte (em % da foto) e quanto ele aproxima.
  foco: "38% 34%",
};

// Amostra de bordado de cada capítulo da lista: um recorte redondo e bem
// fechado (como a lente da lupa) de uma foto daquela categoria.
export const AMOSTRAS: Record<string, { foto: string; foco: string }> = {
  "colecao-solaris": { foto: "/colecao/solaris-top-solaris-7.jpg", foco: "50% 60%" },
  "pronta-entrega": { foto: "/pronta.jpeg", foco: "50% 42%" },
  conjuntos: { foto: "/conjuntos.jpeg", foco: "50% 42%" },
  vestidos: { foto: "/vestido.jpg", foco: "50% 50%" },
  tops: { foto: "/tops.jpeg", foco: "50% 45%" },
  saias: { foto: "/saias.jpeg", foco: "40% 55%" },
  acessorios: { foto: "/headpiece.jpeg", foco: "50% 32%" },
};

// Nota do ateliê: o material da peça, tirado da primeira frase do texto do
// catálogo (sem o parêntese técnico). "Feito à mão, sob medida, com um mix de
// pérolas" vira "À mão, com pérolas"; frases sem "com" (ou que já dizem "à
// mão" depois dele) ficam como estão.
export function notaDoAtelie(p: Produto): string {
  const frase = (p.detalhes.split(/(?<=\.)\s/)[0] ?? "")
    .replace(/\s*\([^)]*\)/g, "")
    .replace(/\.$/, "")
    .trim();
  const m = frase.match(/\bcom (?:um mix de )?(.+)$/i);
  if (!m || /à mão/i.test(m[1])) return `${frase}.`;
  return `À mão, com ${m[1]}.`;
}
