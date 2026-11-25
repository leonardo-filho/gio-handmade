// Classes repetidas da estrutura v3 (cabeçalho, gavetas, sacola e rodapé).
// Fonte das medidas: spec-v3, seções 2, 3 e 5.

/** Anel de foco do teclado: o dourado #b8902a só aparece aqui. */
export const FOCO =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-solid focus-visible:outline-[#b8902a]";

/** Hover de link e botão: opacidade a 0,7 em 0,2 s (sem animação com movimento reduzido). */
export const HOVER = "transition-opacity duration-200 hover:opacity-70 motion-reduce:transition-none";

/** Rótulo e botão em caixa alta (Questrial 12 px, espaçamento de 0,16em). */
export const CAIXA_ALTA = "text-[12px] uppercase tracking-[0.16em]";

/** Botão principal: navy com texto creme, 48 px, raio de 4 px. */
export const BOTAO_PRINCIPAL = `flex min-h-12 w-full items-center justify-center rounded-[4px] bg-[#1B4965] px-6 text-[#EDE7D9] ${CAIXA_ALTA} ${HOVER} ${FOCO}`;

/** Botão de contorno: 1 px navy, 48 px, raio de 4 px. */
export const BOTAO_CONTORNO = `flex min-h-12 items-center justify-center rounded-[4px] border border-[#1B4965] px-6 text-[#1B4965] ${CAIXA_ALTA} ${HOVER} ${FOCO}`;

/**
 * Campo de texto: 44 px, raio de 4 px, fonte de 16 px (o iPhone não dá zoom).
 * A borda é navy a 60% e não a 40% da spec: a 40% ela fica em 2:1 no creme, e
 * a borda é o que mostra que ali é um campo (AA pede 3:1; a 60% dá 3,03:1).
 * No foco, a borda fica navy cheia com 2 px (no campo, o foco vem também do
 * clique, então ele não usa o anel dourado, que é só do teclado).
 */
export const CAMPO =
  "h-11 min-w-0 flex-1 rounded-[4px] border border-[#1B4965]/60 bg-transparent px-3 text-[16px] text-[#1B4965] outline-none placeholder:text-brand-muted focus:border-[#1B4965] focus:ring-1 focus:ring-[#1B4965]";

/** Linha divisória: 1 px navy a 15%. */
export const LINHA = "border-[#1B4965]/15";
