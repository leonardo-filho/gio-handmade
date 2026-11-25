"use client";

import { useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import { useCart } from "@/components/cart/CartProvider";
import { fecharPeca, useHidratado, useUrlLoja } from "@/components/loja/urlLoja";
import { produtoPorId } from "@/components/loja/vistas";
import Folha from "@/components/vitrine/Folha";

// A peça abre na própria home, com a mesma folha da /loja: a foto do cartão
// cresce até ela, o voltar do celular fecha (a URL ganha ?produto=<id>, como
// na loja) e o "Adicionar" voa para a sacola.
export default function PecaAberta() {
  const { produto } = useUrlLoja();
  const hidratado = useHidratado();
  const aberta = hidratado && produto ? (produtoPorId.get(produto) ?? null) : null;

  return (
    <>
      <AvisoSaiDoCaminho />
      <AnimatePresence>{aberta && <Folha key={aberta.id} produto={aberta} onFechar={fecharPeca} />}</AnimatePresence>
    </>
  );
}

// O aviso "no carrinho" (CartToast, do layout) fica preso no rodapé da tela.
// Como na /loja, ele sai do caminho assim que a pessoa segue adiante: ao rolar
// a página ou ao tocar fora do "Ver carrinho". O contador da sacola continua
// mostrando o que está no carrinho.
function AvisoSaiDoCaminho() {
  const { ultimoAdicionado, dispensarAviso } = useCart();
  const vez = ultimoAdicionado?.vez ?? null;
  useEffect(() => {
    if (vez === null) return;
    let partida: number | null = null;
    const espera = window.setTimeout(() => {
      partida = window.scrollY;
    }, 400);
    const aoRolar = () => {
      if (partida !== null && Math.abs(window.scrollY - partida) > 120) dispensarAviso(vez);
    };
    const aoTocar = (e: PointerEvent) => {
      const alvo = e.target instanceof Element ? e.target : null;
      const aviso = alvo?.closest("[role='status'][aria-live='polite']");
      if (aviso && alvo?.closest("button, a[href]")) return;
      // Outro "+" adicionando: o aviso novo substitui este.
      if (alvo?.closest("[data-sacola-peca]")) return;
      dispensarAviso(vez);
    };
    window.addEventListener("scroll", aoRolar, { passive: true });
    document.addEventListener("pointerdown", aoTocar, true);
    return () => {
      window.clearTimeout(espera);
      window.removeEventListener("scroll", aoRolar);
      document.removeEventListener("pointerdown", aoTocar, true);
    };
  }, [vez, dispensarAviso]);
  return null;
}
