"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/components/cart/CartProvider";
import { FOCO, HOVER, LINHA } from "@/components/v3/estrutura/estilo";
import { IconeVoltar } from "../icones";

// Cabeçalho do checkout: "Sacola" à esquerda (abre a gaveta para editar), o
// logo no centro e nada mais. A sacola devolve o foco para o botão marcado
// com data-cart-button.
export default function CabecalhoCheckout() {
  const { open } = useCart();
  return (
    <header className={`relative flex h-[60px] items-center border-b px-1.5 md:h-[76px] md:px-4 lg:px-6 ${LINHA}`}>
      <button
        type="button"
        onClick={open}
        data-cart-button=""
        className={`flex h-11 items-center gap-1 rounded-[4px] px-2 text-[12px] ${HOVER} ${FOCO}`}
      >
        <IconeVoltar className="h-5 w-5" />
        Sacola
      </button>
      <Link
        href="/"
        aria-label="Gio Handmade, página inicial"
        className={`absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center rounded-[4px] p-1 ${FOCO}`}
      >
        <Image src="/logo-navy.png" alt="Gio Handmade" width={1200} height={856} priority sizes="(min-width: 768px) 62px, 51px" className="h-9 w-auto md:h-11" />
      </Link>
    </header>
  );
}
