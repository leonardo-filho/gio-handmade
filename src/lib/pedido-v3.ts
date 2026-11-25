"use client";

import { useSyncExternalStore } from "react";
import { sugerirTamanho, type Medidas } from "@/data/medidas";
import type { Produto } from "@/data/produtos";
import type { CartLine } from "@/components/cart/CartProvider";
import {
  itensDoCarrinho,
  type DadosCliente,
  type Endereco,
  type FormaPagamento,
  type ItemPedido,
  type Modalidade,
} from "@/lib/checkout";
import type { FreteEstimado } from "@/lib/frete";

// Estado complementar da Versao 3 (Argon):
// Guarda as medidas informadas por peca (na pagina da peca ou no checkout) e
// o rascunho das etapas do checkout, sincronizando sacola, pagina da peca e
// pagina de checkout via useSyncExternalStore (sem setState em useEffect e
// sem acessar window no render do servidor).

export type MedidasPeca = {
  medidas?: Medidas;
  tamanhoReferencia?: string;
  medidasPorVideo?: boolean;
};

export type MapaMedidas = Record<string, MedidasPeca>;

export type RascunhoCheckout = {
  forma: FormaPagamento;
  modalidade: Modalidade;
  cliente: DadosCliente;
  entrega: Endereco;
  frete: FreteEstimado | null;
  observacao: string;
};

const CHAVE_MEDIDAS = "gio-v3-medidas-v1";
const CHAVE_RASCUNHO = "gio-v3-checkout-v1";

const MEDIDAS_VAZIAS: MapaMedidas = {};

const RASCUNHO_INICIAL: RascunhoCheckout = {
  forma: "cartao",
  modalidade: "sinal",
  cliente: {
    nome: "",
    email: "",
    whatsapp: "",
    cpf: "",
  },
  entrega: {
    cep: "",
    rua: "",
    numero: "",
    complemento: "",
    bairro: "",
    cidade: "",
    uf: "",
  },
  frete: null,
  observacao: "",
};

type Ouvinte = () => void;

function criarStoreLocal<T>(chave: string, inicial: T, validar: (bruto: unknown) => T) {
  let cache: { valor: T } | null = null;
  const ouvintes = new Set<Ouvinte>();

  function obter(): T {
    if (typeof window === "undefined") return inicial;
    if (!cache) {
      try {
        const raw = window.localStorage.getItem(chave);
        cache = { valor: raw ? validar(JSON.parse(raw)) : inicial };
      } catch {
        cache = { valor: inicial };
      }
    }
    return cache.valor;
  }

  function definir(novo: T) {
    cache = { valor: novo };
    if (typeof window !== "undefined") {
      try {
        window.localStorage.setItem(chave, JSON.stringify(novo));
      } catch {
        // Ignora erro de quota do navegador e mantem em memoria.
      }
    }
    ouvintes.forEach((o) => o());
  }

  function assinar(ouvinte: Ouvinte) {
    ouvintes.add(ouvinte);
    const onStorage = (e: StorageEvent) => {
      if (e.key !== null && e.key !== chave) return;
      cache = null;
      ouvinte();
    };
    window.addEventListener("storage", onStorage);
    return () => {
      ouvintes.delete(ouvinte);
      window.removeEventListener("storage", onStorage);
    };
  }

  return {
    obter,
    definir,
    assinar,
    servidor: () => inicial,
  };
}

function validarMapaMedidas(bruto: unknown): MapaMedidas {
  if (!bruto || typeof bruto !== "object") return MEDIDAS_VAZIAS;
  const mapa: MapaMedidas = {};
  for (const [id, valor] of Object.entries(bruto as Record<string, unknown>)) {
    if (!valor || typeof valor !== "object") continue;
    const v = valor as MedidasPeca;
    const m = v.medidas;
    const medidasLimpas: Medidas | undefined =
      m && typeof m === "object"
        ? {
            busto: typeof m.busto === "number" && Number.isFinite(m.busto) ? m.busto : undefined,
            cintura: typeof m.cintura === "number" && Number.isFinite(m.cintura) ? m.cintura : undefined,
            quadril: typeof m.quadril === "number" && Number.isFinite(m.quadril) ? m.quadril : undefined,
          }
        : undefined;
    mapa[id] = {
      medidas: medidasLimpas,
      tamanhoReferencia: typeof v.tamanhoReferencia === "string" ? v.tamanhoReferencia : undefined,
      medidasPorVideo: Boolean(v.medidasPorVideo),
    };
  }
  return mapa;
}

