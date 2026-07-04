import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Vitrine from "@/components/Vitrine";
import SmoothScroll from "@/components/SmoothScroll";
import WhatsAppButton from "@/components/WhatsAppButton";

export const metadata: Metadata = {
  title: "Loja · Gio Handmade",
  description:
    "Vitrine completa da Gio Handmade. Monte seu carrinho, calcule o frete e finalize pelo WhatsApp. Peças feitas à mão em Belém.",
};

export default function LojaPage() {
  return (
    <main className="min-h-screen bg-white">
      <SmoothScroll />
      <Header />
      <div className="pt-24 md:pt-28">
        <Vitrine />
      </div>
      <Footer />
      <WhatsAppButton />
    </main>
  );
}
