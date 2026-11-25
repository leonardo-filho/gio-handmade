// Pranchas do lookbook: a página de cada peça é uma sequência curta de telas.
//   I   A peça: as fotos da peça inteira (no manequim, quando houver).
//   II  O bordado de perto: um recorte da foto no ponto em que o bordado é
//       mais denso (FOCOS, em dados-fotos.ts).
//   III No corpo: as fotos com modelo, quando existirem.
//   IV  A ficha: preço, escolha e compra (desenhada à parte).
//
// Nada aqui muda o catálogo: as fotos vêm de produtos.ts, mais algumas fotos
// de campanha da mesma peça que já estavam em public/ e não entravam na loja.

import type { Produto } from "@/data/produtos";
import { ASPECTOS, FOCOS } from "./dados-fotos";

export type Foto = { src: string; aspecto: number };

export type Pranchas = {
  peca: Foto[];
  detalhe: { src: string; x: number; y: number } | null;
  corpo: Foto[];
};

// Fotos com modelo (o resto é peça no manequim).
const CORPO = new Set(
  `solaris-top-solaris.jpg solaris-top-solaris-3.jpg solaris-top-solaris-4.jpg solaris-top-solaris-5.jpg
  solaris-top-solaris-6.jpg solaris-top-perla.jpg solaris-top-perla-3.jpg solaris-top-perla-4.jpg
  solaris-top-aurora.jpg solaris-top-aurora-2.jpg solaris-top-aurora-5.jpg solaris-top-lumina.jpg
  solaris-top-lumina-3.jpg solaris-top-lumina-4.jpg solaris-top-noir.jpg solaris-top-noir-2.jpg
  solaris-top-noir-3.jpg solaris-top-noir-4.jpg solaris-headpiece-lumina.jpg solaris-headpiece-lumina-2.jpg
  solaris-headpiece-lumina-3.jpg solaris-headpiece-perla.jpg solaris-headpiece-perla-2.jpg conjunto-sarah.jpg
  conjunto-sarah-2.jpg conjunto-sarah-4.jpg conjunto-sarah-5.jpg top-maya-2.jpg top-maya-3.jpg
  top-lourdes-3.jpg top-lourdes-4.jpg top-hexa-frente-v4.jpg top-hexa-costas.jpg top-hexa-bandeira.jpg
  top-aguas-frente.jpg top-aguas-lateral.jpg top-aguas-costas.jpg top-floresce-frente.jpg
  top-floresce-lateral.jpg top-floresce-costas.jpg chocker-ouro-verde-01.jpg chocker-ouro-verde-02.jpg`
    .split(/\s+/)
    .filter(Boolean)
    .map((f) => `/colecao/${f}`)
);

// Fotos de campanha da mesma peça que já estavam no site e não entravam na loja.
const EXTRAS: Record<string, string[]> = {
  "top-hexa": ["/colecao/top-hexa-bandeira.jpg"],
  "top-aguas": ["/colecao/top-aguas-costas.jpg"],
  "top-floresce": ["/colecao/top-floresce-costas.jpg"],
};

const foto = (src: string): Foto => ({ src, aspecto: ASPECTOS[src] ?? 0.75 });

export function fotosDe(p: Produto): string[] {
  const todas = [p.foto, p.fotoHover, ...(p.fotosExtra ?? []), ...(EXTRAS[p.id] ?? [])];
  return [...new Set(todas.filter((f): f is string => Boolean(f)))];
}

export function pranchasDe(p: Produto): Pranchas {
  const todas = fotosDe(p);
  const noManequim = todas.filter((f) => !CORPO.has(f));
  const comModelo = todas.filter((f) => CORPO.has(f));
  // Sem foto de manequim, a primeira foto de modelo abre a história como "a peça".
  const peca = noManequim.length > 0 ? noManequim : comModelo.slice(0, 1);
  const corpo = comModelo.filter((f) => !peca.includes(f));
  const foco = FOCOS[p.id];
  return {
    peca: peca.map(foto),
    detalhe: foco ? { src: foco.foto, x: foco.x, y: foco.y } : null,
    corpo: corpo.map(foto),
  };
}

/** Foco do bordado de uma peça (para o recorte das fotos grandes da loja). */
export function focoDe(p: Produto): { x: number; y: number } | null {
  const f = FOCOS[p.id];
  return f && f.foto === p.foto ? { x: f.x, y: f.y } : null;
}

export const NUMERAIS = ["I", "II", "III", "IV", "V"];
