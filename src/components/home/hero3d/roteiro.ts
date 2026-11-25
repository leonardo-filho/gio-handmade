// Roteiro do hero "Ponto a ponto": o que acontece em cada trecho da rolagem.
//
// O progresso p vai de 0 (topo da home) a 1 (fim da seção presa). A cena 3D
// e os textos leem as mesmas faixas, então o contador, as frases e as
// miçangas andam juntos. Este arquivo não importa o three: o componente da
// página usa o roteiro sem baixar a cena.

export const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);

/** Posição de p dentro da faixa [a, b], de 0 a 1. */
export const faixa = (p: number, a: number, b: number) => clamp01((p - a) / (b - a));

export const suave = (t: number) => t * t * (3 - 2 * t);
export const entraSai = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
export const saida = (t: number) => 1 - Math.pow(1 - t, 3);
export const saidaExpo = (t: number) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t));

/** Trechos da rolagem (frações do progresso). */
export const TRECHO = {
  /**
   * A peça montada se solta, de baixo para cima. Até a pessoa rolar, as
   * miçangas ficam no desenho da peça: a dispersão anda com o dedo, nunca
   * sozinha.
   */
  solta: [0.004, 0.06] as const,
  /** As miçangas voam para o lugar, uma a uma. */
  costura: [0.06, 0.47] as const,
  /** A peça pronta gira com a rolagem. */
  giro: [0.47, 0.66] as const,
  /** A câmera mergulha no bordado. */
  mergulho: [0.64, 0.84] as const,
  /** A cena dá lugar à foto real. */
  foto: [0.8, 0.91] as const,
};

/** Quanto da costura já foi feito (0 a 1) no progresso p. */
export const costura = (p: number) => faixa(p, TRECHO.costura[0], TRECHO.costura[1]);

/** Quanto a peça montada da abertura já se soltou (0 a 1) no progresso p. */
export const dispersao = (p: number) => faixa(p, TRECHO.solta[0], TRECHO.solta[1]);

/**
 * Cada miçanga voa durante esta fração da costura. A miçanga i (na ordem de
 * costura, de n) sai em i / n * (1 - VOO) e pousa VOO depois.
 */
export const VOO = 0.075;

/** Fração das miçangas já pousadas, para o contador. */
export const pousadas = (c: number) => clamp01((c - VOO) / (1 - VOO));

/** Total do contador: o texto da peça fala em mais de 2.500 miçangas e pedrarias. */
export const TOTAL_MICANGAS = 2500;

/**
 * Blocos de texto: cada um fica ativo enquanto p está entre `de` e `ate`.
 * Entram e saem por tempo (transição do CSS), não presos ao dedo: a frase
 * assenta inteira mesmo com a rolagem rápida.
 */
export const BLOCOS = [
  { id: "abertura", de: -1, ate: 0.05 },
  { id: "costura", de: 0.07, ate: 0.45 },
  { id: "peca", de: 0.49, ate: 0.645 },
  { id: "mergulho", de: 0.675, ate: 0.8 },
  { id: "final", de: 0.865, ate: 2 },
] as const;

export type IdBloco = (typeof BLOCOS)[number]["id"];

/** Onde a rolagem para quando alguém chega pelo teclado aos botões do fim. */
export const P_FINAL = 0.95;
