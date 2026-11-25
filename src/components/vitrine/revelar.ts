"use client";

import { useEffect, type RefObject } from "react";

// Revelação na rolagem, sem estado do React: o elemento que nasce abaixo da
// tela ganha data-revelar="espera" (escondido pelo CSS) e, quando entra na
// tela, "visto" (a transição do CSS faz o resto). O que já nasce visível fica
// como está, então o HTML do servidor nunca pisca e, sem JavaScript, nada
// some. A coluna define um atraso pequeno: os dois cartões de uma linha
// entram um depois do outro.
//
// Um observador só para a página inteira, e nenhuma medida feita na mão: a
// posição vem do próprio observador. Medir cartão por cartão no efeito (ler
// a posição e logo escrever o atributo) forçava um cálculo de layout por
// cartão e travava a troca de filtro em celular lento.

type Estado = "novo" | "espera";

const estados = new WeakMap<HTMLElement, Estado>();
let observador: IntersectionObserver | null = null;

function aoCruzar(entradas: IntersectionObserverEntry[]) {
  for (const entrada of entradas) {
    const el = entrada.target as HTMLElement;
    const estado = estados.get(el);
    const r = entrada.boundingClientRect;
    if (estado === "novo") {
      // Primeira notícia do elemento: na tela (ou acima dela), fica como está.
      if (r.top < window.innerHeight && r.bottom > 0) {
        soltar(el);
      } else if (r.top >= window.innerHeight) {
        const coluna = Math.min(3, Math.floor((r.left / Math.max(1, window.innerWidth)) * 3));
        el.style.setProperty("--atraso", `${coluna * 90}ms`);
        el.dataset.revelar = "espera";
        estados.set(el, "espera");
      } else {
        soltar(el);
      }
    } else if (estado === "espera" && entrada.isIntersecting) {
      el.dataset.revelar = "visto";
      soltar(el);
    }
  }
}

function soltar(el: HTMLElement) {
  estados.delete(el);
  observador?.unobserve(el);
}

export function useRevelar(ref: RefObject<HTMLElement | null>, ativo = true) {
  useEffect(() => {
    const el = ref.current;
    if (!el || !ativo) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    observador ??= new IntersectionObserver(aoCruzar, { rootMargin: "0px 0px -6% 0px" });
    estados.set(el, "novo");
    observador.observe(el);
    return () => {
      soltar(el);
      delete el.dataset.revelar;
    };
  }, [ref, ativo]);
}
