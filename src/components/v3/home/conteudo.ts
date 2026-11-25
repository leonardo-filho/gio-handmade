// Conteúdo da home v3: fotos, portas de categoria e o texto de "Quem faz".
// Nada aqui é promessa nova. O texto vem de AboutSection.tsx (via textos.ts) e
// os links levam às vistas que a /loja já tem (?ver=<slug>).

import { SOBRE } from "@/components/home/textos";

export type FotoHero = { src: string; alt: string };

// Ensaio Brilho Tropical (4:5, parede creme), recortado em 3:4 na tela.
// No celular aparece só a do meio; no computador, as três lado a lado.
export const HERO: [FotoHero, FotoHero, FotoHero] = [
  { src: "/campanha/brilho-tropical-01.jpg", alt: "Modelo com o Top Águas Brasileiras, de miçangas azuis" },
  { src: "/campanha/brilho-tropical-07.jpg", alt: "Modelo com o Top Floresce, de miçangas verdes e amarelas" },
  { src: "/campanha/brilho-tropical-09.jpg", alt: "Modelo com o Top Hexa é Luxo, com a bandeira do Brasil bordada" },
];

// Coleção em destaque: o nome entra sobre a foto (Garamond itálico, creme).
// Sem coleção ativa (hoje), o hero fica sem nenhuma palavra e leva à /loja.
export const COLECAO_ATIVA: { nome: string; href: string } | null = null;

export type Porta = {
  slug: string;
  rotulo: string;
  foto: string;
  /** object-position que mira o bordado dentro do recorte 2:1 (e a origem do zoom). */
  foco: string;
  /** Aproximação do close quando a peça não enche o recorte (1 = sem zoom). */
  zoom: number;
};

// Quatro portas, cada uma um close do bordado de uma peça da categoria.
// Vestidos tem 2 peças e fica no menu e na loja. Foco e zoom escolhidos para
// o canto do rótulo cair num trecho escuro da foto (contraste AA do creme).
export const PORTAS: Porta[] = [
  { slug: "tops", rotulo: "Tops", foto: "/colecao/top-maya.jpg", foco: "50% 40%", zoom: 1 },
  { slug: "conjuntos", rotulo: "Conjuntos", foto: "/colecao/conjunto-selene.jpg", foco: "65% 22%", zoom: 1.4 },
  { slug: "saias", rotulo: "Saias", foto: "/colecao/saia-sarah.jpg", foco: "50% 50%", zoom: 1 },
  { slug: "acessorios", rotulo: "Acessórios", foto: "/colecao/chocker-ouro-verde-3.jpg", foco: "70% 50%", zoom: 1.5 },
];

export const QUEM_FAZ = {
  titulo: "Feito à mão por Giovanna, em Belém",
  // Frase de AboutSection. Curta de propósito: a home toda cabe em 150 palavras.
  texto: SOBRE.citacao,
};
