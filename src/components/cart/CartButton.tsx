"use client";

import { useCart } from "./CartProvider";

export default function CartButton({ className = "" }: { className?: string }) {
  const { count, open, hydrated } = useCart();

  return (
    <button
      type="button"
      onClick={open}
      aria-label={`Abrir carrinho${count > 0 ? ` (${count} ${count === 1 ? "item" : "itens"})` : ""}`}
      className={`relative flex h-10 w-10 items-center justify-center rounded-full text-[#1B4965] transition-colors hover:bg-[#1B4965]/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1B4965]/50 ${className}`}
    >
      <svg
        className="h-5 w-5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.6}
        aria-hidden
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"
        />
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 6h18" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 10a4 4 0 0 1-8 0" />
      </svg>

      {hydrated && count > 0 && (
        <span className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[#1B4965] px-1 text-[10px] font-bold leading-none text-[#EDE7D9] ring-2 ring-[#EDE7D9]">
          {count}
        </span>
      )}
    </button>
  );
}
