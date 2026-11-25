import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Finalizar from "@/components/v4/finalizar/Finalizar";
import { FOCO, HOVER } from "@/components/v3/estrutura/estilo";

export const metadata: Metadata = {
  title: "Finalizar compra · Gio Handmade",
  robots: { index: false },
};

// Checkout dentro do site. Cabeçalho próprio e enxuto (sem menu, busca nem
// sacola): o logo e o caminho de volta para a loja.
export default function FinalizarPage() {
  return (
    <main className="min-h-screen bg-[#EDE7D9] text-[#1B4965]">
      <header className="relative flex h-[60px] items-center justify-center border-b border-[#1B4965]/15 md:h-[76px]">
        <Link
          href="/loja"
          className={`absolute left-2 top-1/2 flex min-h-11 -translate-y-1/2 items-center gap-1 rounded-[4px] px-2 text-[12px] md:left-6 ${HOVER} ${FOCO}`}
        >
          <svg aria-hidden viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.5}>
            <path d="M15 5 8 12l7 7" />
          </svg>
          Loja
        </Link>
        <Link href="/" aria-label="Gio Handmade, página inicial" className={`rounded-[4px] ${FOCO}`}>
          <Image src="/logo-navy.png" alt="Gio Handmade" width={1200} height={856} priority sizes="62px" className="h-9 w-auto md:h-11" />
        </Link>
      </header>
      <Finalizar />
    </main>
  );
}
