"use client";

import { useState } from "react";
import { useCart, type CartItem } from "./CartProvider";

type Props = {
  item: CartItem;
  className?: string;
  label?: string;
  /**
   * Rótulo curto para o celular (ex.: "Adicionar"). Quando vem, o botão fica
   * sempre numa linha, com 44 px de altura mínima e 12 px de texto: o rótulo
   * curto aparece abaixo de 640 px e o `label` a partir daí. O nome da peça
   * entra só para leitor de tela ("Adicionar ao carrinho: Top Solaris"), para
   * cada botão da vitrine ter um nome próprio. Sem `labelCurto`, o botão fica
   * exatamente como antes.
   */
  labelCurto?: string;
};

export default function AddToCartButton({
  item,
  className = "",
  label = "Adicionar ao carrinho",
  labelCurto,
}: Props) {
  const { add } = useCart();
  const [added, setAdded] = useState(false);
  const compacto = labelCurto !== undefined;

  function onAdd(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    add(item);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1400);
  }

  const medidas = compacto
    ? "min-h-11 whitespace-nowrap px-3 py-2 text-xs tracking-[0.1em] sm:px-4 sm:tracking-[0.14em]"
    : "px-5 py-3 text-[11px] tracking-[0.18em]";

  return (
    <button
      type="button"
      onClick={onAdd}
      className={`inline-flex items-center justify-center gap-2 rounded-sm bg-[#1B4965] font-bold uppercase text-[#EDE7D9] transition-colors duration-300 hover:bg-[#130209] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1B4965] focus-visible:ring-offset-2 focus-visible:ring-offset-[#EDE7D9] ${medidas} ${className}`}
    >
      {added ? (
        <>
          <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" d="M20 6 9 17l-5-5" />
          </svg>
          Adicionado
        </>
      ) : compacto ? (
        <>
          <span className="sm:hidden">{labelCurto}</span>
          <span className="hidden sm:inline">{label}</span>
          <span className="sr-only">{`: ${item.nome}`}</span>
        </>
      ) : (
        label
      )}
    </button>
  );
}
