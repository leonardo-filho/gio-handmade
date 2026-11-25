"use client";

import { useId, useMemo, useRef, useState, type ReactNode } from "react";
import { flushSync } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { chaveDaLinha, useCart, type CartLine } from "@/components/cart/CartProvider";
import { calcularValores, itensDoCarrinho } from "@/lib/checkout";
import { formatBRLPreco } from "@/lib/format";
import Gaveta from "@/components/v3/estrutura/Gaveta";
import FotoSuave from "@/components/v3/estrutura/FotoSuave";
import { IconeFechar, IconeSeta } from "@/components/v3/estrutura/Icones";
import { BOTAO_CONTORNO, BOTAO_PRINCIPAL, CAMPO, FOCO, HOVER, LINHA } from "@/components/v3/estrutura/estilo";
import { produtoDe } from "../checkout/regras";

// Sacola da versão 1: gaveta pela direita (tela cheia no celular, 420 px do
// md para cima). Só o que se confere antes de pagar: as peças com a opção,
// o cupom, o subtotal no cartão com o pix embaixo e FINALIZAR COMPRA, que leva
// ao checkout dentro do site. Frete e forma de pagamento ficam no checkout.

const VERDE_TEXTO = "text-[#276a3b]";

function rotuloOpcao(linha: CartLine) {
  if (linha.opcao !== "pronta-entrega") return "Sob medida";
  const tamanho = produtoDe(linha.id)?.tamanho;
  return tamanho ? `Pronta entrega · ${tamanho}` : "Pronta entrega";
}

function sacolaDoCabecalho(): HTMLElement | null {
  const botoes = Array.from(document.querySelectorAll<HTMLElement>("[data-cart-button]"));
  return botoes.find((b) => b.getClientRects().length > 0) ?? null;
}

