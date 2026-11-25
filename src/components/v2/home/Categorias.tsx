import Link from "next/link";
import Foto from "@/components/v3/home/Foto";
import { PORTAS } from "./conteudo";

// Categorias da home: quatro retratos 3:4 com o nome embaixo (sem texto por
// cima da foto, então o contraste não depende da foto). Celular: 2x2.
// Computador: 4 lado a lado.
export default function Categorias() {
  return (
    <nav aria-labelledby="categorias-titulo" className="px-4 pb-4 pt-14 md:px-8 md:pt-20 lg:px-12">
      <h2 id="categorias-titulo" className="mb-4 text-center font-[family-name:var(--font-serif)] text-[22px] leading-[26px] text-[#1B4965]">
        Categorias
      </h2>
      <ul className="grid grid-cols-2 gap-x-3 gap-y-5 md:grid-cols-4 md:gap-x-4">
        {PORTAS.map((porta) => (
          <li key={porta.slug}>
            <Link
              href={`/loja?ver=${porta.slug}`}
              className="group block text-[#1B4965] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#b8902a]"
            >
              <span className="relative block aspect-[3/4] overflow-hidden">
                <Foto src={porta.foto} alt="" sizes="(min-width: 768px) 25vw, 50vw" foco={porta.foco} />
              </span>
              <span className="mt-2 flex min-h-8 items-center justify-between font-[family-name:var(--font-serif)] text-[18px] leading-6 transition-opacity duration-200 group-hover:opacity-70 motion-reduce:transition-none">
                {porta.rotulo}
                <span aria-hidden className="text-[14px]">
                  →
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
