#!/usr/bin/env node
// Gera as miçangas do Top Maya para o hero 3D da home ("Ponto a ponto").
//
// Lê a foto da peça no manequim (public/colecao/top-maya.jpg: manequim preto,
// miçangas marrons e douradas, parede cinza) e acha cerca de 2.500 miçangas:
//   1. máscara: pixel com cor de miçanga (croma e saturação altos) contra o
//      manequim escuro e a parede clara e sem cor; os alfinetes brancos do
//      manequim saem por terem pouca saturação;
//   2. textura: o tecido marrom liso do sutiã sai por ter pouca variação local
//      (a miçanga tem brilho e sombra lado a lado);
//   3. amostragem: os pontos mais brilhantes primeiro (o reflexo de cada
//      miçanga), com espaçamento mínimo para não amontoar; o espaçamento é
//      ajustado até dar o número pedido;
//   4. cor média em volta do ponto, tamanho pela distância ao vizinho mais
//      perto e tipo pela cor (pérola dourada, cristal âmbar, pérola marrom);
//   5. volume: os pontos são enrolados num tronco (elipse por linha, com o
//      bojo do sutiã à frente), para a peça ter corpo ao girar;
//   6. ordem de costura: uma linha que segue a miçanga vizinha mais perto,
//      descendo pela peça, como quem borda fileira por fileira.
//
// Saída: public/3d/top-maya.bin (binário compacto, little endian):
//   cabeçalho de 32 bytes: "GHM1", total (uint32), k, cx, cy (float32: o
//   ponto x, y da peça vem da foto por x = (u - cx) * k, y = (cy - v) * k *
//   altura/largura, com u e v de 0 a 1 na foto), largura e altura da foto
//   (uint16 cada) e 4 bytes livres;
//   cada miçanga em 12 bytes: x, y, z (int16, valor / 16384), r, g, b (uint8),
//   tamanho (uint8, raio = valor / 255 * 0.06), tipo (uint8: 0 pérola
//   dourada, 1 cristal âmbar, 2 pérola marrom) e 1 byte livre.
//   As miçangas já vêm na ordem de costura.
//
// Uso: node scripts/gerar-pontos-maya.mjs [--total 2500] [--previa arquivo.png]
// A prévia desenha os pontos com a cor e o tamanho de cada um ao lado da
// ordem de costura (do navy ao dourado), para conferir antes de usar.

import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const raiz = join(dirname(fileURLToPath(import.meta.url)), "..");
const FOTO = join(raiz, "public/colecao/top-maya.jpg");
const SAIDA = join(raiz, "public/3d/top-maya.bin");

const args = process.argv.slice(2);
const arg = (nome, padrao) => {
  const i = args.indexOf(`--${nome}`);
  return i >= 0 && args[i + 1] ? args[i + 1] : padrao;
};
const TOTAL = Number(arg("total", 2500));
const PREVIA = arg("previa", null);

// Trabalha na metade da resolução (608 x 801): sobra detalhe para achar cada
// miçanga e a conta fica rápida.
const ESCALA = 0.5;
const { data, info } = await sharp(FOTO)
  .resize(Math.round(1215 * ESCALA))
  .raw()
  .toBuffer({ resolveWithObject: true });
const W = info.width;
const H = info.height;
const N = W * H;

// ---------------------------------------------------------------- máscara
const lum = new Float32Array(N);
const mascara = new Uint8Array(N);
for (let i = 0; i < N; i++) {
  const r = data[i * 3];
  const g = data[i * 3 + 1];
  const b = data[i * 3 + 2];
  const mx = Math.max(r, g, b);
  const mn = Math.min(r, g, b);
  const c = mx - mn;
  const v = mx / 255;
  const s = mx ? c / mx : 0;
  lum[i] = 0.299 * r + 0.587 * g + 0.114 * b;
  let conta = c >= 18 && s >= 0.32 && r >= g && g >= b - 4;
  if (v > 0.62 && s < 0.3) conta = false;
  mascara[i] = conta ? 1 : 0;
}

