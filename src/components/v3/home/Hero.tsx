import Link from "next/link";
import Foto from "./Foto";
import { COLECAO_ATIVA, HERO } from "./conteudo";

// Hero atemporal do conceito "Atelie de Luz e Relevo":
// Celular: 1 foto 3:4 do Top Maya no corpo (peca atemporal em ambar e dourado).
// Desktop: triptico combinando silhueta (Top Aurora), peca no corpo (Top Maya)
// e close macro real das 2.500 micangas (top-maya-5.jpg), com assinatura
// curta em Garamond italico creme sobre veu de tinta no terco inferior.
export default function Hero() {
  const [esquerda, centro, direita] = HERO;
  const colecao = COLECAO_ATIVA;

  return (
    <section aria-label="Campanha">
      <Link
        href={colecao?.href ?? "/loja"}
        aria-label={colecao ? `Ver ${colecao.nome}` : "Ver a loja"}
        className="group relative grid focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-solid focus-visible:outline-[#b8902a] md:grid-cols-3 md:gap-[15px]"
      >
        <Moldura extra="hidden md:block" veu={!!colecao}>
          <Foto src={esquerda.src} alt={esquerda.alt} sizes="33vw" foco={esquerda.foco} />
        </Moldura>
        <Moldura veu={!!colecao}>
          <Foto
            src={centro.src}
            alt={centro.alt}
            sizes="(min-width: 768px) 33vw, 100vw"
            foco={centro.foco}
            prioridade
          />
        </Moldura>
        <Moldura extra="hidden md:block" veu={!!colecao}>
          <Foto src={direita.src} alt={direita.alt} sizes="33vw" foco={direita.foco} />
        </Moldura>

        {colecao && (
          <span className="pointer-events-none absolute bottom-4 left-4 font-[family-name:var(--font-serif)] text-[28px] italic leading-tight text-[#EDE7D9] [text-shadow:0_2px_10px_rgba(19,2,9,0.55)] md:bottom-6 md:left-6 md:text-[38px]">
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
          className="pointer-events-none absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-[#130209]/55 via-[#130209]/20 to-transparent"
        />
      )}
    </div>
  );
}
