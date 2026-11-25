import Link from "next/link";
import Foto from "./Foto";
import { COLECAO_ATIVA, HERO } from "./conteudo";

// Hero parado, de borda a borda, e a foto inteira é o link. Celular: 1 foto
// 3:4 (390x520). Computador: tríptico do mesmo ensaio, 3 fotos 3:4 com 15 px
// de vão (as fotos da Gio são todas em retrato). Sem coleção ativa, nenhuma
// palavra; com coleção, só o nome dela em Garamond itálico sobre um véu de
// tinta no terço de baixo.
export default function Hero() {
  const [esquerda, centro, direita] = HERO;
  const colecao = COLECAO_ATIVA;

  return (
    <section aria-label="Campanha">
      <Link
        href={colecao?.href ?? "/loja"}
        aria-label={colecao ? `Ver a coleção ${colecao.nome}` : "Ver a loja"}
        className="relative grid focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-solid focus-visible:outline-[#b8902a] md:grid-cols-3 md:gap-[15px]"
      >
        {/* Laterais só no computador: no celular ficam com display none e,
            com carregamento preguiçoso, nem são baixadas. */}
        <Moldura extra="hidden md:block" veu={!!colecao}>
          <Foto src={esquerda.src} alt={esquerda.alt} sizes="33vw" />
        </Moldura>
        <Moldura veu={!!colecao}>
          <Foto src={centro.src} alt={centro.alt} sizes="(min-width: 768px) 33vw, 100vw" prioridade />
        </Moldura>
        <Moldura extra="hidden md:block" veu={!!colecao}>
          <Foto src={direita.src} alt={direita.alt} sizes="33vw" />
        </Moldura>

        {colecao && (
          <span className="pointer-events-none absolute bottom-4 left-4 font-[family-name:var(--font-serif)] text-[28px] italic leading-tight text-[#EDE7D9] md:text-[40px]">
            {colecao.nome}
          </span>
        )}
      </Link>
    </section>
  );
}

function Moldura({ children, extra = "", veu }: { children: React.ReactNode; extra?: string; veu: boolean }) {
  return (
    <div className={`relative aspect-[3/4] ${extra}`}>
      {children}
      {veu && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-[#130209]/40 to-transparent"
        />
      )}
    </div>
  );
}
