// Sistema de cupons de desconto da loja.
//
// Cada cupom tem um código, um percentual de desconto e uma data limite. A
// validação é feita no fuso de Brasília (UTC-3): o cupom vale até o fim do dia
// informado em `validoAte` (23:59 daquele dia), independentemente do fuso do
// aparelho do cliente.
//
// Para criar uma promoção nova, basta adicionar um item em `cupons`. Para
// encerrar uma promoção antes da hora, é só apagar o item (ou mudar a data).

export type Cupom = {
  codigo: string; // sempre em MAIÚSCULAS; o cliente digita sem diferenciar caixa/acento
  percentual: number; // ex.: 10 = 10% de desconto sobre o subtotal
  validoAte: string; // data limite inclusiva, formato "AAAA-MM-DD" (fim do dia, Brasília)
  descricao?: string; // texto curto para divulgação
};

export const cupons: Cupom[] = [
  {
    codigo: "SOLARIS",
    percentual: 10,
    validoAte: "2026-08-01", // sábado
    descricao: "10% OFF em toda a loja",
  },
];

export type ResultadoCupom =
  | { status: "ok"; cupom: Cupom }
  | { status: "expirado"; cupom: Cupom }
  | { status: "invalido" };

/** Normaliza o código digitado: sem espaços, sem acento, em MAIÚSCULAS. */
export function normalizarCodigo(codigo: string): string {
  return codigo
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/\s+/g, "")
    .toUpperCase();
}

/** Verifica se o cupom ainda está no prazo (fim do dia `validoAte`, Brasília). */
export function cupomValido(cupom: Cupom, agora: Date = new Date()): boolean {
  const limite = new Date(`${cupom.validoAte}T23:59:59.999-03:00`);
  return agora.getTime() <= limite.getTime();
}

/** Procura um cupom pelo código (ignora caixa/acento/espaços). */
export function buscarCupom(codigo: string): Cupom | null {
  const alvo = normalizarCodigo(codigo);
  if (!alvo) return null;
  return cupons.find((c) => normalizarCodigo(c.codigo) === alvo) ?? null;
}

/** Valida um código: existe? está no prazo? */
export function validarCupom(codigo: string, agora: Date = new Date()): ResultadoCupom {
  const cupom = buscarCupom(codigo);
  if (!cupom) return { status: "invalido" };
  if (!cupomValido(cupom, agora)) return { status: "expirado", cupom };
  return { status: "ok", cupom };
}

/** Valor do desconto (em R$) que o cupom aplica sobre o subtotal. */
export function calcularDesconto(subtotal: number, cupom: Cupom): number {
  return Math.round(subtotal * (cupom.percentual / 100) * 100) / 100;
}
