import Image from "next/image";
import Link from "next/link";
import { BOTAO_CONTORNO, BOTAO_PRINCIPAL } from "@/components/v3/estrutura/estilo";
import Legenda from "../peca/Legenda";

// Home da versão 4: um ensaio de quatro fotos grandes em sequência, cada uma
// uma prancha que leva à peça, e uma linha de texto no fim. Celular: uma foto
// por tela (a primeira ocupa a tela toda). Computador: duas por vez.
const FOTOS = [
  {
    src: "/colecao/top-maya-2.jpg",
    href: "/loja/top-maya",
    nome: "Top Maya",
    alt: "Modelo com o Top Maya, bordado em tons de marrom e dourado",
    posicao: "50% 0%",
  },
  {
    src: "/campanha/brilho-tropical-07.jpg",
    href: "/loja/top-floresce",
    nome: "Top Floresce",
    alt: "Modelo com o Top Floresce, de miçangas verdes e amarelas",
    posicao: "50% 35%",
  },
  {
    src: "/colecao/solaris-top-perla-4.jpg",
    href: "/loja/solaris-top-perla",
    nome: "Top Perla",
    alt: "Modelo com o Top Perla, de pérolas brancas",
    posicao: "50% 30%",
  },
  {
    src: "/colecao/solaris-top-noir-3.jpg",
    href: "/loja/solaris-top-noir",
    nome: "Top Noir",
    alt: "Modelo com o Top Noir, de miçangas pretas e cristais",
    posicao: "50% 30%",
  },
];

const NUMERAIS = ["I", "II", "III", "IV"];

export default function Ensaio() {
  return (
    <>
      <h1 className="sr-only">Gio Handmade: tops, conjuntos e acessórios bordados à mão</h1>
      <ul className="grid gap-y-2 md:grid-cols-2 md:gap-x-2">
        {FOTOS.map((f, i) => (
          <li key={f.src}>
            <Link
              href={f.href}
              className="group block text-[#1B4965] outline-offset-[-3px] focus-visible:outline-2 focus-visible:outline-[#b8902a]"
            >
              <span
                className={`relative block overflow-hidden bg-[#1B4965]/5 ${
                  i === 0 ? "h-[calc(100svh-60px-44px)] min-h-[460px]" : "aspect-[4/5]"
                } md:aspect-auto md:h-[calc(100svh-76px-44px)] md:min-h-[520px]`}
              >
                <Image
                  src={f.src}
                  alt={f.alt}
                  fill
                  sizes="(min-width: 768px) 50vw, 100vw"
                  priority={i < 2}
                  style={{ objectPosition: f.posicao }}
                  className="object-cover transition-opacity duration-200 group-hover:opacity-90 motion-reduce:transition-none"
                />
              </span>
              <Legenda numeral={NUMERAIS[i]} titulo={f.nome} seta className="px-4 md:px-6" />
            </Link>
          </li>
        ))}
      </ul>

      <section aria-label="Gio Handmade" className="px-4 pb-14 pt-12 text-center text-[#1B4965] md:pb-24 md:pt-20">
        <p className="font-serif text-[26px] italic leading-8 md:text-[36px] md:leading-[44px]">Bordado à mão, um a um, em Belém.</p>
        <div className="mx-auto mt-7 grid max-w-[520px] grid-cols-2 gap-2 md:gap-3">
          <Link href="/loja" className={BOTAO_PRINCIPAL.replace("px-6", "px-3")}>
            Ver a loja
          </Link>
          <Link href="/loja?ver=pronta-entrega" className={BOTAO_CONTORNO.replace("px-6", "px-3")}>
            Pronta entrega
          </Link>
        </div>
      </section>
    </>
  );
}
