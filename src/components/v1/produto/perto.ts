// Contas do "Ver de perto": onde o dedo ou o mouse caiu na foto, e que
// pedaço da foto está à vista quando ela está ampliada.

export type Ponto = { x: number; y: number };
export type Tamanho = { w: number; h: number };

/** Recorte das fotos na galeria (object-position 50% 40%): o busto fica a 40% da altura. */
export const RECORTE: Ponto = { x: 0.5, y: 0.4 };

/** Aproximação com que o "Ver de perto" abre. */
export const ZOOM_INICIAL = 2.5;
export const ZOOM_MIN = 1;
export const ZOOM_MAX = 4;

export const limitar = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

/**
 * Converte um ponto da moldura (0 a 1, com a foto em object-cover) no ponto
 * da foto inteira (0 a 1). Serve para abrir a tela cheia exatamente onde a
 * pessoa tocou.
 */
export function pontoNaFoto(toque: Ponto, moldura: Tamanho, natural: Tamanho, recorte: Ponto = RECORTE): Ponto {
  if (!natural.w || !natural.h || !moldura.w || !moldura.h) return toque;
  const k = Math.max(moldura.w / natural.w, moldura.h / natural.h);
  const dw = natural.w * k;
  const dh = natural.h * k;
  const ox = (moldura.w - dw) * recorte.x;
  const oy = (moldura.h - dh) * recorte.y;
  return {
    x: limitar((toque.x * moldura.w - ox) / dw, 0, 1),
    y: limitar((toque.y * moldura.h - oy) / dh, 0, 1),
  };
}

/** Tamanho da foto inteira dentro de uma caixa, sem cortar (object-contain). */
export function caber(natural: Tamanho, caixa: Tamanho): Tamanho {
  const k = Math.min(caixa.w / natural.w, caixa.h / natural.h);
  return { w: natural.w * k, h: natural.h * k };
}
