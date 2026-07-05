/**
 * Calcula o valor do parcelamento no cartão de crédito baseado no valor à vista (PIX).
 * Adiciona uma margem padrão de ~10% para o valor no cartão e arredonda para o múltiplo
 * de 5 mais próximo para manter os preços limpos e similares ao que já era praticado.
 */
export function calcularParcelamento(precoPix: number): string {
  // Acréscimo padrão de ~10% para o valor no cartão
  const valorCartaoBruto = precoPix * 1.10;
  
  // Arredonda para o múltiplo de 5 mais próximo (ex: 715, 605, 1250)
  const valorCartao = Math.ceil(valorCartaoBruto / 5) * 5;

  // Define o número de parcelas baseado no valor
  let parcelas = 1;
  if (valorCartao >= 1200) parcelas = 6;
  else if (valorCartao >= 900) parcelas = 5;
  else if (valorCartao >= 500) parcelas = 4;
  else if (valorCartao >= 150) parcelas = 3;
  else if (valorCartao >= 100) parcelas = 2;

  // Valor final de cada parcela, garantindo que não tenha dizimas
  const valorParcela = Math.ceil(valorCartao / parcelas);
  return `${parcelas}x de R$ ${valorParcela} sem juros`;
}
