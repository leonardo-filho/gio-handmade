"use client";

import { useRef, useState } from "react";
import { flushSync } from "react-dom";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/components/cart/CartProvider";
import {
  calcularValores,
  itensDoCarrinho,
  provedorAtual,
  validarCliente,
  validarEndereco,
  type DadosCliente,
  type Endereco,
  type FormaPagamento,
  type ItemPedido,
  type Modalidade,
  type Pedido,
} from "@/lib/checkout";
import { calcularFrete, mascararCep, normalizarCep, type FreteEstimado } from "@/lib/frete";
import { formatBRL } from "@/lib/format";
import { produtos, secaoVitrine } from "@/data/produtos";
import { BOTAO_CONTORNO, BOTAO_PRINCIPAL, FOCO, HOVER, LINHA } from "@/components/v3/estrutura/estilo";
import CamposMedidas from "../medidas/CamposMedidas";
import { medidasNumericas, medidasProntas, tamanhoSugerido, useTodasMedidas } from "../medidas/armazem";
import { Campo, Opcao, mascaraCpf, mascaraTelefone } from "./campos";
import Confirmacao, { type PedidoFeito } from "./Confirmacao";

type Etapa = "dados" | "entrega" | "medidas" | "pagamento" | "confirmacao";

const TITULOS: Record<Etapa, string> = {
  dados: "Seus dados",
  entrega: "Entrega",
  medidas: "Medidas",
  pagamento: "Pagamento",
  confirmacao: "Confirmação",
};

const porId = new Map(produtos.map((p) => [p.id, p]));
const ehRoupa = (id: string) => {
  const p = porId.get(id);
  return p ? secaoVitrine(p) !== "Acessórios" : true;
};

type Erros = Record<string, string | undefined>;

