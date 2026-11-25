"use client";

import { useMemo, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { chaveDaLinha, useCart } from "./CartProvider";
import { formatBRLPreco } from "@/lib/format";
import { calcularValores } from "@/lib/checkout";
import { itensComMedidas, precisaDeMedidas, rotuloOpcao, textoMedidas } from "@/lib/v2/pedido";
import Gaveta from "../v3/estrutura/Gaveta";
import FotoSuave from "../v3/estrutura/FotoSuave";
import { IconeFechar } from "../v3/estrutura/Icones";
import { BOTAO_CONTORNO, BOTAO_PRINCIPAL, FOCO, HOVER, LINHA } from "../v3/estrutura/estilo";

// Sacola da versão 2: gaveta pela direita (tela cheia no celular, 420 px do
// md para cima). Cada linha mostra a peça, a opção e, nas peças de vestir sob
// medida, as medidas que vieram do provador. Embaixo, o subtotal no cartão e
// no pix e o FINALIZAR COMPRA, que leva ao checkout dentro do site (frete,
// medidas que faltam, cupom e pagamento ficam lá).

// Sacola do cabeçalho que está na tela: o foco volta para ela quando quem
// abriu a sacola já saiu da tela.
function sacolaDoCabecalho(): HTMLElement | null {
  const botoes = Array.from(document.querySelectorAll<HTMLElement>("[data-cart-button]"));
  return botoes.find((b) => b.getClientRects().length > 0) ?? null;
}

export default function CartDrawer() {
  const pathname = usePathname();
  const { lines, isOpen, close, remove, setQty } = useCart();
  const fecharRef = useRef<HTMLButtonElement>(null);

  const itens = useMemo(() => itensComMedidas(lines), [lines]);
  const cartao = calcularValores(itens, { forma: "cartao", modalidade: "total" });
  const pix = calcularValores(itens, { forma: "pix", modalidade: "total" });
  const temSobMedida = itens.some((i) => i.opcao === "sob-medida");
  const faltamMedidas = itens.some((i) => precisaDeMedidas(i) && !i.medidasPorVideo && !i.medidas?.busto);

  // "Ver a loja": já na loja, só fecha a sacola.
  function verLoja(e: React.MouseEvent<HTMLAnchorElement>) {
    const simples = e.button === 0 && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey;
    if (pathname === "/loja" && simples) e.preventDefault();
    close();
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
              {itens.map((item, i) => {
                const line = lines[i];
                const medidas = textoMedidas(item);
                return (
                  <li key={chaveDaLinha(line)} className={`flex gap-4 border-b py-4 ${LINHA}`}>
                    <span className="relative h-24 w-[72px] shrink-0 overflow-hidden bg-[#1B4965]/5">
                      <FotoSuave src={item.foto} alt="" fill sizes="72px" className="object-cover object-[50%_40%]" />
                    </span>
                    <div className="flex min-w-0 flex-1 flex-col">
                      <div className="flex items-start justify-between gap-3">
                        <Link href={`/loja/${item.id}`} onClick={close} className={`rounded-[2px] text-[14px] leading-5 ${HOVER} ${FOCO}`}>
                          {item.nome}
                        </Link>
                        <p className="nums-preco shrink-0 font-[family-name:var(--font-serif)] text-[16px] font-medium leading-5">
                          {formatBRLPreco(item.precoCartao * item.qty)}
                        </p>
                      </div>
                      <p className="mt-1 text-[12px] leading-[18px] text-brand-muted">{rotuloOpcao(item)}</p>
                      {medidas && <p className="text-[12px] leading-[18px] text-brand-muted">{medidas}</p>}
                      <div className="mt-auto flex items-center justify-between pt-3">
                        <Quantidade
                          nome={item.nome}
                          qty={line.qty}
                          menos={() => setQty(line.id, line.qty - 1, line.opcao)}
                          mais={() => setQty(line.id, line.qty + 1, line.opcao)}
                        />
                        <button
                          type="button"
                          onClick={() => remove(line.id, line.opcao)}
                          aria-label={`Remover ${item.nome} (${rotuloOpcao(item).toLowerCase()})`}
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
          </div>

          <div className={`shrink-0 border-t px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4 md:px-6 ${LINHA}`}>
            <div className="flex items-baseline justify-between gap-3">
              <p className="text-[12px] uppercase tracking-[0.16em]">Subtotal</p>
              <div className="text-right">
                <p aria-live="polite" className="nums-preco font-[family-name:var(--font-serif)] text-[20px] font-medium leading-6">
                  {formatBRLPreco(cartao.subtotal)}
                </p>
                {pix.subtotal < cartao.subtotal && (
                  <p className="nums-preco text-[12px] leading-4 text-brand-muted">ou {formatBRLPreco(pix.subtotal)} no pix</p>
                )}
              </div>
            </div>
            <Link href="/checkout" onClick={close} className={`${BOTAO_PRINCIPAL} mt-4`}>
              Finalizar compra
            </Link>
            <p className="mt-2 text-center text-[12px] leading-[18px] text-brand-muted">
              {faltamMedidas
                ? "Frete e medidas na próxima etapa."
                : temSobMedida
                  ? "Sob medida começa com sinal de 50%."
                  : "Frete calculado pelo CEP na próxima etapa."}
            </p>
          </div>
        </>
      )}
    </Gaveta>
  );
}

// "− 1 +": caixas de 28 px, com 44 px de toque (a área passa 8 px para cada lado).
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
