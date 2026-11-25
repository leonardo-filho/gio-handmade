import type { Produto } from "@/data/produtos";
import { formatBRLPreco } from "@/lib/format";
import { parcelamentoCartao } from "@/lib/parcelas";

export const EASE_ATELIER = [0.22, 1, 0.36, 1] as const;

export const SPRING_PILULA = {
  type: "spring" as const,
  stiffness: 420,
  damping: 34,
  mass: 0.8,
};

export const SPRING_LAYOUT = {
  type: "spring" as const,
  stiffness: 320,
  damping: 32,
  mass: 0.9,
};

export const SPRING_BOTAO = {
  type: "spring" as const,
  stiffness: 500,
  damping: 28,
};

export const SPRING_FOLHA = {
  type: "spring" as const,
  stiffness: 360,
  damping: 36,
  mass: 0.9,
};

export type Ordenacao = "curadoria" | "menor" | "maior";

export const OPCOES_ORDENACAO: { id: Ordenacao; rotulo: string; curto: string }[] = [
  { id: "curadoria", rotulo: "Curadoria", curto: "Curadoria" },
  { id: "menor", rotulo: "Menor preço", curto: "Menor" },
  { id: "maior", rotulo: "Maior preço", curto: "Maior" },
];

export function fotosDoProduto(p: Produto): string[] {
  return [p.foto, p.fotoHover, ...(p.fotosExtra ?? [])].filter(
    (src): src is string => Boolean(src)
  );
}

export function precoEfetivoCartao(p: Produto): number {
  return parcelamentoCartao(p).total;
}

export function ordenarProdutos(itens: Produto[], ordem: Ordenacao): Produto[] {
  if (ordem === "curadoria") return itens;
  const copia = [...itens];
  if (ordem === "menor") {
    copia.sort((a, b) => precoEfetivoCartao(a) - precoEfetivoCartao(b));
  } else {
    copia.sort((a, b) => precoEfetivoCartao(b) - precoEfetivoCartao(a));
  }
  return copia;
}

export function faixaDePreco(itens: Produto[]): string {
  if (itens.length === 0) return "";
  let min = Infinity;
  let max = -Infinity;
  for (const item of itens) {
    const valor = precoEfetivoCartao(item);
    if (valor < min) min = valor;
    if (valor > max) max = valor;
  }
  if (!Number.isFinite(min) || !Number.isFinite(max)) return "";
  if (min === max) return formatBRLPreco(min);
  return `${formatBRLPreco(min)} a ${formatBRLPreco(max)}`;
}
