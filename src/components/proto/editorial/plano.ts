// Diagramação da loja editorial: transforma a lista de peças de uma seção numa
// sequência de blocos de grade (peça normal, peça em destaque, dupla e textos
// que quebram a grade), com um ritmo que não se repete.
//
// A grade tem 2 colunas no celular e 4 a partir de 1024 px, com fluxo denso.
// Cada "módulo" fecha as linhas nos dois tamanhos, então nenhum buraco aparece
// e a ordem das peças se mantém:
//   destaque (2x2 no desktop, largura total no celular) + 4 peças
//   fileira de 4 peças (uma sim, outra não, escalonada: a 2ª e a 4ª descem)
//   texto largo (2 colunas) + 2 peças
//   sobras: 1 peça + texto, 2 peças + texto largo, 3 peças + texto curto

import { secaoId, type Produto } from "@/data/produtos";
import { formatBRLPreco } from "@/lib/format";
import { parcelamentoCartao } from "@/lib/parcelas";

export type Interludio =
  | { tipo: "citacao"; texto: string; assinatura?: string }
  | { tipo: "nota"; rotulo: string; texto: string; whatsapp?: boolean }
  | { tipo: "curto"; texto: string; apoio?: string };

export type FormaTexto = "largo" | "celula" | "resto";
export type Lado = "esq" | "dir";

export type Bloco =
  | { tipo: "peca"; chave: string; produto: Produto; desloca?: boolean }
  | { tipo: "destaque"; chave: string; produto: Produto; lado: Lado; fotoInicial: number }
  | { tipo: "dupla"; chave: string; produto: Produto; fotoInicial: number; ordem: 0 | 1 }
  | { tipo: "texto"; chave: string; forma: FormaTexto; lado: Lado; interludio: Interludio };

// Peças com foto de modelo e qual foto usar no destaque (índice na lista
// foto, fotoHover, fotosExtra). As outras têm só manequim.
const FOTO_MODELO: Record<string, number> = {
  "solaris-top-solaris": 0,
  "solaris-top-perla": 0,
  "solaris-top-aurora": 0,
  "solaris-top-lumina": 0,
  "solaris-top-noir": 0,
  "solaris-headpiece-lumina": 0,
  "solaris-headpiece-perla": 0,
  "conjunto-sarah": 3,
  "top-maya": 1,
  "top-lourdes": 2,
  "top-hexa": 0,
  "top-aguas": 0,
  "top-floresce": 0,
  "chocker-ouro-verde": 0,
};

// Quem abre cada seção (e os destaques seguintes, nas seções longas).
const ORDEM_DESTAQUE: Record<string, string[]> = {
  [secaoId["Coleção Solaris"]]: ["solaris-top-solaris", "solaris-headpiece-lumina"],
  [secaoId.Conjuntos]: ["conjunto-sarah"],
  [secaoId.Vestidos]: ["vestido-luna"],
  [secaoId.Tops]: ["top-maya", "top-hexa", "solaris-top-aurora", "top-lourdes"],
  [secaoId.Saias]: ["saia-brisa"],
  [secaoId.Acessórios]: ["chocker-ouro-verde", "solaris-headpiece-lumina"],
  "pronta-entrega": ["solaris-top-perla", "top-aguas"],
};

// Frases que quebram a grade. Todas já estão no site (home, sobre, processo e
// modal da peça); nenhuma promessa nova.
const LONGOS: Interludio[] = [
  { tipo: "citacao", texto: "Cada detalhe importa. Feito para quem entende detalhes." },
  {
    tipo: "nota",
    rotulo: "Deixe do seu jeito",
    texto: "Dá para personalizar a peça do seu jeito, inclusive as cores. Chame no WhatsApp que a gente monta com você.",
    whatsapp: true,
  },
  {
    tipo: "citacao",
    texto: "Este não é um processo industrial. É um trabalho de paciência, arte e dedicação.",
    assinatura: "Giovanna Alves, quem faz cada peça",
  },
  {
    tipo: "nota",
    rotulo: "Sob medida",
    texto: "Depois do pedido, a Gio te manda um vídeo para você tirar as medidas.",
  },
  { tipo: "citacao", texto: "Uma mulher, múltiplas criações." },
  { tipo: "citacao", texto: "Bordado à mão, um a um, em Belém." },
];

const CURTOS: Interludio[] = [
  { tipo: "curto", texto: "Cada peça é única.", apoio: "Pequenas variações fazem parte da sua autenticidade." },
  { tipo: "curto", texto: "100% artesanal.", apoio: "Slow fashion, feito em Belém." },
  { tipo: "curto", texto: "Atemporal por natureza." },
];

/** Fila de textos de uma página: cada frase aparece uma vez antes de repetir. */
export function criarFila() {
  let longo = 0;
  let curto = 0;
  let n = 0;
  return {
    proximo(forma: FormaTexto): { chave: string; interludio: Interludio } {
      n += 1;
      if (forma === "largo") {
        const interludio = LONGOS[longo % LONGOS.length];
        longo += 1;
        return { chave: `texto-${n}`, interludio };
      }
      const interludio = CURTOS[curto % CURTOS.length];
      curto += 1;
      return { chave: `texto-${n}`, interludio };
    },
  };
}

