"use client";

// Medidas que a cliente digitou, por peça (id do produto). Moram no
// localStorage para a página da peça e o checkout dividirem o mesmo valor:
// quem preencheu na peça já chega na etapa 3 com tudo pronto.
//
// Guardamos o texto digitado (e não o número) para o campo aceitar "86,5"
// enquanto a pessoa digita. O número sai de paraMedidas().

import { useCallback, useSyncExternalStore } from "react";
import { medidaValida, sugerirTamanho, type LinhaTamanho, type Medidas } from "@/data/medidas";

export type MedidasDigitadas = {
  busto: string;
  cintura: string;
  quadril: string;
  /** "Prefiro mandar por vídeo depois". */
  porVideo: boolean;
};

export const MEDIDAS_VAZIAS: MedidasDigitadas = { busto: "", cintura: "", quadril: "", porVideo: false };

type Mapa = Record<string, MedidasDigitadas>;

const CHAVE = "gio-medidas-v1";
const MAPA_VAZIO: Mapa = {};

let cache: Mapa | null = null;
const ouvintes = new Set<() => void>();

function ler(): Mapa {
  if (cache) return cache;
  try {
    const bruto = window.localStorage.getItem(CHAVE);
    const valor: unknown = bruto ? JSON.parse(bruto) : null;
    cache = valor && typeof valor === "object" ? (valor as Mapa) : MAPA_VAZIO;
  } catch {
    cache = MAPA_VAZIO;
  }
  return cache;
}

function gravar(mapa: Mapa) {
  cache = mapa;
  try {
    window.localStorage.setItem(CHAVE, JSON.stringify(mapa));
  } catch {
    /* sem storage: vale nesta aba */
  }
  ouvintes.forEach((o) => o());
}

function assinar(ouvinte: () => void) {
  ouvintes.add(ouvinte);
  const aoMudarStorage = (e: StorageEvent) => {
    if (e.key !== null && e.key !== CHAVE) return;
    cache = null;
    ouvinte();
  };
  window.addEventListener("storage", aoMudarStorage);
  return () => {
    ouvintes.delete(ouvinte);
    window.removeEventListener("storage", aoMudarStorage);
  };
}

const lerServidor = () => MAPA_VAZIO;

/** Todas as medidas salvas (para o checkout, que olha várias peças). */
export function useTodasMedidas(): Mapa {
  return useSyncExternalStore(assinar, ler, lerServidor);
}

/** As medidas de uma peça e a função que muda parte delas. */
export function useMedidas(id: string): [MedidasDigitadas, (parcial: Partial<MedidasDigitadas>) => void] {
  const mapa = useTodasMedidas();
  const atual = mapa[id] ?? MEDIDAS_VAZIAS;
  const mudar = useCallback(
    (parcial: Partial<MedidasDigitadas>) => {
      const antes = ler();
      gravar({ ...antes, [id]: { ...(antes[id] ?? MEDIDAS_VAZIAS), ...parcial } });
    },
    [id]
  );
  return [atual, mudar];
}

/** Esquece as medidas das peças de um pedido já feito. */
export function esquecerMedidas(ids: string[]) {
  const antes = ler();
  const depois = { ...antes };
  for (const id of ids) delete depois[id];
  gravar(depois);
}

function numero(texto: string): number | undefined {
  const limpo = texto.replace(",", ".").replace(/[^\d.]/g, "");
  if (!limpo) return undefined;
  const n = Number(limpo);
  return Number.isFinite(n) ? n : undefined;
}

/** Número só se estiver entre 50 e 160 cm. */
function valida(texto: string): number | undefined {
  const n = numero(texto);
  return medidaValida(n) ? n : undefined;
}

/** Converte o texto digitado em medidas em cm (o que não é número válido fica de fora). */
export function paraMedidas(d: MedidasDigitadas): Medidas {
  return { busto: valida(d.busto), cintura: valida(d.cintura), quadril: valida(d.quadril) };
}

/** Campo preenchido mas fora de 50 a 160 cm (erro de digitação, como 850). */
export function campoInvalido(texto: string): boolean {
  const n = numero(texto);
  return texto.trim() !== "" && !medidaValida(n);
}

/** Tamanho de referência pelas medidas (null sem nenhuma medida válida). */
export function tamanhoSugerido(d: MedidasDigitadas): LinhaTamanho | null {
  return sugerirTamanho(paraMedidas(d));
}

/** Busto e cintura válidos e nenhum campo fora da faixa, ou a escolha de mandar por vídeo. */
export function medidasProntas(d: MedidasDigitadas): boolean {
  if (d.porVideo) return true;
  if (campoInvalido(d.busto) || campoInvalido(d.cintura) || campoInvalido(d.quadril)) return false;
  const m = paraMedidas(d);
  return medidaValida(m.busto) && medidaValida(m.cintura);
}

/** Resumo curto: "86 · 68 · 96 cm" (só o que foi preenchido). */
export function resumoMedidas(d: MedidasDigitadas): string {
  const m = paraMedidas(d);
  const partes = [m.busto, m.cintura, m.quadril].filter((v) => medidaValida(v)).map((v) => String(v).replace(".", ","));
  return partes.length ? `${partes.join(" · ")} cm` : "";
}
