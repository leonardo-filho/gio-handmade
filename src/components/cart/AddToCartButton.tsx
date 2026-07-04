"use client";

import { useState } from "react";
import { useCart, type CartItem } from "./CartProvider";

type Props = {
  item: CartItem;
  className?: string;
  label?: string;
};

export default function AddToCartButton({ item, className = "", label = "Adicionar ao carrinho" }: Props) {
  const { add } = useCart();
  const [added, setAdded] = useState(false);

  function onAdd(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    add(item);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1400);
  }

  return (
    <button
      type="button"
      onClick={onAdd}
      className={`inline-flex items-center justify-center gap-2 rounded-sm bg-[#1B4965] px-5 py-3 text-[11px] font-bold uppercase tracking-[0.18em] text-[#EDE7D9] transition-colors duration-300 hover:bg-[#130209] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1B4965] focus-visible:ring-offset-2 focus-visible:ring-offset-[#EDE7D9] ${className}`}
    >
      {added ? (
        <>
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" d="M20 6 9 17l-5-5" />
          </svg>
          Adicionado
        </>
      ) : (
        label
      )}
    </button>
  );
}
