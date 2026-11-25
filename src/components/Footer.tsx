import Image from "next/image";
import Link from "next/link";
import { produtos } from "@/data/produtos";
import { parcelamentoCartao } from "@/lib/parcelas";
import { INSTAGRAM, INSTAGRAM_ARROBA, WA_ORCAMENTO } from "./home/textos";
import { IconeInstagram } from "./v3/estrutura/Icones";
import { FOCO, HOVER, LINHA } from "./v3/estrutura/estilo";

// Rodapé v3 (spec, seção 2): creme, linha de 1 px em cima, cerca de 30
// palavras. No celular, o logo com o Instagram, os quatro links em duas
// colunas (cada um com 44 px de toque), o pagamento e a origem. Do md para
// cima, três colunas: links, contato, e o logo com o pagamento e o ©.
// Sem newsletter, sem frase grande e sem contagem de peças.

// O maior parcelamento sem juros do catálogo ("até 7x" hoje, por causa do Top Lourdes). Sai do mesmo
// cálculo dos preços da loja, então acompanha o catálogo sozinho.
const MAX_PARCELAS = Math.max(...produtos.map((p) => parcelamentoCartao(p).vezes));

const LINKS_LOJA = [
  { nome: "Loja", href: "/loja" },
  { nome: "Pronta entrega", href: "/loja?ver=pronta-entrega" },
  { nome: "Como encomendar", href: "/como-encomendar" },
] as const;

const link = `inline-flex min-h-11 items-center rounded-[4px] md:min-h-8 ${HOVER} ${FOCO}`;

export default function Footer() {
  const ano = new Date().getFullYear();

  return (
    <footer className={`border-t bg-[#EDE7D9] px-4 py-10 text-[#1B4965] md:px-12 md:py-12 ${LINHA}`}>
      <div className="mx-auto grid max-w-[1344px] gap-y-6 md:grid-cols-3 md:gap-x-12">
        {/* Logo e Instagram (no desktop, o logo fica na coluna da direita). */}
        <div className="flex items-center justify-between md:hidden">
          <Image src="/logo-navy.png" alt="Gio Handmade" width={1200} height={856} sizes="51px" loading="eager" className="h-9 w-auto" />
          <a
            href={INSTAGRAM}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Instagram ${INSTAGRAM_ARROBA}`}
            className={`-mr-3 flex h-11 w-11 items-center justify-center rounded-[4px] ${HOVER} ${FOCO}`}
          >
            <IconeInstagram className="h-5 w-5" />
          </a>
        </div>

        <nav aria-label="Rodapé" className="text-[13px]">
          <ul className="grid grid-cols-2 md:grid-cols-1">
            {LINKS_LOJA.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className={link}>
                  {l.nome}
                </Link>
              </li>
            ))}
            <li className="md:hidden">
              <a href={WA_ORCAMENTO} target="_blank" rel="noopener noreferrer" className={link}>
                WhatsApp
              </a>
            </li>
          </ul>
        </nav>

        {/* Contato (só do md para cima; no celular, o WhatsApp está nos links e o Instagram ao lado do logo). */}
        <div className="hidden text-[13px] md:block">
          <ul>
            <li>
              <a href={WA_ORCAMENTO} target="_blank" rel="noopener noreferrer" className={link}>
                WhatsApp
              </a>
            </li>
            <li>
              <a
                href={INSTAGRAM}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Instagram ${INSTAGRAM_ARROBA}`}
                className={`-ml-3 flex h-11 w-11 items-center justify-center rounded-[4px] ${HOVER} ${FOCO}`}
              >
                <IconeInstagram className="h-5 w-5" />
              </a>
            </li>
          </ul>
        </div>

        {/* Alinhada à esquerda: alinhada à direita, o © ficava sob o WhatsApp flutuante. */}
        <div>
          <Image
            src="/logo-navy.png"
            alt="Gio Handmade"
            width={1200}
            height={856}
            sizes="56px"
            loading="eager"
            className="hidden h-10 w-auto md:mb-4 md:block"
          />
          <p className="text-[12px] text-brand-muted">Pix e cartão em até {MAX_PARCELAS}x sem juros</p>
          <p className="mt-3 text-[12px] leading-[18px] text-brand-muted">
            Feito à mão em Belém, PA
            <br />© {ano} Gio Handmade
          </p>
        </div>
      </div>
    </footer>
  );
}
