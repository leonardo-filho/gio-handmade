"use client";

// Medidas da cliente no provador (versão 2). São do corpo dela, não da peça:
// digitadas uma vez, valem para qualquer peça que ela abrir depois. Ficam
// guardadas só neste aparelho (localStorage) e são lidas com
// useSyncExternalStore: no servidor e na hidratação valem vazias, e logo
// depois o React troca pelo que está salvo, sem setState em efeito.
// As contas sem estado ficam em medidasRascunho.ts.

import { useSyncExternalStore } from "react";
import { RASCUNHO_VAZIO, type Rascunho } from "./medidasRascunho";

const CHAVE = "gio-provador-v1";

let cache: Rascunho | null = null;
const ouvintes = new Set<() => void>();

function ler(): Rascunho {
  if (cache) return cache;
  try {
    const bruto = JSON.parse(window.localStorage.getItem(CHAVE) ?? "null") as Partial<Rascunho> | null;
    cache = {
      busto: typeof bruto?.busto === "string" ? bruto.busto : "",
      cintura: typeof bruto?.cintura === "string" ? bruto.cintura : "",
      quadril: typeof bruto?.quadril === "string" ? bruto.quadril : "",
      porVideo: bruto?.porVideo === true,
    };
  } catch {
    cache = RASCUNHO_VAZIO;
  }
  return cache;
}

export function salvarRascunho(novo: Rascunho) {
  cache = novo;
  try {
    window.localStorage.setItem(CHAVE, JSON.stringify(novo));
  } catch {
    /* sem storage: vale só nesta aba */
  }
  ouvintes.forEach((o) => o());
}

function assinar(ouvinte: () => void) {
  ouvintes.add(ouvinte);
  const aoMudar = (e: StorageEvent) => {
    if (e.key !== null && e.key !== CHAVE) return;
    cache = null;
    ouvinte();
  };
  window.addEventListener("storage", aoMudar);
  return () => {
    ouvintes.delete(ouvinte);
    window.removeEventListener("storage", aoMudar);
  };
}

const servidor = () => RASCUNHO_VAZIO;

/** As medidas salvas da cliente (vazias no servidor). */
export function useMedidasCliente(): Rascunho {
  return useSyncExternalStore(assinar, ler, servidor);
}

