"use client";

import { useRef, useState } from "react";
import { flushSync } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { chaveDaLinha, useCart } from "@/components/cart/CartProvider";
import { itensDoCarrinho, calcularValores } from "@/lib/checkout";
import { formatBRLPreco } from "@/lib/format";
import { produtos, secaoVitrine } from "@/data/produtos";
import Gaveta from "@/components/v3/estrutura/Gaveta";
import FotoSuave from "@/components/v3/estrutura/FotoSuave";
import Sanfona from "@/components/v3/produto/Sanfona";
import { IconeFechar } from "@/components/v3/estrutura/Icones";
import { BOTAO_CONTORNO, BOTAO_PRINCIPAL, CAMPO, FOCO, HOVER, LINHA } from "@/components/v3/estrutura/estilo";
import { medidasProntas, useTodasMedidas } from "../medidas/armazem";

const produtoPorId = new Map(produtos.map((p) => [p.id, p]));
const VERDE_TEXTO = "text-[#276a3b]";

function sacolaDoCabecalho(): HTMLElement | null {
  const botoes = Array.from(document.querySelectorAll<HTMLElement>("[data-cart-button]"));
  return botoes.find((b) => b.getClientRects().length > 0) ?? null;
}

// Sacola da versão 4: gaveta pela direita. As peças (com a opção e, nas sob
// medida, se as medidas já vieram), o cupom e o total no cartão e no pix. O
// FINALIZAR leva ao checkout dentro do site, onde ficam entrega, medidas e
// pagamento.
export default function Sacola() {
  const pathname = usePathname();
  const { lines, isOpen, close, remove, setQty, cupom, aplicarCupom, removerCupom } = useCart();
  const medidas = useTodasMedidas();
  const fecharRef = useRef<HTMLButtonElement>(null);
  const [codigo, setCodigo] = useState("");
  const [erroCupom, setErroCupom] = useState<string | null>(null);
  const campoCupomRef = useRef<HTMLInputElement>(null);
  const aplicadoRef = useRef<HTMLParagraphElement>(null);

  const itens = itensDoCarrinho(lines);
  const noCartao = calcularValores(itens, { forma: "cartao", modalidade: "total", cupom });
  const noPix = calcularValores(itens, { forma: "pix", modalidade: "total", cupom });
  const temSobMedida = lines.some((l) => l.opcao !== "pronta-entrega");

  function verLoja(e: React.MouseEvent<HTMLAnchorElement>) {
    const simples = e.button === 0 && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey;
    if (pathname === "/loja" && simples) e.preventDefault();
    close();
  }

  function aoAplicar() {
    const r = aplicarCupom(codigo);
    if (r.status === "ok") {
      flushSync(() => {
        setCodigo("");
        setErroCupom(null);
      });
      aplicadoRef.current?.focus();
    } else setErroCupom(r.status === "expirado" ? "Esse cupom expirou." : "Cupom inválido. Confira o código.");
  }

  function aoRemoverCupom() {
    flushSync(() => {
      removerCupom();
      setErroCupom(null);
    });
    campoCupomRef.current?.focus();
  }

  return (
    <Gaveta aberta={isOpen} lado="direita" aoFechar={close} rotulo="Sacola" focoInicial={fecharRef} focoDeVolta={sacolaDoCabecalho}>
      <div className={`relative flex h-14 shrink-0 items-center justify-center border-b ${LINHA}`}>
        <h2 className="text-[11px] uppercase tracking-[0.16em]">Sacola</h2>
        <button
          ref={fecharRef}
          type="button"
          onClick={close}
          aria-label="Fechar sacola"
          className={`absolute right-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-[4px] md:right-3 ${HOVER} ${FOCO}`}
        >
          <IconeFechar className="h-5 w-5" />
        </button>
      </div>

      {lines.length === 0 ? (
        <div className="flex flex-col items-center gap-6 px-4 pt-16 text-center">
          <p className="text-[14px]">Sua sacola está vazia.</p>
          <Link href="/loja" onClick={verLoja} className={`${BOTAO_CONTORNO} w-full max-w-[280px]`}>
            Ver a loja
          </Link>
        </div>
      ) : (
        <>
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-6 md:px-6">
            <ul>
              {lines.map((line, i) => {
                const produto = produtoPorId.get(line.id);
                const item = itens[i];
                const sobMedida = line.opcao !== "pronta-entrega";
                const roupa = produto ? secaoVitrine(produto) !== "Acessórios" : true;
                const m = medidas[line.id];
                const nota = !sobMedida
                  ? "Pronta entrega"
                  : !roupa
                    ? "Sob medida"
                    : m?.porVideo
                      ? "Sob medida · medidas por vídeo"
                      : m && medidasProntas(m)
                        ? "Sob medida · medidas informadas"
                        : "Sob medida · medidas na finalização";
                return (
                  <li key={chaveDaLinha(line)} className={`flex gap-4 border-b py-4 ${LINHA}`}>
                    <Link
                      href={`/loja/${line.id}`}
                      onClick={close}
                      tabIndex={-1}
                      aria-hidden
                      className="relative h-24 w-[72px] shrink-0 overflow-hidden bg-[#1B4965]/5"
                    >
                      <FotoSuave src={produto?.foto ?? line.foto} alt="" fill sizes="72px" className="object-cover" />
                    </Link>
                    <div className="flex min-w-0 flex-1 flex-col">
                      <div className="flex items-start justify-between gap-3">
                        <p className="text-[14px] leading-5">{line.nome}</p>
                        <p className="nums-preco shrink-0 font-serif text-[16px] font-medium leading-5">
                          {formatBRLPreco(item.precoCartao * line.qty)}
                        </p>
                      </div>
                      <p className="mt-1 text-[12px] leading-[18px] text-brand-muted">{nota}</p>
                      <div className="mt-auto flex items-center justify-between pt-3">
                        <Quantidade
                          nome={line.nome}
                          qty={line.qty}
                          menos={() => setQty(line.id, line.qty - 1, line.opcao)}
                          mais={() => setQty(line.id, line.qty + 1, line.opcao)}
                        />
                        <button
                          type="button"
                          onClick={() => remove(line.id, line.opcao)}
                          aria-label={`Remover ${line.nome}`}
                          className={`-mr-2 flex min-h-11 items-center rounded-[4px] px-2 text-[12px] text-brand-muted underline underline-offset-4 ${HOVER} ${FOCO}`}
                        >
                          Remover
                        </button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>

            <div className="mt-2">
              <Sanfona titulo="Tenho um cupom">
                {cupom ? (
                  <div className="flex items-center justify-between gap-3">
                    <p ref={aplicadoRef} tabIndex={-1} className={`text-[14px] outline-none ${VERDE_TEXTO}`}>
                      {cupom.codigo} aplicado · {cupom.percentual}% de desconto
                    </p>
                    <button
                      type="button"
                      onClick={aoRemoverCupom}
                      aria-label={`Remover cupom ${cupom.codigo}`}
                      className={`-mr-2 flex min-h-11 items-center rounded-[4px] px-2 text-[12px] text-brand-muted underline underline-offset-4 ${HOVER} ${FOCO}`}
                    >
                      Remover
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="flex gap-2">
                      <label htmlFor="sacola-cupom" className="sr-only">
                        Código do cupom
                      </label>
                      <input
                        ref={campoCupomRef}
                        id="sacola-cupom"
                        placeholder="Código do cupom"
                        autoCapitalize="characters"
                        autoComplete="off"
                        spellCheck={false}
                        value={codigo}
                        onChange={(e) => {
                          setCodigo(e.target.value);
                          if (erroCupom) setErroCupom(null);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") aoAplicar();
                        }}
                        aria-invalid={erroCupom ? true : undefined}
                        aria-describedby={erroCupom ? "sacola-cupom-erro" : undefined}
                        className={`${CAMPO} uppercase placeholder:normal-case`}
                      />
                      <button
                        type="button"
                        onClick={aoAplicar}
                        className={`flex h-11 shrink-0 items-center rounded-[4px] border border-[#1B4965] px-4 text-[12px] uppercase tracking-[0.14em] ${HOVER} ${FOCO}`}
                      >
                        Aplicar
                      </button>
                    </div>
                    {erroCupom && (
                      <p id="sacola-cupom-erro" role="alert" className="mt-2 text-[12px] text-[#a33]">
                        {erroCupom}
                      </p>
                    )}
                  </>
                )}
              </Sanfona>
            </div>
          </div>

          <div className={`shrink-0 border-t px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4 md:px-6 ${LINHA}`}>
            {noCartao.desconto > 0 && cupom && (
              <p className="mb-1 flex justify-between text-[12px] text-brand-muted">
                <span>Cupom {cupom.codigo}</span>
                <span className={`nums-preco ${VERDE_TEXTO}`}>−{formatBRLPreco(noCartao.desconto)}</span>
              </p>
            )}
            <div className="flex items-baseline justify-between gap-3">
              <p className="text-[12px] text-brand-muted">
                <span className="uppercase tracking-[0.16em] text-[#1B4965]">Total</span> no cartão
              </p>
              <p aria-live="polite" className="nums-preco font-serif text-[20px] font-medium">
                {formatBRLPreco(noCartao.total)}
              </p>
            </div>
            {noPix.total < noCartao.total && (
              <p className="text-right text-[12px] text-brand-muted">ou {formatBRLPreco(noPix.total)} no pix</p>
            )}
            <Link href="/finalizar" onClick={close} className={`${BOTAO_PRINCIPAL} mt-3`}>
              Finalizar compra
            </Link>
            <p className="mt-2 text-center text-[12px] leading-[18px] text-brand-muted">
              Frete e pagamento na próxima etapa.{temSobMedida ? " Sob medida começa com sinal de 50%." : ""}
            </p>
          </div>
        </>
      )}
    </Gaveta>
  );
}

function Quantidade({ nome, qty, menos, mais }: { nome: string; qty: number; menos: () => void; mais: () => void }) {
  const botao = `relative flex h-7 w-7 items-center justify-center rounded-[4px] after:absolute after:-inset-2 after:content-[''] ${HOVER} ${FOCO}`;
  return (
    <div role="group" aria-label={`Quantidade de ${nome}`} className="flex h-7 items-center rounded-[4px] border border-[#1B4965]/40">
      <button type="button" onClick={menos} aria-label={qty === 1 ? `Remover ${nome}` : `Diminuir quantidade de ${nome}`} className={botao}>
        <span aria-hidden className="text-[16px] leading-none">−</span>
      </button>
      <span aria-live="polite" className="nums-preco w-7 text-center text-[13px]">
        {qty}
      </span>
      <button type="button" onClick={mais} aria-label={`Aumentar quantidade de ${nome}`} className={botao}>
        <span aria-hidden className="text-[16px] leading-none">+</span>
      </button>
    </div>
  );
}
