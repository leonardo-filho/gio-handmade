import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import { WA_SEU_JEITO } from "@/components/home/textos";
import { BOTAO_CONTORNO, BOTAO_PRINCIPAL, FOCO, HOVER, LINHA } from "@/components/v3/estrutura/estilo";

export const metadata: Metadata = {
  title: "Como encomendar · Gio Handmade",
  description: "Escolha a peça, informe as medidas, pague o sinal de 50% e receba a peça feita à mão. Pix ou cartão.",
};

// Como encomendar da versão 1: os quatro passos da compra pelo site (com o
// checkout dentro dele), o pagamento e o caminho para a peça do seu jeito.
// Menos de 200 palavras. As regras são as que o site já tinha (sinal de
// 50%, saldo em até 72 horas, prazo a partir do sinal), sem promessa nova.

const PASSOS = [
  {
    titulo: "Escolha a peça",
    texto: "Na loja, escolha sob medida ou pronta entrega. A pronta entrega já está finalizada, com envio imediato.",
  },
  {
    titulo: "Suas medidas",
    texto: "Informe busto, cintura e quadril na página da peça ou ao finalizar a compra. Se preferir, a Gio manda um vídeo mostrando como medir.",
  },
  {
    titulo: "Sinal de 50%",
    texto:
      "A confecção começa com o sinal, no Pix ou no cartão. Ele não é reembolsável em caso de desistência. O saldo vence em até 72 horas após a data combinada para envio ou retirada.",
  },
  {
    titulo: "Feita à mão para você",
    texto: "O prazo de cada peça aparece na página dela e conta a partir do sinal. O frete é calculado pelo CEP.",
  },
];

const PAGAMENTO = [
  { titulo: "Pix", texto: "O menor valor de cada peça." },
  { titulo: "Cartão", texto: "Sem juros nas parcelas indicadas em cada peça." },
];

export default function ComoEncomendar() {
  return (
    <main className="min-h-screen bg-[#EDE7D9] text-[#1B4965]">
      <Header />

      <div className="mx-auto max-w-[640px] px-4 pb-16 pt-4 md:pb-20 md:pt-8">
        <nav aria-label="Você está em" className="flex min-h-11 items-center text-[12px] text-brand-muted">
          <Link href="/" className={`-mx-1 inline-flex min-h-11 items-center rounded-[4px] px-1 ${HOVER} ${FOCO}`}>
            Início
          </Link>
          <span aria-hidden className="px-1.5">
            ·
          </span>
          <span aria-current="page">Como encomendar</span>
        </nav>
        <h1 className="font-[family-name:var(--font-serif)] text-[26px] leading-[1.2] md:text-[30px]">Como encomendar</h1>

        <ol className={`mt-6 border-t ${LINHA}`}>
          {PASSOS.map((passo, i) => (
            <li key={passo.titulo} className={`grid grid-cols-[32px_1fr] gap-x-3 border-b py-5 ${LINHA}`}>
              <span aria-hidden className="nums-preco font-[family-name:var(--font-serif)] text-[22px] leading-7 text-brand-muted">
                {i + 1}
              </span>
              <div>
                <h2 className="font-[family-name:var(--font-serif)] text-[20px] leading-7">{passo.titulo}</h2>
                <p className="mt-1 text-[14px] leading-[22px]">{passo.texto}</p>
              </div>
            </li>
          ))}
        </ol>

        <h2 className="mt-10 text-[11px] uppercase tracking-[0.16em]">Pagamento</h2>
        <dl className="mt-3 grid gap-3 sm:grid-cols-2">
          {PAGAMENTO.map((forma) => (
            <div key={forma.titulo} className={`rounded-[4px] border px-4 py-3 ${LINHA}`}>
              <dt className="font-[family-name:var(--font-serif)] text-[18px] leading-[26px]">{forma.titulo}</dt>
              <dd className="text-[13px] leading-5">{forma.texto}</dd>
            </div>
          ))}
        </dl>

        <p className="mt-10 text-[14px] leading-[22px]">
          Quer a peça do seu jeito, com outras cores?{" "}
          <a href={WA_SEU_JEITO} target="_blank" rel="noopener noreferrer" className={`rounded-[4px] underline underline-offset-4 ${HOVER} ${FOCO}`}>
            Fale com a Gio no WhatsApp
          </a>
          .
        </p>

        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          <Link href="/loja" className={BOTAO_PRINCIPAL}>
            Ver a loja
          </Link>
          <Link href="/loja?ver=pronta-entrega" className={BOTAO_CONTORNO}>
            Pronta entrega
          </Link>
        </div>
      </div>

      <Footer />
      <WhatsAppButton />
    </main>
  );
}
