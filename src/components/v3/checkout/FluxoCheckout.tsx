"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/components/cart/CartProvider";
import type { Medidas } from "@/data/medidas";
import { SINAL } from "@/data/conteudo-loja";
import {
  calcularValores,
  linkWhatsapp,
  medidasCompletas,
  mensagemDoPedido,
  provedorAtual,
  validarCliente,
  validarEndereco,
  type DadosCliente,
  type Endereco,
  type ItemPedido,
  type Pedido,
  type ResultadoPagamento,
  type Valores,
} from "@/lib/checkout";
import { formatBRL, formatBRLPreco } from "@/lib/format";
import {
  buscarCep,
  calcularFrete,
  estimarFrete,
  mascararCep,
  normalizarCep,
  ORIGEM,
  type FreteEstimado,
} from "@/lib/frete";
import {
  atualizarRascunhoCheckout,
  itensDoCarrinhoComMedidas,
  resumoMedidasPeca,
  salvarMedidasPeca,
  useMapaMedidas,
  useRascunhoCheckout,
} from "@/lib/pedido-v3";
import { BOTAO_CONTORNO, BOTAO_PRINCIPAL, CAMPO, FOCO, HOVER, LINHA } from "../estrutura/estilo";
import { IconeWhatsApp } from "../estrutura/Icones";
import { SeletorMedidasSobMedida } from "../produto/TabelaMedidas";

type Etapa = 1 | 2 | 3 | 4 | 5;

const ETAPAS: { numero: Etapa; rotulo: string }[] = [
  { numero: 1, rotulo: "1. Seus dados" },
  { numero: 2, rotulo: "2. Entrega" },
  { numero: 3, rotulo: "3. Medidas" },
  { numero: 4, rotulo: "4. Pagamento" },
  { numero: 5, rotulo: "5. Confirmação" },
];

type ConfirmacaoSnapshot = {
  pedido: Pedido;
  resultado: Extract<ResultadoPagamento, { status: "aprovado" | "pendente" }>;
  valores: Valores;
};

