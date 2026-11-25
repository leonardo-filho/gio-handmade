// Núcleo do checkout dentro do site (comum às versões de apresentação).
//
// O que ele resolve, sem tela: tipos do pedido, valores (pix x cartão, sinal
// de 50% nas peças sob medida, cupom e frete), validação dos dados da cliente,
// a mensagem de confirmação para o WhatsApp da Gio e o provedor de pagamento.
//
// Pagamento: por enquanto só existe o provedor "demonstracao", que simula a
// aprovação para a apresentação de sábado (28/11/2026). Os dois caminhos reais
// em estudo ficam como provedores a ligar depois da decisão com a Gio:
//   - Nuvemshop: o site monta o carrinho pela Storefront API e passa para o
//     checkout da Nuvemshop; as medidas vão como campo personalizado do item.
//   - Mercado Pago: pagamento dentro do site (Pix e cartão), com o sinal.
// Nenhum dado de cartão passa por este código: no caminho real, quem coleta o
// cartão é o componente do provedor.

import { produtos, type Produto } from "@/data/produtos";
import { parcelamentoCartao } from "@/lib/parcelas";
import { calcularDesconto, validarCupom, type Cupom } from "@/lib/cupons";
import { medidaValida, sugerirTamanho, type Medidas } from "@/data/medidas";
import type { CartLine, OpcaoPeca } from "@/components/cart/CartProvider";

export const WHATSAPP_GIO = "559192982017";

/** Fração paga no pedido de uma peça sob medida (a confecção começa com ela). */
export const FRACAO_SINAL = 0.5;

export type FormaPagamento = "pix" | "cartao";
/** "sinal": paga 50% das peças sob medida agora e o resto antes do envio. "total": paga tudo agora. */
export type Modalidade = "sinal" | "total";

export type DadosCliente = {
  nome: string;
  email: string;
  whatsapp: string;
  cpf?: string;
};

export type Endereco = {
  cep: string;
  rua: string;
  numero: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  uf: string;
};

export type ItemPedido = {
  id: string;
  nome: string;
  foto: string;
  opcao: OpcaoPeca;
  qty: number;
  /** Valores unitários do catálogo (o preço salvo no carrinho não manda). */
  precoPix: number;
  precoCartao: number;
  maxParcelas: number;
  /** Só nas peças sob medida: as medidas da cliente para esta peça. */
  medidas?: Medidas;
  /** Tamanho de referência (sugerido pela tabela ou escolhido pela cliente). */
  tamanhoReferencia?: string;
  /** Se a cliente prefere mandar as medidas depois, por vídeo com a Gio. */
  medidasPorVideo?: boolean;
};

export type Pedido = {
  itens: ItemPedido[];
  cliente: DadosCliente;
  entrega: Endereco;
  frete: number;
  forma: FormaPagamento;
  modalidade: Modalidade;
  cupom?: string;
  observacao?: string;
};

export type Valores = {
  subtotal: number;
  desconto: number;
  frete: number;
  total: number;
  /** O que é cobrado agora (com sinal, metade das peças sob medida + o resto inteiro + frete). */
  agora: number;
  /** O que fica para antes do envio. */
  depois: number;
  temSobMedida: boolean;
  maxParcelas: number;
};

const porId = new Map<string, Produto>(produtos.map((p) => [p.id, p]));

/** Converte as linhas do carrinho em itens do pedido, com os valores atuais do catálogo. */
export function itensDoCarrinho(linhas: CartLine[]): ItemPedido[] {
  return linhas.map((l) => {
    const p = porId.get(l.id);
    const cartao = parcelamentoCartao(p ?? { preco: l.preco });
    return {
      id: l.id,
      nome: p?.nome ?? l.nome,
      foto: p?.foto ?? l.foto,
      opcao: l.opcao,
      qty: l.qty,
      precoPix: p?.preco ?? l.preco,
      precoCartao: cartao.total,
      maxParcelas: cartao.vezes,
    };
  });
}