// Textura: desvio padrão da luminância numa janela 7 x 7 (por imagem
// integral). Tecido liso fica abaixo do limite.
const integral = new Float64Array((W + 1) * (H + 1));
const integral2 = new Float64Array((W + 1) * (H + 1));
for (let y = 0; y < H; y++) {
  let soma = 0;
  let soma2 = 0;
  for (let x = 0; x < W; x++) {
    const l = lum[y * W + x];
    soma += l;
    soma2 += l * l;
    integral[(y + 1) * (W + 1) + x + 1] = integral[y * (W + 1) + x + 1] + soma;
    integral2[(y + 1) * (W + 1) + x + 1] = integral2[y * (W + 1) + x + 1] + soma2;
  }
}
function desvio(x, y, raio) {
  const x0 = Math.max(0, x - raio);
  const y0 = Math.max(0, y - raio);
  const x1 = Math.min(W, x + raio + 1);
  const y1 = Math.min(H, y + raio + 1);
  const n = (x1 - x0) * (y1 - y0);
  const k = (a, xx, yy) => a[yy * (W + 1) + xx];
  const s = k(integral, x1, y1) - k(integral, x0, y1) - k(integral, x1, y0) + k(integral, x0, y0);
  const s2 = k(integral2, x1, y1) - k(integral2, x0, y1) - k(integral2, x1, y0) + k(integral2, x0, y0);
  const media = s / n;
  return Math.sqrt(Math.max(0, s2 / n - media * media));
}
for (let y = 0; y < H; y++) {
  for (let x = 0; x < W; x++) {
    const i = y * W + x;
    if (mascara[i] && desvio(x, y, 3) < 11) mascara[i] = 0;
  }
}

// Manchas pequenas e soltas (restos de alfinete, reflexo no manequim) saem:
// componente conexo com menos de 40 pixels.
{
  const rotulo = new Int32Array(N).fill(-1);
  const pilha = new Int32Array(N);
  for (let i = 0; i < N; i++) {
    if (!mascara[i] || rotulo[i] >= 0) continue;
    let topo = 0;
    pilha[topo++] = i;
    rotulo[i] = i;
    const membros = [];
    while (topo) {
      const j = pilha[--topo];
      membros.push(j);
      const x = j % W;
      const y = (j / W) | 0;
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          const xx = x + dx;
          const yy = y + dy;
          if (xx < 0 || yy < 0 || xx >= W || yy >= H) continue;
          const k = yy * W + xx;
          if (mascara[k] && rotulo[k] < 0) {
            rotulo[k] = i;
            pilha[topo++] = k;
          }
        }
      }
    }
    if (membros.length < 40) for (const j of membros) mascara[j] = 0;
  }
}

// --------------------------------------------------------------- amostragem
// Brilho suavizado (o reflexo da miçanga vira um pico) e um pouco de ruído
// fixo para desempatar.
let semente = 7;
const aleatorio = () => {
  semente = (semente * 16807) % 2147483647;
  return semente / 2147483647;
};
const candidatos = [];
for (let y = 1; y < H - 1; y++) {
  for (let x = 1; x < W - 1; x++) {
    const i = y * W + x;
    if (!mascara[i]) continue;
    let soma = 0;
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) soma += lum[i + dy * W + dx];
    candidatos.push({ x, y, peso: soma / 9 + aleatorio() * 6 });
  }
}
candidatos.sort((a, b) => b.peso - a.peso);

function amostrar(raio) {
  const celula = raio;
  const gw = Math.ceil(W / celula);
  const gh = Math.ceil(H / celula);
  const grade = new Map();
  const aceitos = [];
  const r2 = raio * raio;
  for (const c of candidatos) {
    const gx = Math.floor(c.x / celula);
    const gy = Math.floor(c.y / celula);
    let livre = true;
    for (let yy = gy - 1; yy <= gy + 1 && livre; yy++) {
      for (let xx = gx - 1; xx <= gx + 1 && livre; xx++) {
        if (xx < 0 || yy < 0 || xx >= gw || yy >= gh) continue;
        const lista = grade.get(yy * gw + xx);
        if (!lista) continue;
        for (const o of lista) {
          const dx = o.x - c.x;
          const dy = o.y - c.y;
          if (dx * dx + dy * dy < r2) {
            livre = false;
            break;
          }
        }
      }
    }
    if (!livre) continue;
    aceitos.push(c);
    const chave = gy * gw + gx;
    const lista = grade.get(chave);
    if (lista) lista.push(c);
    else grade.set(chave, [c]);
  }
  return aceitos;
}

