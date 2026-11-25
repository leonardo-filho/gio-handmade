import Image from "next/image";
import Link from "next/link";
import { produtos } from "@/data/produtos";
import { precosDe } from "@/components/v3/loja/precos";
import SetaTexto from "@/components/v3/home/SetaTexto";
import { DESTAQUE } from "./conteudo";

// Peça em destaque: a primeira tela da home é uma peça só, grande, no corpo.
//   Celular: a foto quase da tela toda e, embaixo, "Peça em destaque", o nome
//            e "Ver a peça" (8 palavras). O bloco inteiro é o link.
//   Computador: a foto à esquerda, da altura da tela; à direita, o nome, a
//            primeira frase dos detalhes, o preço e duas fotos de perto.
export default function Destaque() {
  const peca = produtos.find((p) => p.id === DESTAQUE.id);
  if (!peca) return null;
  const precos = precosDe(peca);
  const frase = peca.detalhes.split(". ")[0].replace(/\.$/, "") + ".";
  const href = `/loja/${peca.id}`;

  return (
    <section aria-labelledby="destaque-nome" className="md:grid md:grid-cols-2">
      <Link
        href={href}
        tabIndex={-1}
        aria-hidden
        className="relative block h-[clamp(420px,calc(100svh_-_192px),160vw)] bg-[#1B4965]/5 md:h-[calc(100svh_-_76px)] md:max-h-[980px] md:min-h-[560px]"
      >
        <Image
          src={DESTAQUE.foto}
          alt={DESTAQUE.alt}
          fill
          priority
          sizes="(min-width: 768px) 50vw, 100vw"
          className="object-cover"
          style={{ objectPosition: DESTAQUE.foco }}
        />
      </Link>

      <div className="px-4 pb-2 pt-4 text-[#1B4965] md:flex md:flex-col md:items-center md:justify-center md:px-10 md:py-12 md:text-center">
        <p className="text-[10px] uppercase leading-3 tracking-[0.16em] text-brand-muted">Peça em destaque</p>
        <h2 id="destaque-nome" className="mt-1.5 font-[family-name:var(--font-serif)] text-[30px] leading-9 md:mt-4 md:text-[52px] md:leading-[60px]">
          {/* py-1 no link em linha: 44 px de toque sem mudar a altura do título. */}
          <Link href={href} className="rounded-[4px] py-1 transition-opacity duration-200 hover:opacity-70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#b8902a] motion-reduce:transition-none">
            {peca.nome}
          </Link>
        </h2>
        <p className="mt-3 hidden max-w-[360px] text-pretty text-[14px] leading-[22px] md:block">{frase}</p>
        <p className="mt-4 hidden md:block">
          <span className="nums-preco font-[family-name:var(--font-serif)] text-[20px] font-medium">{precos.cartao}</span>
          <span className="ml-2 text-[12px]">{precos.parcelas}</span>
        </p>
        <Link
          href={href}
          className="-mx-1 mt-1 inline-flex min-h-11 items-center gap-2 rounded-[4px] px-1 text-[12px] uppercase tracking-[0.16em] transition-opacity duration-200 hover:opacity-70 focus-visible:outline-2 focus-visible:outline-[#b8902a] motion-reduce:transition-none md:mt-6 md:min-h-12 md:rounded-[4px] md:border md:border-[#1B4965] md:px-8"
        >
          Ver a peça
          <SetaTexto />
        </Link>

        <div aria-hidden className="mt-10 hidden gap-3 md:flex">
          {DESTAQUE.detalhes.map((f) => (
            <span key={f} className="relative block h-[200px] w-[150px] overflow-hidden bg-[#1B4965]/5 lg:h-[240px] lg:w-[180px]">
              <Image src={f} alt="" fill sizes="180px" className="object-cover object-[50%_40%]" />
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
