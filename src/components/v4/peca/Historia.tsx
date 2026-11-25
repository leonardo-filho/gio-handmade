"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import type { Produto } from "@/data/produtos";
import { useCart } from "@/components/cart/CartProvider";
import { precosDe } from "@/components/v3/loja/precos";
import { BOTAO_PRINCIPAL } from "@/components/v3/estrutura/estilo";
import { NUMERAIS, type Pranchas } from "../lookbook/pranchas";
import Prancha from "./Prancha";
import Detalhe from "./Detalhe";
import Ficha, { type Opcao } from "./Ficha";

type Props = {
  produto: Produto;
  pranchas: Pranchas;
  categoria: { nome: string; slug: string };
  roupa: boolean;
};

type Item = { id: string; titulo: string; miniatura: string; foco?: string };

// A página da peça como uma pequena história em pranchas de tela cheia:
// a peça inteira, o bordado de perto, a peça no corpo (quando há foto) e a
// ficha. No celular, as pranchas encaixam na rolagem e a barra de compra
// (nome, preço e COMPRAR) fica presa embaixo até a ficha aparecer. No
// computador, a ficha é a coluna da direita, presa ao rolar, e à esquerda
// fica o índice das pranchas.
export default function Historia({ produto, pranchas, categoria, roupa }: Props) {
  const { add, open } = useCart();
  const [opcao, setOpcao] = useState<Opcao>("sob-medida");
  const [ativa, setAtiva] = useState("prancha-peca");
  const [barraVisivel, setBarraVisivel] = useState(true);
  const comprarRef = useRef<HTMLButtonElement>(null);
  const precos = precosDe(produto);

  const itens: Item[] = [{ id: "prancha-peca", titulo: "A peça", miniatura: pranchas.peca[0]?.src ?? produto.foto }];
  if (pranchas.detalhe)
    itens.push({
      id: "prancha-bordado",
      titulo: "O bordado de perto",
      miniatura: pranchas.detalhe.src,
      foco: `${pranchas.detalhe.x}% ${pranchas.detalhe.y}%`,
    });
  if (pranchas.corpo.length > 0) itens.push({ id: "prancha-corpo", titulo: "No corpo", miniatura: pranchas.corpo[0].src });
  const numeral = (id: string) => NUMERAIS[itens.findIndex((i) => i.id === id)];
  const numeralFicha = NUMERAIS[itens.length];

  // Qual prancha está na tela (para o índice do computador).
  useEffect(() => {
    const secoes = Array.from(document.querySelectorAll<HTMLElement>("[data-prancha]"));
    const observador = new IntersectionObserver(
      (entradas) => {
        const visivel = entradas.filter((e) => e.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visivel) setAtiva((visivel.target as HTMLElement).dataset.prancha ?? "");
      },
      { threshold: [0.5, 0.75] }
    );
    secoes.forEach((s) => observador.observe(s));
    return () => observador.disconnect();
  }, []);

  // A barra presa embaixo sai quando o COMPRAR da ficha aparece (ou já passou).
  useEffect(() => {
    const alvo = comprarRef.current;
    if (!alvo) return;
    const observador = new IntersectionObserver(([e]) => {
      setBarraVisivel(!e.isIntersecting && e.boundingClientRect.top > 0);
    });
    observador.observe(alvo);
    return () => observador.disconnect();
  }, []);

  function comprar() {
    add({ id: produto.id, nome: produto.nome, preco: produto.preco, foto: produto.foto, categoria: produto.categoria, opcao });
    open();
  }

  function irPara(id: string) {
    const reduzido = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    document.getElementById(id)?.scrollIntoView({ behavior: reduzido ? "auto" : "smooth", block: "start" });
  }

  return (
    <>
      <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_400px] lg:gap-10 lg:pr-8 xl:grid-cols-[132px_minmax(0,1fr)_440px] xl:gap-12 xl:pr-[60px]">
        {/* Índice das pranchas (computador largo). */}
        <nav aria-label="Pranchas da peça" className="hidden xl:block">
          <ol className="sticky top-[76px] space-y-4 pl-6 pt-6">
            {itens.map((item, i) => {
              const atual = item.id === ativa;
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => irPara(item.id)}
                    aria-current={atual || undefined}
                    className="group flex w-full flex-col items-start gap-1.5 text-left text-[#1B4965] transition-opacity duration-200 hover:opacity-70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#b8902a] motion-reduce:transition-none"
                  >
                    <span
                        className={`relative block h-[72px] w-[54px] overflow-hidden bg-[#1B4965]/5 outline outline-1 outline-offset-2 ${
                          atual ? "outline-[#1B4965]" : "outline-transparent"
                        }`}
                      >
                        <Image
                        src={item.miniatura}
                        alt=""
                        fill
                        sizes="108px"
                        style={item.foco ? { objectPosition: item.foco, transformOrigin: item.foco, transform: "scale(1.9)" } : undefined}
                        className="object-cover"
                      />
                      </span>
                    <span className="flex items-baseline gap-2 text-[12px] leading-4">
                      <span className="nums-preco font-serif text-brand-muted">{NUMERAIS[i]}</span>
                      <span className={atual ? "underline underline-offset-4" : ""}>{item.titulo}</span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>
        </nav>

        <div className="min-w-0">
          <Prancha
            id="prancha-peca"
            numeral={numeral("prancha-peca")}
            titulo="A peça"
            fotos={pranchas.peca}
            nome={produto.nome}
            primeira
          />
          {pranchas.detalhe && (
            <Detalhe id="prancha-bordado" numeral={numeral("prancha-bordado")} nome={produto.nome} detalhe={pranchas.detalhe} />
          )}
          {pranchas.corpo.length > 0 && (
            <Prancha id="prancha-corpo" numeral={numeral("prancha-corpo")} titulo="No corpo" fotos={pranchas.corpo} nome={produto.nome} />
          )}
        </div>

        <aside
          id="ficha"
          aria-label="Ficha da peça"
          className="scroll-mt-[60px] snap-start px-4 pb-6 pt-8 md:scroll-mt-[76px] lg:sticky lg:top-[76px] lg:max-h-[calc(100vh-76px)] lg:snap-align-none lg:overflow-y-auto lg:overscroll-contain lg:px-1 lg:pb-10 lg:pt-6 lg:[scrollbar-width:thin]"
        >
          <Ficha
            produto={produto}
            categoria={categoria}
            numeral={numeralFicha}
            roupa={roupa}
            opcao={opcao}
            aoEscolher={setOpcao}
            aoComprar={comprar}
            comprarRef={comprarRef}
          />
        </aside>
      </div>

      {/* Barra presa embaixo (celular e tablet): a ficha resumida. */}
      <div
        inert={!barraVisivel}
        className={`fixed inset-x-0 bottom-0 z-30 border-t border-[#1B4965]/15 bg-[#EDE7D9] px-4 pb-[max(10px,env(safe-area-inset-bottom))] pt-2.5 duration-300 ease-out motion-reduce:transition-none lg:hidden ${
          barraVisivel ? "translate-y-0 transition-transform" : "translate-y-full transition-transform"
        }`}
      >
        <div className="mx-auto flex max-w-[720px] items-center gap-3">
          <div className="min-w-0 flex-1 text-[#1B4965]">
            <p className="truncate text-[13px] leading-[18px]">{produto.nome}</p>
            <p className="flex items-baseline gap-1.5 text-[12px] leading-6">
              <span className="nums-preco font-serif text-[17px] font-medium">{precos.cartao}</span>
              <span aria-hidden className="text-brand-muted">·</span>
              {produto.prontaEntrega ? (
                <button
                  type="button"
                  onClick={() => irPara("ficha-tamanho")}
                  className="-my-2.5 min-h-11 text-brand-muted underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-[#b8902a]"
                >
                  {opcao === "pronta-entrega" ? "pronta entrega" : "sob medida"}
                </button>
              ) : (
                <span className="text-brand-muted">sob medida</span>
              )}
            </p>
          </div>
          <button type="button" onClick={comprar} className={`${BOTAO_PRINCIPAL.replace("w-full", "w-auto")} shrink-0 px-7`}>
            Comprar
          </button>
        </div>
      </div>
    </>
  );
}