let baixo = 2;
let alto = 20;
let pontos = [];
for (let passo = 0; passo < 30; passo++) {
  const meio = (baixo + alto) / 2;
  pontos = amostrar(meio);
  if (pontos.length > TOTAL) baixo = meio;
  else alto = meio;
}
pontos = amostrar(baixo);
// Sobrando poucos, os de menor peso (fora do reflexo) saem.
pontos = pontos.slice(0, TOTAL);
const RAIO = baixo;

// ------------------------------------------------------- cor, tamanho, tipo
function corMedia(cx, cy, raio) {
  let r = 0;
  let g = 0;
  let b = 0;
  let n = 0;
  for (let dy = -raio; dy <= raio; dy++) {
    for (let dx = -raio; dx <= raio; dx++) {
      if (dx * dx + dy * dy > raio * raio) continue;
      const x = cx + dx;
      const y = cy + dy;
      if (x < 0 || y < 0 || x >= W || y >= H) continue;
      const i = y * W + x;
      if (!mascara[i]) continue;
      r += data[i * 3];
      g += data[i * 3 + 1];
      b += data[i * 3 + 2];
      n++;
    }
  }
  if (!n) {
    const i = cy * W + cx;
    return [data[i * 3], data[i * 3 + 1], data[i * 3 + 2]];
  }
  return [r / n, g / n, b / n];
}

function hsv(r, g, b) {
  const mx = Math.max(r, g, b);
  const mn = Math.min(r, g, b);
  const c = mx - mn;
  let h = 0;
  if (c) {
    if (mx === r) h = ((g - b) / c) % 6;
    else if (mx === g) h = (b - r) / c + 2;
    else h = (r - g) / c + 4;
    h *= 60;
    if (h < 0) h += 360;
  }
  return [h, mx ? c / mx : 0, mx / 255];
}

// Vizinho mais perto (para o tamanho), pela mesma grade.
function vizinhoMaisPerto(lista) {
  const celula = RAIO * 2;
  const gw = Math.ceil(W / celula);
  const grade = new Map();
  lista.forEach((p, i) => {
    const chave = Math.floor(p.y / celula) * gw + Math.floor(p.x / celula);
    const l = grade.get(chave);
    if (l) l.push(i);
    else grade.set(chave, [i]);
  });
  return lista.map((p) => {
    const gx = Math.floor(p.x / celula);
    const gy = Math.floor(p.y / celula);
    let melhor = Infinity;
    for (let yy = gy - 2; yy <= gy + 2; yy++) {
      for (let xx = gx - 2; xx <= gx + 2; xx++) {
        const l = grade.get(yy * gw + xx);
        if (!l) continue;
        for (const j of l) {
          const o = lista[j];
          if (o === p) continue;
          const d = Math.hypot(o.x - p.x, o.y - p.y);
          if (d < melhor) melhor = d;
        }
      }
    }
    return Number.isFinite(melhor) ? melhor : RAIO * 2;
  });
}

const distancias = vizinhoMaisPerto(pontos);
for (let i = 0; i < pontos.length; i++) {
  const p = pontos[i];
  const [r, g, b] = corMedia(p.x, p.y, Math.max(1, Math.round(RAIO * 0.45)));
  p.cor = [r, g, b];
  const [h, s, v] = hsv(r, g, b);
  // Pérola dourada: amarelada e menos saturada; cristal âmbar: laranja e
  // saturado; pérola marrom: escura.
  if (h >= 34 && s < 0.62 && v > 0.3) p.tipo = 0;
  else if (v < 0.26) p.tipo = 2;
  else p.tipo = 1;
  // Raio em pixels: metade da distância ao vizinho, dentro de uma faixa.
  p.raio = Math.min(RAIO * 1.15, Math.max(RAIO * 0.42, distancias[i] * 0.5));
}

