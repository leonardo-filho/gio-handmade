import Link from "next/link";
import Foto from "@/components/v3/home/Foto";
import SetaTexto from "@/components/v3/home/SetaTexto";
import { IconeVerDePerto } from "../icones";

// Bloco "De perto" da home: um close do bordado do Top Maya e o caminho para
// a peça, onde o "Ver de perto" deixa percorrer o bordado com o dedo ou o
// mouse. Celular: foto quadrada de borda a borda e o texto embaixo.
// Computador: foto 3:2 em três quintos da largura e o texto ao lado.
export default function DePerto() {
  return (
    <section aria-labelledby="de-perto-titulo" className="pb-14 md:grid md:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] md:items-center md:gap-4 md:pb-[72px]">
      <Link
        href="/loja/top-maya"
        tabIndex={-1}
        aria-hidden
        className="group relative block aspect-square md:aspect-[3/2]"
      >
        <Foto
          src="/colecao/top-maya.jpg"
          alt=""
          sizes="(min-width: 768px) 108vw, 180vw"
          foco="46% 44%"
          zoom={1.8}
        />
        <span className="absolute bottom-3 right-3 flex h-8 items-center gap-1.5 rounded-full bg-[#EDE7D9] pl-2.5 pr-3 text-[10px] uppercase leading-none tracking-[0.14em] text-[#1B4965] shadow-[0_1px_3px_rgb(19_2_9/0.18)]">
          <IconeVerDePerto className="h-4 w-4" />
          Ver de perto
        </span>
      </Link>

      <div className="px-4 pt-6 text-center md:px-12 md:pt-0">
        <h2 id="de-perto-titulo" className="text-balance font-[family-name:var(--font-serif)] text-[22px] font-normal leading-[26px] md:text-[32px] md:leading-10">
          O bordado, de perto
        </h2>
        <p className="mx-auto mt-3 max-w-[360px] text-pretty text-[14px] leading-[22px]">
          Top Maya, bordado à mão com mais de 2.500 miçangas.
        </p>
        <Link
          href="/loja/top-maya"
          className="mt-2 inline-flex min-h-11 items-center gap-2 text-[12px] uppercase tracking-[0.16em] transition-opacity duration-200 hover:opacity-70 focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-[#b8902a] motion-reduce:transition-none"
        >
          Ver a peça
          <SetaTexto />
        </Link>
      </div>
    </section>
  );
}
