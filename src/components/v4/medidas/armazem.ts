"use client";

// Medidas da cliente para cada peça sob medida (busto, cintura e quadril, em
// cm, como ela digitou) e a opção de mandar por vídeo depois. Ficam no
// localStorage, por peça: a página da peça grava e o checkout lê e completa.
// Leitura com useSyncExternalStore: no servidor vale vazio, sem mismatch.

import { useCallback, useSyncExternalStore } from "react";
import { medidaValida, sugerirTamanho, type Medidas } from "@/data/medidas";

export type MedidasDigitadas = {
  busto?: string;
  cintura?: string;
  quadril?: string;
  porVideo?: boolean;
};

type Tudo = Record<string, MedidasDigitadas>;

const CHAVE = "gio-v4-medidas";
const VAZIO: Tudo = {};
let cache: Tudo | null = null;
const ouvintes = new Set<() => void>();

function ler(): Tudo {
  if (cache) return cache;
  try {
    const bruto = window.localStorage.getItem(CHAVE);
    const valor: unknown = bruto ? JSON.parse(bruto) : null;
    cache = valor && typeof valor === "object" ? (valor as Tudo) : VAZIO;
  } catch {
    cache = VAZIO;
  }
  return cache;
}

function gravar(valor: Tudo) {
  cache = valor;
  try {
    window.localStorage.setItem(CHAVE, JSON.stringify(valor));
  } catch {
    /* sem storage: vale só nesta aba */
  }
  ouvintes.forEach((o) => o());
}

function assinar(ouvinte: () => void) {
  ouvintes.add(ouvinte);
  const aoMudar = (e: StorageEvent) => {
    if (e.key !== CHAVE) return;
    cache = null;
    ouvinte();
  };
  window.addEventListener("storage", aoMudar);
  return () => {
    ouvintes.delete(ouvinte);
    window.removeEventListener("storage", aoMudar);
  };
}

const servidor = () => VAZIO;

/** Todas as medidas gravadas (por id de peça). */
export function useTodasMedidas(): Tudo {
  return useSyncExternalStore(assinar, ler, servidor);
}

/** Medidas de uma peça e a função que as altera (junta com o que já existe). */
export function useMedidas(id: string): [MedidasDigitadas, (mudanca: Partial<MedidasDigitadas>) => void] {
  const tudo = useTodasMedidas();
  const alterar = useCallback(
    (mudanca: Partial<MedidasDigitadas>) => {
      const atual = ler();
      gravar({ ...atual, [id]: { ...atual[id], ...mudanca } });
    },
    [id]
  );
  return [tudo[id] ?? {}, alterar];
}

/** "85,5" vira 85.5; vazio ou inválido vira undefined. */
export function paraNumero(texto?: string): number | undefined {
  if (!texto) return undefined;
  const n = Number(texto.replace(",", ".").trim());
  return Number.isFinite(n) && n > 0 ? n : undefined;
}

export function medidasNumericas(m: MedidasDigitadas): Medidas {
  return { busto: paraNumero(m.busto), cintura: paraNumero(m.cintura), quadril: paraNumero(m.quadril) };
}

/** Busto e cintura válidos (o mínimo que o núcleo do checkout pede). */
export function medidasProntas(m: MedidasDigitadas): boolean {
  const n = medidasNumericas(m);
  return medidaValida(n.busto) && medidaValida(n.cintura);
}

export function tamanhoSugerido(m: MedidasDigitadas) {
  return sugerirTamanho(medidasNumericas(m));
}