// ------------------------------------------------------------------ volume
// Silhueta do manequim e da peça por linha: tudo que não é parede.
const parede = new Uint8Array(N);
for (let i = 0; i < N; i++) {
  const r = data[i * 3];
  const g = data[i * 3 + 1];
  const b = data[i * 3 + 2];
  const mx = Math.max(r, g, b);
  const s = mx ? (mx - Math.min(r, g, b)) / mx : 0;
  parede[i] = mx > 120 && s < 0.25 ? 1 : 0;
}
const esquerda = new Float32Array(H);
const direita = new Float32Array(H);
for (let y = 0; y < H; y++) {
  let a = -1;
  let z = -1;
  for (let x = 0; x < W; x++) {
    if (!parede[y * W + x]) {
      if (a < 0) a = x;
      z = x;
    }
  }
  esquerda[y] = a < 0 ? W / 2 : a;
  direita[y] = z < 0 ? W / 2 : z;
}
// Suaviza as bordas (o pescoço e os ombros do manequim têm degraus).
function suavizar(arr, raio) {
  const saida = new Float32Array(arr.length);
  for (let i = 0; i < arr.length; i++) {
    let s = 0;
    let n = 0;
    for (let k = -raio; k <= raio; k++) {
      const j = Math.min(arr.length - 1, Math.max(0, i + k));
      s += arr[j];
      n++;
    }
    saida[i] = s / n;
  }
  return saida;
}
const esq = suavizar(esquerda, 14);
const dir = suavizar(direita, 14);

// Limites da peça (pelas miçangas) para normalizar.
let minX = Infinity;
let maxX = -Infinity;
let minY = Infinity;
let maxY = -Infinity;
for (const p of pontos) {
  minX = Math.min(minX, p.x);
  maxX = Math.max(maxX, p.x);
  minY = Math.min(minY, p.y);
  maxY = Math.max(maxY, p.y);
}
const centroX = (minX + maxX) / 2;
const centroY = (minY + maxY) / 2;
// Altura da peça vira 2 unidades (de -1 a 1).
const porPixel = 2 / (maxY - minY);

// Bojo: o centro de cada lado do sutiã (na foto, em meia resolução) e o
// quanto ele avança para a frente.
const BOJOS = [
  { x: 258, y: 362, raio: 95, altura: 0.24 },
  { x: 458, y: 335, raio: 72, altura: 0.2 },
];
// Onde termina o sutiã e começam as correntes (na foto, em meia resolução).
const FIM_DO_SUTIA = 455;

for (const p of pontos) {
  const y = Math.round(p.y);
  const c = (esq[y] + dir[y]) / 2;
  const meia = Math.max(20, (dir[y] - esq[y]) / 2);
  const u = Math.max(-1, Math.min(1, (p.x - c) / meia));
  // Tronco elíptico: profundidade de 0,62 da meia largura.
  let z = 0.62 * meia * Math.sqrt(1 - u * u);
  for (const b of BOJOS) {
    const d2 = ((p.x - b.x) ** 2 + (p.y - b.y) ** 2) / (b.raio * b.raio);
    z += b.altura * meia * Math.exp(-d2);
  }
  // As correntes caem um pouco à frente do corpo.
  if (p.y > FIM_DO_SUTIA) z += 4;
  p.px = (p.x - centroX) * porPixel;
  p.py = (centroY - p.y) * porPixel;
  p.pz = z * porPixel;
}
// Centraliza a profundidade (o giro fica em volta do meio do tronco).
{
  let minZ = Infinity;
  let maxZ = -Infinity;
  for (const p of pontos) {
    minZ = Math.min(minZ, p.pz);
    maxZ = Math.max(maxZ, p.pz);
  }
  const meioZ = minZ * 0.35 + maxZ * 0.65 - 0.25;
  for (const p of pontos) p.pz -= meioZ;
}

