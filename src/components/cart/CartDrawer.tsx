"use client";

import { useId, useMemo, useRef, useState, type ReactNode } from "react";
import { flushSync } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { chaveDaLinha, useCart, type CartLine } from "./CartProvider";
import { formatBRL, formatBRLPreco } from "@/lib/format";
import { calcularDesconto } from "@/lib/cupons";
import { calcularFrete, mascararCep, normalizarCep, ORIGEM, type FreteEstimado } from "@/lib/frete";
import { labelParcelamento, parcelamentoCartao, type Parcelamento } from "@/lib/parcelas";
import { produtos, type Produto } from "@/data/produtos";
import { WHATSAPP } from "../home/textos";
import Gaveta from "../v3/estrutura/Gaveta";
import FotoSuave from "../v3/estrutura/FotoSuave";
import { IconeFechar, IconeSeta } from "../v3/estrutura/Icones";
import { BOTAO_CONTORNO, BOTAO_PRINCIPAL, CAMPO, FOCO, HOVER, LINHA } from "../v3/estrutura/estilo";

// Sacola v3 (spec, seção 2): gaveta pela direita, tela cheia no celular e
// 420 px do md para cima. Vazia, um aviso e o caminho de volta para a loja.
// Com peças: as linhas (peça + opção), Cartão ou Pix, as sanfonas de frete e
// de cupom, o total, o FINALIZAR PELO WHATSAPP e a linha do sinal.
//
// O total muda com a forma de pagamento: no cartão, o valor de cartão de cada
// peça; no pix, o menor valor. O cupom vale sobre o subtotal da forma
// escolhida e o frete (estimativa pelo CEP) soma no fim.

type FreteStatus = "idle" | "loading" | "ok" | "erro";
type FormaPagamento = "cartao" | "pix";

const produtoPorId = new Map(produtos.map((p) => [p.id, p]));

// Verde de "cupom aplicado" (5:1 no creme).
const VERDE_TEXTO = "text-[#276a3b]";

/** "Sob medida" ou "Pronta entrega · P" (o tamanho entra quando o catálogo tiver). */
function rotuloOpcao(linha: CartLine, produto?: Produto) {
  if (linha.opcao !== "pronta-entrega") return "Sob medida";
  return produto?.tamanho ? `Pronta entrega · ${produto.tamanho}` : "Pronta entrega";
}

/** A mesma opção, para a mensagem do WhatsApp ("sob medida", "pronta entrega, tam. P"). */
function opcaoNaMensagem(linha: CartLine, produto?: Produto) {
  if (linha.opcao !== "pronta-entrega") return "sob medida";
  return produto?.tamanho ? `pronta entrega, tam. ${produto.tamanho}` : "pronta entrega";
}

// Sacola do cabeçalho que está na tela: o foco volta para ela quando quem
// abriu a sacola já saiu da tela.
function sacolaDoCabecalho(): HTMLElement | null {
  const botoes = Array.from(document.querySelectorAll<HTMLElement>("[data-cart-button]"));
  return botoes.find((b) => b.getClientRects().length > 0) ?? null;
}

