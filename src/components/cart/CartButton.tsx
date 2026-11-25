"use client";

import { useCart } from "./CartProvider";
import { IconeSacola } from "../v3/estrutura/Icones";
import { FOCO, HOVER } from "../v3/estrutura/estilo";

// Sacola do cabeçalho: ícone de 22 px com o número de peças dentro do corpo
// da sacola (como na AL.TER). O número só entra depois da hidratação, porque o
// carrinho mora no localStorage e o servidor não o conhece.
export default function CartButton({ className = "" }: { className?: string }) {
  const { count, open, hydrated } = useCart();
  const mostra = hydrated && count > 0;
  const numero = count > 9 ? "9+" : String(count);

  return (
    <button
      type="button"
      onClick={open}
      // data-cart-button: a sacola devolve o foco para cá ao fechar quando
      // quem a abriu já saiu da tela.
      data-cart-button=""
      aria-haspopup="dialog"
      aria-label={mostra ? `Abrir sacola, ${count} ${count === 1 ? "peça" : "peças"}` : "Abrir sacola"}
      className={`relative flex h-11 w-11 items-center justify-center rounded-[4px] text-[#1B4965] ${HOVER} ${FOCO} ${className}`}
    >
      <IconeSacola className="h-[22px] w-[22px]" />
      {mostra && (
        <span
          aria-hidden
          className="nums-preco absolute left-1/2 top-[24px] -translate-x-1/2 -translate-y-1/2 text-[10px] leading-none tracking-[-0.02em]"
        >
          {numero}
        </span>
      )}
    </button>
  );
}
