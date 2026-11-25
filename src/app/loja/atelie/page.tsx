import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SmoothScroll from "@/components/SmoothScroll";
import WhatsAppButton from "@/components/WhatsAppButton";
import Atelie from "@/components/proto/atelie/Atelie";

// Protótipo da loja na direção "Ateliê" (o bordado de perto, com lupa).
export const metadata: Metadata = {
  title: "Ateliê · Gio Handmade",
  description:
    "Peças feitas à mão, ponto a ponto. Veja o bordado de perto, monte seu carrinho e finalize pelo WhatsApp.",
};

export default function AtelieLojaPage() {
  return (
    <main className="min-h-screen bg-[#EDE7D9]">
      <a
        href="#pecas"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:flex focus:min-h-11 focus:items-center focus:rounded-full focus:bg-[#1B4965] focus:px-5 focus:py-3 focus:text-xs focus:font-bold focus:uppercase focus:tracking-[0.18em] focus:text-[#EDE7D9] focus:outline-none focus:ring-2 focus:ring-[#b8902a] focus:ring-offset-2"
      >
        Pular para as peças
      </a>
      <SmoothScroll />
      <Header />
      <div className="pt-[var(--header-h-topo,102px)] md:pt-[var(--header-h-topo,109px)]">
        <Atelie />
      </div>
      <Footer />
      <WhatsAppButton />
    </main>
  );
}
