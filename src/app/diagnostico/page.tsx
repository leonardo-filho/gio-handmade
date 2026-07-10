import type { Metadata } from "next";
import DiagnosticoForm from "@/components/diagnostico/DiagnosticoForm";

// Página interna (fora da navegação e fora dos buscadores): formulário de
// diagnóstico do negócio que a Gio preenche e envia pro Leonardo via WhatsApp.
export const metadata: Metadata = {
  title: "Diagnóstico · Gio Handmade",
  robots: { index: false, follow: false },
};

export default function DiagnosticoPage() {
  return <DiagnosticoForm />;
}
