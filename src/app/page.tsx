import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import ProntaEntrega from "@/components/v3/home/ProntaEntrega";
import QuemFaz from "@/components/v3/home/QuemFaz";
import Categorias from "@/components/v2/home/Categorias";
import Destaque from "@/components/v2/home/Destaque";

// Home da versão 2 (Provador), enxuta: uma peça em destaque, grande, a
// pronta entrega, as categorias e quem faz. Sem animação de entrada.
export default function Home() {
  return (
    <>
      <Header />
      <main className="bg-[#EDE7D9] text-[#1B4965]">
        <Destaque />
        <ProntaEntrega />
        <Categorias />
        <div className="pt-10 md:pt-14">
          <QuemFaz />
        </div>
      </main>
      <Footer />
      <WhatsAppButton />
    </>
  );
}