// Checkout dentro do site em 5 etapas curtas:
// (1) Seus dados: nome, e-mail, WhatsApp, CPF opcional (validarCliente);
// (2) Entrega: CEP que preenche o endereco (buscarCep e calcularFrete), numero, complemento (validarEndereco);
// (3) Medidas de cada peca sob medida que ainda nao tiver (medidasCompletas);
// (4) Pagamento: Pix ou cartao, e para pecas sob medida "pagar o sinal de 50% agora" ou "pagar tudo",
//     quadro reservado "Aqui entra o pagamento seguro do provedor" e botao que chama provedorAtual.pagar;
// (5) Confirmacao: codigo do pedido, resumo e botao "Enviar o pedido para a Gio no WhatsApp".
export default function FluxoCheckout() {
  const { lines, clear, cupom, hydrated, aplicarCupom, removerCupom } = useCart();
  const mapaMedidas = useMapaMedidas();
  const rascunho = useRascunhoCheckout();

  const [etapa, setEtapa] = useState<Etapa>(1);
  const [errosCliente, setErrosCliente] = useState<Partial<Record<keyof DadosCliente, string>>>({});
  const [errosEndereco, setErrosEndereco] = useState<Partial<Record<keyof Endereco, string>>>({});
  const [erroMedidas, setErroMedidas] = useState<string | null>(null);
  const [buscandoCep, setBuscandoCep] = useState(false);
  const [avisoCep, setAvisoCep] = useState<string | null>(null);
  const [editandoMedidaId, setEditandoMedidaId] = useState<string | null>(null);
  const [pagando, setPagando] = useState(false);
  const [erroPagamento, setErroPagamento] = useState<string | null>(null);
  const [confirmado, setConfirmado] = useState<ConfirmacaoSnapshot | null>(null);
  const [copiadoPix, setCopiadoPix] = useState(false);
  const [codigoCupom, setCodigoCupom] = useState("");
  const [erroCupom, setErroCupom] = useState<string | null>(null);

  const itens: ItemPedido[] = itensDoCarrinhoComMedidas(lines, mapaMedidas);
  const itensSobMedida = itens.filter((i) => i.opcao === "sob-medida");
  const faltamMedidas = itensSobMedida.filter((i) => !medidasCompletas(i));

  const freteAtual: FreteEstimado | null =
    rascunho.frete ??
    (rascunho.entrega.uf.trim().length === 2
      ? estimarFrete({
          cep: rascunho.entrega.cep || "66040-100",
          uf: rascunho.entrega.uf.trim().toUpperCase(),
          localidade: rascunho.entrega.cidade || ORIGEM.cidade,
          bairro: rascunho.entrega.bairro || undefined,
          logradouro: rascunho.entrega.rua || undefined,
        })
      : null);

  const valores = calcularValores(itens, {
    forma: rascunho.forma,
    modalidade: rascunho.modalidade,
    frete: freteAtual?.valor ?? 0,
    cupom,
  });

  function atualizarCliente(parcial: Partial<DadosCliente>) {
    atualizarRascunhoCheckout({
      cliente: { ...rascunho.cliente, ...parcial },
    });
  }

  function atualizarEntrega(parcial: Partial<Endereco>) {
    const novaEntrega = { ...rascunho.entrega, ...parcial };
    let novoFrete = rascunho.frete;
    if (parcial.uf !== undefined || parcial.cidade !== undefined) {
      if (novaEntrega.uf.trim().length === 2) {
        novoFrete =
          estimarFrete({
            cep: novaEntrega.cep || "66040-100",
            uf: novaEntrega.uf.trim().toUpperCase(),
            localidade: novaEntrega.cidade || "",
            bairro: novaEntrega.bairro || undefined,
            logradouro: novaEntrega.rua || undefined,
          }) ?? rascunho.frete;
      }
    }
    atualizarRascunhoCheckout({
      entrega: novaEntrega,
      frete: novoFrete,
    });
  }

  async function consultarCep(cepBruto: string) {
    const limpo = normalizarCep(cepBruto);
    if (limpo.length !== 8) {
      setAvisoCep("Digite os 8 números do CEP.");
      return;
    }
    setBuscandoCep(true);
    setAvisoCep(null);
    const [end, freteCalc] = await Promise.all([buscarCep(limpo), calcularFrete(limpo)]);
    setBuscandoCep(false);

    if (end) {
      atualizarRascunhoCheckout({
        entrega: {
          ...rascunho.entrega,
          cep: end.cep,
          rua: end.logradouro || rascunho.entrega.rua,
          bairro: end.bairro || rascunho.entrega.bairro,
          cidade: end.localidade || rascunho.entrega.cidade,
          uf: end.uf || rascunho.entrega.uf,
        },
        frete: freteCalc,
      });
      setErrosEndereco({});
    } else {
      setAvisoCep("Não foi possível preencher pelo CEP agora. Complete rua, bairro, cidade e UF abaixo.");
    }
  }

  function avancarDeDados(e: React.FormEvent) {
    e.preventDefault();
    const erros = validarCliente(rascunho.cliente);
    setErrosCliente(erros);
    if (Object.keys(erros).length > 0) return;
    setEtapa(2);
  }

  function avancarDeEntrega(e: React.FormEvent) {
    e.preventDefault();
    const erros = validarEndereco(rascunho.entrega);
    setErrosEndereco(erros);
    if (Object.keys(erros).length > 0) return;
    if (itensSobMedida.length > 0) {
      setEtapa(3);
    } else {
      setEtapa(4);
    }
  }

  function avancarDeMedidas() {
    const pendentes = itensSobMedida.filter((i) => !medidasCompletas(i));
    if (pendentes.length > 0) {
      setErroMedidas(
        `Informe busto e cintura (de 50 a 160 cm) ou marque "Prefiro mandar por vídeo depois" para: ${pendentes
          .map((p) => p.nome)
          .join(", ")}.`
      );
      return;
    }
    setErroMedidas(null);
    setEtapa(4);
  }

  async function finalizarPagamento() {
    const errosC = validarCliente(rascunho.cliente);
    if (Object.keys(errosC).length > 0) {
      setErrosCliente(errosC);
      setEtapa(1);
      return;
    }
    const errosE = validarEndereco(rascunho.entrega);
    if (Object.keys(errosE).length > 0) {
      setErrosEndereco(errosE);
      setEtapa(2);
      return;
    }
    if (itensSobMedida.some((i) => !medidasCompletas(i))) {
      setEtapa(3);
      return;
    }

    const pedido: Pedido = {
      itens,
      cliente: rascunho.cliente,
      entrega: rascunho.entrega,
      frete: freteAtual?.valor ?? 0,
      forma: rascunho.forma,
      modalidade: valores.temSobMedida ? rascunho.modalidade : "total",
      cupom: cupom?.codigo,
      observacao: rascunho.observacao.trim() || undefined,
    };

    setPagando(true);
    setErroPagamento(null);
    try {
      const resultado = await provedorAtual.pagar(pedido);
      setPagando(false);
      if (resultado.status === "erro") {
        setErroPagamento(resultado.mensagem);
        return;
      }
      setConfirmado({
        pedido,
        resultado,
        valores,
      });
      clear();
      setEtapa(5);
    } catch {
      setPagando(false);
      setErroPagamento("Não foi possível concluir a demonstração. Tente novamente.");
    }
  }

  // Etapa 5: tela de confirmacao com codigo do pedido, resumo e botao para o WhatsApp da Gio.
  if (etapa === 5 && confirmado) {
    const { pedido, resultado, valores: v } = confirmado;
    const textoWhats = mensagemDoPedido(pedido, resultado.codigo);
    const urlWhats = linkWhatsapp(textoWhats);

    return (
      <div className="mx-auto max-w-[760px] px-4 pb-20 pt-4 text-[#1B4965] md:pt-8">
        {provedorAtual.demonstracao && (
          <div className="mb-6 rounded-[4px] border border-[#1B4965]/25 bg-[#C8E1E4]/45 px-3.5 py-2.5 text-[12px] text-[#1B4965]">
            Modo demonstração: nenhum valor é cobrado.
          </div>
        )}

        <div className={`rounded-[4px] border p-5 md:p-8 ${LINHA}`}>
          <p className="text-[11px] uppercase tracking-[0.16em] text-brand-muted">Pedido registrado</p>
          <h1 className="nums-preco mt-1 font-serif text-[28px] leading-9 md:text-[34px]">
            Código {resultado.codigo}
          </h1>
          <p className="mt-2 text-[14px] leading-[22px] text-brand-muted">
            {resultado.status === "aprovado"
              ? "Pagamento de demonstração no cartão aprovado."
              : "Pix de demonstração gerado. Envie o pedido abaixo para a Gio no WhatsApp."}
          </p>

          {resultado.status === "pendente" && resultado.pix?.copiaECola && (
            <div className={`mt-5 rounded-[4px] border bg-[#1B4965]/5 p-4 ${LINHA}`}>
              <p className="text-[11px] uppercase tracking-[0.14em]">Pix copia e cola (demonstração)</p>
              <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                <code className="nums-preco break-all text-[13px] text-[#1B4965]">{resultado.pix.copiaECola}</code>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard?.writeText(resultado.pix?.copiaECola ?? "");
                    setCopiadoPix(true);
                  }}
                  className={`flex min-h-9 items-center rounded-[4px] border border-[#1B4965] px-3 text-[11px] uppercase tracking-[0.12em] ${HOVER} ${FOCO}`}
                >
                  {copiadoPix ? "Copiado" : "Copiar código"}
                </button>
              </div>
            </div>
          )}

          {/* Botao principal exigido no briefing: Enviar o pedido para a Gio no WhatsApp */}
          <a
            href={urlWhats}
            target="_blank"
            rel="noopener noreferrer"
            className={`mt-6 gap-2 ${BOTAO_PRINCIPAL}`}
          >
            <IconeWhatsApp className="h-4 w-4 shrink-0" />
            Enviar o pedido para a Gio no WhatsApp
          </a>

          {/* Resumo completo do pedido */}
          <div className={`mt-8 border-t pt-6 ${LINHA}`}>
            <h2 className="font-serif text-[20px]">Resumo do pedido</h2>
            <ul className="mt-3 space-y-3">
              {pedido.itens.map((item) => (
                <li key={`${item.id}:${item.opcao}`} className="flex items-start justify-between gap-3 text-[14px]">
                  <div>
                    <p className="font-medium">
                      {item.qty}x {item.nome}{" "}
                      <span className="font-normal text-brand-muted">
                        ({item.opcao === "sob-medida" ? "sob medida" : "pronta entrega"})
                      </span>
                    </p>
                    {item.opcao === "sob-medida" && (
                      <p className="text-[12px] text-brand-muted">
                        {resumoMedidasPeca({
                          medidas: item.medidas,
                          tamanhoReferencia: item.tamanhoReferencia,
                          medidasPorVideo: item.medidasPorVideo,
                        }) ?? "Medidas a confirmar com a Gio"}
                      </p>
                    )}
                  </div>
                  <p className="nums-preco font-serif text-[16px] font-medium">
                    {formatBRLPreco((pedido.forma === "pix" ? item.precoPix : item.precoCartao) * item.qty)}
                  </p>
                </li>
              ))}
            </ul>

            <dl className={`mt-4 space-y-1.5 border-t pt-4 text-[13px] ${LINHA}`}>
              <div className="flex justify-between">
                <dt className="text-brand-muted">Forma de pagamento</dt>
                <dd>{pedido.forma === "pix" ? "Pix" : `Cartão (até ${v.maxParcelas}x sem juros)`}</dd>
              </div>
              {v.desconto > 0 && (
                <div className="flex justify-between text-[#276a3b]">
                  <dt>Desconto ({pedido.cupom})</dt>
                  <dd className="nums-preco">−{formatBRL(v.desconto)}</dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt className="text-brand-muted">Frete estimado</dt>
                <dd className="nums-preco">{formatBRL(v.frete)}</dd>
              </div>
              <div className="flex justify-between font-medium">
                <dt>Total do pedido</dt>
                <dd className="nums-preco font-serif text-[18px]">{formatBRL(v.total)}</dd>
              </div>
              {pedido.modalidade === "sinal" && v.temSobMedida && (
                <>
                  <div className="flex justify-between text-[#1B4965]">
                    <dt>Valor do sinal agora (50% do sob medida + frete)</dt>
                    <dd className="nums-preco font-serif text-[17px] font-medium">{formatBRL(v.agora)}</dd>
                  </div>
                  <div className="flex justify-between text-brand-muted">
                    <dt>Restante antes do envio</dt>
                    <dd className="nums-preco">{formatBRL(v.depois)}</dd>
                  </div>
                </>
              )}
            </dl>

            <div className={`mt-4 border-t pt-4 text-[13px] leading-5 text-brand-muted ${LINHA}`}>
              <p className="text-[#1B4965]">
                <strong>Entrega:</strong> {pedido.entrega.rua}, {pedido.entrega.numero}
                {pedido.entrega.complemento ? `, ${pedido.entrega.complemento}` : ""}, {pedido.entrega.bairro},{" "}
                {pedido.entrega.cidade}/{pedido.entrega.uf.toUpperCase()} · CEP {pedido.entrega.cep}
              </p>
              <p className="mt-1">
                <strong>Cliente:</strong> {pedido.cliente.nome} · {pedido.cliente.email} · {pedido.cliente.whatsapp}
              </p>
            </div>
          </div>

          <div className="mt-6">
            <Link href="/loja" className={`${BOTAO_CONTORNO} w-full`}>
              Voltar para a loja
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (hydrated && lines.length === 0) {
    return (
      <div className="mx-auto max-w-[560px] px-4 py-16 text-center text-[#1B4965]">
        <h1 className="font-serif text-[26px]">Sua sacola está vazia</h1>
        <p className="mt-2 text-[14px] text-brand-muted">
          Escolha uma peça na loja para iniciar seu pedido sob medida ou a pronta entrega.
        </p>
        <Link href="/loja" className={`${BOTAO_PRINCIPAL} mx-auto mt-6 max-w-[260px]`}>
          Ver a loja
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1120px] px-4 pb-20 pt-4 text-[#1B4965] md:pt-8">
      {/* Aviso discreto e claro de modo demonstracao */}
      {provedorAtual.demonstracao && (
        <div className="mb-5 flex flex-wrap items-center justify-between gap-2 rounded-[4px] border border-[#1B4965]/25 bg-[#C8E1E4]/40 px-3.5 py-2 text-[12px] text-[#1B4965]">
          <span>Modo demonstração: nenhum valor é cobrado.</span>
          <Link href="/loja" className={`underline underline-offset-4 ${HOVER} ${FOCO}`}>
            Continuar comprando
          </Link>
        </div>
      )}

      {/* Barra das 5 etapas do checkout */}
      <nav aria-label="Etapas do checkout" className={`mb-6 border-b pb-3 ${LINHA}`}>
        <ol className="flex flex-wrap items-center gap-2">
          {ETAPAS.map((item) => {
            const ativa = etapa === item.numero;
            const concluida = etapa > item.numero;
            const desabilitada = item.numero === 5 || (item.numero === 3 && itensSobMedida.length === 0);
            return (
              <li key={item.numero}>
                <button
                  type="button"
                  disabled={desabilitada && !ativa}
                  onClick={() => {
                    if (item.numero < 5) setEtapa(item.numero);
                  }}
                  aria-current={ativa ? "step" : undefined}
                  className={`flex min-h-10 items-center rounded-[4px] border px-3 text-[11px] uppercase tracking-[0.13em] ${FOCO} ${
                    ativa
                      ? "border-[#1B4965] bg-[#1B4965] text-[#EDE7D9]"
                      : concluida
                        ? `border-[#1B4965] bg-[#C8E1E4] text-[#1B4965] ${HOVER}`
                        : "border-[#1B4965]/25 text-brand-muted disabled:opacity-50"
                  }`}
                >
                  {item.rotulo}
                </button>
              </li>
            );
          })}
        </ol>
      </nav>

      <div className="grid gap-8 lg:grid-cols-[1fr_380px] lg:items-start">
        {/* Coluna da etapa ativa */}
        <section aria-live="polite" className={`rounded-[4px] border p-4 md:p-6 ${LINHA}`}>
          {etapa === 1 && (
            <form onSubmit={avancarDeDados} noValidate>
              <h1 className="font-serif text-[24px] leading-8">1. Seus dados</h1>
              <p className="mt-1 text-[13px] text-brand-muted">
                Para enviarmos a confirmação e combinarmos os detalhes pelo WhatsApp.
              </p>

              <div className="mt-5 space-y-4">
                <div>
                  <label htmlFor="chk-nome" className="block text-[12px] uppercase tracking-[0.12em]">
                    Nome e sobrenome
                  </label>
                  <input
                    id="chk-nome"
                    name="nome"
                    type="text"
                    autoComplete="name"
                    placeholder="Ex.: Marina Costa"
                    value={rascunho.cliente.nome}
                    onChange={(e) => {
                      atualizarCliente({ nome: e.target.value });
                      if (errosCliente.nome) setErrosCliente((ant) => ({ ...ant, nome: undefined }));
                    }}
                    aria-invalid={Boolean(errosCliente.nome) || undefined}
                    className={`mt-1 w-full ${CAMPO}`}
                  />
                  {errosCliente.nome && (
                    <p role="alert" className="mt-1 text-[12px] text-[#a33]">
                      {errosCliente.nome}
                    </p>
                  )}
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="chk-email" className="block text-[12px] uppercase tracking-[0.12em]">
                      E-mail
                    </label>
                    <input
                      id="chk-email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      placeholder="voce@email.com"
                      value={rascunho.cliente.email}
                      onChange={(e) => {
                        atualizarCliente({ email: e.target.value });
                        if (errosCliente.email) setErrosCliente((ant) => ({ ...ant, email: undefined }));
                      }}
                      aria-invalid={Boolean(errosCliente.email) || undefined}
                      className={`mt-1 w-full ${CAMPO}`}
                    />
                    {errosCliente.email && (
                      <p role="alert" className="mt-1 text-[12px] text-[#a33]">
                        {errosCliente.email}
                      </p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="chk-whatsapp" className="block text-[12px] uppercase tracking-[0.12em]">
                      WhatsApp com DDD
                    </label>
                    <input
                      id="chk-whatsapp"
                      name="whatsapp"
                      type="tel"
                      inputMode="tel"
                      autoComplete="tel"
                      placeholder="(91) 99999-9999"
                      value={rascunho.cliente.whatsapp}
                      onChange={(e) => {
                        atualizarCliente({ whatsapp: e.target.value });
                        if (errosCliente.whatsapp) setErrosCliente((ant) => ({ ...ant, whatsapp: undefined }));
                      }}
                      aria-invalid={Boolean(errosCliente.whatsapp) || undefined}
                      className={`mt-1 w-full ${CAMPO}`}
                    />
                    {errosCliente.whatsapp && (
                      <p role="alert" className="mt-1 text-[12px] text-[#a33]">
                        {errosCliente.whatsapp}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label htmlFor="chk-cpf" className="block text-[12px] uppercase tracking-[0.12em]">
                    CPF <span className="normal-case tracking-normal text-brand-muted">(opcional)</span>
                  </label>
                  <input
                    id="chk-cpf"
                    name="cpf"
                    type="text"
                    inputMode="numeric"
                    placeholder="000.000.000-00"
                    value={rascunho.cliente.cpf ?? ""}
                    onChange={(e) => {
                      atualizarCliente({ cpf: e.target.value });
                      if (errosCliente.cpf) setErrosCliente((ant) => ({ ...ant, cpf: undefined }));
                    }}
                    aria-invalid={Boolean(errosCliente.cpf) || undefined}
                    className={`mt-1 w-full ${CAMPO}`}
                  />
                  {errosCliente.cpf && (
                    <p role="alert" className="mt-1 text-[12px] text-[#a33]">
                      {errosCliente.cpf}
                    </p>
                  )}
                </div>
              </div>

              <button type="submit" className={`mt-6 ${BOTAO_PRINCIPAL}`}>
                Continuar para entrega
              </button>
            </form>
          )}

          {etapa === 2 && (
            <form onSubmit={avancarDeEntrega} noValidate>
              <h1 className="font-serif text-[24px] leading-8">2. Entrega</h1>
              <p className="mt-1 text-[13px] text-brand-muted">
                Informe seu CEP para preencher o endereço e calcular o frete a partir de {ORIGEM.cidade}/{ORIGEM.uf}.
              </p>

              <div className="mt-5 space-y-4">
                <div>
                  <label htmlFor="chk-cep" className="block text-[12px] uppercase tracking-[0.12em]">
                    CEP
                  </label>
                  <div className="mt-1 flex gap-2">
                    <input
                      id="chk-cep"
                      name="cep"
                      type="text"
                      inputMode="numeric"
                      autoComplete="postal-code"
                      placeholder="00000-000"
                      value={rascunho.entrega.cep}
                      onChange={(e) => {
                        const m = mascararCep(e.target.value);
                        atualizarEntrega({ cep: m });
                        if (errosEndereco.cep) setErrosEndereco((ant) => ({ ...ant, cep: undefined }));
                        if (normalizarCep(m).length === 8) {
                          consultarCep(m);
                        }
                      }}
                      aria-invalid={Boolean(errosEndereco.cep) || undefined}
                      className={CAMPO}
                    />
                    <button
                      type="button"
                      onClick={() => consultarCep(rascunho.entrega.cep)}
                      disabled={buscandoCep}
                      className={`flex h-11 shrink-0 items-center rounded-[4px] border border-[#1B4965] px-4 text-[12px] uppercase tracking-[0.14em] disabled:opacity-50 ${HOVER} ${FOCO}`}
                    >
                      {buscandoCep ? "Buscando..." : "Buscar CEP"}
                    </button>
                  </div>
                  {errosEndereco.cep && (
                    <p role="alert" className="mt-1 text-[12px] text-[#a33]">
                      {errosEndereco.cep}
                    </p>
                  )}
                  {avisoCep && <p className="mt-1 text-[12px] text-brand-muted">{avisoCep}</p>}
                  {freteAtual && (
                    <p className="mt-1.5 text-[12px] text-[#1B4965]">
                      Frete estimado ({freteAtual.regiao}):{" "}
                      <strong className="nums-preco">{formatBRLPreco(freteAtual.valor)}</strong> · de{" "}
                      {freteAtual.prazoMin} a {freteAtual.prazoMax} dias úteis após a confecção.
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="chk-rua" className="block text-[12px] uppercase tracking-[0.12em]">
                    Rua / Logradouro
                  </label>
                  <input
                    id="chk-rua"
                    name="rua"
                    type="text"
                    autoComplete="street-address"
                    placeholder="Rua, avenida ou travessa"
                    value={rascunho.entrega.rua}
                    onChange={(e) => {
                      atualizarEntrega({ rua: e.target.value });
                      if (errosEndereco.rua) setErrosEndereco((ant) => ({ ...ant, rua: undefined }));
                    }}
                    aria-invalid={Boolean(errosEndereco.rua) || undefined}
                    className={`mt-1 w-full ${CAMPO}`}
                  />
                  {errosEndereco.rua && (
                    <p role="alert" className="mt-1 text-[12px] text-[#a33]">
                      {errosEndereco.rua}
                    </p>
                  )}
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="chk-numero" className="block text-[12px] uppercase tracking-[0.12em]">
                      Número
                    </label>
                    <input
                      id="chk-numero"
                      name="numero"
                      type="text"
                      placeholder="Ex.: 120 ou S/N"
                      value={rascunho.entrega.numero}
                      onChange={(e) => {
                        atualizarEntrega({ numero: e.target.value });
                        if (errosEndereco.numero) setErrosEndereco((ant) => ({ ...ant, numero: undefined }));
                      }}
                      aria-invalid={Boolean(errosEndereco.numero) || undefined}
                      className={`mt-1 w-full ${CAMPO}`}
                    />
                    {errosEndereco.numero && (
                      <p role="alert" className="mt-1 text-[12px] text-[#a33]">
                        {errosEndereco.numero}
                      </p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="chk-complemento" className="block text-[12px] uppercase tracking-[0.12em]">
                      Complemento <span className="normal-case tracking-normal text-brand-muted">(opcional)</span>
                    </label>
                    <input
                      id="chk-complemento"
                      name="complemento"
                      type="text"
                      placeholder="Apto, bloco, referência"
                      value={rascunho.entrega.complemento ?? ""}
                      onChange={(e) => atualizarEntrega({ complemento: e.target.value })}
                      className={`mt-1 w-full ${CAMPO}`}
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-[1fr_1fr_88px]">
                  <div>
                    <label htmlFor="chk-bairro" className="block text-[12px] uppercase tracking-[0.12em]">
                      Bairro
                    </label>
                    <input
                      id="chk-bairro"
                      name="bairro"
                      type="text"
                      placeholder="Seu bairro"
                      value={rascunho.entrega.bairro}
                      onChange={(e) => {
                        atualizarEntrega({ bairro: e.target.value });
                        if (errosEndereco.bairro) setErrosEndereco((ant) => ({ ...ant, bairro: undefined }));
                      }}
                      aria-invalid={Boolean(errosEndereco.bairro) || undefined}
                      className={`mt-1 w-full ${CAMPO}`}
                    />
                    {errosEndereco.bairro && (
                      <p role="alert" className="mt-1 text-[12px] text-[#a33]">
                        {errosEndereco.bairro}
                      </p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="chk-cidade" className="block text-[12px] uppercase tracking-[0.12em]">
                      Cidade
                    </label>
                    <input
                      id="chk-cidade"
                      name="cidade"
                      type="text"
                      placeholder="Sua cidade"
                      value={rascunho.entrega.cidade}
                      onChange={(e) => {
                        atualizarEntrega({ cidade: e.target.value });
                        if (errosEndereco.cidade) setErrosEndereco((ant) => ({ ...ant, cidade: undefined }));
                      }}
                      aria-invalid={Boolean(errosEndereco.cidade) || undefined}
                      className={`mt-1 w-full ${CAMPO}`}
                    />
                  </div>

                  <div>
                    <label htmlFor="chk-uf" className="block text-[12px] uppercase tracking-[0.12em]">
                      UF
                    </label>
                    <input
                      id="chk-uf"
                      name="uf"
                      type="text"
                      maxLength={2}
                      placeholder="PA"
                      value={rascunho.entrega.uf}
                      onChange={(e) => {
                        atualizarEntrega({ uf: e.target.value.toUpperCase() });
                        if (errosEndereco.cidade) setErrosEndereco((ant) => ({ ...ant, cidade: undefined }));
                      }}
                      aria-invalid={Boolean(errosEndereco.cidade) || undefined}
                      className={`mt-1 w-full uppercase ${CAMPO}`}
                    />
                  </div>
                </div>
                {errosEndereco.cidade && (
                  <p role="alert" className="text-[12px] text-[#a33]">
                    {errosEndereco.cidade}
                  </p>
                )}
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <button type="button" onClick={() => setEtapa(1)} className={BOTAO_CONTORNO}>
                  Voltar
                </button>
                <button type="submit" className={`flex-1 ${BOTAO_PRINCIPAL}`}>
                  {itensSobMedida.length > 0 ? "Continuar para medidas" : "Continuar para pagamento"}
                </button>
              </div>
            </form>
          )}

          {etapa === 3 && (
            <div>
              <h1 className="font-serif text-[24px] leading-8">3. Medidas das peças sob medida</h1>
              <p className="mt-1 text-[13px] text-brand-muted">
                {faltamMedidas.length > 0
                  ? "Informe as medidas das peças sob medida que ainda não foram preenchidas, ou escolha mandar por vídeo depois."
                  : "Todas as peças sob medida já estão com as medidas definidas. Você pode revisar ou ir para o pagamento."}
              </p>

              <ul className="mt-5 space-y-5">
                {itensSobMedida.map((item) => {
                  const completa = medidasCompletas(item);
                  const aberta = !completa || editandoMedidaId === item.id;
                  const resumo = resumoMedidasPeca(mapaMedidas[item.id]);

                  return (
                    <li key={item.id} className={`rounded-[4px] border p-4 ${LINHA}`}>
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <span className="relative h-14 w-11 shrink-0 overflow-hidden bg-[#1B4965]/5">
                            <Image src={item.foto} alt="" fill sizes="44px" className="object-cover" />
                          </span>
                          <div>
                            <h2 className="font-serif text-[18px] leading-6">{item.nome}</h2>
                            <p className="text-[12px] text-brand-muted">
                              {completa && resumo ? `Confirmada: ${resumo}` : "Aguardando medidas ou opção por vídeo"}
                            </p>
                          </div>
                        </div>

                        {completa && (
                          <button
                            type="button"
                            onClick={() => setEditandoMedidaId(aberta && editandoMedidaId === item.id ? null : item.id)}
                            className={`min-h-9 rounded px-2 text-[12px] underline underline-offset-4 ${HOVER} ${FOCO}`}
                          >
                            {aberta && editandoMedidaId === item.id ? "Fechar" : "Editar"}
                          </button>
                        )}
                      </div>

                      {aberta && (
                        <div className="mt-3">
                          <SeletorMedidasSobMedida
                            compacto
                            medidas={item.medidas ?? {}}
                            medidasPorVideo={Boolean(item.medidasPorVideo)}
                            tamanhoReferencia={item.tamanhoReferencia}
                            aoMudarMedidas={(novas: Medidas, ref?: string) => {
                              salvarMedidasPeca(item.id, {
                                medidas: novas,
                                tamanhoReferencia: ref,
                                medidasPorVideo: false,
                              });
                              if (erroMedidas) setErroMedidas(null);
                            }}
                            aoMudarPorVideo={(porVideo: boolean) => {
                              salvarMedidasPeca(item.id, {
                                medidas: item.medidas,
                                tamanhoReferencia: item.tamanhoReferencia,
                                medidasPorVideo: porVideo,
                              });
                              if (erroMedidas) setErroMedidas(null);
                            }}
                          />
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>

              {erroMedidas && (
                <p role="alert" className="mt-4 text-[13px] text-[#a33]">
                  {erroMedidas}
                </p>
              )}

              <div className="mt-6 flex flex-wrap gap-3">
                <button type="button" onClick={() => setEtapa(2)} className={BOTAO_CONTORNO}>
                  Voltar
                </button>
                <button type="button" onClick={avancarDeMedidas} className={`flex-1 ${BOTAO_PRINCIPAL}`}>
                  Continuar para pagamento
                </button>
              </div>
            </div>
          )}

          {etapa === 4 && (
            <div>
              <h1 className="font-serif text-[24px] leading-8">4. Pagamento</h1>
              <p className="mt-1 text-[13px] text-brand-muted">
                Escolha entre Pix e cartão. {valores.temSobMedida ? SINAL : ""}
              </p>

              {/* Escolha Pix ou Cartao */}
              <fieldset className="mt-5">
                <legend className="text-[11px] uppercase tracking-[0.14em]">Forma de pagamento</legend>
                <div className="mt-2 grid gap-2.5 sm:grid-cols-2">
                  <button
                    type="button"
                    aria-pressed={rascunho.forma === "cartao"}
                    onClick={() => atualizarRascunhoCheckout({ forma: "cartao" })}
                    className={`flex min-h-14 flex-col items-start justify-center rounded-[4px] border px-4 py-2.5 text-left ${FOCO} ${
                      rascunho.forma === "cartao"
                        ? "border-[#1B4965] bg-[#C8E1E4] text-[#1B4965]"
                        : `border-[#1B4965]/40 text-[#1B4965] ${HOVER}`
                    }`}
                  >
                    <span className="text-[12px] uppercase tracking-[0.14em]">Cartão de crédito</span>
                    <span className="mt-0.5 text-[12px] text-brand-muted">
                      Até {valores.maxParcelas}x sem juros
                    </span>
                  </button>

                  <button
                    type="button"
                    aria-pressed={rascunho.forma === "pix"}
                    onClick={() => atualizarRascunhoCheckout({ forma: "pix" })}
                    className={`flex min-h-14 flex-col items-start justify-center rounded-[4px] border px-4 py-2.5 text-left ${FOCO} ${
                      rascunho.forma === "pix"
                        ? "border-[#1B4965] bg-[#C8E1E4] text-[#1B4965]"
                        : `border-[#1B4965]/40 text-[#1B4965] ${HOVER}`
                    }`}
                  >
                    <span className="text-[12px] uppercase tracking-[0.14em]">Pix à vista</span>
                    <span className="mt-0.5 text-[12px] text-brand-muted">Menor valor em cada peça</span>
                  </button>
                </div>
              </fieldset>

              {/* Escolha Sinal de 50% agora ou Pagar tudo (para pecas sob medida) */}
              {valores.temSobMedida && (
                <fieldset className="mt-5">
                  <legend className="text-[11px] uppercase tracking-[0.14em]">
                    Como pagar as peças sob medida
                  </legend>
                  <div className="mt-2 grid gap-2.5 sm:grid-cols-2">
                    <button
                      type="button"
                      aria-pressed={rascunho.modalidade === "sinal"}
                      onClick={() => atualizarRascunhoCheckout({ modalidade: "sinal" })}
                      className={`flex min-h-16 flex-col items-start justify-center rounded-[4px] border px-4 py-3 text-left ${FOCO} ${
                        rascunho.modalidade === "sinal"
                          ? "border-[#1B4965] bg-[#C8E1E4] text-[#1B4965]"
                          : `border-[#1B4965]/40 text-[#1B4965] ${HOVER}`
                      }`}
                    >
                      <span className="text-[12px] uppercase tracking-[0.12em]">
                        Pagar o sinal de 50% agora
                      </span>
                      <span className="nums-preco mt-1 text-[12px] text-brand-muted">
                        Agora: <strong className="text-[#1B4965]">{formatBRL(valores.agora)}</strong> · Antes do envio:{" "}
                        {formatBRL(valores.depois)}
                      </span>
                    </button>

                    <button
                      type="button"
                      aria-pressed={rascunho.modalidade === "total"}
                      onClick={() => atualizarRascunhoCheckout({ modalidade: "total" })}
                      className={`flex min-h-16 flex-col items-start justify-center rounded-[4px] border px-4 py-3 text-left ${FOCO} ${
                        rascunho.modalidade === "total"
                          ? "border-[#1B4965] bg-[#C8E1E4] text-[#1B4965]"
                          : `border-[#1B4965]/40 text-[#1B4965] ${HOVER}`
                      }`}
                    >
                      <span className="text-[12px] uppercase tracking-[0.12em]">Pagar tudo</span>
                      <span className="nums-preco mt-1 text-[12px] text-brand-muted">
                        100% agora: <strong className="text-[#1B4965]">{formatBRL(valores.total)}</strong>
                      </span>
                    </button>
                  </div>
                </fieldset>
              )}

              {/* Quadro reservado do provedor (proibido criar campo de numero de cartao proprio) */}
              <div className="mt-6 rounded-[4px] border border-dashed border-[#1B4965]/50 bg-[#1B4965]/5 p-4">
                <p className="text-[12px] uppercase tracking-[0.14em] text-[#1B4965]">
                  {rascunho.forma === "cartao"
                    ? "Aqui entra o pagamento seguro do provedor"
                    : "Pix gerado pelo provedor na confirmação"}
                </p>
                <p className="mt-1.5 text-[13px] leading-5 text-brand-muted">
                  {rascunho.forma === "cartao"
                    ? "Quadro reservado ao componente oficial do provedor (Mercado Pago ou Nuvemshop), onde o cartão é processado com segurança sem passar pelo site."
                    : "Ao confirmar abaixo, o provedor gera o código Pix copia e cola correspondente ao valor de agora."}
                </p>
                <p className="mt-2 text-[12px] text-[#1B4965]">
                  Modo demonstração: nenhum valor é cobrado.
                </p>
              </div>

              {/* Observacao opcional */}
              <div className="mt-5">
                <label htmlFor="chk-obs" className="block text-[12px] uppercase tracking-[0.12em]">
                  Observação para a Gio <span className="normal-case tracking-normal text-brand-muted">(opcional)</span>
                </label>
                <input
                  id="chk-obs"
                  type="text"
                  placeholder="Ex.: cor desejada, ocasião ou data da viagem"
                  value={rascunho.observacao}
                  onChange={(e) => atualizarRascunhoCheckout({ observacao: e.target.value })}
                  className={`mt-1 w-full ${CAMPO}`}
                />
              </div>

              {erroPagamento && (
                <p role="alert" className="mt-4 text-[13px] text-[#a33]">
                  {erroPagamento}
                </p>
              )}

              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => setEtapa(itensSobMedida.length > 0 ? 3 : 2)}
                  disabled={pagando}
                  className={BOTAO_CONTORNO}
                >
                  Voltar
                </button>
                <button
                  type="button"
                  onClick={finalizarPagamento}
                  disabled={pagando}
                  className={`flex-1 disabled:opacity-60 ${BOTAO_PRINCIPAL}`}
                >
                  {pagando
                    ? "Confirmando pedido..."
                    : `Confirmar pedido (${formatBRL(valores.agora)} agora)`}
                </button>
              </div>
            </div>
          )}
        </section>

        {/* Coluna lateral: resumo da sacola, cupom e valores */}
        <aside aria-label="Resumo dos valores" className={`rounded-[4px] border p-4 md:p-5 ${LINHA}`}>
          <h2 className="text-[11px] uppercase tracking-[0.16em]">Seu pedido</h2>
          <ul className="mt-3 divide-y divide-[#1B4965]/15">
            {itens.map((item) => {
              const unit = rascunho.forma === "pix" ? item.precoPix : item.precoCartao;
              const resumo = item.opcao === "sob-medida" ? resumoMedidasPeca(mapaMedidas[item.id]) : null;
              return (
                <li key={`${item.id}:${item.opcao}`} className="flex gap-3 py-3">
                  <span className="relative h-16 w-12 shrink-0 overflow-hidden bg-[#1B4965]/5">
                    <Image src={item.foto} alt="" fill sizes="48px" className="object-cover" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="truncate text-[13px]">{item.qty}x {item.nome}</p>
                      <p className="nums-preco shrink-0 font-serif text-[15px] font-medium">
                        {formatBRLPreco(unit * item.qty)}
                      </p>
                    </div>
                    <p className="mt-0.5 text-[11px] text-brand-muted">
                      {item.opcao === "sob-medida" ? "Sob medida" : "Pronta entrega"}
                      {resumo ? ` · ${resumo}` : ""}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>

          {/* Cupom */}
          <div className={`mt-3 border-t pt-3 ${LINHA}`}>
            {cupom ? (
              <div className="flex items-center justify-between text-[12px]">
                <span className="text-[#276a3b]">
                  Cupom {cupom.codigo} ({cupom.percentual}% OFF)
                </span>
                <button
                  type="button"
                  onClick={removerCupom}
                  className={`underline underline-offset-4 text-brand-muted ${HOVER} ${FOCO}`}
                >
                  Remover
                </button>
              </div>
            ) : (
              <div>
                <div className="flex gap-2">
                  <label htmlFor="chk-cupom" className="sr-only">
                    Código do cupom
                  </label>
                  <input
                    id="chk-cupom"
                    type="text"
                    placeholder="Cupom de desconto"
                    value={codigoCupom}
                    onChange={(e) => {
                      setCodigoCupom(e.target.value);
                      if (erroCupom) setErroCupom(null);
                    }}
                    className={`${CAMPO} uppercase placeholder:normal-case`}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const r = aplicarCupom(codigoCupom);
                      if (r.status === "ok") {
                        setCodigoCupom("");
                        setErroCupom(null);
                      } else if (r.status === "expirado") {
                        setErroCupom("Esse cupom expirou.");
                      } else {
                        setErroCupom("Cupom inválido.");
                      }
                    }}
                    className={`flex h-11 shrink-0 items-center rounded-[4px] border border-[#1B4965] px-3 text-[11px] uppercase tracking-[0.13em] ${HOVER} ${FOCO}`}
                  >
                    Aplicar
                  </button>
                </div>
                {erroCupom && <p className="mt-1 text-[11px] text-[#a33]">{erroCupom}</p>}
              </div>
            )}
          </div>

          <dl className={`mt-4 space-y-1.5 border-t pt-3 text-[13px] ${LINHA}`}>
            <div className="flex justify-between">
              <dt className="text-brand-muted">
                Subtotal ({rascunho.forma === "pix" ? "no Pix" : "no cartão"})
              </dt>
              <dd className="nums-preco">{formatBRL(valores.subtotal)}</dd>
            </div>
            {valores.desconto > 0 && (
              <div className="flex justify-between text-[#276a3b]">
                <dt>Desconto</dt>
                <dd className="nums-preco">−{formatBRL(valores.desconto)}</dd>
              </div>
            )}
            <div className="flex justify-between">
              <dt className="text-brand-muted">Frete</dt>
              <dd className="nums-preco">{freteAtual ? formatBRL(valores.frete) : "Pelo CEP"}</dd>
            </div>
            <div className="flex items-baseline justify-between pt-1">
              <dt className="text-[12px] uppercase tracking-[0.14em]">Total</dt>
              <dd className="nums-preco font-serif text-[20px] font-medium">{formatBRL(valores.total)}</dd>
            </div>
            {valores.temSobMedida && rascunho.modalidade === "sinal" && (
              <div className={`mt-2 rounded bg-[#C8E1E4]/55 p-2.5 text-[12px] ${LINHA}`}>
                <div className="flex justify-between font-medium">
                  <dt>Pagar agora (sinal de 50%)</dt>
                  <dd className="nums-preco">{formatBRL(valores.agora)}</dd>
                </div>
                <div className="mt-0.5 flex justify-between text-brand-muted">
                  <dt>Antes do envio</dt>
                  <dd className="nums-preco">{formatBRL(valores.depois)}</dd>
                </div>
              </div>
            )}
          </dl>
        </aside>
      </div>
    </div>
  );
}
