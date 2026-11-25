"use client";

import { useEffect, useEffectEvent, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/components/cart/CartProvider";
import {
  calcularValores,
  linkWhatsapp,
  mensagemDoPedido,
  provedorAtual,
  validarCliente,
  validarEndereco,
  type DadosCliente,
  type Endereco,
  type FormaPagamento,
  type Modalidade,
  type Pedido,
  type Valores,
} from "@/lib/checkout";
import { buscarCep, estimarFrete, mascararCep, normalizarCep, ORIGEM } from "@/lib/frete";
import { formatBRLPreco } from "@/lib/format";
import { itensComMedidas, medidasEmDia, precisaDeMedidas, rotuloOpcao, textoMedidas } from "@/lib/v2/pedido";
import { salvarRascunho, useMedidasCliente } from "@/lib/v2/medidasCliente";
import { medidasDoRascunho, rascunhoCompleto, tamanhoDoRascunho, type Rascunho } from "@/lib/v2/medidasRascunho";
import { IconeWhatsApp } from "@/components/v3/estrutura/Icones";
import { BOTAO_CONTORNO, BOTAO_PRINCIPAL, FOCO, HOVER, LINHA } from "@/components/v3/estrutura/estilo";
import Provador from "../provador/Provador";
import { BarraEtapas, CabecalhoCheckout, Campo, ETAPAS, ListaItens, OpcaoCartao, ResumoRecolhido, Valores as LinhasValores } from "./partes";

// Checkout dentro do site (versão 2), em cinco etapas curtas:
//   1. seus dados; 2. entrega, com o CEP que preenche o endereço e estima o
//   frete; 3. medidas das peças de vestir sob medida que ainda não vieram do
//   provador (ou "por vídeo"); 4. pagamento, pix ou cartão e, com peça sob
//   medida, sinal de 50% ou tudo; 5. confirmação, com o código do pedido e o
//   botão que manda tudo para a Gio no WhatsApp.
// O núcleo (valores, validação, mensagem e provedor) é o lib/checkout.ts
// comum às versões. O provedor de hoje é o de demonstração: nada é cobrado.

type Confirmado = { codigo: string; aprovado: boolean; pix?: string; pedido: Pedido; valores: Valores };

const CLIENTE_VAZIO: DadosCliente = { nome: "", email: "", whatsapp: "", cpf: "" };
const ENDERECO_VAZIO: Endereco = { cep: "", rua: "", numero: "", complemento: "", bairro: "", cidade: "", uf: "" };

function mascararTelefone(v: string) {
  const d = v.replace(/\D/g, "").slice(0, 11);
  if (d.length === 0) return "";
  if (d.length <= 2) return `(${d}`;
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

function mascararCpf(v: string) {
  const d = v.replace(/\D/g, "").slice(0, 11);
  return d
    .replace(/^(\d{3})(\d)/, "$1.$2")
    .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d{1,2})$/, ".$1-$2");
}

const chave = (i: { id: string; opcao: string }) => `${i.id}:${i.opcao}`;

// Cada etapa vira uma entrada no histórico, sem trocar a URL: o voltar do
// celular volta uma etapa sem perder o que foi digitado. A entrada da etapa 1
// é a da própria página (sem a chave).
const CHAVE_HISTORICO = "etapaCheckout";

function etapaDoHistorico(estado: unknown): number {
  const n = (estado as Record<string, unknown> | null)?.[CHAVE_HISTORICO];
  return typeof n === "number" && n >= 1 && n <= 4 ? n : 1;
}

function rascunhoDa(item: { medidas?: { busto?: number; cintura?: number; quadril?: number }; medidasPorVideo?: boolean }): Rascunho {
  const m = item.medidas ?? {};
  return {
    busto: m.busto ? String(m.busto) : "",
    cintura: m.cintura ? String(m.cintura) : "",
    quadril: m.quadril ? String(m.quadril) : "",
    porVideo: !!item.medidasPorVideo,
  };
}

