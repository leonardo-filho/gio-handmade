// Formatação de valores em Real brasileiro, usada no carrinho e na vitrine.

export function formatBRL(valor: number): string {
  return valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  });
}

// Versão curta, sem centavos, para etiquetas ("R$ 550")
export function formatBRLCurto(valor: number): string {
  return "R$ " + valor.toLocaleString("pt-BR", { maximumFractionDigits: 0 });
}

// Preço de vitrine: sem centavos quando o valor é redondo ("R$ 550"),
// com centavos quando não é ("R$ 599,90").
export function formatBRLPreco(valor: number): string {
  const inteiro = Number.isInteger(valor);
  return (
    "R$ " +
    valor.toLocaleString("pt-BR", {
      minimumFractionDigits: inteiro ? 0 : 2,
      maximumFractionDigits: inteiro ? 0 : 2,
    })
  );
}
