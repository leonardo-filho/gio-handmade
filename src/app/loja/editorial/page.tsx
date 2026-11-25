import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SmoothScroll from "@/components/SmoothScroll";
import WhatsAppButton from "@/components/WhatsAppButton";
import LojaEditorial from "@/components/proto/editorial/LojaEditorial";

export const metadata: Metadata = {
  title: "Loja · Gio Handmade",
  description:
    "Tops, conjuntos, saias, vestidos e headpieces bordados à mão, um a um, em Belém. Monte seu carrinho e finalize pelo WhatsApp.",
};

// Protótipo da direção "editorial" da loja (revista de moda).
export default function LojaEditorialPage() {
  return (
    <main className="min-h-screen bg-[#EDE7D9]">
      {/* Primeiro foco da página: pula o header e a capa e vai para o sumário. */}
      <a
        href="#pecas"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:flex focus:min-h-11 focus:items-center focus:rounded-sm focus:bg-[#1B4965] focus:px-5 focus:py-3 focus:text-xs focus:font-bold focus:uppercase focus:tracking-[0.18em] focus:text-[#EDE7D9] focus:outline-none focus:ring-2 focus:ring-[#b8902a] focus:ring-offset-2"
      >
        Pular para as peças
      </a>
      <SmoothScroll />
      <Header />
      {/* Espaço do header fixo (a altura que o próprio Header publica). */}
      <div className="pt-[var(--header-h-topo,102px)] md:pt-[var(--header-h-topo,109px)]">
        <LojaEditorial />
      </div>
      <Footer />
      <WhatsAppButton />
    </main>
  );
}
