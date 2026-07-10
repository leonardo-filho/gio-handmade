// Parcelamento no cartão de crédito. A vitrine mostra primeiro o valor no
// cartão ("R$ 599,90 até 5x sem juros") e o pix como alternativa mais barata.

export type Parcelamento = {
  total: number; // valor total no cartão
  vezes: number; // parcelamento máximo sem juros ("até Nx sem juros")
};

/**
 * Retorna o valor no cartão e o parcelamento máximo de um produto.
 * Usa os valores definidos no catálogo (`precoCartao` + `maxParcelas`);
 * para peças ainda sem valor de cartão definido, estima com acréscimo de
 * ~10% sobre o pix, arredondado ao múltiplo de 5 (mesma regra já praticada).
 */
export function parcelamentoCartao(produto: {
  preco: number;
  precoCartao?: number;
  maxParcelas?: number;
}): Parcelamento {
  if (produto.precoCartao && produto.maxParcelas) {
    return { total: produto.precoCartao, vezes: produto.maxParcelas };
  }

  // Math.round evita ruído de ponto flutuante (400 * 1.1 = 440.00000000000006)
  const total = Math.ceil(Math.round(produto.preco * 110) / 100 / 5) * 5;

  let vezes = 1;
  if (total >= 1200) vezes = 6;
  else if (total >= 900) vezes = 5;
  else if (total >= 500) vezes = 4;
  else if (total >= 150) vezes = 3;
  else if (total >= 100) vezes = 2;

  return { total, vezes };
}

// Texto do parcelamento ("até 5x sem juros"; "no cartão" quando não parcela).
export function labelParcelamento(p: Parcelamento): string {
  return p.vezes > 1 ? `até ${p.vezes}x sem juros` : "no cartão";
}
