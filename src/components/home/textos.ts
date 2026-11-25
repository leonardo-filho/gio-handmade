// Links e textos da home, do cabeçalho e do rodapé. Nada aqui é promessa
// nova: cada texto vem de um lugar do site que já existe (fonte ao lado).

export const WHATSAPP = "559192982017";

/** Orçamento (Hero, Header e o botão flutuante do WhatsApp usam a mesma mensagem). */
export const WA_ORCAMENTO = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent("Olá, gostaria de realizar um orçamento.")}`;

/** Peça do seu jeito (o fim da /loja, vitrine/ComoComprar.tsx). */
export const WA_SEU_JEITO = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(
  "Oi, Gio! Quero encomendar uma peça do meu jeito. Pode me ajudar?"
)}`;

export const INSTAGRAM = "https://instagram.com/gio.handmade__";
export const INSTAGRAM_ARROBA = "@gio.handmade__";

// Do pedido à entrega (ProcessSection.tsx), com a pontuação revista.
export const PASSOS = [
  {
    titulo: "Inspiração",
    texto: "Envie uma referência ou descreva a peça dos seus sonhos pelo WhatsApp.",
  },
  {
    titulo: "Orçamento e sinal",
    texto:
      "A confecção começa após o pagamento de 50% do valor. Esse sinal não é reembolsável em caso de desistência. O saldo restante deve ser quitado em até 72 horas após a data combinada para envio ou retirada; depois desse prazo, a peça é colocada à venda.",
    destaque: "Regra importante",
  },
  {
    titulo: "Medidas",
    texto: "Eu mesma ajudo você: mando um vídeo explicativo para você tirar suas medidas com perfeição.",
  },
  {
    titulo: "Confecção",
    texto: "Sua peça começa a nascer, ponto a ponto. O prazo de produção depende da complexidade e aparece em cada peça da loja.",
    destaque: "Prazo",
  },
] as const;

// Formas de pagamento (ProcessSection.tsx e os preços da loja).
export const PAGAMENTO = [
  { titulo: "Pix", texto: "Sem acréscimos: o menor valor de cada peça." },
  {
    titulo: "Cartão",
    texto: "Sem juros nas parcelas indicadas em cada peça, ou em até 12x com juros no link de pagamento.",
  },
] as const;

// Quem faz (AboutSection.tsx).
export const SOBRE = {
  ola: "Olá! Eu sou a Giovanna Alves, a mente e as mãos por trás de cada peça da Gio Handmade.",
  citacao: "Este não é um processo industrial. É um trabalho de paciência, arte e dedicação.",
  feito: "Cada top, cada saia e cada acessório é feito exclusivamente por mim.",
  encomenda:
    "Quando você encomenda uma peça, não está apenas comprando uma roupa: está levando para casa horas de trabalho manual, carinho e um design pensado para valorizar a sua essência.",
  selos: ["Slow Fashion", "100% Artesanal", "Belém · PA"],
};

// Personalizar (vitrine/ComoComprar.tsx).
export const PERSONALIZAR =
  "Dá para personalizar a peça, inclusive as cores. Chame no WhatsApp que a gente monta com você.";
