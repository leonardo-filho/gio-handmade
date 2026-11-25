import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import Hero from "@/components/v3/home/Hero";
import ProntaEntrega from "@/components/v3/home/ProntaEntrega";
import VitrineRelevo from "@/components/v3/home/VitrineRelevo";
import Portas from "@/components/v3/home/Portas";
import QuemFaz from "@/components/v3/home/QuemFaz";

// Home v3 (Argon - Atelie de Luz e Relevo):
// Hero atemporal parado, pronta entrega, janela autoral da Mesa de Luz &
// Relevo 3D do Top Maya, quatro portas de categoria e quem faz.
export default function Home() {
  return (
    <>
      <Header />
      <main className="bg-[#EDE7D9] text-[#1B4965]">
        <Hero />
        <ProntaEntrega />
        <VitrineRelevo />
        <Portas />
        <QuemFaz />
      </main>
      <Footer />
      <WhatsAppButton />
    </>
  );
}