function arred(v: number): number {
  return Math.round(v * 100) / 100;
}

export function calcularValores(
  itens: ItemPedido[],
  opcoes: { forma: FormaPagamento; modalidade: Modalidade; frete?: number; cupom?: Cupom | null }
): Valores {
  const unit = (i: ItemPedido) => (opcoes.forma === "pix" ? i.precoPix : i.precoCartao);
  const subtotal = arred(itens.reduce((s, i) => s + unit(i) * i.qty, 0));
  const desconto = opcoes.cupom ? arred(calcularDesconto(subtotal, opcoes.cupom)) : 0;
  const fator = subtotal > 0 ? (subtotal - desconto) / subtotal : 1;
  const frete = arred(opcoes.frete ?? 0);
  const total = arred(subtotal - desconto + frete);
  const temSobMedida = itens.some((i) => i.opcao === "sob-medida");

  let agora = total;
  if (opcoes.modalidade === "sinal" && temSobMedida) {
    const sobMedida = itens.filter((i) => i.opcao === "sob-medida").reduce((s, i) => s + unit(i) * i.qty, 0) * fator;
    const resto = itens.filter((i) => i.opcao !== "sob-medida").reduce((s, i) => s + unit(i) * i.qty, 0) * fator;
    agora = arred(sobMedida * FRACAO_SINAL + resto + frete);
  }
  const maxParcelas = opcoes.forma === "cartao" ? Math.min(...itens.map((i) => i.maxParcelas), 12) : 1;
  return { subtotal, desconto, frete, total, agora, depois: arred(total - agora), temSobMedida, maxParcelas: Number.isFinite(maxParcelas) ? maxParcelas : 1 };
}

// Validação simples dos dados (mensagens curtas, prontas para a interface).
export function validarCliente(c: DadosCliente): Partial<Record<keyof DadosCliente, string>> {
  const erros: Partial<Record<keyof DadosCliente, string>> = {};
  if (c.nome.trim().split(/\s+/).length < 2) erros.nome = "Informe nome e sobrenome.";
  if (!/^\S+@\S+\.\S+$/.test(c.email.trim())) erros.email = "Confira o e-mail.";
  if (c.whatsapp.replace(/\D/g, "").length < 10) erros.whatsapp = "Informe o WhatsApp com DDD.";
  if (c.cpf && c.cpf.replace(/\D/g, "").length !== 11) erros.cpf = "O CPF tem 11 números.";
  return erros;
}

export function validarEndereco(e: Endereco): Partial<Record<keyof Endereco, string>> {
  const erros: Partial<Record<keyof Endereco, string>> = {};
  if (e.cep.replace(/\D/g, "").length !== 8) erros.cep = "O CEP tem 8 números.";
  if (!e.rua.trim()) erros.rua = "Informe a rua.";
  if (!e.numero.trim()) erros.numero = "Informe o número (ou S/N).";
  if (!e.bairro.trim()) erros.bairro = "Informe o bairro.";
  if (!e.cidade.trim() || !/^[A-Z]{2}$/.test(e.uf.trim().toUpperCase())) erros.cidade = "Confira cidade e UF.";
  return erros;
}

/** Peça sob medida precisa de busto e cintura (quadril nas saias e conjuntos) ou da opção de mandar por vídeo. */
export function medidasCompletas(item: ItemPedido): boolean {
  if (item.opcao !== "sob-medida" || item.medidasPorVideo) return true;
  const m = item.medidas ?? {};
  return medidaValida(m.busto) && medidaValida(m.cintura);
}

export function cupomDoCodigo(codigo?: string): Cupom | null {
  if (!codigo) return null;
  const r = validarCupom(codigo);
  return r.status === "ok" ? r.cupom : null;
}

