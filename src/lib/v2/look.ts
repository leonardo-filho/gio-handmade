// Monte o look (versão 2, Provador): sugere as peças do catálogo que combinam
// com a peça aberta. Não depende de cadastro novo: lê só a categoria, o nome e
// os detalhes de produtos.ts.
//
// Como escolhe:
//   1. Os lugares do look dependem da peça: um top pede saia e headpiece; uma
//      saia pede top e headpiece; conjunto e vestido pedem só o headpiece.
//      O choker entra como terceira peça quando combina de verdade.
//   2. Em cada lugar, ganha a peça com mais pontos:
//      - mesma família de nome (Top Giô com Saia Giô, Conjunto Moonlight com
//        Headpiece Moonlight): é o par que a Gio desenhou junto;
//      - mesma cor citada nos detalhes (verde, azul, dourado...);
//      - mesmo material (pérolas, conchas, cristais...), com peso menor para
//        o que aparece em quase tudo (miçangas, correntes).
//   3. Empate fica com a ordem do catálogo, então a sugestão é sempre a mesma.

import { produtos, secaoVitrine, type Produto } from "@/data/produtos";
import { parcelamentoCartao } from "@/lib/parcelas";

type Lugar = "saia" | "top" | "cabeca" | "pescoco";

const semAcento = (t: string) =>
  t
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();

// Primeira palavra do nome é o tipo da peça; o resto é a família.
const TIPOS = new Set(["top", "saia", "headpiece", "conjunto", "vestido", "regata", "acessorio", "chocker", "choker"]);

function familia(p: Produto): string {
  const palavras = semAcento(p.nome).split(/\s+/);
  return TIPOS.has(palavras[0]) ? palavras.slice(1).join(" ") : "";
}

// Peso de cada material: o que é raro no catálogo diz mais sobre a peça.
const MATERIAIS: [RegExp, number][] = [
  [/perola/, 3],
  [/concha/, 4],
  [/espelhad/, 4],
  [/paete/, 3],
  [/madeira/, 4],
  [/pedras? naturais/, 3],
  [/argola/, 3],
  [/cristal|cristais/, 2],
  [/pedraria/, 2],
  [/acrilico/, 2],
  [/\belos?\b/, 2],
  [/micanga/, 1],
  [/corrente/, 1],
];

const CORES: RegExp[] = [/verde|esmeralda/, /azul|turquesa|royal/, /dourad|ouro/, /amarel/, /pret|noir/, /branc/, /rosa/];

function marcas(p: Produto) {
  const texto = semAcento(`${p.nome} ${p.detalhes}`);
  return {
    materiais: MATERIAIS.filter(([re]) => re.test(texto)),
    cores: CORES.filter((re) => re.test(texto)),
    texto,
  };
}

function pontos(a: Produto, b: Produto): number {
  let total = 0;
  const fa = familia(a);
  if (fa && fa === familia(b)) total += 10;
  const ma = marcas(a);
  const mb = marcas(b);
  for (const [re, peso] of ma.materiais) if (re.test(mb.texto)) total += peso;
  for (const re of ma.cores) if (re.test(mb.texto)) total += 3;
  return total;
}

const ehHeadpiece = (p: Produto) => semAcento(p.nome).startsWith("headpiece");
const ehChoker = (p: Produto) => /^chocker|^choker/.test(semAcento(p.nome));

const CANDIDATOS: Record<Lugar, (p: Produto) => boolean> = {
  saia: (p) => secaoVitrine(p) === "Saias",
  top: (p) => secaoVitrine(p) === "Tops",
  cabeca: ehHeadpiece,
  pescoco: ehChoker,
};

/** Os lugares do look para cada tipo de peça (vazio: a peça não monta look). */
function lugaresDe(p: Produto): Lugar[] {
  const secao = secaoVitrine(p);
  if (secao === "Tops") return ["saia", "cabeca", "pescoco"];
  if (secao === "Saias") return ["top", "cabeca", "pescoco"];
  if (secao === "Conjuntos" || secao === "Vestidos") return ["cabeca", "pescoco"];
  return [];
}

// O choker só entra quando combina de verdade (cor ou família em comum) e
// quando a peça já não tem um integrado.
const PISO_PESCOCO = 5;

// Espalha os empates: entre as peças com a mesma pontuação, a escolha sai de
// uma conta fixa sobre o id da peça aberta (sempre igual para a mesma peça,
// mas diferente de uma peça para outra).
function sorteioFixo(texto: string): number {
  let h = 0;
  for (let i = 0; i < texto.length; i++) h = (h * 31 + texto.charCodeAt(i)) >>> 0;
  return h;
}

function melhor(peca: Produto, lugar: Lugar, usados: Set<string>): { produto: Produto; pontos: number } | null {
  let maior = -1;
  let empatados: Produto[] = [];
  for (const c of produtos) {
    if (c.id === peca.id || usados.has(c.id) || !CANDIDATOS[lugar](c)) continue;
    const p = pontos(peca, c);
    if (p > maior) {
      maior = p;
      empatados = [c];
    } else if (p === maior) {
      empatados.push(c);
    }
  }
  if (empatados.length === 0) return null;
  const produto = empatados[sorteioFixo(`${peca.id}:${lugar}`) % empatados.length];
  return { produto, pontos: maior };
}

// Looks escolhidos à mão, que valem antes da regra. Hoje só o da peça em
// destaque da home (o Top Maya é marrom e dourado, o que os detalhes não
// dizem). A Gio pode acrescentar ou trocar.
const LOOKS_FIXOS: Record<string, string[]> = {
  "top-maya": ["saia-gio", "headpiece-luna"],
};

/** Até 3 peças que combinam com a peça aberta, na ordem do look. */
export function sugerirLook(peca: Produto): Produto[] {
  const fixo = LOOKS_FIXOS[peca.id];
  if (fixo) return fixo.flatMap((id) => produtos.filter((p) => p.id === id));
  const usados = new Set<string>();
  const look: Produto[] = [];
  for (const lugar of lugaresDe(peca)) {
    if (lugar === "pescoco" && /chocker|choker/.test(semAcento(peca.detalhes))) continue;
    const achado = melhor(peca, lugar, usados);
    if (!achado) continue;
    if (lugar === "pescoco" && achado.pontos < PISO_PESCOCO) continue;
    usados.add(achado.produto.id);
    look.push(achado.produto);
  }
  return look;
}

/** Peças de vestir levam as medidas do corpo; headpiece e choker, não. */
export function ehDeVestir(p: Pick<Produto, "categoria" | "nome">): boolean {
  if (p.categoria === "Acessórios") return false;
  const nome = semAcento(p.nome);
  return !(nome.startsWith("headpiece") || nome.startsWith("chocker") || nome.startsWith("choker"));
}

/** Soma do look: no cartão (o que a loja mostra primeiro) e no pix. */
export function somaDoLook(pecas: Produto[]): { cartao: number; pix: number } {
  let cartao = 0;
  let pix = 0;
  for (const p of pecas) {
    cartao += parcelamentoCartao(p).total;
    pix += p.preco;
  }
  return { cartao: Math.round(cartao * 100) / 100, pix: Math.round(pix * 100) / 100 };
}
