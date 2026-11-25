import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import { PAGAMENTO, PASSOS, WA_ORCAMENTO } from "@/components/home/textos";
import { BOTAO_CONTORNO, BOTAO_PRINCIPAL, FOCO, HOVER } from "@/components/v3/estrutura/estilo";

export const metadata: Metadata = {
  title: "Como encomendar · Gio Handmade",
  description: "Do pedido à entrega: referência, sinal de 50%, medidas por vídeo e confecção à mão. Pix ou cartão.",
};

// Como encomendar (spec v3): os passos e o pagamento, em lista simples, com
// menos de 200 palavras. É o destino do link da home, do menu e do rodapé.
// Todo o texto vem de components/home/textos.ts (o mesmo do site atual).
export default function ComoEncomendar() {
  return (
    <main className="min-h-screen bg-[#EDE7D9] text-[#1B4965]">
      <Header />

      <div className="mx-auto max-w-[640px] px-4 pb-16 pt-4 md:pb-20 md:pt-8">
        <nav aria-label="Trilha" className="flex min-h-11 items-center text-[12px] text-brand-muted">
          <Link href="/" className={`rounded-[4px] ${HOVER} ${FOCO}`}>
            Início
          </Link>
          <span aria-hidden className="px-1.5">
            ·
          </span>
          <span aria-current="page">Como encomendar</span>
        </nav>
        <h1 className="font-[family-name:var(--font-serif)] text-[26px] leading-[1.2] md:text-[30px]">Como encomendar</h1>

        <ol className="mt-8 space-y-6">
          {PASSOS.map((passo, i) => (
            <li key={passo.titulo} className="grid grid-cols-[24px_1fr] gap-x-3">
              <span aria-hidden className="nums-preco font-[family-name:var(--font-serif)] text-[20px] leading-[28px]">
                {i + 1}
              </span>
              <div>
                <h2 className="font-[family-name:var(--font-serif)] text-[20px] leading-[28px]">{passo.titulo}</h2>
                <p className="mt-1 text-[14px] leading-[22px]">{passo.texto}</p>
              </div>
            </li>
          ))}
        </ol>

        <h2 className="mt-12 font-[family-name:var(--font-serif)] text-[22px] leading-[1.25]">Pagamento</h2>
        <dl className="mt-4 space-y-4">
          {PAGAMENTO.map((forma) => (
            <div key={forma.titulo}>
              <dt className="font-[family-name:var(--font-serif)] text-[18px] leading-[26px]">{forma.titulo}</dt>
              <dd className="text-[14px] leading-[22px]">{forma.texto}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-10 grid gap-3 sm:grid-cols-2">
          <Link href="/loja" className={BOTAO_PRINCIPAL}>
            Ver a loja
          </Link>
          <a href={WA_ORCAMENTO} target="_blank" rel="noopener noreferrer" className={BOTAO_CONTORNO}>
            Falar no WhatsApp
          </a>
        </div>
      </div>

      <Footer />
      <WhatsAppButton />
    </main>
  );
}
