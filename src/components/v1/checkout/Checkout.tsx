"use client";

import { useId, useMemo, useRef, useState, useSyncExternalStore } from "react";
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
  WHATSAPP_GIO,
} from "@/lib/checkout";
import { buscarCep, estimarFrete, mascararCep, normalizarCep } from "@/lib/frete";
import { formatBRLPreco } from "@/lib/format";
import { BOTAO_PRINCIPAL, FOCO, HOVER, LINHA } from "@/components/v3/estrutura/estilo";
import { IconeSeta } from "@/components/v3/estrutura/Icones";
import CamposMedidas from "../produto/CamposMedidas";
import {
  MEDIDAS_VAZIAS,
  esquecerMedidas,
  medidasProntas,
  paraMedidas,
  resumoMedidas,
  tamanhoSugerido,
  useTodasMedidas,
} from "../estado/medidasSalvas";
import { IconeCadeado } from "../icones";
import Confirmacao from "./Confirmacao";
import { Campo, ERRO, Escolha, Etapa, Resumo, type EstadoEtapa } from "./partes";
import {
  FRETE_GRATIS_ACIMA,
  assinarUltimoPedido,
  gravarUltimoPedido,
  lerUltimoPedido,
  mascararCpf,
  mascararWhatsapp,
  pedeMedidas,
} from "./regras";
import FotoSuave from "@/components/v3/estrutura/FotoSuave";

// Checkout dentro do site, em 5 etapas curtas numa página só (o modelo das
// lojas grandes): 1 seus dados, 2 entrega (o CEP preenche o endereço e
// estima o frete), 3 medidas das peças sob medida que ainda não têm,
// 4 pagamento (Pix ou cartão; no sob medida, sinal de 50% ou tudo) e
// 5 confirmação, com o código e o pedido pronto para a Gio no WhatsApp.
// Só a etapa da vez fica aberta; as prontas viram uma linha com "Alterar".
//
// O pagamento é de demonstração (provedorAtual): o aviso fica discreto na
// etapa 4. Nenhum campo de cartão é nosso: no cartão aparece o quadro onde
// entra o componente do provedor.

type Passo = 1 | 2 | 3 | 4;

const CLIENTE_VAZIO: DadosCliente = { nome: "", email: "", whatsapp: "", cpf: "" };
const ENDERECO_VAZIO: Endereco = { cep: "", rua: "", numero: "", complemento: "", bairro: "", cidade: "", uf: "" };

const semAssinatura = () => () => {};

const reduzido = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export default function Checkout() {
  const { lines, hydrated, cupom, clear, open } = useCart();
  const ultimo = useSyncExternalStore(assinarUltimoPedido, lerUltimoPedido, () => null);
  const montado = useSyncExternalStore(semAssinatura, () => true, () => false);

  if (!montado || !hydrated) return <Esqueleto />;
  if (lines.length === 0) {
    if (ultimo) return <Confirmacao feito={ultimo} />;
    return (
      <div className="mx-auto max-w-[480px] px-4 py-20 text-center">
        <h1 className="font-[family-name:var(--font-serif)] text-[26px]">Sua sacola está vazia</h1>
        <p className="mt-2 text-[14px] text-brand-muted">Escolha uma peça para finalizar a compra.</p>
        <Link href="/loja" className={`${BOTAO_PRINCIPAL} mx-auto mt-8 max-w-[280px]`}>
          Ver a loja
        </Link>
      </div>
    );
  }
  return <Etapas lines={lines} cupomCodigo={cupom?.codigo ?? null} aoConcluir={clear} abrirSacola={open} />;
}

function Esqueleto() {
  return (
    <div aria-busy="true" className="mx-auto max-w-[1120px] px-4 py-10 md:px-8">
      <div className="h-8 w-48 rounded bg-[#1B4965]/5" />
      <div className="mt-8 h-40 rounded bg-[#1B4965]/5" />
    </div>
  );
}

type EtapasProps = {
  lines: ReturnType<typeof useCart>["lines"];
  cupomCodigo: string | null;
  aoConcluir: () => void;
  abrirSacola: () => void;
};