export default function Sacola() {
  const pathname = usePathname();
  const { lines, isOpen, close, remove, setQty, cupom, aplicarCupom, removerCupom } = useCart();
  const fecharRef = useRef<HTMLButtonElement>(null);
  const [codigoCupom, setCodigoCupom] = useState("");
  const [cupomErro, setCupomErro] = useState<string | null>(null);
  const cupomInputRef = useRef<HTMLInputElement>(null);
  const cupomAplicadoRef = useRef<HTMLParagraphElement>(null);

  const itens = useMemo(() => itensDoCarrinho(lines), [lines]);
  const cartao = calcularValores(itens, { forma: "cartao", modalidade: "total", cupom });
  const pix = calcularValores(itens, { forma: "pix", modalidade: "total", cupom });
  const temSobMedida = lines.some((l) => l.opcao !== "pronta-entrega");

  function verLoja(e: React.MouseEvent<HTMLAnchorElement>) {
    const simples = e.button === 0 && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey;
    if (pathname === "/loja" && simples) e.preventDefault();
    close();
  }

  function aoAplicarCupom() {
    const resultado = aplicarCupom(codigoCupom);
    if (resultado.status === "ok") {
      flushSync(() => {
        setCodigoCupom("");
        setCupomErro(null);
      });
      cupomAplicadoRef.current?.focus();
    } else if (resultado.status === "expirado") {
      setCupomErro("Esse cupom expirou.");
    } else {
      setCupomErro("Cupom inválido. Confira o código.");
    }
  }

  function aoRemoverCupom() {
    flushSync(() => {
      removerCupom();
      setCupomErro(null);
    });
    cupomInputRef.current?.focus();
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
                const item = itens[i];
                return (
                  <li key={chaveDaLinha(line)} className={`flex gap-4 border-b py-4 ${LINHA}`}>
                    <Link
                      href={`/loja/${line.id}`}
                      onClick={close}
                      tabIndex={-1}
                      aria-hidden
                      className="relative h-24 w-[72px] shrink-0 overflow-hidden bg-[#1B4965]/5"
                    >
                      <FotoSuave src={item?.foto ?? line.foto} alt="" fill sizes="72px" className="object-cover" />
                    </Link>
                    <div className="flex min-w-0 flex-1 flex-col">
                      <div className="flex items-start justify-between gap-3">
                        <Link href={`/loja/${line.id}`} onClick={close} className={`rounded-[4px] text-[14px] leading-5 ${HOVER} ${FOCO}`}>
                          {line.nome}
                        </Link>
                        <p className="nums-preco shrink-0 font-[family-name:var(--font-serif)] text-[16px] font-medium leading-5">
                          {formatBRLPreco((item?.precoCartao ?? line.preco) * line.qty)}
                        </p>
                      </div>
                      <p className="mt-1 text-[12px] leading-[18px] text-brand-muted">{rotuloOpcao(line)}</p>
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
                          aria-label={`Remover ${line.nome} (${rotuloOpcao(line).toLowerCase()})`}
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
                    <p ref={cupomAplicadoRef} tabIndex={-1} className={`text-[14px] outline-none ${VERDE_TEXTO}`}>
                      {cupom.codigo} aplicado · {cupom.percentual}% OFF
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
                        ref={cupomInputRef}
                        id="sacola-cupom"
                        placeholder="Código do cupom"
                        autoCapitalize="characters"
                        autoComplete="off"
                        spellCheck={false}
                        value={codigoCupom}
                        onChange={(e) => {
                          setCodigoCupom(e.target.value);
                          if (cupomErro) setCupomErro(null);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") aoAplicarCupom();
                        }}
                        aria-invalid={cupomErro ? true : undefined}
                        aria-describedby={cupomErro ? "sacola-cupom-erro" : undefined}
                        className={`${CAMPO} uppercase placeholder:normal-case`}
                      />
                      <button
                        type="button"
                        onClick={aoAplicarCupom}
                        className={`flex h-11 shrink-0 items-center rounded-[4px] border border-[#1B4965] px-4 text-[12px] uppercase tracking-[0.14em] ${HOVER} ${FOCO}`}
                      >
                        Aplicar
                      </button>
                    </div>
                    {cupomErro && (
                      <p id="sacola-cupom-erro" role="alert" className="mt-2 text-[12px] text-[#a33]">
                        {cupomErro}
                      </p>
                    )}
                  </>
                )}
              </Sanfona>
            </div>
          </div>

          <div className={`shrink-0 border-t px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4 md:px-6 ${LINHA}`}>
            {cupom && cartao.desconto > 0 && (
              <div className="mb-1 flex justify-between text-[12px] text-brand-muted">
                <span>Cupom {cupom.codigo}</span>
                <span className={`nums-preco ${VERDE_TEXTO}`}>−{formatBRLPreco(cartao.desconto)}</span>
              </div>
            )}
            <div className="flex items-baseline justify-between gap-3">
              <p className="text-[12px] uppercase tracking-[0.16em]">Subtotal</p>
              <p aria-live="polite" className="nums-preco font-[family-name:var(--font-serif)] text-[20px] font-medium">
                {formatBRLPreco(cartao.total)}
              </p>
            </div>
            {pix.total < cartao.total && (
              <p className="text-right text-[12px] leading-4 text-brand-muted">
                ou <span className="nums-preco">{formatBRLPreco(pix.total)}</span> no pix
              </p>
            )}
            <Link href="/checkout" onClick={close} className={`${BOTAO_PRINCIPAL} mt-3`}>
              Finalizar compra
            </Link>
            <p className="mt-2 text-center text-[12px] leading-[18px] text-brand-muted">
              {temSobMedida ? "Sob medida começa com sinal de 50%. Frete na próxima etapa." : "Frete na próxima etapa."}
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
        <span aria-hidden className="text-[16px] leading-none">
          −
        </span>
      </button>
      <span aria-live="polite" className="nums-preco w-7 text-center text-[13px]">
        {qty}
      </span>
      <button type="button" onClick={mais} aria-label={`Aumentar quantidade de ${nome}`} className={botao}>
        <span aria-hidden className="text-[16px] leading-none">
          +
        </span>
      </button>
    </div>
  );
}

function Sanfona({ titulo, children }: { titulo: string; children: ReactNode }) {
  const [aberta, setAberta] = useState(false);
  const id = useId();
  return (
    <div className={`border-b ${LINHA}`}>
      <button
        type="button"
        aria-expanded={aberta}
        aria-controls={id}
        onClick={() => setAberta((a) => !a)}
        className={`flex h-12 w-full items-center justify-between rounded-[4px] text-[11px] uppercase tracking-[0.14em] ${HOVER} ${FOCO}`}
      >
        {titulo}
        <IconeSeta className={`h-4 w-4 transition-transform duration-200 motion-reduce:transition-none ${aberta ? "rotate-180" : ""}`} />
      </button>
      <div
        id={id}
        inert={!aberta}
        className={`grid transition-[grid-template-rows] duration-200 motion-reduce:transition-none ${aberta ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
      >
        <div className="overflow-hidden">
          <div className="px-1 pb-4 pt-1">{children}</div>
        </div>
      </div>
    </div>
  );
}
