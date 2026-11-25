"use client";

import Image from "next/image";
import Link from "next/link";
import CartButton from "./cart/CartButton";
import { useGavetas } from "./v3/estrutura/Gavetas";
import { IconeLupa, IconeMenu } from "./v3/estrutura/Icones";
import { FOCO, HOVER } from "./v3/estrutura/estilo";

// Cabeçalho (versão 2): a barra creme, presa ao rolar, sem encolher, sem
// linha e sem sombra (60 px no celular e 76 px do md para cima). A faixa de
// "frete grátis acima de R$ 600" saiu: o checkout desta versão calcula o
// frete pelo CEP (lib/frete.ts) e a faixa prometeria outra coisa.
//
// Toda a navegação fica atrás do hambúrguer, até no desktop: à esquerda o
// menu e a lupa (os dois abrem a gaveta da esquerda), no centro o logo e à
// direita só a sacola.
//
// Uso: a página põe <Header /> como filho direto do <main>, antes de tudo.
// Ele entra no fluxo (não é fixed), então a página não precisa de espaço em
// cima. O <main> não pode ter overflow hidden (overflow-x-clip serve), senão
// a barra deixa de ficar presa.
export default function Header() {
  const { aberta, modo, abrirMenu, abrirBusca } = useGavetas();

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-[#EDE7D9] text-[#1B4965]">
        <div className="relative flex h-[60px] items-center justify-between px-1.5 md:h-[76px] md:px-4 lg:px-6">
          <div className="flex items-center">
            <button
              type="button"
              onClick={abrirMenu}
              aria-haspopup="dialog"
              aria-expanded={aberta && modo === "menu"}
              aria-label="Abrir menu"
              className={`flex h-11 min-w-11 items-center justify-center gap-2 rounded-[4px] px-[11px] ${HOVER} ${FOCO}`}
            >
              <IconeMenu className="h-[22px] w-[22px] shrink-0" />
              <span aria-hidden className="hidden text-[12px] leading-none md:inline">
                Menu
              </span>
            </button>
            <button
              type="button"
              onClick={abrirBusca}
              aria-haspopup="dialog"
              aria-expanded={aberta && modo === "busca"}
              aria-label="Buscar peças"
              className={`flex h-11 w-11 items-center justify-center rounded-[4px] ${HOVER} ${FOCO}`}
            >
              <IconeLupa className="h-5 w-5" />
            </button>
          </div>

          <Link
            href="/"
            aria-label="Gio Handmade, página inicial"
            className={`absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center rounded-[4px] px-1 py-1 md:py-0 ${FOCO}`}
          >
            <Image
              src="/logo-navy.png"
              alt="Gio Handmade"
              width={1200}
              height={856}
              priority
              // 36 px de altura no celular (50 px de largura) e 44 px do md para cima (62 px).
              sizes="(min-width: 768px) 62px, 51px"
              className="h-9 w-auto md:h-11"
            />
          </Link>

          <CartButton />
        </div>
      </header>
    </>
  );
}
