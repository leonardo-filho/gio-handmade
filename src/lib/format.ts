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
