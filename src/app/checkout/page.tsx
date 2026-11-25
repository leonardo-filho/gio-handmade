import type { Metadata } from "next";
import Checkout from "@/components/v1/checkout/Checkout";
import CabecalhoCheckout from "@/components/v1/checkout/CabecalhoCheckout";

export const metadata: Metadata = {
  title: "Finalizar compra · Gio Handmade",
  description: "Seus dados, entrega, medidas e pagamento, em etapas curtas.",
  robots: { index: false },
};

// Checkout dentro do site. Cabeçalho mínimo (sem faixa, menu nem WhatsApp
// flutuante), como nas lojas grandes: só o logo e a volta para a sacola.
export default function CheckoutPage() {
  return (
    <main className="min-h-screen bg-[#EDE7D9] text-[#1B4965]">
      <CabecalhoCheckout />
      <Checkout />
    </main>
  );
}
