import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import Ensaio from "@/components/v4/home/Ensaio";

// Home da versão 4 (lookbook): o ensaio de quatro fotos, uma linha de texto e
// o rodapé. Sem carrossel, sem portas de categoria e sem animação de entrada.
export default function Home() {
  return (
    <>
      <Header />
      <main className="bg-[#EDE7D9] text-[#1B4965]">
        <Ensaio />
      </main>
      <Footer />
      <WhatsAppButton />
    </>
  );
}
