"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import {
  calcularDesconto,
  validarCupom,
  type Cupom,
  type ResultadoCupom,
} from "@/lib/cupons";
import type { Medidas } from "@/data/medidas";

/** Como a peça foi pedida: feita sob medida ou a peça pronta, com envio imediato. */
export type OpcaoPeca = "sob-medida" | "pronta-entrega";

export type CartItem = {
  id: string;
  nome: string;
  preco: number;
  foto: string;
  categoria?: string;
  /**
   * Opção escolhida na página da peça: "sob-medida" ou "pronta-entrega".
   * Sem opção (ou com um valor fora desses dois), a linha vale como sob medida.
   */
  opcao?: OpcaoPeca | (string & {});
  /** Versão 2 (provador): as medidas da cliente que seguem com a peça sob medida. */
  medidas?: Medidas;
  /** A cliente prefere mandar as medidas depois, por vídeo. */
  medidasPorVideo?: boolean;
  /** Tamanho de referência sugerido pela tabela (só referência). */
  tamanhoReferencia?: string;
};

/** O que o provador grava numa linha da sacola. */
export type MedidasDaLinha = Pick<CartItem, "medidas" | "medidasPorVideo" | "tamanhoReferencia">;

/**
 * Linha da sacola. A linha é a peça MAIS a opção: o mesmo top em sob medida e
 * em pronta entrega são duas linhas, cada uma com a sua quantidade.
 */
export type CartLine = Omit<CartItem, "opcao"> & { opcao: OpcaoPeca; qty: number };

/** Opção de quem não escolheu: as peças são feitas sob encomenda. */
export const OPCAO_PADRAO: OpcaoPeca = "sob-medida";

export function normalizarOpcao(valor: unknown): OpcaoPeca {
  return valor === "pronta-entrega" ? "pronta-entrega" : OPCAO_PADRAO;
}

/** Chave única da linha (para key do React e comparações). */
export function chaveDaLinha(linha: { id: string; opcao: OpcaoPeca }): string {
  return `${linha.id}:${linha.opcao}`;
}

// Última peça adicionada, para o aviso "{nome} no carrinho" (CartToast, que
// saiu do layout na v3; o campo fica para quem ainda o lê).
// `vez` cresce a cada add, então o aviso reaparece mesmo com a mesma peça.
export type UltimoAdicionado = {
  id: string;
  nome: string;
  foto: string;
  vez: number;
};

type CartContextValue = {
  lines: CartLine[];
  add: (item: CartItem, qty?: number) => void;
  /** Tira a linha da peça na opção dada (sem opção: sob medida). */
  remove: (id: string, opcao?: string) => void;
  /** Muda a quantidade da linha (0 ou menos tira a linha). Sem opção: sob medida. */
  setQty: (id: string, qty: number, opcao?: string) => void;
  /** Troca as medidas da linha (peça + opção). */
  definirMedidas: (id: string, opcao: string, dados: MedidasDaLinha) => void;
  clear: () => void;
  count: number;
  subtotal: number;
  cupom: Cupom | null;
  desconto: number;
  aplicarCupom: (codigo: string) => ResultadoCupom;
  removerCupom: () => void;
  isOpen: boolean;
  open: () => void;
  close: () => void;
  hydrated: boolean;
  ultimoAdicionado: UltimoAdicionado | null;
  dispensarAviso: (vez: number) => void;
};

const CartContext = createContext<CartContextValue | null>(null);

const STORAGE_KEY = "gio-cart-v1";
const STORAGE_KEY_CUPOM = "gio-cupom-v1";

// Carrinho e cupom moram no localStorage e são lidos com useSyncExternalStore:
// no servidor (e durante a hidratação) valem vazios, e logo depois o React
// troca pelo que está salvo, sem mismatch de SSR e sem setState em efeito.
// De quebra, outra aba aberta da loja acompanha as mudanças (evento storage).
type Ouvinte = () => void;

