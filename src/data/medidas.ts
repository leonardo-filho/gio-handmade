// Tabela de medidas da Gio Handmade (em cm), aprovada pelo Leo em 25/11/2026.
// Vale para as peças de vestir (tops, conjuntos, saias e vestidos). Peça sob
// medida usa as medidas da própria cliente; a tabela serve de referência e
// para sugerir o tamanho mais próximo.

export type Faixa = { min: number; max: number };

export type LinhaTamanho = {
  /** Rótulo curto, como aparece no seletor: "PP", "P", "M", "G", "GG". */
  tamanho: string;
  /** Numeração equivalente: 34, 36, 38, 40, 42. */
  numero: number;
  busto: Faixa;
  cintura: Faixa;
  quadril: Faixa;
};

export const TABELA_MEDIDAS: LinhaTamanho[] = [
  { tamanho: "PP", numero: 34, busto: { min: 77, max: 81 }, cintura: { min: 58, max: 62 }, quadril: { min: 86, max: 90 } },
  { tamanho: "P", numero: 36, busto: { min: 81, max: 85 }, cintura: { min: 62, max: 66 }, quadril: { min: 90, max: 94 } },
  { tamanho: "M", numero: 38, busto: { min: 85, max: 89 }, cintura: { min: 66, max: 70 }, quadril: { min: 94, max: 98 } },
  { tamanho: "G", numero: 40, busto: { min: 89, max: 93 }, cintura: { min: 70, max: 74 }, quadril: { min: 98, max: 102 } },
  { tamanho: "GG", numero: 42, busto: { min: 93, max: 97 }, cintura: { min: 75, max: 78 }, quadril: { min: 102, max: 106 } },
];

/** As três medidas que a cliente informa (em cm). Qualquer uma pode faltar. */
export type Medidas = {
  busto?: number;
  cintura?: number;
  quadril?: number;
};

/** Limites aceitos no formulário, para pegar erro de digitação (ex.: 850 em vez de 85). */
export const LIMITES_MEDIDA: Faixa = { min: 50, max: 160 };

export function medidaValida(valor: number | undefined): boolean {
  return typeof valor === "number" && Number.isFinite(valor) && valor >= LIMITES_MEDIDA.min && valor <= LIMITES_MEDIDA.max;
}

function distancia(valor: number, faixa: Faixa): number {
  if (valor < faixa.min) return faixa.min - valor;
  if (valor > faixa.max) return valor - faixa.max;
  return 0;
}

/**
 * Sugere o tamanho da tabela mais próximo das medidas informadas (soma das
 * distâncias até cada faixa). Devolve null se nenhuma medida válida veio.
 * É só uma referência: a peça sob medida é feita com as medidas da cliente.
 */
export function sugerirTamanho(medidas: Medidas): LinhaTamanho | null {
  const campos = (["busto", "cintura", "quadril"] as const).filter((c) => medidaValida(medidas[c]));
  if (campos.length === 0) return null;
  let melhor: LinhaTamanho | null = null;
  let menor = Infinity;
  for (const linha of TABELA_MEDIDAS) {
    const d = campos.reduce((soma, c) => soma + distancia(medidas[c] as number, linha[c]), 0);
    if (d < menor) {
      menor = d;
      melhor = linha;
    }
  }
  return melhor;
}

export function formatarFaixa(f: Faixa): string {
  return `${f.min}-${f.max}`;
}
