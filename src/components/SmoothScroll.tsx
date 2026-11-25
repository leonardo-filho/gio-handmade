"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { registrarLenis } from "@/lib/travaRolagem";

export default function SmoothScroll() {
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    const lenis = new Lenis({
      duration: 1.4,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.2,
    });
    // A trava de rolagem (modal, carrinho, menu) e o rolarAte usam esta instância.
    registrarLenis(lenis);

    let rafId: number;
    function raf(time: number) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);

    // Links âncora (#secao) precisam rolar via Lenis, senão o scroll nativo
    // conflita com o smooth-scroll e às vezes não chega na seção.
    function handleAnchorClick(e: MouseEvent) {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey) return;
      const target = e.target as HTMLElement | null;
      const link = target?.closest('a[href*="#"]') as HTMLAnchorElement | null;
      if (!link) return;

      const url = new URL(link.href, window.location.href);
      // só trata âncoras da própria página
      if (url.pathname !== window.location.pathname || !url.hash) return;

      const el = document.querySelector(url.hash);
      if (!el) return;

      e.preventDefault();
      // Offset dinâmico = altura real do header fixo (+ barra de categorias da
      // loja, quando presente) + respiro, pra seção não ficar atrás das barras.
      const header = document.querySelector("header");
      const headerH = header ? Math.round(header.getBoundingClientRect().height) : 80;
      const lojaNav = document.querySelector("[data-loja-nav]");
      const navH = lojaNav ? Math.round(lojaNav.getBoundingClientRect().height) : 0;
      // O Lenis já desconta o scroll-margin-top do alvo; somado ao offset, o
      // desconto entrava duas vezes e a seção parava longe da barra.
      const margem = parseFloat(getComputedStyle(el).scrollMarginTop) || 0;
      lenis.scrollTo(el as HTMLElement, { offset: -(headerH + navH + 16) + margem, duration: 1.2 });
      window.history.pushState(null, "", url.hash);
      // Como o link nativo, leva o foco ao alvo quando ele aceita foco (o
      // "Pular para as peças" depende disso). Num alvo sem foco, não faz nada.
      if (el instanceof HTMLElement) el.focus({ preventScroll: true });
    }

    document.addEventListener("click", handleAnchorClick);

    return () => {
      cancelAnimationFrame(rafId);
      document.removeEventListener("click", handleAnchorClick);
      registrarLenis(null);
      lenis.destroy();
    };
  }, []);

  return null;
}