export type Fila = ReturnType<typeof criarFila>;

type Etapa = "fileira" | "texto-esq" | "texto-dir" | "destaque-dir" | "destaque-esq";

// Ritmo das seções longas (Tops): nunca dois módulos iguais em seguida.
const RITMO: Etapa[] = ["fileira", "texto-esq", "fileira", "destaque-dir", "fileira", "texto-dir", "fileira", "destaque-esq"];

export function planejar(slug: string, itens: Produto[], fila: Fila): Bloco[] {
  const restantes = [...itens];
  const blocos: Bloco[] = [];
  const preferidos = [...(ORDEM_DESTAQUE[slug] ?? [])];

  const tirar = (id: string) => {
    const i = restantes.findIndex((p) => p.id === id);
    return i >= 0 ? restantes.splice(i, 1)[0] : null;
  };

  const proximoDestaque = (): Produto => {
    while (preferidos.length) {
      const p = tirar(preferidos.shift()!);
      if (p) return p;
    }
    const comModelo = restantes.find((p) => p.id in FOTO_MODELO);
    return tirar((comModelo ?? restantes[0]).id)!;
  };

  const pecas = (n: number, escalonada = false) => {
    restantes.splice(0, n).forEach((produto, i) => {
      blocos.push({ tipo: "peca", chave: produto.id, produto, desloca: escalonada && i % 2 === 1 });
    });
  };

  const texto = (forma: FormaTexto, lado: Lado = "esq") => {
    const { chave, interludio } = fila.proximo(forma);
    blocos.push({ tipo: "texto", chave, forma, lado, interludio });
  };

  const destaque = (lado: Lado) => {
    const produto = proximoDestaque();
    blocos.push({ tipo: "destaque", chave: produto.id, produto, lado, fotoInicial: FOTO_MODELO[produto.id] ?? 0 });
  };

  // Fecha a seção com o que sobrou (menos de uma fileira).
  const sobras = () => {
    const r = restantes.length;
    if (r === 1) {
      pecas(1);
      texto("resto");
    } else if (r === 2) {
      texto("largo", "dir");
      pecas(2);
    } else if (r === 3) {
      pecas(3);
      texto("celula");
    }
  };

  if (itens.length === 0) return blocos;

  // Uma ou duas peças: página dupla, as duas grandes.
  if (itens.length <= 2) {
    const primeira = proximoDestaque();
    blocos.push({ tipo: "dupla", chave: primeira.id, produto: primeira, fotoInicial: FOTO_MODELO[primeira.id] ?? 0, ordem: 0 });
    const segunda = restantes.shift();
    if (segunda)
      blocos.push({ tipo: "dupla", chave: segunda.id, produto: segunda, fotoInicial: FOTO_MODELO[segunda.id] ?? 0, ordem: 1 });
    else texto("largo");
    return blocos;
  }

  // Abertura: destaque à esquerda e até 4 peças ao lado.
  destaque("esq");
  const k = Math.min(4, restantes.length);
  pecas(k);
  if (k === 3) texto("celula");
  if (k === 2) texto("largo");

  let passo = 0;
  let fileiras = 0;
  while (restantes.length > 0) {
    const r = restantes.length;
    const etapa = RITMO[passo % RITMO.length];
    passo += 1;
    if (r < 4) {
      sobras();
      break;
    }
    if (etapa === "fileira" || ((etapa === "destaque-dir" || etapa === "destaque-esq") && r < 5)) {
      pecas(4, fileiras % 2 === 1);
      fileiras += 1;
    } else if (etapa === "texto-esq" || etapa === "texto-dir") {
      texto("largo", etapa === "texto-dir" ? "dir" : "esq");
      pecas(2);
    } else {
      destaque(etapa === "destaque-dir" ? "dir" : "esq");
      pecas(4);
    }
  }

  return blocos;
}

/** A foto do destaque mostra uma modelo (o rosto precisa ficar no quadro). */
export const temModelo = (id: string) => id in FOTO_MODELO;

/** Fotos da peça, começando pela escolhida para o destaque. */
export function fotosDaPeca(p: Produto, inicial = 0): string[] {
  const todas = [p.foto, p.fotoHover, ...(p.fotosExtra ?? [])].filter(Boolean) as string[];
  if (inicial <= 0 || inicial >= todas.length) return todas;
  return [todas[inicial], ...todas.filter((_, i) => i !== inicial)];
}

/** Primeira frase da descrição (para o destaque). */
export function resumo(p: Produto): string {
  // Ponto seguido de espaço ou do fim ("2.500 miçangas" não corta), sem o
  // parêntese técnico do acabamento.
  const frase = p.detalhes.match(/^.*?\.(?=\s|$)/)?.[0] ?? p.detalhes;
  return frase.replace(/\s*\([^)]*\)/g, "").trim();
}

/** "de R$ 950 a R$ 1.299,90" (valores no cartão, como nos cards). */
export function faixaDePreco(itens: Produto[]): string | null {
  if (itens.length < 2) return null;
  const valores = itens.map((p) => parcelamentoCartao(p).total);
  const min = Math.min(...valores);
  const max = Math.max(...valores);
  if (min === max) return null;
  return `de ${formatBRLPreco(min)} a ${formatBRLPreco(max)}`;
}