function Etapas({ lines, cupomCodigo, aoConcluir, abrirSacola }: EtapasProps) {
  const { cupom } = useCart();
  const base = useId();
  const todasMedidas = useTodasMedidas();
  const raizRef = useRef<HTMLDivElement>(null);

  const [passo, setPasso] = useState<Passo>(1);
  const [feitas, setFeitas] = useState<Set<number>>(() => new Set());
  const [tentou, setTentou] = useState<Set<number>>(() => new Set());
  const [cliente, setCliente] = useState<DadosCliente>(CLIENTE_VAZIO);
  const [endereco, setEndereco] = useState<Endereco>(ENDERECO_VAZIO);
  const [cepStatus, setCepStatus] = useState<"idle" | "buscando" | "ok" | "erro">("idle");
  const [forma, setForma] = useState<FormaPagamento>("cartao");
  const [modalidade, setModalidade] = useState<Modalidade>("sinal");
  const [pagando, setPagando] = useState(false);
  const [erroPagamento, setErroPagamento] = useState<string | null>(null);
  const [resumoAberto, setResumoAberto] = useState(false);

  // Itens com os preços do catálogo e as medidas que a cliente já digitou.
  const itens: ItemPedido[] = useMemo(
    () =>
      itensDoCarrinho(lines).map((i) => {
        if (!pedeMedidas(i)) return i;
        const d = todasMedidas[i.id] ?? MEDIDAS_VAZIAS;
        return {
          ...i,
          medidas: paraMedidas(d),
          medidasPorVideo: d.porVideo,
          tamanhoReferencia: tamanhoSugerido(d)?.tamanho,
        };
      }),
    [lines, todasMedidas]
  );
  const paraMedir = itens.filter(pedeMedidas);
  const medidasOk = paraMedir.every((i) => medidasProntas(todasMedidas[i.id] ?? MEDIDAS_VAZIAS));

  // Frete pela UF e cidade (do CEP ou digitadas) e grátis acima do limite.
  const estimativa =
    endereco.uf.trim().length === 2
      ? estimarFrete({ cep: endereco.cep, uf: endereco.uf.trim().toUpperCase(), localidade: endereco.cidade })
      : null;
  const pixSemFrete = calcularValores(itens, { forma: "pix", modalidade: "total", cupom });
  const freteGratis = pixSemFrete.total >= FRETE_GRATIS_ACIMA;
  const frete = freteGratis ? 0 : (estimativa?.valor ?? 0);
  const valores = calcularValores(itens, { forma, modalidade, frete, cupom });
  const valoresPix = calcularValores(itens, { forma: "pix", modalidade, frete, cupom });
  const valoresCartao = calcularValores(itens, { forma: "cartao", modalidade, frete, cupom });

  const errosCliente = validarCliente(cliente);
  const errosEndereco = validarEndereco(endereco);

  function estado(n: Passo): EstadoEtapa {
    if (n === passo) return "ativa";
    if (n === 3 && paraMedir.length === 0 && passo > 3) return "feita";
    return feitas.has(n) ? "feita" : "futura";
  }

  function irPara(n: Passo) {
    setPasso(n);
    requestAnimationFrame(() => {
      const bloco = document.getElementById(`etapa-${n}-bloco`);
      if (!bloco) return;
      const topo = bloco.getBoundingClientRect().top;
      if (topo < 0 || topo > window.innerHeight * 0.6) bloco.scrollIntoView({ block: "start", behavior: reduzido() ? "auto" : "smooth" });
      bloco.querySelector<HTMLElement>("input:not([type=radio]):not([disabled])")?.focus({ preventScroll: true });
    });
  }

  function focarErro() {
    requestAnimationFrame(() => raizRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus());
  }

  /** Marca a etapa como pronta e vai para a próxima que falta. */
  function concluir(n: Passo, extra: number[] = []) {
    const novas = new Set(feitas);
    novas.add(n);
    extra.forEach((e) => novas.add(e));
    if (paraMedir.length === 0) novas.add(3);
    setFeitas(novas);
    const proximo = ([1, 2, 3, 4] as Passo[]).find((p) => p > n && !novas.has(p)) ?? 4;
    irPara(proximo);
  }

  function continuarDados() {
    setTentou((t) => new Set(t).add(1));
    if (Object.keys(errosCliente).length) return focarErro();
    concluir(1);
  }

  function continuarEntrega() {
    setTentou((t) => new Set(t).add(2));
    if (Object.keys(errosEndereco).length) return focarErro();
    // Quem já deu as medidas na página da peça pula a etapa 3.
    concluir(2, medidasOk ? [3] : []);
  }

  function continuarMedidas() {
    setTentou((t) => new Set(t).add(3));
    if (!medidasOk) return focarErro();
    concluir(3);
  }

  async function aoMudarCep(valor: string) {
    const cep = mascararCep(valor);
    setEndereco((e) => ({ ...e, cep }));
    if (normalizarCep(cep).length !== 8) {
      if (cepStatus !== "idle") setCepStatus("idle");
      return;
    }
    setCepStatus("buscando");
    const achado = await buscarCep(cep);
    if (!achado) {
      setCepStatus("erro");
      return;
    }
    setCepStatus("ok");
    setEndereco((e) => ({
      ...e,
      cep: achado.cep,
      rua: achado.logradouro ?? e.rua,
      bairro: achado.bairro ?? e.bairro,
      cidade: achado.localidade || e.cidade,
      uf: achado.uf || e.uf,
    }));
    requestAnimationFrame(() => document.getElementById(`${base}-numero`)?.focus());
  }

  async function pagar() {
    setPagando(true);
    setErroPagamento(null);
    const pedido: Pedido = {
      itens,
      cliente: { ...cliente, cpf: cliente.cpf?.trim() || undefined },
      entrega: { ...endereco, uf: endereco.uf.trim().toUpperCase() },
      frete,
      forma,
      modalidade: valores.temSobMedida ? modalidade : "total",
      cupom: cupomCodigo ?? undefined,
    };
    const resultado = await provedorAtual.pagar(pedido);
    if (resultado.status === "erro") {
      setErroPagamento(resultado.mensagem);
      setPagando(false);
      return;
    }
    gravarUltimoPedido({ codigo: resultado.codigo, pedido, resultado });
    esquecerMedidas(paraMedir.map((i) => i.id));
    aoConcluir();
    window.scrollTo({ top: 0 });
  }

  const erro1 = tentou.has(1) ? errosCliente : {};
  const erro2 = tentou.has(2) ? errosEndereco : {};
  const mostraEndereco = cepStatus === "ok" || cepStatus === "erro" || !!endereco.rua;
  const comSinal = valores.temSobMedida && modalidade === "sinal";
  const sinal = calcularValores(itens, { forma, modalidade: "sinal", frete, cupom });
  const aPagar = valores.temSobMedida && modalidade === "sinal" ? valores.agora : valores.total;

  const resumo = (
    <Resumo
      itens={itens}
      valores={valores}
      forma={forma}
      freteConhecido={!!estimativa}
      freteGratis={freteGratis}
      cupom={cupomCodigo}
      comSinal={comSinal && passo === 4}
    />
  );

  return (
    <div ref={raizRef} className="mx-auto max-w-[1120px] lg:grid lg:grid-cols-[minmax(0,1fr)_400px] lg:gap-16 lg:px-8">
      {/* Celular: o resumo recolhido no topo, com o total. */}
      <div className={`border-b bg-[#1B4965]/[0.04] lg:hidden ${LINHA}`}>
        <button
          type="button"
          aria-expanded={resumoAberto}
          aria-controls={`${base}-resumo`}
          onClick={() => setResumoAberto((a) => !a)}
          className={`flex h-14 w-full items-center justify-between px-4 ${FOCO}`}
        >
          <span className="flex items-center gap-2 text-[12px] uppercase tracking-[0.14em]">
            {resumoAberto ? "Esconder resumo" : "Ver resumo"}
            <IconeSeta className={`h-4 w-4 transition-transform duration-200 motion-reduce:transition-none ${resumoAberto ? "rotate-180" : ""}`} />
          </span>
          <span className="nums-preco font-[family-name:var(--font-serif)] text-[18px] font-medium">{formatBRLPreco(valores.total)}</span>
        </button>
        <div id={`${base}-resumo`} hidden={!resumoAberto} className="px-4 pb-5">
          {resumo}
        </div>
      </div>

      <div className="px-4 pb-16 pt-6 md:px-8 lg:px-0 lg:pt-10">
        <div className="flex items-baseline justify-between gap-4">
          <h1 className="font-[family-name:var(--font-serif)] text-[26px] leading-8 md:text-[30px]">Finalizar compra</h1>
          <button
            type="button"
            onClick={abrirSacola}
            className={`-mr-1 flex min-h-11 items-center rounded-[4px] px-1 text-[12px] underline underline-offset-4 ${HOVER} ${FOCO}`}
          >
            Editar sacola
          </button>
        </div>

        <div className={`mt-4 border-t ${LINHA}`}>
          {/* 1. Seus dados */}
          <Etapa
            numero={1}
            titulo="Seus dados"
            estado={estado(1)}
            aoAlterar={() => irPara(1)}
            resumo={
              <>
                <p>{cliente.nome}</p>
                <p className="break-all">
                  {cliente.email} · {cliente.whatsapp}
                </p>
              </>
            }
          >
            <form
              noValidate
              onSubmit={(e) => {
                e.preventDefault();
                continuarDados();
              }}
              className="grid gap-4"
            >
              <Campo
                id={`${base}-nome`}
                rotulo="Nome e sobrenome"
                autoComplete="name"
                value={cliente.nome}
                onChange={(e) => setCliente((c) => ({ ...c, nome: e.target.value }))}
                erro={erro1.nome}
              />
              <Campo
                id={`${base}-email`}
                rotulo="E-mail"
                type="email"
                autoComplete="email"
                inputMode="email"
                value={cliente.email}
                onChange={(e) => setCliente((c) => ({ ...c, email: e.target.value }))}
                erro={erro1.email}
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <Campo
                  id={`${base}-whatsapp`}
                  rotulo="WhatsApp"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel-national"
                  value={cliente.whatsapp}
                  onChange={(e) => setCliente((c) => ({ ...c, whatsapp: mascararWhatsapp(e.target.value) }))}
                  erro={erro1.whatsapp}
                />
                <Campo
                  id={`${base}-cpf`}
                  rotulo="CPF"
                  opcional
                  inputMode="numeric"
                  value={cliente.cpf ?? ""}
                  onChange={(e) => setCliente((c) => ({ ...c, cpf: mascararCpf(e.target.value) }))}
                  erro={erro1.cpf}
                />
              </div>
              <button type="submit" className={`mt-2 ${BOTAO_PRINCIPAL}`}>
                Continuar
              </button>
            </form>
          </Etapa>

          {/* 2. Entrega */}
          <Etapa
            numero={2}
            titulo="Entrega"
            estado={estado(2)}
            aoAlterar={() => irPara(2)}
            resumo={
              <>
                <p>
                  {endereco.rua}, {endereco.numero}
                  {endereco.complemento ? `, ${endereco.complemento}` : ""}
                </p>
                <p>
                  {endereco.bairro}, {endereco.cidade}/{endereco.uf.toUpperCase()} · {freteGratis ? "frete grátis" : `frete ${formatBRLPreco(frete)}`}
                </p>
              </>
            }
          >
            <form
              noValidate
              onSubmit={(e) => {
                e.preventDefault();
                continuarEntrega();
              }}
              className="grid gap-4"
            >
              <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-3">
                <Campo
                  id={`${base}-cep`}
                  rotulo="CEP"
                  inputMode="numeric"
                  autoComplete="postal-code"
                  value={endereco.cep}
                  onChange={(e) => aoMudarCep(e.target.value)}
                  erro={erro2.cep}
                  aria-describedby={`${base}-cep-nota`}
                />
                <a
                  href="https://buscacepinter.correios.com.br/app/endereco/index.php"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`mb-0 flex min-h-11 items-center rounded-[4px] text-[12px] underline underline-offset-4 ${HOVER} ${FOCO}`}
                >
                  Não sei meu CEP
                </a>
              </div>
              <p id={`${base}-cep-nota`} aria-live="polite" className="-mt-2 min-h-4 text-[12px] leading-4 text-brand-muted">
                {cepStatus === "buscando" && "Buscando o endereço..."}
                {cepStatus === "erro" && <span className={ERRO}>Não achamos esse CEP. Preencha o endereço abaixo.</span>}
              </p>

              {mostraEndereco && (
                <>
                  <Campo
                    id={`${base}-rua`}
                    rotulo="Rua"
                    autoComplete="address-line1"
                    value={endereco.rua}
                    onChange={(e) => setEndereco((x) => ({ ...x, rua: e.target.value }))}
                    erro={erro2.rua}
                  />
                  <div className="grid grid-cols-[110px_minmax(0,1fr)] gap-3">
                    <Campo
                      id={`${base}-numero`}
                      rotulo="Número"
                      inputMode="numeric"
                      value={endereco.numero}
                      onChange={(e) => setEndereco((x) => ({ ...x, numero: e.target.value }))}
                      erro={erro2.numero}
                    />
                    <Campo
                      id={`${base}-complemento`}
                      rotulo="Complemento"
                      opcional
                      autoComplete="address-line2"
                      value={endereco.complemento ?? ""}
                      onChange={(e) => setEndereco((x) => ({ ...x, complemento: e.target.value }))}
                    />
                  </div>
                  <Campo
                    id={`${base}-bairro`}
                    rotulo="Bairro"
                    value={endereco.bairro}
                    onChange={(e) => setEndereco((x) => ({ ...x, bairro: e.target.value }))}
                    erro={erro2.bairro}
                  />
                  <div className="grid grid-cols-[minmax(0,1fr)_80px] gap-3">
                    <Campo
                      id={`${base}-cidade`}
                      rotulo="Cidade"
                      autoComplete="address-level2"
                      value={endereco.cidade}
                      onChange={(e) => setEndereco((x) => ({ ...x, cidade: e.target.value }))}
                      erro={erro2.cidade}
                    />
                    <Campo
                      id={`${base}-uf`}
                      rotulo="UF"
                      autoComplete="address-level1"
                      maxLength={2}
                      value={endereco.uf}
                      onChange={(e) => setEndereco((x) => ({ ...x, uf: e.target.value.toUpperCase().replace(/[^A-Z]/g, "") }))}
                      aria-invalid={erro2.cidade ? true : undefined}
                    />
                  </div>

                  {estimativa && (
                    <div className="flex items-center justify-between gap-3 rounded-[4px] border border-[#1B4965] bg-[#C8E1E4] px-3 py-3">
                      <span className="min-w-0">
                        <span className="block text-[14px] leading-5">
                          {estimativa.local ? "Entrega em Belém" : `Envio para ${estimativa.regiao}`}
                        </span>
                        <span className="block text-[12px] leading-4 text-[#1B4965]/80">
                          De {estimativa.prazoMin} a {estimativa.prazoMax} dias úteis depois do envio
                        </span>
                      </span>
                      <span className="nums-preco shrink-0 font-[family-name:var(--font-serif)] text-[17px] font-medium">
                        {freteGratis ? (
                          <>
                            <span className="sr-only">Frete grátis</span>
                            <span aria-hidden>Grátis</span>
                          </>
                        ) : (
                          formatBRLPreco(estimativa.valor)
                        )}
                      </span>
                    </div>
                  )}
                </>
              )}
              <button type="submit" className={`mt-2 ${BOTAO_PRINCIPAL}`}>
                Continuar
              </button>
            </form>
          </Etapa>

          {/* 3. Medidas */}
          <Etapa
            numero={3}
            titulo="Medidas"
            estado={estado(3)}
            aoAlterar={paraMedir.length ? () => irPara(3) : undefined}
            resumo={
              paraMedir.length === 0 ? (
                <p>Nenhuma peça precisa de medidas.</p>
              ) : (
                paraMedir.map((i) => {
                  const d = todasMedidas[i.id] ?? MEDIDAS_VAZIAS;
                  return (
                    <p key={i.id}>
                      {i.nome}: {d.porVideo ? "por vídeo, depois do pedido" : resumoMedidas(d)}
                    </p>
                  );
                })
              )
            }
          >
            <form
              noValidate
              onSubmit={(e) => {
                e.preventDefault();
                continuarMedidas();
              }}
            >
              <p className="text-[13px] leading-5 text-brand-muted">
                Suas medidas em centímetros. Se preferir, a Gio manda um vídeo mostrando como medir.
              </p>
              <ul className="mt-2">
                {paraMedir.map((i) => (
                  <li key={i.id} className={`border-b py-4 last:border-b-0 ${LINHA}`}>
                    <div className="mb-3 flex items-center gap-3">
                      <span className="relative h-16 w-12 shrink-0 overflow-hidden rounded-[2px] bg-[#1B4965]/5">
                        <FotoSuave src={i.foto} alt="" fill sizes="48px" className="object-cover object-[50%_40%]" />
                      </span>
                      <span>
                        <span className="block font-[family-name:var(--font-serif)] text-[17px] leading-6">{i.nome}</span>
                        <span className="block text-[12px] text-brand-muted">Sob medida{i.qty > 1 ? `, ${i.qty} unidades com as mesmas medidas` : ""}</span>
                      </span>
                    </div>
                    <CamposMedidas produtoId={i.id} exigir={tentou.has(3)} />
                  </li>
                ))}
              </ul>
              <button type="submit" className={`mt-4 ${BOTAO_PRINCIPAL}`}>
                Continuar
              </button>
            </form>
          </Etapa>

          {/* 4. Pagamento */}
          <Etapa numero={4} titulo="Pagamento" estado={estado(4)}>
            <fieldset>
              <legend className="text-[10px] uppercase tracking-[0.14em]">Forma de pagamento</legend>
              <div className="mt-2 grid gap-2">
                <Escolha
                  nome="forma"
                  valor="cartao"
                  marcada={forma === "cartao"}
                  aoEscolher={() => setForma("cartao")}
                  titulo="Cartão de crédito"
                  detalhe={valoresCartao.maxParcelas > 1 ? `em até ${valoresCartao.maxParcelas}x sem juros` : "à vista"}
                  lado={formatBRLPreco(valoresCartao.total)}
                />
                <Escolha
                  nome="forma"
                  valor="pix"
                  marcada={forma === "pix"}
                  aoEscolher={() => setForma("pix")}
                  titulo="Pix"
                  detalhe="o menor valor"
                  lado={formatBRLPreco(valoresPix.total)}
                />
              </div>
            </fieldset>

            {valores.temSobMedida && (
              <fieldset className="mt-6">
                <legend className="text-[10px] uppercase tracking-[0.14em]">Quanto pagar agora</legend>
                <div className="mt-2 grid gap-2">
                  <Escolha
                    nome="modalidade"
                    valor="sinal"
                    marcada={modalidade === "sinal"}
                    aoEscolher={() => setModalidade("sinal")}
                    titulo="Sinal de 50%"
                    detalhe={`e ${formatBRLPreco(sinal.depois)} antes do envio`}
                    lado={formatBRLPreco(sinal.agora)}
                  />
                  <Escolha
                    nome="modalidade"
                    valor="total"
                    marcada={modalidade === "total"}
                    aoEscolher={() => setModalidade("total")}
                    titulo="Tudo agora"
                    lado={formatBRLPreco(valores.total)}
                  />
                </div>
              </fieldset>
            )}

            {forma === "cartao" ? (
              <div className="mt-6 flex flex-col items-center justify-center gap-2 rounded-[4px] border border-dashed border-[#1B4965]/50 px-4 py-7 text-center">
                <IconeCadeado className="h-5 w-5" />
                <p className="text-[13px] leading-5">Aqui entra o pagamento seguro do provedor.</p>
                <p className="text-[12px] leading-4 text-brand-muted">Os dados do cartão ficam só com ele.</p>
              </div>
            ) : (
              <p className="mt-6 text-[13px] leading-5 text-brand-muted">
                Ao confirmar, você recebe o código Pix copia e cola.
              </p>
            )}

            <button type="button" onClick={pagar} disabled={pagando} aria-busy={pagando || undefined} className={`mt-4 ${BOTAO_PRINCIPAL} disabled:opacity-70`}>
              {pagando ? "Processando..." : forma === "pix" ? `Gerar Pix de ${formatBRLPreco(aPagar)}` : `Pagar ${formatBRLPreco(aPagar)}`}
            </button>
            {erroPagamento && (
              <p role="alert" className={`mt-2 text-[13px] ${ERRO}`}>
                {erroPagamento}
              </p>
            )}
            <p className="mt-3 flex items-center justify-center gap-1.5 text-[12px] leading-4 text-brand-muted">
              <span aria-hidden className="block h-1.5 w-1.5 rounded-full bg-[#1B4965]/40" />
              Modo demonstração: nenhum valor é cobrado.
            </p>
          </Etapa>

          {/* 5. Confirmação (vira a tela de confirmação depois do pagamento) */}
          <Etapa numero={5} titulo="Confirmação" estado="futura" />
        </div>

        <p className="mt-8 text-[12px] leading-[18px] text-brand-muted">
          Dúvida antes de pagar?{" "}
          <a
            href={`https://wa.me/${WHATSAPP_GIO}`}
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex min-h-11 items-center rounded-[4px] text-[#1B4965] underline underline-offset-4 ${HOVER} ${FOCO}`}
          >
            Fale com a Gio no WhatsApp
          </a>
        </p>
      </div>

      {/* Computador: o resumo fixo à direita. */}
      <aside aria-label="Resumo do pedido" className="hidden lg:block lg:pt-10">
        <div className={`sticky top-6 rounded-[4px] border bg-[#1B4965]/[0.03] p-6 ${LINHA}`}>
          <h2 className="mb-2 text-[11px] uppercase tracking-[0.16em]">Resumo do pedido</h2>
          {resumo}
        </div>
      </aside>
    </div>
  );
}
