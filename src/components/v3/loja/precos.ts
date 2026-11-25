// Preços de uma peça como a loja mostra: o valor no cartão primeiro, o
// parcelamento sem juros e o pix como alternativa (só quando for menor).

import type { Produto } from "@/data/produtos";
import { formatBRLPreco } from "@/lib/format";
import { labelParcelamento, parcelamentoCartao } from "@/lib/parcelas";

export type Precos = {
  /** Valor no cartão, formatado ("R$ 1.199,90"). */
  cartao: string;
  /** Valor no cartão, em número (para ordenar). */
  valorCartao: number;
  /** "até 5x sem juros" (ou "no cartão" quando não parcela). */
  parcelas: string;
  /** Parcelas sem juros (1 quando não parcela). */
  vezes: number;
  /** Valor no pix formatado, ou null quando não é menor que o do cartão. */
  pix: string | null;
};

export function precosDe(produto: Produto): Precos {
  const parcelamento = parcelamentoCartao(produto);
  return {
    cartao: formatBRLPreco(parcelamento.total),
    valorCartao: parcelamento.total,
    parcelas: labelParcelamento(parcelamento),
    vezes: parcelamento.vezes,
    pix: produto.preco < parcelamento.total ? formatBRLPreco(produto.preco) : null,
  };
}