export default function Checkout() {
  const { lines, hydrated, cupom, aplicarCupom, removerCupom, clear, definirMedidas } = useCart();
  const salvo = useMedidasCliente();
  const tituloRef = useRef<HTMLHeadingElement>(null);
  const cepPedido = useRef("");

  const [etapa, setEtapa] = useState(1);
  const [tentou, setTentou] = useState<Record<number, boolean>>({});
  const [cliente, setCliente] = useState<DadosCliente>(CLIENTE_VAZIO);
  const [endereco, setEndereco] = useState<Endereco>(ENDERECO_VAZIO);
  const [cepStatus, setCepStatus] = useState<"idle" | "buscando" | "ok" | "nao-achou">("idle");
  const [rascunhos, setRascunhos] = useState<Record<string, Rascunho>>({});
  const [forma, setForma] = useState<FormaPagamento>("cartao");
  const [modalidade, setModalidade] = useState<Modalidade>("sinal");
  const [codigoCupom, setCodigoCupom] = useState("");
  const [erroCupom, setErroCupom] = useState<string | null>(null);
  const [pagando, setPagando] = useState(false);
  const [erroPagamento, setErroPagamento] = useState<string | null>(null);
  const [confirmado, setConfirmado] = useState<Confirmado | null>(null);
  const [copiado, setCopiado] = useState(false);

  const itens = useMemo(() => itensComMedidas(lines), [lines]);
  const temSobMedida = itens.some((i) => i.opcao === "sob-medida");
  const pedemMedidas = itens.filter(precisaDeMedidas);

  const frete = useMemo(() => {
    const uf = endereco.uf.trim().toUpperCase();
    if (!/^[A-Z]{2}$/.test(uf) || !endereco.cidade.trim()) return null;
    return estimarFrete({ cep: endereco.cep, uf, localidade: endereco.cidade.trim() });
  }, [endereco.cep, endereco.cidade, endereco.uf]);

  const opcoesValor = { modalidade: temSobMedida ? modalidade : ("total" as Modalidade), frete: frete?.valor, cupom };
  const v = calcularValores(itens, { forma, ...opcoesValor });
  const vPix = calcularValores(itens, { ...opcoesValor, forma: "pix" });
  const vCartao = calcularValores(itens, { ...opcoesValor, forma: "cartao" });

  const errosCliente = validarCliente({ ...cliente, cpf: cliente.cpf || undefined });
  const errosEndereco = validarEndereco(endereco);

  function mostrar(n: number) {
    setEtapa(n);
    window.scrollTo({ top: 0, behavior: "auto" });
    requestAnimationFrame(() => tituloRef.current?.focus({ preventScroll: true }));
  }

  /** Avança para a etapa e guarda a entrada no histórico. */
  function avancar(n: number) {
    window.history.pushState({ [CHAVE_HISTORICO]: n }, "");
    mostrar(n);
  }

  /** Volta pela barra das etapas: pelo histórico, quando as entradas são desta compra. */
  function voltarPara(n: number) {
    if (n < etapa && etapaDoHistorico(window.history.state) === etapa) window.history.go(n - etapa);
    else mostrar(n);
  }

  /** A etapa mais adiantada que os dados já preenchidos permitem. */
  function etapaPermitida() {
    if (Object.keys(errosCliente).length > 0) return 1;
    if (Object.keys(errosEndereco).length > 0) return 2;
    if (!itens.every(medidasEmDia)) return 3;
    return 4;
  }

  function continuar(atual: number, ok: boolean, proxima: () => void) {
    if (!ok) {
      setTentou((t) => ({ ...t, [atual]: true }));
      return;
    }
    proxima();
  }

  /** As medidas que abrem para a peça: as dela, se já tiver, ou as do provador deste aparelho. */
  function rascunhoInicial(item: (typeof itens)[number]): Rascunho {
    const proprio = rascunhoDa(item);
    return proprio.busto || proprio.cintura || proprio.quadril ? proprio : salvo;
  }

  // Ao chegar nas medidas: abre o formulário das peças que ainda não têm,
  // já com as medidas que a cliente deixou no provador deste aparelho.
  function prepararMedidas() {
    const novos: Record<string, Rascunho> = {};
    for (const item of pedemMedidas) {
      if (!medidasEmDia(item)) novos[chave(item)] = rascunhoInicial(item);
    }
    setRascunhos(novos);
  }

  function abrirMedidas() {
    prepararMedidas();
    avancar(3);
  }

  function salvarMedidas() {
    // Peça que ainda pede medidas e está fechada (chegou aqui pelo histórico): abre e cobra.
    const fechadas = pedemMedidas.filter((i) => !medidasEmDia(i) && !rascunhos[chave(i)]);
    if (fechadas.length > 0) {
      setRascunhos((atual) => ({ ...atual, ...Object.fromEntries(fechadas.map((i) => [chave(i), rascunhoInicial(i)])) }));
      setTentou((t) => ({ ...t, 3: true }));
      return;
    }
    const abertos = Object.entries(rascunhos);
    const ok = abertos.every(([, r]) => r.porVideo || rascunhoCompleto(r));
    continuar(3, ok, () => {
      for (const [k, r] of abertos) {
        const item = itens.find((i) => chave(i) === k);
        if (!item) continue;
        definirMedidas(
          item.id,
          item.opcao,
          r.porVideo ? { medidasPorVideo: true } : { medidas: medidasDoRascunho(r), tamanhoReferencia: tamanhoDoRascunho(r)?.tamanho }
        );
      }
      // As últimas medidas digitadas valem para as próximas peças (o "por vídeo" de uma peça não).
      const ultimo = abertos.map(([, r]) => r).filter((r) => !r.porVideo && rascunhoCompleto(r)).at(-1);
      if (ultimo) salvarRascunho(ultimo);
      setRascunhos({});
      avancar(4);
    });
  }

  // Voltar e avançar do navegador dentro do checkout. Depois do pedido, o
  // voltar sai do checkout (vai para a página de antes da etapa 1).
  const aoNavegar = useEffectEvent((e: PopStateEvent) => {
    if (window.location.pathname !== "/checkout") return;
    const alvo = etapaDoHistorico(e.state);
    if (confirmado) {
      window.history.go(-alvo);
      return;
    }
    const n = Math.min(alvo, etapaPermitida());
    if (n === etapa) return;
    if (n === 3) prepararMedidas();
    mostrar(n);
  });

  useEffect(() => {
    const aoPopState = (e: PopStateEvent) => aoNavegar(e);
    window.addEventListener("popstate", aoPopState);
    return () => window.removeEventListener("popstate", aoPopState);
  }, []);

  async function aoMudarCep(texto: string) {
    const cep = mascararCep(texto);
    setEndereco((e) => ({ ...e, cep }));
    const digitos = normalizarCep(cep);
    if (digitos.length !== 8) {
      if (cepStatus === "buscando") setCepStatus("idle");
      return;
    }
    if (digitos === cepPedido.current) return;
    cepPedido.current = digitos;
    setCepStatus("buscando");
    const achado = await buscarCep(digitos);
    if (cepPedido.current !== digitos) return;
    if (achado) {
      setEndereco((e) => ({
        ...e,
        rua: achado.logradouro ?? e.rua,
        bairro: achado.bairro ?? e.bairro,
        cidade: achado.localidade || e.cidade,
        uf: achado.uf || e.uf,
      }));
      setCepStatus("ok");
    } else {
      setCepStatus("nao-achou");
    }
  }

  function aoAplicarCupom() {
    const r = aplicarCupom(codigoCupom);
    if (r.status === "ok") {
      setCodigoCupom("");
      setErroCupom(null);
    } else {
      setErroCupom(r.status === "expirado" ? "Esse cupom expirou." : "Cupom inválido. Confira o código.");
    }
  }

  async function pagar() {
    if (pagando) return;
    setPagando(true);
    setErroPagamento(null);
    const pedido: Pedido = {
      itens,
      cliente: { ...cliente, cpf: cliente.cpf || undefined },
      entrega: { ...endereco, uf: endereco.uf.toUpperCase() },
      frete: frete?.valor ?? 0,
      forma,
      modalidade: temSobMedida ? modalidade : "total",
      cupom: cupom?.codigo,
    };
    const r = await provedorAtual.pagar(pedido);
    setPagando(false);
    if (r.status === "erro") {
      setErroPagamento(r.mensagem);
      return;
    }
    setConfirmado({
      codigo: r.codigo,
      aprovado: r.status === "aprovado",
      pix: r.status === "pendente" ? r.pix?.copiaECola : undefined,
      pedido,
      valores: v,
    });
    clear();
    removerCupom();
    mostrar(5);
  }

  async function copiarPix(codigo: string) {
    try {
      await navigator.clipboard.writeText(codigo);
      setCopiado(true);
    } catch {
      setCopiado(false);
    }
  }

  // Antes de ler a sacola salva, nada (o servidor não a conhece).
  if (!hydrated) {
    return (
      <>
        <CabecalhoCheckout />
        <main className="min-h-screen bg-[#EDE7D9]" />
      </>
    );
  }

  if (lines.length === 0 && !confirmado) {
    return (
      <>
        <CabecalhoCheckout />
        <main className="min-h-[70vh] bg-[#EDE7D9] px-4 pt-16 text-center text-[#1B4965]">
          <h1 className="font-[family-name:var(--font-serif)] text-[26px] leading-8">Sua sacola está vazia</h1>
          <Link href="/loja" className={`mx-auto mt-6 max-w-[280px] ${BOTAO_CONTORNO}`}>
            Ver a loja
          </Link>
        </main>
      </>
    );
  }

  const titulo = etapa === 5 && confirmado ? `Pedido ${confirmado.codigo}` : ETAPAS[etapa - 1];
  const erro = (campo: string, erros: Record<string, string | undefined>) => (tentou[etapa] ? erros[campo] : undefined);

  const resumo = (
    <>
      <ListaItens itens={itens} forma={forma} />
      <div className="mt-4">
        <LinhasValores v={v} forma={forma} freteConhecido={!!frete} mostrarAgora={etapa >= 4} cupom={cupom?.codigo} />
      </div>
    </>
  );

  return (
    <>
      <CabecalhoCheckout />
      <main className="min-h-screen bg-[#EDE7D9] text-[#1B4965]">
        <div
          className={`mx-auto px-4 pb-16 pt-2 md:px-8 lg:pt-6 ${
            etapa < 5 ? "max-w-[1080px] lg:grid lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-16" : "max-w-[624px]"
          }`}
        >
          <div className="min-w-0 max-w-[560px]">
            {etapa < 5 && (
              <>
                <BarraEtapas atual={etapa} aoIr={voltarPara} />
                <div className="mt-4">
                  <ResumoRecolhido total={formatBRLPreco(v.total)} pecas={itens.reduce((s, i) => s + i.qty, 0)}>
                    {resumo}
                  </ResumoRecolhido>
                </div>
              </>
            )}

            {etapa === 5 && <p className="pt-6 text-[11px] uppercase tracking-[0.16em] text-brand-muted">Pedido feito</p>}
            <h1
              ref={tituloRef}
              tabIndex={-1}
              className={`font-[family-name:var(--font-serif)] text-[28px] leading-9 outline-none md:text-[32px] md:leading-10 ${etapa === 5 ? "mt-1" : "mt-6"}`}
            >
              {titulo}
            </h1>

            {etapa === 1 && (
              <form
                noValidate
                className="mt-5 space-y-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  continuar(1, Object.keys(errosCliente).length === 0, () => avancar(2));
                }}
              >
                <Campo
                  rotulo="Nome e sobrenome"
                  autoComplete="name"
                  value={cliente.nome}
                  onChange={(e) => setCliente({ ...cliente, nome: e.target.value })}
                  erro={erro("nome", errosCliente)}
                />
                <Campo
                  rotulo="E-mail"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  value={cliente.email}
                  onChange={(e) => setCliente({ ...cliente, email: e.target.value })}
                  erro={erro("email", errosCliente)}
                />
                <Campo
                  rotulo="WhatsApp"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel-national"
                  placeholder="(91) 99999-9999"
                  value={cliente.whatsapp}
                  onChange={(e) => setCliente({ ...cliente, whatsapp: mascararTelefone(e.target.value) })}
                  erro={erro("whatsapp", errosCliente)}
                />
                <Campo
                  rotulo="CPF"
                  opcional
                  inputMode="numeric"
                  autoComplete="off"
                  value={cliente.cpf ?? ""}
                  onChange={(e) => setCliente({ ...cliente, cpf: mascararCpf(e.target.value) })}
                  erro={erro("cpf", errosCliente)}
                />
                <button type="submit" className={`${BOTAO_PRINCIPAL} !mt-6`}>
                  Continuar
                </button>
              </form>
            )}

            {etapa === 2 && (
              <form
                noValidate
                className="mt-5 space-y-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  continuar(2, Object.keys(errosEndereco).length === 0, abrirMedidas);
                }}
              >
                <Campo
                  rotulo="CEP"
                  inputMode="numeric"
                  autoComplete="postal-code"
                  placeholder="00000-000"
                  value={endereco.cep}
                  onChange={(e) => aoMudarCep(e.target.value)}
                  erro={erro("cep", errosEndereco)}
                  nota={
                    cepStatus === "buscando"
                      ? "Buscando o endereço..."
                      : cepStatus === "nao-achou"
                        ? "Não achamos esse CEP. Preencha o endereço abaixo."
                        : `Enviamos de ${ORIGEM.cidade}/${ORIGEM.uf}.`
                  }
                  className="max-w-[220px]"
                />
                {(cepStatus === "ok" || cepStatus === "nao-achou" || endereco.rua !== "") && (
                  <>
                    <Campo rotulo="Rua" autoComplete="address-line1" value={endereco.rua} onChange={(e) => setEndereco({ ...endereco, rua: e.target.value })} erro={erro("rua", errosEndereco)} />
                    <div className="grid grid-cols-[minmax(0,2fr)_minmax(0,3fr)] gap-3">
                      <Campo rotulo="Número" inputMode="numeric" autoComplete="address-line2" value={endereco.numero} onChange={(e) => setEndereco({ ...endereco, numero: e.target.value })} erro={erro("numero", errosEndereco)} />
                      <Campo rotulo="Complemento" opcional value={endereco.complemento ?? ""} onChange={(e) => setEndereco({ ...endereco, complemento: e.target.value })} />
                    </div>
                    <Campo rotulo="Bairro" autoComplete="address-level3" value={endereco.bairro} onChange={(e) => setEndereco({ ...endereco, bairro: e.target.value })} erro={erro("bairro", errosEndereco)} />
                    <div className="grid grid-cols-[minmax(0,1fr)_72px] gap-3">
                      <Campo rotulo="Cidade" autoComplete="address-level2" value={endereco.cidade} onChange={(e) => setEndereco({ ...endereco, cidade: e.target.value })} erro={erro("cidade", errosEndereco)} />
                      <Campo rotulo="UF" autoComplete="address-level1" maxLength={2} value={endereco.uf} onChange={(e) => setEndereco({ ...endereco, uf: e.target.value.toUpperCase().replace(/[^A-Z]/g, "") })} />
                    </div>
                    {frete && (
                      <div aria-live="polite" className="rounded-[4px] bg-[#1B4965]/[0.06] px-3 py-3 text-[13px] leading-5">
                        <p className="flex justify-between gap-3">
                          <span>
                            Frete para {frete.endereco.localidade}/{frete.endereco.uf}
                          </span>
                          <span className="nums-preco font-[family-name:var(--font-serif)] text-[16px] font-medium">{formatBRLPreco(frete.valor)}</span>
                        </p>
                        <p className="text-[12px] leading-[18px] text-brand-muted">
                          {frete.prazoMin} a {frete.prazoMax} dias úteis depois do envio. Estimativa; o valor final é confirmado no WhatsApp.
                        </p>
                      </div>
                    )}
                  </>
                )}
                <button type="submit" className={`${BOTAO_PRINCIPAL} !mt-6`}>
                  Continuar
                </button>
              </form>
            )}

            {etapa === 3 && (
              <div className="mt-5">
                {pedemMedidas.length === 0 ? (
                  <p className="text-[14px] leading-[22px]">Suas peças não pedem medidas.</p>
                ) : (
                  <>
                    <p className="text-[14px] leading-[22px] text-brand-muted">
                      {Object.keys(rascunhos).length > 0 ? "Confira as medidas de cada peça." : "Suas medidas já vieram do provador."}
                    </p>
                    <ul className="mt-4 space-y-4">
                      {pedemMedidas.map((item) => {
                        const k = chave(item);
                        const r = rascunhos[k];
                        const falta = tentou[3] && r && !(r.porVideo || rascunhoCompleto(r));
                        return (
                          <li key={k} className={`rounded-[4px] border p-3 ${falta ? "border-[#a33]" : "border-[#1B4965]/15"}`}>
                            <div className="flex items-center gap-3">
                              <span className="relative h-16 w-12 shrink-0 overflow-hidden bg-[#1B4965]/5">
                                <Image src={item.foto} alt="" fill sizes="48px" className="object-cover object-[50%_40%]" />
                              </span>
                              <div className="min-w-0 flex-1">
                                <p className="truncate text-[14px] leading-5">{item.nome}</p>
                                <p className="text-[12px] leading-[18px] text-brand-muted">{r ? rotuloOpcao(item) : textoMedidas(item)}</p>
                              </div>
                              {!r && (
                                <button
                                  type="button"
                                  onClick={() => setRascunhos((atual) => ({ ...atual, [k]: rascunhoDa(item) }))}
                                  className={`-mr-1 flex min-h-11 items-center rounded-[4px] px-2 text-[12px] underline underline-offset-4 ${HOVER} ${FOCO}`}
                                >
                                  Alterar
                                </button>
                              )}
                            </div>
                            {r && (
                              <div className="mt-3">
                                <Provador compacto peca={item.nome} valor={r} aoMudar={(novo) => setRascunhos((atual) => ({ ...atual, [k]: novo }))} />
                                {falta && (
                                  <p role="alert" className="text-[12px] leading-[18px] text-[#a33]">
                                    Informe busto e cintura, ou escolha mandar por vídeo.
                                  </p>
                                )}
                              </div>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  </>
                )}
                <button type="button" onClick={salvarMedidas} className={`${BOTAO_PRINCIPAL} mt-6`}>
                  Continuar
                </button>
              </div>
            )}

            {etapa === 4 && (
              <div className="mt-5">
                <fieldset>
                  <legend className="text-[10px] uppercase leading-3 tracking-[0.14em]">Forma de pagamento</legend>
                  <div className="mt-2 space-y-2">
                    <OpcaoCartao
                      nome="forma"
                      valor="pix"
                      marcado={forma === "pix"}
                      aoEscolher={() => setForma("pix")}
                      titulo="Pix"
                      nota="O menor valor"
                      direita={formatBRLPreco(vPix.total)}
                    />
                    <OpcaoCartao
                      nome="forma"
                      valor="cartao"
                      marcado={forma === "cartao"}
                      aoEscolher={() => setForma("cartao")}
                      titulo="Cartão"
                      nota={vCartao.maxParcelas > 1 ? `Em até ${vCartao.maxParcelas}x sem juros` : "À vista"}
                      direita={formatBRLPreco(vCartao.total)}
                    />
                  </div>
                </fieldset>

                {temSobMedida && (
                  <fieldset className="mt-6">
                    <legend className="text-[10px] uppercase leading-3 tracking-[0.14em]">Quanto pagar agora</legend>
                    <div className="mt-2 space-y-2">
                      <OpcaoCartao
                        nome="modalidade"
                        valor="sinal"
                        marcado={modalidade === "sinal"}
                        aoEscolher={() => setModalidade("sinal")}
                        titulo="Pagar o sinal de 50% agora"
                        nota={`O restante, ${formatBRLPreco(calcularValores(itens, { forma, ...opcoesValor, modalidade: "sinal" }).depois)}, antes do envio`}
                        direita={formatBRLPreco(calcularValores(itens, { forma, ...opcoesValor, modalidade: "sinal" }).agora)}
                      />
                      <OpcaoCartao
                        nome="modalidade"
                        valor="total"
                        marcado={modalidade === "total"}
                        aoEscolher={() => setModalidade("total")}
                        titulo="Pagar tudo agora"
                        direita={formatBRLPreco(v.total)}
                      />
                    </div>
                  </fieldset>
                )}

                <details className={`group mt-5 border-y ${LINHA}`} open={!!cupom || undefined}>
                  <summary className={`flex h-12 cursor-pointer list-none items-center justify-between text-[11px] uppercase tracking-[0.14em] [&::-webkit-details-marker]:hidden ${FOCO}`}>
                    {cupom ? `Cupom ${cupom.codigo} aplicado` : "Tenho um cupom"}
                    <svg aria-hidden viewBox="0 0 12 12" className="h-3 w-3 group-open:rotate-180 motion-safe:transition-transform" fill="none" stroke="currentColor" strokeWidth={1.2}>
                      <path d="M2.5 4.5 6 8l3.5-3.5" />
                    </svg>
                  </summary>
                  <div className="pb-4">
                    {cupom ? (
                      <button type="button" onClick={removerCupom} className={`flex min-h-11 items-center text-[12px] text-brand-muted underline underline-offset-4 ${HOVER} ${FOCO}`}>
                        Remover cupom
                      </button>
                    ) : (
                      <div className="flex items-start gap-2">
                        <Campo
                          rotulo="Código do cupom"
                          className="flex-1"
                          autoCapitalize="characters"
                          autoComplete="off"
                          spellCheck={false}
                          value={codigoCupom}
                          onChange={(e) => {
                            setCodigoCupom(e.target.value.toUpperCase());
                            setErroCupom(null);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              aoAplicarCupom();
                            }
                          }}
                          erro={erroCupom ?? undefined}
                        />
                        <button type="button" onClick={aoAplicarCupom} className={`mt-[22px] flex h-11 shrink-0 items-center rounded-[4px] border border-[#1B4965] px-4 text-[12px] uppercase tracking-[0.14em] ${HOVER} ${FOCO}`}>
                          Aplicar
                        </button>
                      </div>
                    )}
                  </div>
                </details>

                {forma === "cartao" ? (
                  <div className="mt-5 flex flex-col items-center justify-center gap-1 rounded-[4px] border border-dashed border-[#1B4965]/50 px-4 py-6 text-center">
                    <svg aria-hidden viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.4} strokeLinecap="round">
                      <rect x="5" y="10.5" width="14" height="10" rx="1.5" />
                      <path d="M8.5 10.5V7.5a3.5 3.5 0 0 1 7 0v3" />
                    </svg>
                    <p className="text-[13px] leading-5">Aqui entra o pagamento seguro do provedor</p>
                  </div>
                ) : (
                  <p className="mt-5 text-[13px] leading-5 text-brand-muted">O código Pix aparece na próxima tela.</p>
                )}

                <button type="button" onClick={pagar} disabled={pagando} aria-busy={pagando || undefined} className={`${BOTAO_PRINCIPAL} mt-5 disabled:opacity-70`}>
                  {pagando ? "Processando..." : forma === "pix" ? `Gerar Pix de ${formatBRLPreco(v.agora)}` : `Pagar ${formatBRLPreco(v.agora)}`}
                </button>
                {erroPagamento && (
                  <p role="alert" className="mt-2 text-[12px] text-[#a33]">
                    {erroPagamento}
                  </p>
                )}
                {provedorAtual.demonstracao && (
                  <p className="mt-3 flex items-center justify-center gap-2 text-[12px] leading-[18px] text-brand-muted">
                    <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-[#1B4965]/50" />
                    Modo demonstração: nenhum valor é cobrado.
                  </p>
                )}
              </div>
            )}

            {etapa === 5 && confirmado && (
              <Confirmacao confirmado={confirmado} copiado={copiado} aoCopiar={copiarPix} />
            )}
          </div>

          {etapa < 5 && (
            <aside aria-label="Resumo do pedido" className="hidden lg:block">
              <div className="sticky top-[100px] rounded-[4px] border border-[#1B4965]/15 p-5">
                <h2 className="mb-4 text-[11px] uppercase tracking-[0.16em]">Resumo</h2>
                {resumo}
              </div>
            </aside>
          )}
        </div>
      </main>
    </>
  );
}

function Confirmacao({ confirmado, copiado, aoCopiar }: { confirmado: Confirmado; copiado: boolean; aoCopiar: (codigo: string) => void }) {
  const { pedido, valores: v, codigo } = confirmado;
  const e = pedido.entrega;
  const whatsapp = linkWhatsapp(mensagemDoPedido(pedido, codigo));

  return (
    <div className="mt-3">
      <p className="text-[14px] leading-[22px]">
        {confirmado.aprovado ? "Pagamento aprovado." : "Pix gerado. Copie o código no app do seu banco."}{" "}
        <span className="text-brand-muted">(demonstração)</span>
      </p>

      {confirmado.pix && (
        <div className="mt-4 flex items-center gap-2 rounded-[4px] border border-[#1B4965]/40 p-2 pl-3">
          <code className="min-w-0 flex-1 truncate text-[12px]">{confirmado.pix}</code>
          <button type="button" onClick={() => aoCopiar(confirmado.pix!)} className={`flex h-11 shrink-0 items-center rounded-[4px] border border-[#1B4965] px-3 text-[11px] uppercase tracking-[0.14em] ${HOVER} ${FOCO}`}>
            <span aria-live="polite">{copiado ? "Copiado" : "Copiar"}</span>
          </button>
        </div>
      )}

      <a href={whatsapp} target="_blank" rel="noopener noreferrer" className={`${BOTAO_PRINCIPAL} mt-6 gap-3 py-3 text-center leading-5`}>
        <IconeWhatsApp className="h-4 w-4 shrink-0" />
        Enviar o pedido para a Gio no WhatsApp
      </a>
      <p className="mt-2 text-center text-[12px] leading-[18px] text-brand-muted">A mensagem já leva as peças, as medidas e o endereço.</p>

      <div className={`mt-8 border-t pt-5 ${LINHA}`}>
        <h2 className="mb-3 text-[11px] uppercase tracking-[0.16em]">Resumo</h2>
        <ListaItens itens={pedido.itens} forma={pedido.forma} />
        <dl className="mt-4 space-y-1.5 text-[13px] leading-5">
          <div className="flex justify-between gap-3">
            <dt className="text-brand-muted">{pedido.forma === "pix" ? "Pix" : "Cartão"}, total com frete</dt>
            <dd className="nums-preco">{formatBRLPreco(v.total)}</dd>
          </div>
          <div className="flex justify-between gap-3">
            {/* Pix gerado ainda não está pago: o rótulo diz o que falta. */}
            <dt>
              {confirmado.aprovado
                ? v.depois > 0
                  ? "Sinal pago agora"
                  : "Pago agora"
                : v.depois > 0
                  ? "Sinal a pagar no Pix"
                  : "A pagar no Pix"}
            </dt>
            <dd className="nums-preco font-[family-name:var(--font-serif)] text-[17px] font-medium">{formatBRLPreco(v.agora)}</dd>
          </div>
          {v.depois > 0 && (
            <div className="flex justify-between gap-3">
              <dt className="text-brand-muted">Antes do envio</dt>
              <dd className="nums-preco text-brand-muted">{formatBRLPreco(v.depois)}</dd>
            </div>
          )}
        </dl>
        <h2 className="mb-1 mt-6 text-[11px] uppercase tracking-[0.16em]">Entrega</h2>
        <p className="text-[13px] leading-5">
          {e.rua}, {e.numero}
          {e.complemento ? `, ${e.complemento}` : ""}, {e.bairro}
          <br />
          {e.cidade}/{e.uf} · CEP {e.cep}
        </p>
      </div>

      <Link href="/loja" className={`${BOTAO_CONTORNO} mt-8 w-full`}>
        Voltar à loja
      </Link>
    </div>
  );
}