function criarArmazem<T>(
  chave: string,
  vazio: T,
  ler: (raw: string | null) => T,
  escrever: (valor: T) => string | null
) {
  let cache: { valor: T } | null = null;
  const ouvintes = new Set<Ouvinte>();

  function obter(): T {
    if (!cache) {
      try {
        cache = { valor: ler(window.localStorage.getItem(chave)) };
      } catch {
        cache = { valor: vazio }; /* storage indisponível ou JSON inválido */
      }
    }
    return cache.valor;
  }

  function definir(valor: T) {
    cache = { valor };
    try {
      const raw = escrever(valor);
      if (raw === null) window.localStorage.removeItem(chave);
      else window.localStorage.setItem(chave, raw);
    } catch {
      /* ignora: o carrinho segue valendo nesta aba */
    }
    ouvintes.forEach((ouvinte) => ouvinte());
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

  return { obter, definir, assinar, vazio: () => vazio };
}

const SEM_LINHAS: CartLine[] = [];

// Lê o carrinho salvo. A chave do localStorage é a mesma desde a v1: o
// carrinho de antes da v3 não tinha opção, e essas linhas viram sob medida.
// Linhas repetidas (mesma peça e mesma opção) se juntam numa só.
function lerLinhas(raw: string | null): CartLine[] {
  if (!raw) return SEM_LINHAS;
  const parsed: unknown = JSON.parse(raw);
  if (!Array.isArray(parsed)) return SEM_LINHAS;
  const linhas: CartLine[] = [];
  for (const bruto of parsed) {
    if (!bruto || typeof bruto !== "object") continue;
    const l = bruto as Partial<CartLine> & { opcao?: unknown };
    if (typeof l.id !== "string" || typeof l.qty !== "number" || !(l.qty > 0)) continue;
    const opcao = normalizarOpcao(l.opcao);
    const igual = linhas.find((x) => x.id === l.id && x.opcao === opcao);
    if (igual) igual.qty += l.qty;
    else linhas.push({ ...(l as CartLine), opcao });
  }
  return linhas;
}

const armazemLinhas = criarArmazem<CartLine[]>(STORAGE_KEY, SEM_LINHAS, lerLinhas, (linhas) =>
  JSON.stringify(linhas)
);

// Revalida na leitura: um cupom salvo que já expirou não é reaplicado.
const armazemCupom = criarArmazem<string | null>(
  STORAGE_KEY_CUPOM,
  null,
  (raw) => (raw && validarCupom(raw).status === "ok" ? raw.toUpperCase() : null),
  (codigo) => codigo
);

const assinarNada = () => () => {};

export function CartProvider({ children }: { children: ReactNode }) {
  const lines = useSyncExternalStore(armazemLinhas.assinar, armazemLinhas.obter, armazemLinhas.vazio);
  const cupomCodigo = useSyncExternalStore(armazemCupom.assinar, armazemCupom.obter, armazemCupom.vazio);
  // false no servidor e na hidratação, true depois (o badge do header espera).
  const hydrated = useSyncExternalStore(assinarNada, () => true, () => false);

  const [isOpen, setIsOpen] = useState(false);
  const [ultimoAdicionado, setUltimoAdicionado] = useState<UltimoAdicionado | null>(null);
  const vezAdicionado = useRef(0);

  // Adicionar NÃO abre a sacola: quem chama decide (o COMPRAR da página da
  // peça chama add e depois open). A mesma peça na mesma opção soma; em outra
  // opção, vira outra linha.
  const add = useCallback((item: CartItem, qty: number = 1) => {
    const prev = armazemLinhas.obter();
    const opcao = normalizarOpcao(item.opcao);
    const existente = prev.find((l) => l.id === item.id && l.opcao === opcao);
    // Medidas novas valem sobre as antigas da mesma linha.
    const novasMedidas: MedidasDaLinha | null =
      item.medidas || item.medidasPorVideo
        ? { medidas: item.medidas, medidasPorVideo: item.medidasPorVideo, tamanhoReferencia: item.tamanhoReferencia }
        : null;
    armazemLinhas.definir(
      existente
        ? prev.map((l) => (l === existente ? { ...l, ...(novasMedidas ?? {}), qty: l.qty + qty } : l))
        : [...prev, { ...item, opcao, qty }]
    );
    vezAdicionado.current += 1;
    setUltimoAdicionado({ id: item.id, nome: item.nome, foto: item.foto, vez: vezAdicionado.current });
  }, []);

  // Tira o aviso da tela, mas só se ele ainda for o mesmo (um add mais novo
  // no meio do caminho não some antes da hora).
  const dispensarAviso = useCallback((vez: number) => {
    setUltimoAdicionado((atual) => (atual?.vez === vez ? null : atual));
  }, []);

  const remove = useCallback((id: string, opcao?: string) => {
    const alvo = normalizarOpcao(opcao);
    armazemLinhas.definir(armazemLinhas.obter().filter((l) => !(l.id === id && l.opcao === alvo)));
  }, []);

  const setQty = useCallback((id: string, qty: number, opcao?: string) => {
    const alvo = normalizarOpcao(opcao);
    const prev = armazemLinhas.obter();
    const eh = (l: CartLine) => l.id === id && l.opcao === alvo;
    armazemLinhas.definir(
      qty <= 0 ? prev.filter((l) => !eh(l)) : prev.map((l) => (eh(l) ? { ...l, qty } : l))
    );
  }, []);

  const definirMedidas = useCallback((id: string, opcao: string, dados: MedidasDaLinha) => {
    const alvo = normalizarOpcao(opcao);
    armazemLinhas.definir(
      armazemLinhas.obter().map((l) =>
        l.id === id && l.opcao === alvo
          ? { ...l, medidas: dados.medidas, medidasPorVideo: dados.medidasPorVideo, tamanhoReferencia: dados.tamanhoReferencia }
          : l
      )
    );
  }, []);

  const clear = useCallback(() => armazemLinhas.definir(SEM_LINHAS), []);
  // Abrir a sacola encerra o aviso: ele não volta quando a sacola fecha.
  const open = useCallback(() => {
    setIsOpen(true);
    setUltimoAdicionado(null);
  }, []);
  const close = useCallback(() => setIsOpen(false), []);

  const aplicarCupom = useCallback((codigo: string): ResultadoCupom => {
    const resultado = validarCupom(codigo);
    if (resultado.status === "ok") armazemCupom.definir(resultado.cupom.codigo);
    return resultado;
  }, []);

  const removerCupom = useCallback(() => armazemCupom.definir(null), []);

  const count = useMemo(() => lines.reduce((acc, l) => acc + l.qty, 0), [lines]);
  const subtotal = useMemo(
    () => lines.reduce((acc, l) => acc + l.preco * l.qty, 0),
    [lines]
  );

  // Revalida o cupom a cada render relevante: se expirou ou o código não existe
  // mais, ele simplesmente deixa de valer (sem desconto).
  const cupom = useMemo(() => {
    if (!cupomCodigo) return null;
    const resultado = validarCupom(cupomCodigo);
    return resultado.status === "ok" ? resultado.cupom : null;
  }, [cupomCodigo]);

  const desconto = useMemo(
    () => (cupom ? calcularDesconto(subtotal, cupom) : 0),
    [cupom, subtotal]
  );

  const value = useMemo<CartContextValue>(
    () => ({
      lines,
      add,
      remove,
      setQty,
      definirMedidas,
      clear,
      count,
      subtotal,
      cupom,
      desconto,
      aplicarCupom,
      removerCupom,
      isOpen,
      open,
      close,
      hydrated,
      ultimoAdicionado,
      dispensarAviso,
    }),
    [
      lines,
      add,
      remove,
      setQty,
      definirMedidas,
      clear,
      count,
      subtotal,
      cupom,
      desconto,
      aplicarCupom,
      removerCupom,
      isOpen,
      open,
      close,
      hydrated,
      ultimoAdicionado,
      dispensarAviso,
    ]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart precisa estar dentro de <CartProvider>");
  return ctx;
}
