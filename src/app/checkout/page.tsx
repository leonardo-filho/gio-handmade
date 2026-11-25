import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FluxoCheckout from "@/components/v3/checkout/FluxoCheckout";
import Trilha from "@/components/v3/loja/Trilha";

export const metadata: Metadata = {
  title: "Finalizar pedido · Gio Handmade",
  description: "Finalize seu pedido sob medida ou a pronta entrega em etapas curtas dentro do site.",
};

export default function CheckoutPage() {
  return (
    <main className="min-h-screen overflow-x-clip bg-[#EDE7D9] text-[#1B4965]">
      <Header />
      <div className="mx-auto max-w-[1120px] px-4 pt-3 md:pt-5">
        <Trilha
          itens={[
            { rotulo: "Início", href: "/" },
            { rotulo: "Loja", href: "/loja" },
            { rotulo: "Finalizar pedido" },
          ]}
        />
      </div>
      <FluxoCheckout />
      <Footer />
    </main>
  );
}
