import Link from "next/link";
import Foto from "./Foto";
import { PORTAS } from "./conteudo";
import SetaTexto from "./SetaTexto";

// Quatro portas de categoria, cada uma um close do bordado em 2:1, com o
// rótulo em caixa alta sobre um véu de tinta no terço de baixo. Celular:
// empilhadas (390x195, 12 px de vão). Computador: 2x2 (712x356, 16 px).
//
// O véu de 0 a 40% sozinho deixa o creme de 12 px abaixo de 4,5:1 em foto
// clara. Por isso, atrás do rótulo, uma sombra suave no canto inferior
// esquerdo (até 45% de tinta) completa o contraste AA sem escurecer a foto.
export default function Portas() {
  return (
    <nav aria-label="Categorias" className="py-14 md:py-[72px]">
      <ul className="grid gap-3 md:grid-cols-2 md:gap-4">
        {PORTAS.map((porta) => (
          <li key={porta.slug}>
            <Link
              href={`/loja?ver=${porta.slug}`}
              className="group relative block aspect-[2/1] focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-solid focus-visible:outline-[#b8902a]"
            >
              <Foto
                src={porta.foto}
                alt=""
                sizes={`(min-width: 768px) ${Math.ceil(50 * porta.zoom)}vw, ${Math.ceil(100 * porta.zoom)}vw`}
                foco={porta.foco}
                zoom={porta.zoom}
              />
              <span
                aria-hidden
                className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-[#130209]/40 to-transparent"
              />
              <span
                aria-hidden
                className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_240px_80px_at_0%_100%,rgb(19_2_9/0.45),transparent)] md:bg-[radial-gradient(ellipse_320px_90px_at_0%_100%,rgb(19_2_9/0.45),transparent)]"
              />
              <span className="absolute bottom-4 left-4 flex items-center gap-2 text-[12px] uppercase leading-none tracking-[0.16em] text-[#EDE7D9] transition-opacity duration-200 [text-shadow:0_1px_2px_rgb(19_2_9/0.45)] group-hover:opacity-70 motion-reduce:transition-none">
                {porta.rotulo}
                <SetaTexto />
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
