import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import { PASSOS, WA_ORCAMENTO } from "@/components/home/textos";
import { BOTAO_CONTORNO, BOTAO_PRINCIPAL, FOCO, HOVER } from "@/components/v3/estrutura/estilo";
import Silhueta from "@/components/v2/provador/Silhueta";
import { CAMPOS, COMO_MEDIR, NOME_CAMPO } from "@/lib/v2/medidasRascunho";

// Pagamento como o checkout desta versão faz (sem o link de 12x com juros,
// que o checkout dentro do site não tem).
const PAGAMENTO = [
  { titulo: "Pix", texto: "Sem acréscimos: o menor valor de cada peça." },
  { titulo: "Cartão", texto: "Sem juros nas parcelas indicadas em cada peça." },
  { titulo: "Sob medida", texto: "Sinal de 50% ou tudo de uma vez." },
] as const;

export const metadata: Metadata = {
  title: "Como encomendar · Gio Handmade",
  description: "Do pedido à entrega: referência, sinal de 50%, medidas no provador ou por vídeo e confecção à mão. Pix ou cartão.",
};

// Como encomendar: os passos, como medir (com o manequim do provador) e o
// pagamento, em lista simples, perto de 200 palavras. É o destino do link da
// home, do menu e do rodapé. Os passos e o pagamento vêm de
// components/home/textos.ts (o mesmo texto do site atual).
export default function ComoEncomendar() {
  return (
    <main className="min-h-screen bg-[#EDE7D9] text-[#1B4965]">
      <Header />

      <div className="mx-auto max-w-[640px] px-4 pb-16 pt-4 md:pb-20 md:pt-8">
        <nav aria-label="Trilha" className="flex min-h-11 items-center text-[12px] text-brand-muted">
          <Link href="/" className={`inline-flex min-h-11 items-center rounded-[4px] ${HOVER} ${FOCO}`}>
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

        <h2 className="mt-12 font-[family-name:var(--font-serif)] text-[22px] leading-[1.25]">Como medir</h2>
        <div className="mt-4 flex items-center gap-5">
          <Silhueta medidas={{ busto: 86, cintura: 68, quadril: 96 }} ativo={null} className="h-[160px] w-[98px] shrink-0" />
          <dl className="space-y-3">
            {CAMPOS.map((c) => (
              <div key={c}>
                <dt className="font-[family-name:var(--font-serif)] text-[18px] leading-[24px]">{NOME_CAMPO[c]}</dt>
                <dd className="text-[14px] leading-[22px]">{COMO_MEDIR[c]}</dd>
              </div>
            ))}
          </dl>
        </div>
        <p className="mt-4 text-[14px] leading-[22px]">O provador de cada peça mostra o seu tamanho de referência.</p>

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
