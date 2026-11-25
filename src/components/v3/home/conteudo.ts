// Conteudo da home v3 (Argon - Atelie de Luz e Relevo):
// Fotos atemporais centradas no brilho das perolas e cristais ambar, portas de
// categoria em close do bordado e texto enxuto dentro da regua de 150 palavras.

import { SOBRE } from "@/components/home/textos";

export type FotoHero = {
  src: string;
  alt: string;
  foco?: string;
};

// Triptico atemporal de luz e relevo:
// Esquerda (desktop): Top Aurora em modelo (perolas bronze e gotas de cristal)
// Centro (celular e desktop): Top Maya no corpo (2.500 micangas e cristais ambar)
// Direita (desktop): Macro real da trama do Top Maya (relevo das fileiras bordadas)
export const HERO: [FotoHero, FotoHero, FotoHero] = [
  {
    src: "/colecao/solaris-top-aurora.jpg",
    alt: "Modelo com o Top Aurora bordado com pérolas e cristais",
    foco: "50% 28%",
  },
  {
    src: "/colecao/top-maya-2.jpg",
    alt: "Modelo com o Top Maya bordado à mão com mais de 2.500 miçangas e cristais âmbar",
    foco: "50% 35%",
  },
  {
    src: "/colecao/top-maya-5.jpg",
    alt: "Detalhe macro das fileiras de pérolas douradas e cristais âmbar do Top Maya",
    foco: "50% 45%",
  },
];

// Assinatura discreta sobre o hero (2 palavras, mantendo a 1a tela dentro de 8 palavras).
export const COLECAO_ATIVA: { nome: string; href: string } | null = {
  nome: "Luz & Relevo",
  href: "/loja/top-maya",
};

export type Porta = {
  slug: string;
  rotulo: string;
  foto: string;
  foco: string;
  zoom: number;
};

export const PORTAS: Porta[] = [
  { slug: "tops", rotulo: "Tops", foto: "/colecao/top-lourdes-3.jpg", foco: "50% 48%", zoom: 1.05 },
  { slug: "conjuntos", rotulo: "Conjuntos", foto: "/colecao/conjunto-selene.jpg", foco: "65% 22%", zoom: 1.35 },
  { slug: "saias", rotulo: "Saias", foto: "/colecao/saia-sarah.jpg", foco: "50% 50%", zoom: 1 },
  { slug: "acessorios", rotulo: "Acessórios", foto: "/colecao/chocker-ouro-verde-3.jpg", foco: "70% 50%", zoom: 1.45 },
];

export const QUEM_FAZ = {
  titulo: "Feito à mão por Giovanna, em Belém",
  texto: SOBRE.citacao,
};