function validarRascunho(bruto: unknown): RascunhoCheckout {
  if (!bruto || typeof bruto !== "object") return RASCUNHO_INICIAL;
  const r = bruto as Partial<RascunhoCheckout>;
  const c: Partial<DadosCliente> = r.cliente && typeof r.cliente === "object" ? r.cliente : {};
  const e: Partial<Endereco> = r.entrega && typeof r.entrega === "object" ? r.entrega : {};
  return {
    forma: r.forma === "pix" ? "pix" : "cartao",
    modalidade: r.modalidade === "total" ? "total" : "sinal",
    cliente: {
      nome: typeof c.nome === "string" ? c.nome : "",
      email: typeof c.email === "string" ? c.email : "",
      whatsapp: typeof c.whatsapp === "string" ? c.whatsapp : "",
      cpf: typeof c.cpf === "string" ? c.cpf : "",
    },
    entrega: {
      cep: typeof e.cep === "string" ? e.cep : "",
      rua: typeof e.rua === "string" ? e.rua : "",
      numero: typeof e.numero === "string" ? e.numero : "",
      complemento: typeof e.complemento === "string" ? e.complemento : "",
      bairro: typeof e.bairro === "string" ? e.bairro : "",
      cidade: typeof e.cidade === "string" ? e.cidade : "",
      uf: typeof e.uf === "string" ? e.uf : "",
    },
    frete: r.frete && typeof r.frete === "object" && typeof r.frete.valor === "number" ? r.frete : null,
    observacao: typeof r.observacao === "string" ? r.observacao : "",
  };
}

const storeMedidas = criarStoreLocal<MapaMedidas>(CHAVE_MEDIDAS, MEDIDAS_VAZIAS, validarMapaMedidas);
const storeRascunho = criarStoreLocal<RascunhoCheckout>(CHAVE_RASCUNHO, RASCUNHO_INICIAL, validarRascunho);

export function useMapaMedidas(): MapaMedidas {
  return useSyncExternalStore(storeMedidas.assinar, storeMedidas.obter, storeMedidas.servidor);
}

export function salvarMedidasPeca(id: string, dados: MedidasPeca) {
  const atual = storeMedidas.obter();
  const sugerido = dados.medidas ? sugerirTamanho(dados.medidas)?.tamanho : undefined;
  storeMedidas.definir({
    ...atual,
    [id]: {
      ...dados,
      tamanhoReferencia: dados.tamanhoReferencia ?? sugerido,
    },
  });
}

export function useRascunhoCheckout(): RascunhoCheckout {
  return useSyncExternalStore(storeRascunho.assinar, storeRascunho.obter, storeRascunho.servidor);
}

export function atualizarRascunhoCheckout(parcial: Partial<RascunhoCheckout>) {
  const atual = storeRascunho.obter();
  storeRascunho.definir({ ...atual, ...parcial });
}

/** Converte as linhas da sacola em ItemPedido[], juntando as medidas salvas de cada peca sob medida. */
export function itensDoCarrinhoComMedidas(linhas: CartLine[], mapa: MapaMedidas): ItemPedido[] {
  return itensDoCarrinho(linhas).map((item) => {
    if (item.opcao !== "sob-medida") return item;
    const salvo = mapa[item.id];
    if (!salvo) return item;
    const ref = salvo.tamanhoReferencia ?? (salvo.medidas ? sugerirTamanho(salvo.medidas)?.tamanho : undefined);
    return {
      ...item,
      medidas: salvo.medidas,
      tamanhoReferencia: ref,
      medidasPorVideo: salvo.medidasPorVideo,
    };
  });
}

/** Resumo curto das medidas de uma peca sob medida para mostrar na sacola e na revisao. */
export function resumoMedidasPeca(salvo?: MedidasPeca): string | null {
  if (!salvo) return null;
  if (salvo.medidasPorVideo) return "Medidas por vídeo com a Gio";
  const m = salvo.medidas;
  if (!m) return null;
  const partes = [
    m.busto ? `busto ${m.busto}` : null,
    m.cintura ? `cintura ${m.cintura}` : null,
    m.quadril ? `quadril ${m.quadril}` : null,
  ].filter(Boolean);
  if (partes.length === 0) return null;
  const ref = salvo.tamanhoReferencia ?? sugerirTamanho(m)?.tamanho;
  return `${partes.join(", ")} cm${ref ? ` · ref. ${ref}` : ""}`;
}

/** Extrai rotulos curtos e fieis do campo `detalhes` da peca para a Mesa de Luz. */
export function extrairFichaPeca(produto: Produto): string[] {
  const d = produto.detalhes.toLowerCase();
  const notas: string[] = [];

  if (d.includes("2.500 miçangas")) notas.push("Mais de 2.500 miçangas e pedrarias");
  else if (d.includes("2.300 cristais")) notas.push("Mais de 2.300 cristais bordados");
  else {
    const mats: string[] = [];
    if (d.includes("pérola")) mats.push("pérolas");
    if (d.includes("crista")) mats.push("cristais");
    if (d.includes("miçanga")) mats.push("miçangas");
    if (d.includes("pedraria") || d.includes("pedras")) mats.push("pedrarias");
    if (d.includes("concha")) mats.push("conchas");
    if (d.includes("chatons")) mats.push("chatons espelhados");
    if (d.includes("paetê")) mats.push("paetês");
    if (mats.length > 0) {
      notas.push(`Bordado com ${mats.slice(0, 3).join(", ")}`);
    } else {
      notas.push("Bordado à mão, um a um");
    }
  }

  if (d.includes("verniz italiano")) {
    notas.push("Aço banhado em verniz italiano");
  } else if (d.includes("banhado a ouro")) {
    notas.push("Pingente banhado a ouro");
  }

  if (produto.producao) {
    notas.push(`Confecção: ${produto.producao}`);
  }

  return notas;
}