export default function CartDrawer() {
  const pathname = usePathname();
  const { lines, isOpen, close, remove, setQty, cupom, aplicarCupom, removerCupom } = useCart();
  const fecharRef = useRef<HTMLButtonElement>(null);

  const [forma, setForma] = useState<FormaPagamento>("cartao");
  const [cep, setCep] = useState("");
  const [freteStatus, setFreteStatus] = useState<FreteStatus>("idle");
  const [frete, setFrete] = useState<FreteEstimado | null>(null);
  const [codigoCupom, setCodigoCupom] = useState("");
  const [cupomErro, setCupomErro] = useState<string | null>(null);
  const cupomInputRef = useRef<HTMLInputElement>(null);
  const cupomAplicadoRef = useRef<HTMLParagraphElement>(null);

  // Preço de cada linha na forma escolhida. O preço vem do catálogo de hoje
  // (se mudou depois que a peça entrou na sacola, vale o novo).
  const linhas = useMemo(
    () =>
      lines.map((line) => {
        const produto = produtoPorId.get(line.id);
        const precoPix = produto?.preco ?? line.preco;
        const parcelamento: Parcelamento = parcelamentoCartao(produto ?? { preco: precoPix });
        const unitario = forma === "cartao" ? parcelamento.total : precoPix;
        return { line, produto, parcelamento, unitario, totalLinha: unitario * line.qty };
      }),
    [forma, lines]
  );

  const subtotal = linhas.reduce((acc, l) => acc + l.totalLinha, 0);
  const desconto = cupom ? calcularDesconto(subtotal, cupom) : 0;
  const total = subtotal - desconto + (frete?.valor ?? 0);
  const temSobMedida = lines.some((l) => l.opcao !== "pronta-entrega");

  // "Ver a loja": já na loja, só fecha a sacola (a pessoa volta para onde
  // estava). Ctrl ou Cmd + clique segue abrindo nova aba.
  function verLoja(e: React.MouseEvent<HTMLAnchorElement>) {
    const simples = e.button === 0 && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey;
    if (pathname === "/loja" && simples) e.preventDefault();
    close();
  }

  function aoMudarCep(v: string) {
    setCep(mascararCep(v));
    if (freteStatus !== "idle") {
      setFreteStatus("idle");
      setFrete(null);
    }
  }

  async function aoCalcularFrete() {
    if (normalizarCep(cep).length !== 8) {
      setFreteStatus("erro");
      setFrete(null);
      return;
    }
    setFreteStatus("loading");
    const resultado = await calcularFrete(cep);
    setFrete(resultado);
    setFreteStatus(resultado ? "ok" : "erro");
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

  function linkWhatsApp() {
    const itens = linhas
      .map(({ line, produto, parcelamento, unitario, totalLinha }) => {
        const opcao = opcaoNaMensagem(line, produto);
        const porUnidade = line.qty > 1 ? ` (${formatBRL(unitario)} un.)` : "";
        const parcelas = forma === "cartao" ? ` · ${labelParcelamento(parcelamento)}` : "";
        return `• ${line.qty}x ${line.nome} (${opcao}): ${formatBRL(totalLinha)}${porUnidade}${parcelas}`;
      })
      .join("\n");

    const texto = [
      "Oi Gio! Quero fechar meu pedido feito pelo site ✨",
      "",
      `Forma de pagamento: ${forma === "cartao" ? "Cartão de crédito" : "Pix à vista"}`,
      "",
      forma === "cartao" ? "*Itens (valores no cartão):*" : "*Itens (valores no pix):*",
      itens,
      "",
      `Subtotal: ${formatBRL(subtotal)}`,
    ];
    if (cupom && desconto > 0) {
      texto.push(`Cupom ${cupom.codigo} (${cupom.percentual}% OFF): -${formatBRL(desconto)}`);
    }
    if (frete) {
      texto.push(`Frete (${frete.endereco.localidade}/${frete.endereco.uf} · estimativa): ${formatBRL(frete.valor)}`);
      texto.push(`*Total estimado: ${formatBRL(total)}*`);
      texto.push("");
      texto.push(`CEP de entrega: ${frete.endereco.cep}`);
    } else {
      texto.push(`*Total (sem frete): ${formatBRL(subtotal - desconto)}*`);
      texto.push("");
      texto.push("Quero calcular o frete com você.");
    }
    return `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(texto.join("\n"))}`;
  }

  const botaoCampo = `flex h-11 shrink-0 items-center rounded-[4px] border border-[#1B4965] px-4 text-[12px] uppercase tracking-[0.14em] disabled:opacity-50 ${HOVER} ${FOCO}`;

  return (
    <Gaveta
      aberta={isOpen}
      lado="direita"
      aoFechar={close}
      rotulo="Sacola"
      focoInicial={fecharRef}
      focoDeVolta={sacolaDoCabecalho}
    >
      {/* Topo: SACOLA no centro, X à direita e a linha de 1 px. */}
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
              {linhas.map(({ line, produto, totalLinha }) => (
                <li key={chaveDaLinha(line)} className={`flex gap-4 border-b py-4 ${LINHA}`}>
                  <span className="relative h-24 w-[72px] shrink-0 overflow-hidden bg-[#1B4965]/5">
                    <FotoSuave src={produto?.foto ?? line.foto} alt="" fill sizes="72px" className="object-cover" />
                  </span>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-[14px] leading-5">{line.nome}</p>
                      <p className="nums-preco shrink-0 font-[family-name:var(--font-serif)] text-[16px] font-medium leading-5">
                        {formatBRLPreco(totalLinha)}
                      </p>
                    </div>
                    <p className="mt-1 text-[12px] leading-[18px] text-brand-muted">{rotuloOpcao(line, produto)}</p>
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
                        aria-label={`Remover ${line.nome} (${rotuloOpcao(line, produto).toLowerCase()})`}
                        className={`-mr-2 flex min-h-11 items-center rounded-[4px] px-2 text-[12px] text-brand-muted underline underline-offset-4 ${HOVER} ${FOCO}`}
                      >
                        Remover
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            {/* Forma de pagamento: o total muda com ela. Cartão primeiro, como nos preços da loja. */}
            <div role="group" aria-label="Forma de pagamento" className="mt-5 grid grid-cols-2 gap-2">
              {(
                [
                  ["cartao", "Cartão"],
                  ["pix", "Pix"],
                ] as const
              ).map(([valor, nome]) => (
                <button
                  key={valor}
                  type="button"
                  aria-pressed={forma === valor}
                  onClick={() => setForma(valor)}
                  // 40 px de altura, com 2 px a mais de toque em cima e embaixo.
                  className={`relative flex h-10 items-center justify-center rounded-[4px] border border-[#1B4965] text-[12px] uppercase tracking-[0.16em] after:absolute after:-inset-y-0.5 after:inset-x-0 after:content-[''] ${FOCO} ${
                    forma === valor ? "bg-[#1B4965] text-[#EDE7D9]" : `text-[#1B4965] ${HOVER}`
                  }`}
                >
                  {nome}
                </button>
              ))}
            </div>

            <div className="mt-4">
              <Sanfona titulo="Calcular frete">
                <div className="flex gap-2">
                  <label htmlFor="sacola-cep" className="sr-only">
                    CEP
                  </label>
                  <input
                    id="sacola-cep"
                    inputMode="numeric"
                    autoComplete="postal-code"
                    placeholder="Seu CEP"
                    value={cep}
                    onChange={(e) => aoMudarCep(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") aoCalcularFrete();
                    }}
                    aria-invalid={freteStatus === "erro" || undefined}
                    aria-describedby="sacola-cep-nota"
                    className={CAMPO}
                  />
                  <button type="button" onClick={aoCalcularFrete} disabled={freteStatus === "loading"} className={botaoCampo}>
                    {freteStatus === "loading" ? "..." : "Calcular"}
                  </button>
                </div>
                <div id="sacola-cep-nota" aria-live="polite" className="mt-2 text-[12px] leading-[18px] text-brand-muted">
                  {freteStatus === "erro" && <p className="text-[#a33]">CEP não encontrado. Confira o número.</p>}
                  {freteStatus === "ok" && frete && (
                    <p className="text-[#1B4965]">
                      {frete.endereco.localidade}/{frete.endereco.uf}: {formatBRLPreco(frete.valor)}, de {frete.prazoMin} a{" "}
                      {frete.prazoMax} dias úteis
                    </p>
                  )}
                  <p>
                    Enviamos de {ORIGEM.cidade}/{ORIGEM.uf}. Estimativa; valor final confirmado no WhatsApp.
                  </p>
                </div>
              </Sanfona>

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
                      <button type="button" onClick={aoAplicarCupom} className={botaoCampo}>
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

          {/* Fim da sacola, sempre à vista: total, finalizar e o sinal. */}
          <div className={`shrink-0 border-t px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4 md:px-6 ${LINHA}`}>
            {(desconto > 0 || frete) && (
              <dl className="mb-2 space-y-1 text-[12px] text-brand-muted">
                {cupom && desconto > 0 && (
                  <div className="flex justify-between">
                    <dt>Cupom {cupom.codigo}</dt>
                    <dd className={`nums-preco ${VERDE_TEXTO}`}>−{formatBRLPreco(desconto)}</dd>
                  </div>
                )}
                {frete && (
                  <div className="flex justify-between">
                    <dt>Frete</dt>
                    <dd className="nums-preco">{formatBRLPreco(frete.valor)}</dd>
                  </div>
                )}
              </dl>
            )}
            <div className="flex items-baseline justify-between gap-3">
              <p className="text-[12px] text-brand-muted">
                <span className="text-[12px] uppercase tracking-[0.16em] text-[#1B4965]">Total</span>{" "}
                {forma === "cartao" ? "no cartão" : "no pix"}
                {frete ? ", com frete" : ", sem frete"}
              </p>
              <p aria-live="polite" className="nums-preco font-[family-name:var(--font-serif)] text-[20px] font-medium">
                {formatBRLPreco(total)}
              </p>
            </div>
            <a href={linkWhatsApp()} target="_blank" rel="noopener noreferrer" className={`${BOTAO_PRINCIPAL} mt-3`}>
              Finalizar pelo WhatsApp
            </a>
            {temSobMedida && (
              <p className="mt-2 text-center text-[12px] leading-[18px] text-brand-muted">Sob medida começa com sinal de 50%.</p>
            )}
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

// Sanfona fechada por padrão: abre em 0,2 s e o chevron gira. Fechada, o
// conteúdo fica inerte (fora do Tab e do leitor de tela).
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
        <IconeSeta
          className={`h-4 w-4 transition-transform duration-200 motion-reduce:transition-none ${aberta ? "rotate-180" : ""}`}
        />
      </button>
      <div
        id={id}
        inert={!aberta}
        className={`grid transition-[grid-template-rows] duration-200 motion-reduce:transition-none ${
          aberta ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div className="overflow-hidden">
          {/* Respiro de 4 px nas bordas para o anel de foco dos botões não ser cortado. */}
          <div className="px-1 pb-4 pt-1">{children}</div>
        </div>
      </div>
    </div>
  );
}