function brl(v: number): string {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

/** Mensagem do pedido para o WhatsApp da Gio (vai junto da confirmação do pagamento). */
export function mensagemDoPedido(pedido: Pedido, codigo: string): string {
  const v = calcularValores(pedido.itens, { forma: pedido.forma, modalidade: pedido.modalidade, frete: pedido.frete, cupom: cupomDoCodigo(pedido.cupom) });
  const linhas = pedido.itens.map((i) => {
    const opcao = i.opcao === "sob-medida" ? "sob medida" : "pronta entrega";
    let medida = "";
    if (i.opcao === "sob-medida") {
      if (i.medidasPorVideo) medida = " · medidas por vídeo";
      else if (i.medidas) {
        const m = i.medidas;
        const partes = [m.busto && `busto ${m.busto}`, m.cintura && `cintura ${m.cintura}`, m.quadril && `quadril ${m.quadril}`].filter(Boolean);
        const ref = i.tamanhoReferencia ?? sugerirTamanho(m)?.tamanho;
        medida = ` · ${partes.join(", ")} cm${ref ? ` (ref. ${ref})` : ""}`;
      }
    }
    return `• ${i.qty}x ${i.nome} (${opcao})${medida}`;
  });
  const e = pedido.entrega;
  return [
    `Oi, Gio! Pedido ${codigo} feito pelo site.`,
    "",
    ...linhas,
    "",
    `Pagamento: ${pedido.forma === "pix" ? "Pix" : "Cartão"}${pedido.modalidade === "sinal" && v.temSobMedida ? `, sinal de ${brl(v.agora)} agora e ${brl(v.depois)} antes do envio` : `, ${brl(v.total)}`}`,
    `Entrega: ${e.rua}, ${e.numero}${e.complemento ? `, ${e.complemento}` : ""}, ${e.bairro}, ${e.cidade}/${e.uf.toUpperCase()}, CEP ${e.cep}`,
    `Cliente: ${pedido.cliente.nome} · ${pedido.cliente.whatsapp}`,
    pedido.observacao ? `Obs.: ${pedido.observacao}` : "",
  ]
    .filter((l, idx, arr) => l !== "" || arr[idx - 1] !== "")
    .join("\n");
}

export function linkWhatsapp(texto: string): string {
  return `https://wa.me/${WHATSAPP_GIO}?text=${encodeURIComponent(texto)}`;
}

// Provedor de pagamento. A interface já é a definitiva; só o de demonstração existe.
export type ResultadoPagamento =
  | { status: "aprovado"; codigo: string; provedor: string }
  | { status: "pendente"; codigo: string; provedor: string; pix?: { copiaECola: string } }
  | { status: "erro"; mensagem: string };

export type ProvedorPagamento = {
  nome: string;
  /** true quando o pagamento é de mentira (mostrar o aviso "modo demonstração"). */
  demonstracao: boolean;
  pagar: (pedido: Pedido) => Promise<ResultadoPagamento>;
};

function codigoPedido(): string {
  // Código curto e legível (GH-AB12CD). Gerado no clique, nunca no render.
  const letras = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let s = "";
  for (let i = 0; i < 6; i++) s += letras[Math.floor(Math.random() * letras.length)];
  return `GH-${s}`;
}

export const provedorDemonstracao: ProvedorPagamento = {
  nome: "demonstracao",
  demonstracao: true,
  async pagar(pedido) {
    await new Promise((r) => setTimeout(r, 900));
    const codigo = codigoPedido();
    if (pedido.forma === "pix") {
      return { status: "pendente", codigo, provedor: "demonstracao", pix: { copiaECola: `00020126DEMONSTRACAO${codigo}` } };
    }
    return { status: "aprovado", codigo, provedor: "demonstracao" };
  },
};

/** Provedor em uso. Trocar aqui quando a Gio decidir entre Nuvemshop e Mercado Pago. */
export const provedorAtual: ProvedorPagamento = provedorDemonstracao;
