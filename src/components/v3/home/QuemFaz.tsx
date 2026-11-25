import Link from "next/link";
import { QUEM_FAZ } from "./conteudo";
import SetaTexto from "./SetaTexto";

// Quem faz: título, um parágrafo curto (de AboutSection) e o caminho para
// entender a encomenda. Sem foto e sem animação.
export default function QuemFaz() {
  return (
    <section aria-labelledby="quem-faz-titulo" className="px-4 pb-14 text-center md:pb-[72px]">
      <h2
        id="quem-faz-titulo"
        className="text-balance font-[family-name:var(--font-serif)] text-[22px] font-normal leading-[26px] text-[#1B4965]"
      >
        {QUEM_FAZ.titulo}
      </h2>
      <p className="mx-auto mt-4 max-w-[560px] text-pretty text-[14px] leading-[22px] text-[#1B4965]">{QUEM_FAZ.texto}</p>
      <Link
        href="/como-encomendar"
        className="mt-2 inline-flex min-h-11 items-center gap-2 text-[12px] uppercase tracking-[0.16em] text-[#1B4965] transition-opacity duration-200 hover:opacity-70 focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-[#b8902a] motion-reduce:transition-none"
      >
        Como funciona a encomenda
        <SetaTexto />
      </Link>
    </section>
  );
}
