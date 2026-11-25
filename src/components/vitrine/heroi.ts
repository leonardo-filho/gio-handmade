// Foto que cresce do cartão para o detalhe (e volta ao fechar).
//
// O cartão guarda, no toque, onde a foto estava e qual imagem mostrava; a
// folha da peça lê isso ao abrir e faz a cópia da foto voar até o lugar
// dela. Vale por pouco tempo: uma peça aberta por link (story) não tem de
// onde crescer e só sobe da base da tela.

import type { Caixa } from "./movimento";

export type Heroi = {
  id: string;
  /** Foto que o cartão mostrava (índice na lista de fotos da peça). */
  indice: number;
  caixa: Caixa;
  src: string;
  quando: number;
};

let atual: Heroi | null = null;

export function guardarHeroi(h: Omit<Heroi, "quando">) {
  atual = { ...h, quando: performance.now() };
}

export function lerHeroi(id: string): Heroi | null {
  if (!atual || atual.id !== id || performance.now() - atual.quando > 1500) return null;
  return atual;
}

/** Quadro da foto do cartão da peça (o mesmo id pode não estar na grade). */
export function quadroDoCartao(id: string) {
  return document.querySelector<HTMLElement>(`[data-foto-peca="${CSS.escape(id)}"]`);
}

/** Slide i (a foto i) dentro de um quadro de fotos. */
export function slideDe(quadro: Element | null, i: number) {
  return quadro?.querySelectorAll<HTMLElement>("[data-slide]")[i] ?? null;
}

/** Imagem principal do slide i dentro de um quadro de fotos. */
export function imagemDoSlide(quadro: Element | null, i: number) {
  return slideDe(quadro, i)?.querySelector<HTMLImageElement>("img[data-principal]") ?? null;
}

/** O cartão está em díptico ou faixa (as duas primeiras fotos lado a lado)? */
export function modoLargo(quadro: Element | null) {
  const trilho = slideDe(quadro, 0)?.parentElement;
  return !!trilho && getComputedStyle(trilho).display === "grid";
}

/**
 * O slide da foto i, se o cartão está mostrando essa foto agora: no díptico,
 * as duas primeiras; no cartão normal, a do trilho (no toque) ou a primeira
 * (com mouse, fora do hover).
 */
export function slideVisivel(quadro: HTMLElement | null, i: number) {
  const slide = slideDe(quadro, i);
  if (!quadro || !slide) return null;
  if (modoLargo(quadro)) return i <= 1 ? slide : null;
  return Number(quadro.dataset.indice ?? 0) === i ? slide : null;
}