// --------------------------------------------------------- ordem de costura
// Varredura de cima para baixo: só entra na disputa quem está numa faixa logo
// abaixo da miçanga mais alta que falta; dentro da faixa, a mais perto da
// última. A linha segue as fileiras e a peça vai sendo bordada de cima para
// baixo, como na mão.
{
  const FAIXA = RAIO * 7;
  const restantes = pontos.map((_, i) => i).sort((a, b) => pontos[a].y - pontos[b].y);
  const feito = new Uint8Array(pontos.length);
  let inicioFila = 0;
  let atual = restantes[0];
  const ordem = [];
  for (let n = 0; n < pontos.length; n++) {
    feito[atual] = 1;
    ordem.push(atual);
    while (inicioFila < restantes.length && feito[restantes[inicioFila]]) inicioFila++;
    if (inicioFila >= restantes.length) break;
    const topo = pontos[restantes[inicioFila]].y;
    const a = pontos[atual];
    let melhor = -1;
    let custo = Infinity;
    for (let k = inicioFila; k < restantes.length; k++) {
      const j = restantes[k];
      const o = pontos[j];
      if (o.y > topo + FAIXA) break;
      if (feito[j]) continue;
      const c = Math.hypot(o.x - a.x, (o.y - a.y) * 1.6);
      if (c < custo) {
        custo = c;
        melhor = j;
      }
    }
    atual = melhor;
  }
  pontos = ordem.map((i) => pontos[i]);
}

// ------------------------------------------------------------------- saída
const buf = Buffer.alloc(32 + pontos.length * 12);
buf.write("GHM1", 0, "ascii");
buf.writeUInt32LE(pontos.length, 4);
// x = (u - cx) * k e y = (cy - v) * k * (H / W), com u e v de 0 a 1 na foto.
buf.writeFloatLE(porPixel * W, 8);
buf.writeFloatLE(centroX / W, 12);
buf.writeFloatLE(centroY / H, 16);
buf.writeUInt16LE(1215, 20);
buf.writeUInt16LE(1600, 22);
const clamp16 = (v) => Math.max(-32767, Math.min(32767, Math.round(v * 16384)));
pontos.forEach((p, i) => {
  const o = 32 + i * 12;
  buf.writeInt16LE(clamp16(p.px), o);
  buf.writeInt16LE(clamp16(p.py), o + 2);
  buf.writeInt16LE(clamp16(p.pz), o + 4);
  buf.writeUInt8(Math.round(p.cor[0]), o + 6);
  buf.writeUInt8(Math.round(p.cor[1]), o + 7);
  buf.writeUInt8(Math.round(p.cor[2]), o + 8);
  buf.writeUInt8(Math.min(255, Math.round(((p.raio * porPixel) / 0.06) * 255)), o + 9);
  buf.writeUInt8(p.tipo, o + 10);
});
mkdirSync(dirname(SAIDA), { recursive: true });
writeFileSync(SAIDA, buf);

const tipos = [0, 0, 0];
for (const p of pontos) tipos[p.tipo]++;
console.log(
  `${pontos.length} miçangas, espaçamento ${RAIO.toFixed(2)} px, ${buf.length} bytes em ${SAIDA}\n` +
    `pérola dourada ${tipos[0]}, cristal âmbar ${tipos[1]}, pérola marrom ${tipos[2]}`
);

// ------------------------------------------------------------------ prévia
if (PREVIA) {
  const L = 2;
  const PW = W * L;
  const PH = H;
  const img = Buffer.alloc(PW * PH * 3);
  for (let i = 0; i < PW * PH; i++) {
    img[i * 3] = 237;
    img[i * 3 + 1] = 231;
    img[i * 3 + 2] = 217;
  }
  const disco = (cx, cy, r, cor) => {
    for (let y = Math.floor(cy - r); y <= Math.ceil(cy + r); y++) {
      for (let x = Math.floor(cx - r); x <= Math.ceil(cx + r); x++) {
        if (x < 0 || y < 0 || x >= PW || y >= PH) continue;
        if ((x - cx) ** 2 + (y - cy) ** 2 > r * r) continue;
        const i = y * PW + x;
        img[i * 3] = cor[0];
        img[i * 3 + 1] = cor[1];
        img[i * 3 + 2] = cor[2];
      }
    }
  };
  pontos.forEach((p, i) => {
    disco(p.x, p.y, p.raio, p.cor);
    const t = i / (pontos.length - 1);
    const cor = [27 + (184 - 27) * t, 73 + (144 - 73) * t, 101 + (42 - 101) * t];
    disco(W + p.x, p.y, p.raio * 0.8, cor);
  });
  await sharp(img, { raw: { width: PW, height: PH, channels: 3 } }).png().toFile(PREVIA);
  console.log(`prévia em ${PREVIA}`);
}
