import type { Metadata } from "next";
import Checkout from "@/components/v2/checkout/Checkout";

export const metadata: Metadata = {
  title: "Finalizar compra · Gio Handmade",
  robots: { index: false },
};

// Checkout dentro do site (versão 2). Tudo acontece no cliente: a sacola mora
// no aparelho e o pagamento é o do provedor (hoje, o de demonstração).
export default function CheckoutPage() {
  return <Checkout />;
}
