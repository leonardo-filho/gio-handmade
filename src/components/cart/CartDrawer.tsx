"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useCart } from "./CartProvider";
import { formatBRL } from "@/lib/format";
import { calcularDesconto } from "@/lib/cupons";
import { calcularFrete, mascararCep, normalizarCep, ORIGEM, type FreteEstimado } from "@/lib/frete";
import { labelParcelamento, parcelamentoCartao } from "@/lib/parcelas";
import { produtos } from "@/data/produtos";

const WA = "559192982017";
const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;

type FreteStatus = "idle" | "loading" | "ok" | "erro";
type FormaPagamento = "pix" | "cartao";

export default function CartDrawer() {
  const reduce = useReducedMotion();
  const {
    lines,
    isOpen,
    close,
    remove,
    setQty,
    subtotal,
    count,
    clear,
    cupom,
    aplicarCupom,
    removerCupom,
  } = useCart();

  const [cep, setCep] = useState("");
  const [freteStatus, setFreteStatus] = useState<FreteStatus>("idle");
  const [frete, setFrete] = useState<FreteEstimado | null>(null);

  const [codigoCupom, setCodigoCupom] = useState("");
  const [cupomErro, setCupomErro] = useState<string | null>(null);
  const [formaPagamento, setFormaPagamento] = useState<FormaPagamento>("pix");

  const produtoPorId = useMemo(() => new Map(produtos.map((produto) => [produto.id, produto])), []);

  const linhasPagamento = useMemo(
    () =>
      lines.map((line) => {
        const produto = produtoPorId.get(line.id);
        const parcelamento = parcelamentoCartao(produto ?? { preco: line.preco });
        const precoUnitario = formaPagamento === "cartao" ? parcelamento.total : line.preco;

        return {
          line,
          parcelamento,
          precoUnitario,
          totalLinha: precoUnitario * line.qty,
        };
      }),
    [formaPagamento, lines, produtoPorId]
  );

  const subtotalPix = subtotal;
  const subtotalCartao = useMemo(
    () =>
      lines.reduce((acc, line) => {
        const produto = produtoPorId.get(line.id);
        return acc + parcelamentoCartao(produto ?? { preco: line.preco }).total * line.qty;
      }, 0),
    [lines, produtoPorId]
  );

  const subtotalPagamento = formaPagamento === "cartao" ? subtotalCartao : subtotalPix;
  const descontoPagamento = cupom ? calcularDesconto(subtotalPagamento, cupom) : 0;
  const total = subtotalPagamento - descontoPagamento + (frete?.valor ?? 0);
  const descontoPix = cupom ? calcularDesconto(subtotalPix, cupom) : 0;
  const descontoCartao = cupom ? calcularDesconto(subtotalCartao, cupom) : 0;
  const totalPix = subtotalPix - descontoPix + (frete?.valor ?? 0);
  const totalCartao = subtotalCartao - descontoCartao + (frete?.valor ?? 0);
  const formaPagamentoLabel = formaPagamento === "cartao" ? "Cartão de crédito" : "Pix à vista";

  function onAplicarCupom() {
    const resultado = aplicarCupom(codigoCupom);
    if (resultado.status === "ok") {
      setCodigoCupom("");
      setCupomErro(null);
    } else if (resultado.status === "expirado") {
      setCupomErro("Esse cupom expirou.");
    } else {
      setCupomErro("Cupom inválido. Confira o código.");
    }
  }

  function onRemoverCupom() {
    removerCupom();
    setCupomErro(null);
  }

  // Esc fecha + trava o scroll do fundo enquanto aberto
  useEffect(() => {
    if (!isOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [isOpen, close]);

  // Se o CEP mudar depois de calculado, zera o resultado para forçar recálculo
  function onCepChange(v: string) {
    setCep(mascararCep(v));
    if (freteStatus !== "idle") {
      setFreteStatus("idle");
      setFrete(null);
    }
  }

  async function onCalcularFrete() {
    if (normalizarCep(cep).length !== 8) {
      setFreteStatus("erro");
      setFrete(null);
      return;
    }
    setFreteStatus("loading");
    const resultado = await calcularFrete(cep);
    if (resultado) {
      setFrete(resultado);
      setFreteStatus("ok");
    } else {
      setFrete(null);
      setFreteStatus("erro");
    }
  }

  function mensagemWhatsApp() {
    const itens = linhasPagamento
      .map(({ line, parcelamento, precoUnitario, totalLinha }) => {
        const detalheQuantidade = line.qty > 1 ? ` (${formatBRL(precoUnitario)} un.)` : "";
        const detalhePagamento =
          formaPagamento === "cartao" ? ` · ${labelParcelamento(parcelamento)}` : "";

        return `• ${line.qty}x ${line.nome}: ${formatBRL(totalLinha)}${detalheQuantidade}${detalhePagamento}`;
      })
      .join("\n");

    const linhas = [
      "Oi Gio! Quero fechar meu pedido feito pelo site ✨",
      "",
      `Forma de pagamento: ${formaPagamentoLabel}`,
      "",
      formaPagamento === "cartao" ? "*Itens (valores no cartão):*" : "*Itens (valores no pix):*",
      itens,
      "",
      `Subtotal: ${formatBRL(subtotalPagamento)}`,
    ];

    if (cupom && descontoPagamento > 0) {
      linhas.push(`Cupom ${cupom.codigo} (${cupom.percentual}% OFF): -${formatBRL(descontoPagamento)}`);
    }

    if (frete) {
      const destino = `${frete.endereco.localidade}/${frete.endereco.uf}`;
      linhas.push(`Frete (${destino} · estimativa): ${formatBRL(frete.valor)}`);
      linhas.push(`*Total estimado: ${formatBRL(total)}*`);
      linhas.push("");
      linhas.push(`CEP de entrega: ${frete.endereco.cep}`);

      //tirei por causa de teste

      //linhas.push(`Prazo estimado: de ${frete.prazoMin} a ${frete.prazoMax} dias úteis`);
    } else {
      linhas.push(`*Total (sem frete): ${formatBRL(subtotalPagamento - descontoPagamento)}*`);
      linhas.push("");
      linhas.push("Quero calcular o frete com você.");
    }

    return `https://wa.me/${WA}?text=${encodeURIComponent(linhas.join("\n"))}`;
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[90] flex justify-end"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduce ? 0 : 0.25, ease: EASE_OUT_EXPO }}
        >
          {/* Backdrop */}
          <button
            type="button"
            aria-label="Fechar carrinho"
            onClick={close}
            className="absolute inset-0 cursor-default bg-[#130209]/50 backdrop-blur-sm"
          />

          {/* Painel */}
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-label="Carrinho de compras"
            className="relative flex h-full w-full max-w-md flex-col bg-[#EDE7D9] text-[#1B4965] shadow-2xl"
            initial={{ x: reduce ? 0 : "100%" }}
            animate={{ x: 0 }}
            exit={{ x: reduce ? 0 : "100%" }}
            transition={{ duration: reduce ? 0 : 0.4, ease: EASE_OUT_EXPO }}
          >
            {/* Cabeçalho */}
            <div className="flex items-center justify-between border-b border-[#1B4965]/15 px-5 py-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#1B4965]/55">
                  Seu carrinho
                </p>
                <h2 className="font-[family-name:var(--font-serif)] text-2xl leading-tight">
                  {count > 0 ? `${count} ${count === 1 ? "item" : "itens"}` : "Vazio"}
                </h2>
              </div>
              <button
                type="button"
                aria-label="Fechar"
                onClick={close}
                className="flex h-9 w-9 items-center justify-center rounded-full text-[#1B4965] transition-colors hover:bg-[#1B4965]/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1B4965]"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {lines.length === 0 ? (
              /* ---------- Estado vazio ---------- */
              <div className="flex flex-1 flex-col items-center justify-center gap-5 px-8 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#1B4965]/8">
                  <svg className="h-7 w-7 text-[#1B4965]/50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 6h18M16 10a4 4 0 0 1-8 0" />
                  </svg>
                </div>
                <p className="font-[family-name:var(--font-serif)] text-lg text-[#1B4965]/75">
                  Seu carrinho está vazio.
                </p>
                <Link
                  href="/loja"
                  onClick={close}
                  className="inline-flex items-center justify-center rounded-sm bg-[#1B4965] px-7 py-3.5 text-xs font-bold uppercase tracking-[0.2em] text-[#EDE7D9] transition-colors hover:bg-[#130209]"
                >
                  Ver a vitrine
                </Link>
              </div>
            ) : (
              <>
                {/* ---------- Itens ---------- */}
                <div data-lenis-prevent className="flex-1 overflow-y-auto px-5 py-4">
                  <ul className="space-y-4">
                    {linhasPagamento.map(({ line: l, parcelamento, precoUnitario, totalLinha }) => (
                      <li key={l.id} className="flex gap-3.5">
                        <div className="relative h-24 w-[72px] shrink-0 overflow-hidden rounded-sm bg-white">
                          <Image src={l.foto} alt={l.nome} fill sizes="72px" className="object-cover" />
                        </div>
                        <div className="flex min-w-0 flex-1 flex-col">
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="font-[family-name:var(--font-serif)] text-base leading-tight text-[#1B4965]">
                              {l.nome}
                            </h3>
                            <button
                              type="button"
                              aria-label={`Remover ${l.nome}`}
                              onClick={() => remove(l.id)}
                              className="mt-0.5 shrink-0 text-[#1B4965]/40 transition-colors hover:text-[#1B4965]"
                            >
                              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                          <p className="mt-0.5 text-xs text-[#1B4965]/55">
                            {formaPagamento === "cartao"
                              ? `${formatBRL(precoUnitario)} ${labelParcelamento(parcelamento)}`
                              : `${formatBRL(precoUnitario)} no pix`}
                          </p>

                          <div className="mt-auto flex items-center justify-between pt-2">
                            {/* Stepper de quantidade */}
                            <div className="flex items-center rounded-sm border border-[#1B4965]/25">
                              <button
                                type="button"
                                aria-label="Diminuir quantidade"
                                onClick={() => setQty(l.id, l.qty - 1)}
                                className="flex h-8 w-8 items-center justify-center text-[#1B4965] transition-colors hover:bg-[#1B4965]/10"
                              >
                                <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2}>
                                  <path strokeLinecap="round" d="M5 12h14" />
                                </svg>
                              </button>
                              <span className="w-8 text-center text-sm font-medium tabular-nums">{l.qty}</span>
                              <button
                                type="button"
                                aria-label="Aumentar quantidade"
                                onClick={() => setQty(l.id, l.qty + 1)}
                                className="flex h-8 w-8 items-center justify-center text-[#1B4965] transition-colors hover:bg-[#1B4965]/10"
                              >
                                <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2}>
                                  <path strokeLinecap="round" d="M12 5v14M5 12h14" />
                                </svg>
                              </button>
                            </div>
                            <span className="font-[family-name:var(--font-serif)] text-base font-medium tabular-nums text-[#1B4965]">
                              {formatBRL(totalLinha)}
                            </span>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>

                  <button
                    type="button"
                    onClick={clear}
                    className="mt-5 text-[11px] uppercase tracking-[0.18em] text-[#1B4965]/45 underline-offset-4 transition-colors hover:text-[#1B4965] hover:underline"
                  >
                    Esvaziar carrinho
                  </button>
                </div>

                {/* ---------- Rodapé: frete + total + CTA ---------- */}
                <div className="border-t border-[#1B4965]/15 px-5 py-4">
                  {/* Frete */}
                  <div className="mb-4">
                    <label htmlFor="cep-frete" className="text-[10px] font-bold uppercase tracking-[0.28em] text-[#1B4965]/55">
                      Calcular frete
                    </label>
                    <div className="mt-2 flex gap-2">
                      <input
                        id="cep-frete"
                        inputMode="numeric"
                        autoComplete="postal-code"
                        placeholder="Seu CEP (00000-000)"
                        value={cep}
                        onChange={(e) => onCepChange(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") onCalcularFrete();
                        }}
                        className="min-w-0 flex-1 rounded-sm border border-[#1B4965]/25 bg-white px-3 py-2.5 text-sm text-[#1B4965] placeholder:text-[#1B4965]/40 focus:border-[#1B4965] focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={onCalcularFrete}
                        disabled={freteStatus === "loading"}
                        className="shrink-0 rounded-sm border border-[#1B4965] px-4 py-2.5 text-xs font-bold uppercase tracking-[0.14em] text-[#1B4965] transition-colors hover:bg-[#1B4965] hover:text-[#EDE7D9] disabled:opacity-50"
                      >
                        {freteStatus === "loading" ? "..." : "Calcular"}
                      </button>
                    </div>

                    {freteStatus === "erro" && (
                      <p className="mt-2 text-xs text-[#a33]">
                        CEP não encontrado. Confira o número e tente de novo.
                      </p>
                    )}
                    {freteStatus === "ok" && frete && (
                      <p className="mt-2 text-xs text-[#1B4965]/70">
                        {frete.endereco.localidade}/{frete.endereco.uf} · {frete.regiao} · entrega de{" "}
                        {frete.prazoMin} a {frete.prazoMax} dias úteis
                      </p>
                    )}
                    <p className="mt-1.5 text-[11px] text-[#1B4965]/45">
                      Enviamos de {ORIGEM.cidade}/{ORIGEM.uf}. Estimativa; valor final confirmado no WhatsApp.
                    </p>
                  </div>

                  {/* Cupom de desconto */}
                  <div className="mb-4">
                    {cupom ? (
                      <div className="flex items-center justify-between rounded-sm border border-[#2f7a45]/40 bg-[#2f7a45]/[0.08] px-3 py-2.5">
                        <span className="flex items-center gap-2 text-sm text-[#2f7a45]">
                          <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} aria-hidden>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M20 6 9 17l-5-5" />
                          </svg>
                          Cupom <span className="font-bold">{cupom.codigo}</span> · {cupom.percentual}% OFF
                        </span>
                        <button
                          type="button"
                          onClick={onRemoverCupom}
                          className="shrink-0 text-[11px] uppercase tracking-[0.14em] text-[#1B4965]/55 underline-offset-4 transition-colors hover:text-[#1B4965] hover:underline"
                        >
                          Remover
                        </button>
                      </div>
                    ) : (
                      <>
                        <label htmlFor="cupom" className="text-[10px] font-bold uppercase tracking-[0.28em] text-[#1B4965]/55">
                          Cupom de desconto
                        </label>
                        <div className="mt-2 flex gap-2">
                          <input
                            id="cupom"
                            placeholder="Digite seu cupom"
                            value={codigoCupom}
                            onChange={(e) => {
                              setCodigoCupom(e.target.value);
                              if (cupomErro) setCupomErro(null);
                            }}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") onAplicarCupom();
                            }}
                            className="min-w-0 flex-1 rounded-sm border border-[#1B4965]/25 bg-white px-3 py-2.5 text-sm uppercase tracking-[0.08em] text-[#1B4965] placeholder:normal-case placeholder:tracking-normal placeholder:text-[#1B4965]/40 focus:border-[#1B4965] focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={onAplicarCupom}
                            className="shrink-0 rounded-sm border border-[#1B4965] px-4 py-2.5 text-xs font-bold uppercase tracking-[0.14em] text-[#1B4965] transition-colors hover:bg-[#1B4965] hover:text-[#EDE7D9]"
                          >
                            Aplicar
                          </button>
                        </div>
                        {cupomErro && <p className="mt-2 text-xs text-[#a33]">{cupomErro}</p>}
                      </>
                    )}
                  </div>

                  {/* Forma de pagamento */}
                  <fieldset className="mb-4">
                    <legend className="text-[10px] font-bold uppercase tracking-[0.28em] text-[#1B4965]/55">
                      Forma de pagamento
                    </legend>
                    <div className="mt-2 grid grid-cols-2 gap-1 rounded-sm border border-[#1B4965]/20 bg-white/45 p-1">
                      <button
                        type="button"
                        aria-pressed={formaPagamento === "pix"}
                        onClick={() => setFormaPagamento("pix")}
                        className={`rounded-[2px] px-2.5 py-2.5 text-left transition-colors ${
                          formaPagamento === "pix"
                            ? "bg-[#1B4965] text-[#EDE7D9]"
                            : "text-[#1B4965] hover:bg-[#1B4965]/8"
                        }`}
                      >
                        <span className="block text-[11px] font-bold uppercase tracking-[0.14em]">
                          Pix
                        </span>
                        <span className="mt-0.5 block text-sm font-semibold tabular-nums">
                          {formatBRL(totalPix)}
                        </span>
                      </button>
                      <button
                        type="button"
                        aria-pressed={formaPagamento === "cartao"}
                        onClick={() => setFormaPagamento("cartao")}
                        className={`rounded-[2px] px-2.5 py-2.5 text-left transition-colors ${
                          formaPagamento === "cartao"
                            ? "bg-[#1B4965] text-[#EDE7D9]"
                            : "text-[#1B4965] hover:bg-[#1B4965]/8"
                        }`}
                      >
                        <span className="block text-[11px] font-bold uppercase tracking-[0.14em]">
                          Cartão
                        </span>
                        <span className="mt-0.5 block text-sm font-semibold tabular-nums">
                          {formatBRL(totalCartao)}
                        </span>
                      </button>
                    </div>
                  </fieldset>

                  {/* Totais */}
                  <div className="space-y-1.5 border-t border-[#1B4965]/10 pt-3 text-sm">
                    <div className="flex justify-between text-[#1B4965]/75">
                      <span>Subtotal {formaPagamento === "cartao" ? "no cartão" : "no pix"}</span>
                      <span className="tabular-nums">{formatBRL(subtotalPagamento)}</span>
                    </div>
                    {descontoPagamento > 0 && (
                      <div className="flex justify-between font-medium text-[#2f7a45]">
                        <span>Desconto{cupom ? ` (${cupom.codigo})` : ""}</span>
                        <span className="tabular-nums">−{formatBRL(descontoPagamento)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-[#1B4965]/75">
                      <span>Frete</span>
                      <span className="tabular-nums">
                        {frete ? formatBRL(frete.valor) : "a calcular"}
                      </span>
                    </div>
                    <div className="flex items-baseline justify-between pt-1">
                      <span className="font-[family-name:var(--font-serif)] text-lg text-[#1B4965]">
                        Total
                      </span>
                      <span className="font-[family-name:var(--font-serif)] text-2xl font-medium tabular-nums text-[#1B4965]">
                        {formatBRL(total)}
                      </span>
                    </div>
                    <p className="pt-0.5 text-[11px] text-[#1B4965]/45">
                      {formaPagamento === "cartao"
                        ? "Total calculado com os valores de cartão da vitrine. Parcelamento confirmado no WhatsApp."
                        : "Total calculado com os valores à vista no pix."}
                    </p>
                  </div>

                  {/* CTA */}
                  <a
                    href={mensagemWhatsApp()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 flex items-center justify-center gap-2.5 rounded-sm bg-[#1B4965] px-6 py-4 text-xs font-bold uppercase tracking-[0.2em] text-[#EDE7D9] transition-colors hover:bg-[#130209]"
                  >
                    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className="h-4 w-4">
                      <path d="M.057 24l1.687-6.163a11.867 11.867 0 01-1.587-5.945C.16 5.335 5.495 0 12.05 0a11.817 11.817 0 018.413 3.488 11.824 11.824 0 013.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 01-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.821 9.821 0 001.519 5.26l-.999 3.648 3.97-1.317zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                    </svg>
                    Fechar pedido pelo WhatsApp
                  </a>
                  <Link
                    href="/loja"
                    onClick={close}
                    className="mt-2 block text-center text-[11px] uppercase tracking-[0.2em] text-[#1B4965]/55 transition-colors hover:text-[#1B4965]"
                  >
                    Continuar comprando
                  </Link>
                </div>
              </>
            )}
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
