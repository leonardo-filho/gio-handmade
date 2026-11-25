// Regras do checkout da versão 1 que ficam fora do núcleo comum
// (src/lib/checkout.ts): frete grátis, quais peças pedem medidas, máscaras
// dos campos e o último pedido feito nesta aba.

import { produtos, secaoVitrine, type Produto } from "@/data/produtos";
import type { ItemPedido, Pedido, ResultadoPagamento } from "@/lib/checkout";

/**
 * Frete grátis a partir deste valor (o mesmo da faixa do topo do site). Vale
 * sobre o valor no pix já com o cupom, para o frete não mudar quando a
 * cliente troca a forma de pagamento na etapa 4.
 */
export const FRETE_GRATIS_ACIMA = 600;

const porId = new Map<string, Produto>(produtos.map((p) => [p.id, p]));

export function produtoDe(id: string): Produto | undefined {
  return porId.get(id);
}

/** Peça de vestir (tops, conjuntos, saias e vestidos): a tabela de medidas vale para ela. */
export function deVestir(p: Produto | undefined): boolean {
  return !!p && secaoVitrine(p) !== "Acessórios";
}

/** A peça entra na etapa de medidas: sob medida e de vestir. */
export function pedeMedidas(item: Pick<ItemPedido, "id" | "opcao">): boolean {
  return item.opcao === "sob-medida" && deVestir(produtoDe(item.id));
}

export function soDigitos(v: string, max: number): string {
  return v.replace(/\D/g, "").slice(0, max);
}

/** (91) 98201-7000 */
export function mascararWhatsapp(v: string): string {
  const d = soDigitos(v, 11);
  if (d.length <= 2) return d.length ? `(${d}` : "";
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

/** 000.000.000-00 */
export function mascararCpf(v: string): string {
  const d = soDigitos(v, 11);
  return d
    .replace(/^(\d{3})(\d)/, "$1.$2")
    .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d{1,2})$/, ".$1-$2");
}

// Último pedido feito nesta aba (sessionStorage): a confirmação continua na
// tela se a cliente recarregar a página depois de pagar.
export type PedidoFeito = {
  codigo: string;
  pedido: Pedido;
  resultado: Exclude<ResultadoPagamento, { status: "erro" }>;
};

const CHAVE = "gio-ultimo-pedido-v1";
let cache: { valor: PedidoFeito | null } | null = null;
const ouvintes = new Set<() => void>();

export function lerUltimoPedido(): PedidoFeito | null {
  if (cache) return cache.valor;
  try {
    const bruto = window.sessionStorage.getItem(CHAVE);
    cache = { valor: bruto ? (JSON.parse(bruto) as PedidoFeito) : null };
  } catch {
    cache = { valor: null };
  }
  return cache.valor;
}

export function gravarUltimoPedido(valor: PedidoFeito | null) {
  cache = { valor };
  try {
    if (valor) window.sessionStorage.setItem(CHAVE, JSON.stringify(valor));
    else window.sessionStorage.removeItem(CHAVE);
  } catch {
    /* sem storage: vale nesta tela */
  }
  ouvintes.forEach((o) => o());
}

export function assinarUltimoPedido(ouvinte: () => void) {
  ouvintes.add(ouvinte);
  return () => {
    ouvintes.delete(ouvinte);
  };
}
