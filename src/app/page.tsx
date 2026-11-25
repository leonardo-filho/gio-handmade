import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import Hero from "@/components/v3/home/Hero";
import ProntaEntrega from "@/components/v3/home/ProntaEntrega";
import Portas from "@/components/v3/home/Portas";
import QuemFaz from "@/components/v3/home/QuemFaz";
import DePerto from "@/components/v1/home/DePerto";

// Home da versão 1, "Vitrine": cinco blocos enxutos (hero parado, pronta
// entrega, quatro portas de categoria, o bordado de perto e quem faz) e o
// rodapé. Sem rolagem suave, sem 3D e sem entrada animada.
export default function Home() {
  return (
    <>
      <Header />
      <main className="bg-[#EDE7D9] text-[#1B4965]">
        <Hero />
        <ProntaEntrega />
        <Portas />
        <DePerto />
        <QuemFaz />
      </main>
      <Footer />
      <WhatsAppButton />
    </>
  );
}