// Checkout dentro do site, em etapas curtas: seus dados, entrega (o CEP
// preenche o endereço e estima o frete), medidas das peças sob medida que
// ainda não têm, pagamento (pix ou cartão, sinal de 50% ou tudo) e a
// confirmação com o botão que manda o pedido para a Gio no WhatsApp. O
// pagamento é o provedor de demonstração do núcleo (lib/checkout.ts).
export default function Finalizar() {
  const { lines, hydrated, cupom, clear, removerCupom } = useCart();
  const medidas = useTodasMedidas();
  const tituloRef = useRef<HTMLHeadingElement>(null);

  const [etapa, setEtapa] = useState<Etapa>("dados");
  const [cliente, setCliente] = useState<DadosCliente>({ nome: "", email: "", whatsapp: "", cpf: "" });
  const [endereco, setEndereco] = useState<Endereco>({ cep: "", rua: "", numero: "", complemento: "", bairro: "", cidade: "", uf: "" });
  const [frete, setFrete] = useState<FreteEstimado | null>(null);
  const [cepStatus, setCepStatus] = useState<"idle" | "buscando" | "ok" | "erro">("idle");
  const [forma, setForma] = useState<FormaPagamento>("cartao");
  const [modalidade, setModalidade] = useState<Modalidade>("sinal");
  const [erros, setErros] = useState<Erros>({});
  const [pagando, setPagando] = useState(false);
  const [erroPagamento, setErroPagamento] = useState<string | null>(null);
  const [feito, setFeito] = useState<PedidoFeito | null>(null);
  const [resumoAberto, setResumoAberto] = useState(false);

  // Itens do pedido com as medidas gravadas (na página da peça ou aqui).
  const itens: ItemPedido[] = itensDoCarrinho(lines).map((item) => {
    if (item.opcao !== "sob-medida" || !ehRoupa(item.id)) return item;
    const m = medidas[item.id] ?? {};
    return {
      ...item,
      medidas: medidasNumericas(m),
      medidasPorVideo: Boolean(m.porVideo),
      tamanhoReferencia: m.porVideo ? undefined : tamanhoSugerido(m)?.tamanho,
    };
  });
  const sobMedidaRoupa = itens.filter((i, idx, arr) => i.opcao === "sob-medida" && ehRoupa(i.id) && arr.findIndex((o) => o.id === i.id && o.opcao === i.opcao) === idx);
  const acessoriosSobMedida = itens.filter((i) => i.opcao === "sob-medida" && !ehRoupa(i.id));

  const etapas: Etapa[] = feito
    ? feito.etapas
    : ["dados", "entrega", ...(sobMedidaRoupa.length > 0 ? (["medidas"] as const) : []), "pagamento", "confirmacao"];
  const indice = etapas.indexOf(etapa);
  const valorFrete = frete?.valor ?? 0;
  const valores = calcularValores(itens, { forma, modalidade, frete: valorFrete, cupom });
  const valoresPix = calcularValores(itens, { forma: "pix", modalidade, frete: valorFrete, cupom });
  const valoresCartao = calcularValores(itens, { forma: "cartao", modalidade, frete: valorFrete, cupom });

  // O aviso da etapa de medidas some assim que a peça fica completa.
  const medidaPendente = (id: string) => {
    const m = medidas[id] ?? {};
    return !m.porVideo && !medidasProntas(m);
  };

  function irPara(nova: Etapa) {
    flushSync(() => {
      setEtapa(nova);
      setErros({});
      setErroPagamento(null);
    });
    const reduzido = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduzido ? "auto" : "smooth" });
    tituloRef.current?.focus({ preventScroll: true });
  }

  function focarPrimeiroErro(e: Erros) {
    const primeiro = Object.keys(e).find((k) => e[k]);
    if (primeiro) requestAnimationFrame(() => document.getElementById(`f-${primeiro}`)?.focus());
  }

  function avancar(ev: React.FormEvent) {
    ev.preventDefault();
    if (etapa === "dados") {
      const e = validarCliente({ ...cliente, cpf: cliente.cpf || undefined });
      setErros(e);
      if (Object.keys(e).length) return focarPrimeiroErro(e);
    }
    if (etapa === "entrega") {
      const e = validarEndereco(endereco);
      setErros(e);
      if (Object.keys(e).length) return focarPrimeiroErro(e);
    }
    if (etapa === "medidas") {
      const e: Erros = {};
      for (const i of sobMedidaRoupa) {
        if (medidaPendente(i.id)) e[i.id] = "Informe busto e cintura, ou marque o vídeo.";
      }
      setErros(e);
      if (Object.keys(e).length) {
        const primeiro = Object.keys(e)[0];
        requestAnimationFrame(() => document.getElementById(`medidas-${primeiro}`)?.scrollIntoView({ block: "center" }));
        return;
      }
    }
    irPara(etapas[indice + 1]);
  }

  async function aoMudarCep(v: string) {
    const cep = mascararCep(v);
    setEndereco((e) => ({ ...e, cep }));
    if (normalizarCep(cep).length !== 8) {
      setCepStatus("idle");
      setFrete(null);
      return;
    }
    setCepStatus("buscando");
    const r = await calcularFrete(cep);
    if (!r) {
      setCepStatus("erro");
      setFrete(null);
      return;
    }
    setFrete(r);
    setCepStatus("ok");
    setEndereco((e) => ({
      ...e,
      rua: r.endereco.logradouro ?? e.rua,
      bairro: r.endereco.bairro ?? e.bairro,
      cidade: r.endereco.localidade || e.cidade,
      uf: r.endereco.uf || e.uf,
    }));
    setErros({});
    requestAnimationFrame(() => document.getElementById("f-numero")?.focus());
  }

  async function pagar() {
    const pedido: Pedido = {
      itens,
      cliente: { ...cliente, cpf: cliente.cpf || undefined },
      entrega: endereco,
      frete: valorFrete,
      forma,
      modalidade: valores.temSobMedida ? modalidade : "total",
      cupom: cupom?.codigo,
    };
    setPagando(true);
    setErroPagamento(null);
    const resultado = await provedorAtual.pagar(pedido);
    setPagando(false);
    if (resultado.status === "erro") {
      setErroPagamento(resultado.mensagem);
      return;
    }
    const valoresFinais = calcularValores(itens, { forma, modalidade: pedido.modalidade, frete: valorFrete, cupom });
    flushSync(() => {
      setFeito({ pedido, resultado, valores: valoresFinais, freteTexto: frete ? `${frete.prazoMin} a ${frete.prazoMax} dias úteis` : null, etapas });
    });
    clear();
    removerCupom();
    irPara("confirmacao");
  }

  if (!hydrated) {
    return <div className="min-h-[60vh]" aria-busy="true" />;
  }

  if (!feito && lines.length === 0) {
    return (
      <div className="mx-auto flex max-w-[420px] flex-col items-center gap-6 px-4 pb-24 pt-20 text-center text-[#1B4965]">
        <h1 className="font-serif text-[26px]">Sua sacola está vazia</h1>
        <Link href="/loja" className={`${BOTAO_CONTORNO} w-full`}>
          Ver a loja
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1120px] px-4 pb-24 pt-4 text-[#1B4965] md:px-8 lg:grid lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-16 lg:pt-8">
      <div className="min-w-0 lg:max-w-[560px]">
        {/* Progresso: etapa atual e as anteriores (clicáveis para voltar). */}
        <nav aria-label="Etapas da compra">
          <ol className="flex gap-1.5" aria-hidden>
            {etapas.map((e, i) => (
              <li key={e} className={`h-[3px] flex-1 rounded-full ${i <= indice ? "bg-[#1B4965]" : "bg-[#1B4965]/15"}`} />
            ))}
          </ol>
          <p className="mt-3 flex items-center justify-between text-[12px] leading-5 text-brand-muted">
            <span>
              Etapa {indice + 1} de {etapas.length}
            </span>
            {!feito && indice > 0 && (
              <button
                type="button"
                onClick={() => irPara(etapas[indice - 1])}
                className={`-my-3 flex min-h-11 items-center underline underline-offset-4 ${HOVER} ${FOCO}`}
              >
                Voltar para {TITULOS[etapas[indice - 1]].toLowerCase()}
              </button>
            )}
          </p>
        </nav>

        <h1 ref={tituloRef} tabIndex={-1} className="mt-2 font-serif text-[28px] leading-9 outline-none lg:text-[32px] lg:leading-10">
          {feito ? `Pedido ${feito.resultado.codigo}` : TITULOS[etapa]}
        </h1>

        {/* Resumo recolhido (celular). */}
        {!feito && (
          <div className={`mt-4 border-y lg:hidden ${LINHA}`}>
            <button
              type="button"
              aria-expanded={resumoAberto}
              aria-controls="resumo-celular"
              onClick={() => setResumoAberto((a) => !a)}
              className={`flex h-12 w-full items-center justify-between text-[13px] ${HOVER} ${FOCO}`}
            >
              <span>
                {resumoAberto ? "Fechar resumo" : "Ver resumo"} · {itens.reduce((s, i) => s + i.qty, 0)}{" "}
                {itens.reduce((s, i) => s + i.qty, 0) === 1 ? "peça" : "peças"}
              </span>
              <span className="nums-preco font-serif text-[17px] font-medium">{formatBRL(valores.total)}</span>
            </button>
            <div id="resumo-celular" hidden={!resumoAberto} className="pb-4">
              <Resumo itens={itens} forma={forma} valores={valores} temFrete={Boolean(frete)} />
            </div>
          </div>
        )}

        {feito ? (
          <Confirmacao feito={feito} />
        ) : (
          <form onSubmit={avancar} noValidate className="mt-6">
            {etapa === "dados" && (
              <div className="space-y-4">
                <Campo
                  id="f-nome"
                  rotulo="Nome e sobrenome"
                  autoComplete="name"
                  value={cliente.nome}
                  onChange={(e) => setCliente({ ...cliente, nome: e.target.value })}
                  erro={erros.nome}
                />
                <Campo
                  id="f-email"
                  rotulo="E-mail"
                  type="email"
                  autoComplete="email"
                  inputMode="email"
                  value={cliente.email}
                  onChange={(e) => setCliente({ ...cliente, email: e.target.value })}
                  erro={erros.email}
                />
                <Campo
                  id="f-whatsapp"
                  rotulo="WhatsApp com DDD"
                  type="tel"
                  autoComplete="tel-national"
                  inputMode="tel"
                  value={cliente.whatsapp}
                  onChange={(e) => setCliente({ ...cliente, whatsapp: mascaraTelefone(e.target.value) })}
                  erro={erros.whatsapp}
                />
                <Campo
                  id="f-cpf"
                  rotulo="CPF (opcional)"
                  inputMode="numeric"
                  autoComplete="off"
                  value={cliente.cpf ?? ""}
                  onChange={(e) => setCliente({ ...cliente, cpf: mascaraCpf(e.target.value) })}
                  erro={erros.cpf}
                />
              </div>
            )}

            {etapa === "entrega" && (
              <div className="space-y-4">
                <Campo
                  id="f-cep"
                  rotulo="CEP"
                  inputMode="numeric"
                  autoComplete="postal-code"
                  value={endereco.cep}
                  onChange={(e) => aoMudarCep(e.target.value)}
                  erro={erros.cep ?? (cepStatus === "erro" ? "Não achamos esse CEP. Confira ou preencha o endereço." : undefined)}
                  dica={cepStatus === "buscando" ? "Buscando o endereço..." : "O endereço é preenchido pelo CEP."}
                  className="max-w-[220px]"
                />
                <p aria-live="polite" className="text-[13px] leading-5">
                  {frete && cepStatus === "ok" && (
                    <>
                      Frete para {frete.endereco.localidade}/{frete.endereco.uf}:{" "}
                      <span className="nums-preco font-serif text-[16px] font-medium">{formatBRL(frete.valor)}</span>, de{" "}
                      {frete.prazoMin} a {frete.prazoMax} dias úteis.{" "}
                      <span className="text-brand-muted">Estimativa; o valor final é confirmado no WhatsApp.</span>
                    </>
                  )}
                </p>
                <Campo
                  id="f-rua"
                  rotulo="Rua"
                  autoComplete="address-line1"
                  value={endereco.rua}
                  onChange={(e) => setEndereco({ ...endereco, rua: e.target.value })}
                  erro={erros.rua}
                />
                <div className="grid grid-cols-[110px_minmax(0,1fr)] gap-3">
                  <Campo
                    id="f-numero"
                    rotulo="Número"
                    inputMode="numeric"
                    autoComplete="off"
                    value={endereco.numero}
                    onChange={(e) => setEndereco({ ...endereco, numero: e.target.value })}
                    erro={erros.numero}
                  />
                  <Campo
                    id="f-complemento"
                    rotulo="Complemento (opcional)"
                    autoComplete="address-line2"
                    value={endereco.complemento ?? ""}
                    onChange={(e) => setEndereco({ ...endereco, complemento: e.target.value })}
                  />
                </div>
                <Campo
                  id="f-bairro"
                  rotulo="Bairro"
                  value={endereco.bairro}
                  onChange={(e) => setEndereco({ ...endereco, bairro: e.target.value })}
                  erro={erros.bairro}
                />
                <div className="grid grid-cols-[minmax(0,1fr)_80px] gap-3">
                  <Campo
                    id="f-cidade"
                    rotulo="Cidade"
                    autoComplete="address-level2"
                    value={endereco.cidade}
                    onChange={(e) => setEndereco({ ...endereco, cidade: e.target.value })}
                    erro={erros.cidade}
                  />
                  <Campo
                    id="f-uf"
                    rotulo="UF"
                    autoComplete="address-level1"
                    maxLength={2}
                    value={endereco.uf}
                    onChange={(e) => setEndereco({ ...endereco, uf: e.target.value.toUpperCase().replace(/[^A-Z]/g, "") })}
                  />
                </div>
              </div>
            )}

            {etapa === "medidas" && (
              <div>
                <p className="text-[14px] leading-[22px] text-brand-muted">Em centímetros. A peça é feita com as suas medidas.</p>
                <ul className="mt-5 space-y-6">
                  {sobMedidaRoupa.map((i) => (
                    <li key={i.id} id={`medidas-${i.id}`} className={`border-t pt-5 ${LINHA}`}>
                      <div className="mb-4 flex items-center gap-3">
                        <span className="relative h-16 w-12 shrink-0 overflow-hidden bg-[#1B4965]/5">
                          <Image src={i.foto} alt="" fill sizes="48px" className="object-cover" />
                        </span>
                        <p className="font-serif text-[19px] leading-6">{i.nome}</p>
                      </div>
                      <CamposMedidas id={i.id} erro={medidaPendente(i.id) ? erros[i.id] : undefined} />
                    </li>
                  ))}
                </ul>
                {acessoriosSobMedida.length > 0 && (
                  <p className="mt-6 text-[13px] leading-5 text-brand-muted">
                    {acessoriosSobMedida.map((a) => a.nome).join(", ")}: o ajuste é combinado com a Gio.
                  </p>
                )}
              </div>
            )}

            {etapa === "pagamento" && (
              <div>
                <fieldset>
                  <legend className="text-[10px] uppercase leading-3 tracking-[0.14em]">Forma de pagamento</legend>
                  <div className="mt-3 space-y-2">
                    <Opcao
                      nome="forma"
                      valor="pix"
                      marcado={forma === "pix"}
                      aoMarcar={() => setForma("pix")}
                      titulo="Pix"
                      detalhe="O menor valor"
                      direita={formatBRL(valoresPix.total)}
                    />
                    <Opcao
                      nome="forma"
                      valor="cartao"
                      marcado={forma === "cartao"}
                      aoMarcar={() => setForma("cartao")}
                      titulo="Cartão de crédito"
                      detalhe={valoresCartao.maxParcelas > 1 ? `Em até ${valoresCartao.maxParcelas}x sem juros` : "À vista"}
                      direita={formatBRL(valoresCartao.total)}
                    />
                  </div>
                </fieldset>

                {valores.temSobMedida && (
                  <fieldset className="mt-6">
                    <legend className="text-[10px] uppercase leading-3 tracking-[0.14em]">Quanto pagar agora</legend>
                    <div className="mt-3 space-y-2">
                      <Opcao
                        nome="modalidade"
                        valor="sinal"
                        marcado={modalidade === "sinal"}
                        aoMarcar={() => setModalidade("sinal")}
                        titulo="Pagar o sinal de 50% agora"
                        detalhe={`O restante, ${formatBRL(calcularValores(itens, { forma, modalidade: "sinal", frete: valorFrete, cupom }).depois)}, antes do envio`}
                        direita={formatBRL(calcularValores(itens, { forma, modalidade: "sinal", frete: valorFrete, cupom }).agora)}
                      />
                      <Opcao
                        nome="modalidade"
                        valor="total"
                        marcado={modalidade === "total"}
                        aoMarcar={() => setModalidade("total")}
                        titulo="Pagar tudo agora"
                        direita={formatBRL(valores.total)}
                      />
                    </div>
                  </fieldset>
                )}

                {forma === "cartao" ? (
                  <div className="mt-6 flex min-h-[132px] flex-col items-center justify-center rounded-[4px] border border-dashed border-[#1B4965]/50 px-6 py-6 text-center">
                    <p className="text-[14px] leading-5">Aqui entra o pagamento seguro do provedor.</p>
                    <p className="mt-1 text-[12px] leading-4 text-brand-muted">Os dados do cartão são digitados no ambiente dele, não neste site.</p>
                  </div>
                ) : (
                  <p className="mt-6 text-[13px] leading-5 text-brand-muted">O código Pix aparece na próxima tela.</p>
                )}
              </div>
            )}

            {erroPagamento && (
              <p role="alert" className="mt-4 text-[13px] text-[#a33]">
                {erroPagamento}
              </p>
            )}

            <div className="mt-8">
              {etapa === "pagamento" ? (
                <button type="button" onClick={pagar} disabled={pagando} aria-busy={pagando} className={`${BOTAO_PRINCIPAL} disabled:opacity-70`}>
                  {pagando
                    ? "Processando..."
                    : forma === "pix"
                      ? `Gerar Pix de ${formatBRL(valores.agora)}`
                      : `Pagar ${formatBRL(valores.agora)}`}
                </button>
              ) : (
                <button type="submit" className={BOTAO_PRINCIPAL}>
                  Continuar
                </button>
              )}
              {etapa === "pagamento" && provedorAtual.demonstracao && (
                <p className="mt-3 flex items-center justify-center gap-2 text-[12px] text-brand-muted">
                  <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-[#b8902a]" />
                  Modo demonstração: nenhum valor é cobrado.
                </p>
              )}
              {etapa === "dados" && (
                <Link href="/loja" className={`mt-2 flex min-h-11 items-center justify-center text-[12px] text-brand-muted underline underline-offset-4 ${HOVER} ${FOCO}`}>
                  Continuar comprando
                </Link>
              )}
            </div>
          </form>
        )}
      </div>

      {/* Resumo ao lado (computador). */}
      {!feito && (
        <aside aria-label="Resumo do pedido" className="hidden lg:block">
          <div className={`sticky top-8 border-t pt-5 ${LINHA}`}>
            <h2 className="text-[10px] uppercase leading-3 tracking-[0.14em]">Resumo</h2>
            <div className="mt-4">
              <Resumo itens={itens} forma={forma} valores={valores} temFrete={Boolean(frete)} />
            </div>
          </div>
        </aside>
      )}
    </div>
  );
}

function Resumo({
  itens,
  forma,
  valores,
  temFrete,
}: {
  itens: ItemPedido[];
  forma: FormaPagamento;
  valores: ReturnType<typeof calcularValores>;
  temFrete: boolean;
}) {
  const unit = (i: ItemPedido) => (forma === "pix" ? i.precoPix : i.precoCartao);
  return (
    <div className="text-[13px] leading-5">
      <ul className="space-y-3">
        {itens.map((i) => (
          <li key={`${i.id}:${i.opcao}`} className="flex items-center gap-3">
            <span className="relative h-16 w-12 shrink-0 overflow-hidden bg-[#1B4965]/5">
              <Image src={i.foto} alt="" fill sizes="48px" className="object-cover" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate">
                {i.qty > 1 ? `${i.qty}x ` : ""}
                {i.nome}
              </span>
              <span className="block text-[12px] text-brand-muted">{i.opcao === "pronta-entrega" ? "Pronta entrega" : "Sob medida"}</span>
            </span>
            <span className="nums-preco shrink-0 font-serif text-[15px] font-medium">{formatBRL(unit(i) * i.qty)}</span>
          </li>
        ))}
      </ul>
      <dl className={`mt-4 space-y-1 border-t pt-3 ${LINHA}`}>
        <Linha rotulo={forma === "pix" ? "Subtotal no pix" : "Subtotal no cartão"} valor={formatBRL(valores.subtotal)} />
        {valores.desconto > 0 && <Linha rotulo="Cupom" valor={`−${formatBRL(valores.desconto)}`} />}
        <Linha rotulo="Frete" valor={temFrete ? formatBRL(valores.frete) : "pelo CEP"} />
        <div className="flex items-baseline justify-between pt-2">
          <dt className="text-[12px] uppercase tracking-[0.14em]">Total</dt>
          <dd className="nums-preco font-serif text-[20px] font-medium">{formatBRL(valores.total)}</dd>
        </div>
        {valores.agora < valores.total && (
          <>
            <Linha rotulo="Agora (sinal)" valor={formatBRL(valores.agora)} />
            <Linha rotulo="Antes do envio" valor={formatBRL(valores.depois)} />
          </>
        )}
      </dl>
    </div>
  );
}

function Linha({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3 text-brand-muted">
      <dt>{rotulo}</dt>
      <dd className="nums-preco text-[#1B4965]">{valor}</dd>
    </div>
  );
}
