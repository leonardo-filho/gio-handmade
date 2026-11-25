// Leitura das miçangas do Top Maya (public/3d/top-maya.bin, gerado por
// scripts/gerar-pontos-maya.mjs). O formato está descrito no script: um
// cabeçalho de 32 bytes e 12 bytes por miçanga, já na ordem de costura.

export const TIPOS = 3; // 0 pérola dourada, 1 cristal âmbar, 2 pérola marrom

export type Micangas = {
  n: number;
  /** Posição na peça (x, y, z), altura da peça de -1 a 1. */
  alvo: Float32Array;
  /** Raio de cada miçanga, na mesma unidade. */
  raio: Float32Array;
  tipo: Uint8Array;
  /** Cor em sRGB (0 a 1), já acertada para a luz do estúdio. */
  cor: Float32Array;
  /** Da foto para a peça: x = (u - cx) * k, y = (cy - v) * k * altura / largura. */
  k: number;
  cx: number;
  cy: number;
  fotoW: number;
  fotoH: number;
};

// A mesma promessa para sempre, inclusive se falhar: o use() do React precisa
// receber a mesma promessa a cada tentativa de render. Se ela falhar, o erro
// chega à guarda do hero, que fica com a versão estática.
let promessa: Promise<Micangas> | null = null;

export function carregarMicangas(): Promise<Micangas> {
  promessa ??= fetch("/3d/top-maya.bin")
    .then((r) => {
      if (!r.ok) throw new Error(`miçangas: ${r.status}`);
      return r.arrayBuffer();
    })
    .then(ler);
  return promessa;
}

function ler(buf: ArrayBuffer): Micangas {
  const v = new DataView(buf);
  const assinatura = String.fromCharCode(v.getUint8(0), v.getUint8(1), v.getUint8(2), v.getUint8(3));
  if (assinatura !== "GHM1") throw new Error("miçangas: formato desconhecido");
  const n = v.getUint32(4, true);
  const alvo = new Float32Array(n * 3);
  const raio = new Float32Array(n);
  const tipo = new Uint8Array(n);
  const cor = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    const o = 32 + i * 12;
    alvo[i * 3] = v.getInt16(o, true) / 16384;
    alvo[i * 3 + 1] = v.getInt16(o + 2, true) / 16384;
    alvo[i * 3 + 2] = v.getInt16(o + 4, true) / 16384;
    const t = Math.min(2, v.getUint8(o + 10));
    tipo[i] = t;
    raio[i] = (v.getUint8(o + 9) / 255) * 0.06;
    acertarCor(v.getUint8(o + 6), v.getUint8(o + 7), v.getUint8(o + 8), t, cor, i * 3);
  }
  return {
    n,
    alvo,
    raio,
    tipo,
    cor,
    k: v.getFloat32(8, true),
    cx: v.getFloat32(12, true),
    cy: v.getFloat32(16, true),
    fotoW: v.getUint16(20, true),
    fotoH: v.getUint16(22, true),
  };
}

// A cor da foto vem escura (luz de quarto sobre o manequim preto). Aqui ela
// vira a cor da miçanga sob luz de estúdio: o matiz é o da foto, o brilho e a
// saturação ficam na faixa de cada tipo.
const FAIXAS: Record<number, { h: [number, number]; s: [number, number]; v: [number, number] }> = {
  // pérola dourada
  0: { h: [36, 48], s: [0.28, 0.48], v: [0.62, 0.86] },
  // cristal âmbar (topázio, sem puxar para o vermelho)
  1: { h: [24, 38], s: [0.7, 0.88], v: [0.42, 0.68] },
  // pérola marrom
  2: { h: [18, 32], s: [0.55, 0.8], v: [0.17, 0.3] },
};

function acertarCor(r8: number, g8: number, b8: number, tipo: number, saida: Float32Array, o: number) {
  const r = r8 / 255;
  const g = g8 / 255;
  const b = b8 / 255;
  const mx = Math.max(r, g, b);
  const mn = Math.min(r, g, b);
  const c = mx - mn;
  let h = 0;
  if (c > 0) {
    if (mx === r) h = ((g - b) / c) % 6;
    else if (mx === g) h = (b - r) / c + 2;
    else h = (r - g) / c + 4;
    h *= 60;
    if (h < 0) h += 360;
  }
  const s = mx > 0 ? c / mx : 0;
  const f = FAIXAS[tipo];
  // O brilho da foto (0 a ~0,6 nas miçangas) é espalhado pela faixa do tipo.
  const vv = f.v[0] + (f.v[1] - f.v[0]) * Math.min(1, mx / 0.6);
  const ss = Math.min(f.s[1], Math.max(f.s[0], s * 0.9));
  // Matiz preso na faixa do tipo (a foto tem um pouco de verde nas pérolas
  // e de vermelho nos cristais por causa da luz).
  const hh = Math.min(f.h[1], Math.max(f.h[0], h));
  const [rr, gg, bb] = hsvParaRgb(hh, ss, vv);
  saida[o] = rr;
  saida[o + 1] = gg;
  saida[o + 2] = bb;
}

function hsvParaRgb(h: number, s: number, v: number): [number, number, number] {
  const c = v * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = v - c;
  let r = 0;
  let g = 0;
  let b = 0;
  if (h < 60) [r, g, b] = [c, x, 0];
  else if (h < 120) [r, g, b] = [x, c, 0];
  else if (h < 180) [r, g, b] = [0, c, x];
  else if (h < 240) [r, g, b] = [0, x, c];
  else if (h < 300) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];
  return [r + m, g + m, b + m];
}
