import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import Trilha from "@/components/v3/loja/Trilha";
import { WA_ORCAMENTO } from "@/components/home/textos";
import { BOTAO_CONTORNO, BOTAO_PRINCIPAL } from "@/components/v3/estrutura/estilo";

export const metadata: Metadata = {
  title: "Como encomendar · Gio Handmade",
  description: "Escolha, pagamento com sinal de 50%, medidas, confecção à mão e envio. Pix ou cartão.",
};

// Como encomendar (versão 4): os passos como pranchas numeradas, em menos de
// 200 palavras. As regras são as mesmas do site (sinal, 72 horas, vídeo das
// medidas, prazo em cada peça); só o caminho da compra passou a ser no site.
const PASSOS = [
  {
    titulo: "Escolha",
    texto: "Na loja, escolha a peça e se ela vai sob medida ou pronta entrega. Quer algo diferente? Mande uma referência pelo WhatsApp.",
  },
  {
    titulo: "Pagamento",
    texto:
      "Pix ou cartão, aqui no site. Sob medida começa com o sinal de 50%, que não é reembolsável em caso de desistência. Se preferir, pague tudo de uma vez.",
  },
  {
    titulo: "Medidas",
    texto: "Busto, cintura e quadril, na compra. Ou mande depois: a Gio manda um vídeo explicando como medir.",
  },
  {
    titulo: "Confecção",
    texto: "A peça é bordada à mão, um a um. O prazo aparece em cada peça e conta a partir do sinal.",
  },
  {
    titulo: "Envio",
    texto:
      "O frete é calculado pelo CEP. O saldo vence em até 72 horas após a data combinada para envio ou retirada; depois disso, a peça é colocada à venda.",
  },
];

const NUMERAIS = ["I", "II", "III", "IV", "V"];

export default function ComoEncomendar() {
  return (
    <main className="min-h-screen bg-[#EDE7D9] text-[#1B4965]">
      <Header />

      <div className="mx-auto max-w-[1120px] px-4 pb-16 pt-3 md:grid md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:gap-16 md:px-8 md:pb-24 md:pt-8">
        <div className="relative hidden overflow-hidden bg-[#1B4965]/5 md:block md:aspect-[3/4] md:self-start">
          <Image
            src="/colecao/conjunto-selene-2.jpg"
            alt="Conjunto Selene bordado com pedras azuis e lilases, de perto"
            fill
            sizes="50vw"
            loading="eager"
            className="object-cover object-[50%_35%]"
          />
        </div>

        <div className="md:max-w-[480px]">
          <Trilha itens={[{ rotulo: "Início", href: "/" }, { rotulo: "Como encomendar" }]} />
          <h1 className="mt-2 font-serif text-[28px] leading-9 md:text-[34px] md:leading-[42px]">Como encomendar</h1>

          <ol className="mt-8 space-y-6">
            {PASSOS.map((passo, i) => (
              <li key={passo.titulo} className="grid grid-cols-[32px_1fr] gap-x-3 border-t border-[#1B4965]/15 pt-5">
                <span aria-hidden className="nums-preco font-serif text-[15px] leading-7 tracking-[0.08em] text-brand-muted">
                  {NUMERAIS[i]}
                </span>
                <div>
                  <h2 className="font-serif text-[20px] italic leading-7">{passo.titulo}</h2>
                  <p className="mt-1 text-[14px] leading-[22px]">{passo.texto}</p>
                </div>
              </li>
            ))}
          </ol>

          <div className="mt-10 grid gap-3 sm:grid-cols-2">
            <Link href="/loja" className={BOTAO_PRINCIPAL}>
              Ver a loja
            </Link>
            <a href={WA_ORCAMENTO} target="_blank" rel="noopener noreferrer" className={BOTAO_CONTORNO}>
              Falar no WhatsApp
            </a>
          </div>
        </div>
      </div>

      <Footer />
      <WhatsAppButton />
    </main>
  );
}
