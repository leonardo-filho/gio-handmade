// Catálogo completo da vitrine (loja). Fonte única de dados dos produtos
// mostrados em /loja e na home, e adicionados ao carrinho.
//
// Observação de negócio: as peças são feitas à mão, sob encomenda. O preço
// exibido é o valor no PIX; o parcelamento sem juros vai no campo `parcelas`.
// O texto completo de cada peça (materiais, acabamento, notas) fica em
// `detalhes` e abre no modal quando o cliente clica no card.
//
// A "Coleção Solaris" (5 tops + 2 headpieces) é a nova coleção de verão e
// aparece num bloco próprio na home e no topo da loja.

export type Produto = {
  id: string;
  nome: string;
  detalhes: string; // texto completo mostrado no modal de detalhes
  preco: number;
  parcelas?: string; // ex.: "3x de R$ 125 sem juros"
  foto: string;
  fotoHover?: string; // 2ª foto revelada no hover do card
  fotosExtra?: string[]; // fotos adicionais (3ª em diante), exibidas na galeria do modal
  categoria: "Coleção Solaris" | "Tops" | "Conjuntos" | "Saias" | "Vestidos" | "Acessórios";
  prontaEntrega?: boolean;
  producao?: string; // ex.: "até 10 dias úteis"
  tamanho?: string;
};

export const produtos: Produto[] = [
  // ============================================================
  //  COLEÇÃO SOLARIS — nova coleção de verão (5 tops + 2 headpieces)
  // ============================================================
  {
    id: "solaris-top-solaris",
    nome: "Top Solaris",
    detalhes:
      "Bordado à mão, um a um. Caso queira bordar as costas, avisar previamente. A peça-símbolo da coleção.",
    preco: 650,
    foto: "/colecao/solaris-top-solaris.jpg",
    fotoHover: "/colecao/solaris-top-solaris-2.jpg",
    fotosExtra: [
      "/colecao/solaris-top-solaris-3.jpg",
      "/colecao/solaris-top-solaris-4.jpg",
      "/colecao/solaris-top-solaris-5.jpg",
      "/colecao/solaris-top-solaris-6.jpg",
      "/colecao/solaris-top-solaris-7.jpg",
    ],
    categoria: "Coleção Solaris",
    producao: "até 10 dias úteis",
  },
  {
    id: "solaris-top-perla",
    nome: "Top Perla",
    detalhes:
      "Feito à mão, sob medida, com um mix de pérolas. Possui acabamento de aço banhado em verniz italiano (alta resistência e durabilidade).",
    preco: 700,
    foto: "/colecao/solaris-top-perla.jpg",
    fotoHover: "/colecao/solaris-top-perla-2.jpg",
    fotosExtra: [
      "/colecao/solaris-top-perla-3.jpg",
      "/colecao/solaris-top-perla-4.jpg",
      "/colecao/solaris-top-perla-5.jpg",
    ],
    categoria: "Coleção Solaris",
    producao: "até 10 dias úteis",
  },
  {
    id: "solaris-top-aurora",
    nome: "Top Aurora",
    detalhes:
      "Feito à mão, sob medida, com um mix de penduricalhos de miçangas e corrente de aço banhado em verniz italiano (alta resistência e durabilidade).",
    preco: 600,
    foto: "/colecao/solaris-top-aurora.jpg",
    fotoHover: "/colecao/solaris-top-aurora-2.jpg",
    fotosExtra: [
      "/colecao/solaris-top-aurora-3.jpg",
      "/colecao/solaris-top-aurora-4.jpg",
      "/colecao/solaris-top-aurora-5.jpg",
    ],
    categoria: "Coleção Solaris",
    producao: "até 7 dias úteis",
  },
  {
    id: "solaris-top-lumina",
    nome: "Top Lumina",
    detalhes:
      "Feito à mão, sob medida, com um mix de elos e penduricalhos de miçangas. Possui acabamento de aço banhado em verniz italiano (alta resistência e durabilidade).",
    preco: 470,
    foto: "/colecao/solaris-top-lumina.jpg",
    fotoHover: "/colecao/solaris-top-lumina-2.jpg",
    fotosExtra: [
      "/colecao/solaris-top-lumina-3.jpg",
      "/colecao/solaris-top-lumina-4.jpg",
      "/colecao/solaris-top-lumina-5.jpg",
      "/colecao/solaris-top-lumina-6.jpg",
    ],
    categoria: "Coleção Solaris",
    producao: "até 7 dias úteis",
  },
  {
    id: "solaris-top-noir",
    nome: "Top Noir",
    detalhes: "Biquíni com miçangas bordadas à mão.",
    preco: 230,
    foto: "/colecao/solaris-top-noir.jpg",
    fotoHover: "/colecao/solaris-top-noir-2.jpg",
    fotosExtra: [
      "/colecao/solaris-top-noir-3.jpg",
      "/colecao/solaris-top-noir-4.jpg",
      "/colecao/solaris-top-noir-5.jpg",
    ],
    categoria: "Coleção Solaris",
    producao: "até 5 dias úteis",
  },
  {
    id: "solaris-headpiece-lumina",
    nome: "Headpiece Lumina",
    detalhes:
      "Feito à mão, sob medida, com um mix de elos. Possui acabamento de aço banhado em verniz italiano (alta resistência e durabilidade).",
    preco: 200,
    foto: "/colecao/solaris-headpiece-lumina.jpg",
    fotoHover: "/colecao/solaris-headpiece-lumina-2.jpg",
    fotosExtra: ["/colecao/solaris-headpiece-lumina-3.jpg"],
    categoria: "Coleção Solaris",
    producao: "até 5 dias úteis",
  },
  {
    id: "solaris-headpiece-perla",
    nome: "Headpiece Perla",
    detalhes:
      "Feito à mão, sob medida, com um mix de pérolas. Possui acabamento de aço banhado em verniz italiano (alta resistência e durabilidade).",
    preco: 100,
    foto: "/colecao/solaris-headpiece-perla.jpg",
    fotoHover: "/colecao/solaris-headpiece-perla-2.jpg",
    categoria: "Coleção Solaris",
    producao: "até 3 dias úteis",
  },

  // ============================================================
  //  CONJUNTOS
  // ============================================================
  {
    id: "conjunto-gio",
    nome: "Conjunto Giô",
    detalhes:
      "Feito à mão, sob medida, com um mix de pedrarias e correntes de aço banhado em verniz italiano (alta resistência e durabilidade).",
    preco: 1150,
    foto: "/colecao/conjunto-gio.jpg",
    fotoHover: "/colecao/conjunto-gio-2.jpg",
    fotosExtra: ["/colecao/conjunto-gio-3.jpg"],
    categoria: "Conjuntos",
    producao: "até 17 dias úteis",
  },
  {
    id: "conjunto-moonlight",
    nome: "Conjunto Moonlight",
    detalhes:
      "Feito à mão, sob medida, com um mix de penduricalhos de pedras de acrílico e correntes de aço banhado em verniz italiano (alta resistência e durabilidade).",
    preco: 1300,
    foto: "/colecao/conjunto-moonlight.jpg",
    fotoHover: "/colecao/conjunto-moonlight-2.jpg",
    categoria: "Conjuntos",
    producao: "até 15 dias úteis",
  },
  {
    id: "conjunto-crystal",
    nome: "Conjunto Crystal",
    detalhes:
      "Feito à mão, sob medida, com um mix de pedras de acrílico e correntes de aço banhado em verniz italiano (alta resistência e durabilidade).",
    preco: 1100,
    foto: "/colecao/conjunto-crystal.jpg",
    fotoHover: "/colecao/conjunto-crystal-2.jpg",
    categoria: "Conjuntos",
    producao: "até 15 dias úteis",
  },
  {
    id: "conjunto-selene",
    nome: "Conjunto Selene",
    detalhes:
      "Feito à mão, sob medida, com um mix de pedras de acrílico, cristais e correntes de aço banhado em verniz italiano (alta resistência e durabilidade).",
    preco: 1000,
    foto: "/colecao/conjunto-selene.jpg",
    fotoHover: "/colecao/conjunto-selene-2.jpg",
    categoria: "Conjuntos",
    producao: "até 15 dias úteis",
  },
  {
    id: "conjunto-duda",
    nome: "Conjunto Duda",
    detalhes:
      "Feito à mão, sob medida, com um mix de pedrarias e correntes de aço banhado em verniz italiano (alta resistência e durabilidade).",
    preco: 1000,
    foto: "/colecao/conjunto-duda.jpg",
    fotoHover: "/colecao/conjunto-duda-2.jpg",
    categoria: "Conjuntos",
    producao: "até 20 dias úteis",
  },

  // ============================================================
  //  VESTIDOS
  // ============================================================
  {
    id: "vestido-luna",
    nome: "Vestido Luna",
    detalhes:
      "Feito à mão, sob medida, com um mix de miçangas de acrílico e cristais. Correntes e acabamento de aço banhado em verniz italiano (alta resistência e durabilidade).",
    preco: 1300,
    foto: "/colecao/vestido-luna.jpg",
    fotoHover: "/colecao/vestido-luna-2.jpg",
    fotosExtra: ["/colecao/vestido-luna-3.jpg"],
    categoria: "Vestidos",
    producao: "até 20 dias úteis",
  },
  {
    id: "vestido-prisma",
    nome: "Vestido Prisma",
    detalhes:
      "Feito à mão, sob medida, com um mix de miçangas e vidro de acrílico. Correntes e acabamento de aço banhado em verniz italiano (alta resistência e durabilidade).",
    preco: 1100,
    foto: "/colecao/vestido-prisma.jpg",
    fotoHover: "/colecao/vestido-prisma-2.jpg",
    categoria: "Vestidos",
    producao: "até 20 dias úteis",
  },

  // ============================================================
  //  TOPS
  // ============================================================
  {
    id: "top-lourdes",
    nome: "Top Lourdes",
    detalhes:
      "Bordado à mão, com um mix de mais de 2.300 cristais. Caso queira bordar as costas, avisar previamente.",
    preco: 900,
    foto: "/colecao/top-lourdes.jpg",
    fotoHover: "/colecao/top-lourdes-2.jpg",
    fotosExtra: ["/colecao/top-lourdes-3.jpg", "/colecao/top-lourdes-4.jpg"],
    categoria: "Tops",
    producao: "até 10 dias úteis",
  },
  {
    id: "regata-nyx",
    nome: "Regata Nyx",
    detalhes:
      "Feito à mão, sob medida, com um mix de argolas de metal e elos de aço banhado em verniz italiano (alta resistência e durabilidade).",
    preco: 700,
    foto: "/colecao/regata-nyx.jpg",
    fotoHover: "/colecao/regata-nyx-2.jpg",
    fotosExtra: [
      "/colecao/regata-nyx-3.jpg",
      "/colecao/regata-nyx-4.jpg",
      "/colecao/regata-nyx-5.jpg",
    ],
    categoria: "Tops",
    producao: "até 12 dias úteis",
  },
  {
    id: "top-medusa",
    nome: "Top Medusa",
    detalhes:
      "Feito à mão, sob medida, com um mix de miçangas e cristais. Possui correntes e acabamento de aço banhado em verniz italiano (alta resistência e durabilidade).",
    preco: 700,
    foto: "/colecao/top-medusa.jpg",
    fotoHover: "/colecao/top-medusa-2.jpg",
    fotosExtra: ["/colecao/top-medusa-3.jpg"],
    categoria: "Tops",
    producao: "até 12 dias úteis",
  },
  {
    id: "top-ana",
    nome: "Top Ana",
    detalhes:
      "Feito à mão, sob medida, com um mix de miçangas e cristais. Possui correntes e acabamento de aço banhado em verniz italiano (alta resistência e durabilidade).",
    preco: 650,
    foto: "/colecao/top-ana.jpg",
    fotoHover: "/colecao/top-ana-2.jpg",
    categoria: "Tops",
    producao: "até 12 dias úteis",
  },
  {
    id: "top-kesha",
    nome: "Top Kesha",
    detalhes:
      "Feito à mão, sob medida, com um mix de miçangas, cristais e pedrarias. Possui correntes e acabamento de aço banhado em verniz italiano (alta resistência e durabilidade).",
    preco: 650,
    foto: "/colecao/top-kesha.jpg",
    categoria: "Tops",
    producao: "até 12 dias úteis",
  },
  {
    id: "top-musa",
    nome: "Top Musa",
    detalhes:
      "Feito à mão, sob medida, com um mix de miçangas, cristais e pedrarias. Possui correntes e acabamento de aço banhado em verniz italiano (alta resistência e durabilidade).",
    preco: 600,
    foto: "/colecao/top-musa.jpg",
    categoria: "Tops",
    producao: "até 12 dias úteis",
  },
  {
    id: "top-crystal",
    nome: "Top Crystal",
    detalhes:
      "Feito à mão, sob medida, com um mix de pedras de acrílico e vidro transparente. Possui correntes e acabamento de aço banhado em verniz italiano (alta resistência e durabilidade).",
    preco: 600,
    foto: "/colecao/top-crystal.jpg",
    fotoHover: "/colecao/top-crystal-2.jpg",
    fotosExtra: ["/colecao/conjunto-crystal.jpg"],
    categoria: "Tops",
    producao: "até 12 dias úteis",
  },
  {
    id: "top-onix",
    nome: "Top Ônix",
    detalhes:
      "Feito à mão, sob medida, com um mix de miçangas e pedras naturais. Possui correntes e acabamento de aço banhado em verniz italiano (alta resistência e durabilidade).",
    preco: 550,
    foto: "/colecao/top-onix.jpg",
    categoria: "Tops",
    producao: "até 10 dias úteis",
  },
  {
    id: "top-julia",
    nome: "Top Júlia",
    detalhes:
      "Feito à mão, sob medida, com um mix de miçangas e cristais. Possui correntes e acabamento de aço banhado em verniz italiano (alta resistência e durabilidade). Disponível em várias cores.",
    preco: 550,
    foto: "/colecao/top-julia.jpg",
    fotoHover: "/colecao/top-julia-2.jpg",
    fotosExtra: ["/colecao/top-julia-3.jpg"],
    categoria: "Tops",
    producao: "até 12 dias úteis",
  },
  {
    id: "top-gio",
    nome: "Top Giô",
    detalhes:
      "Feito à mão, sob medida, com um mix de pedrarias, elos e correntes de aço banhados em verniz italiano (alta resistência e durabilidade).",
    preco: 550,
    foto: "/colecao/top-gio.jpg",
    fotoHover: "/colecao/top-gio-2.jpg",
    fotosExtra: ["/colecao/conjunto-gio.jpg"],
    categoria: "Tops",
    producao: "até 12 dias úteis",
  },
  {
    id: "top-duda",
    nome: "Top Duda",
    detalhes:
      "Feito à mão, sob medida, com um mix de pedrarias e miçangas. Possui correntes e acabamento de aço banhado em verniz italiano (alta resistência e durabilidade). Material solicitado de fora.",
    preco: 550,
    foto: "/colecao/top-duda.jpg",
    fotosExtra: ["/colecao/conjunto-duda.jpg"],
    categoria: "Tops",
    producao: "até 15 dias úteis",
  },
  {
    id: "top-mirror",
    nome: "Top Mirror",
    detalhes:
      "Feito à mão, sob medida, com um mix de chatons espelhados, elos e corrente de aço banhado em verniz italiano (alta resistência e durabilidade) e penduricalhos de miçanga.",
    preco: 400,
    foto: "/colecao/top-mirror.jpg",
    fotoHover: "/colecao/top-mirror-2.jpg",
    fotosExtra: ["/colecao/top-mirror-3.jpg"],
    categoria: "Tops",
    producao: "até 10 dias úteis",
  },
  {
    id: "top-imperatriz",
    nome: "Top Imperatriz",
    detalhes:
      "Feito à mão, sob medida, com um mix de miçangas e pérolas. Possui correntes e acabamento de aço banhado em verniz italiano (alta resistência e durabilidade).",
    preco: 450,
    foto: "/colecao/top-imperatriz.jpg",
    categoria: "Tops",
    producao: "até 7 dias úteis",
  },
  {
    id: "top-bruna",
    nome: "Top Bruna",
    detalhes:
      "Feito à mão, sob medida, com um mix de miçangas, cristais e pedrarias. Possui correntes e acabamento de aço banhado em verniz italiano (alta resistência e durabilidade).",
    preco: 450,
    foto: "/colecao/top-bruna.jpg",
    categoria: "Tops",
    producao: "até 10 dias úteis",
  },
  {
    id: "top-golden",
    nome: "Top Golden",
    detalhes:
      "Feito à mão, sob medida, com um mix de miçangas e pedras naturais. Possui correntes e acabamento de aço banhado em verniz italiano (alta resistência e durabilidade).",
    preco: 450,
    foto: "/colecao/top-golden.jpg",
    categoria: "Tops",
    producao: "até 10 dias úteis",
  },
  {
    id: "top-chains",
    nome: "Top Chains",
    detalhes:
      "Feito à mão, sob medida, com um mix de correntes de aço banhadas em verniz italiano (alta resistência e durabilidade).",
    preco: 450,
    foto: "/colecao/top-chains.jpg",
    categoria: "Tops",
    producao: "até 5 dias úteis",
  },
  {
    id: "top-layla",
    nome: "Top Layla",
    detalhes:
      "Feito à mão, sob medida, com um mix de miçangas e cristais. Possui correntes e acabamento de aço banhado em verniz italiano (alta resistência e durabilidade).",
    preco: 430,
    foto: "/colecao/top-layla.jpg",
    categoria: "Tops",
    producao: "até 7 dias úteis",
  },
  {
    id: "top-giurds",
    nome: "Top Giurds",
    detalhes:
      "Feito à mão, sob medida, com um mix de elos e conchas de acrílico. Possui correntes e acabamento de aço banhado em verniz italiano (alta resistência e durabilidade).",
    preco: 370,
    foto: "/colecao/top-giurds.jpg",
    fotoHover: "/colecao/top-giurds-2.jpg",
    categoria: "Tops",
    producao: "até 10 dias úteis",
  },
  {
    id: "top-beatriz",
    nome: "Top Beatriz",
    detalhes:
      "Feito à mão, sob medida, com um mix de pedrarias e elos. Possui correntes e acabamento de aço banhado em verniz italiano (alta resistência e durabilidade).",
    preco: 370,
    foto: "/colecao/top-beatriz.jpg",
    categoria: "Tops",
    producao: "até 10 dias úteis",
  },
  {
    id: "top-nanda",
    nome: "Top Nanda",
    detalhes:
      "Feito à mão, sob medida, com um mix de elos, paetês e pedrarias que representam o fundo do mar. Possui corrente de aço e acabamento banhados em verniz italiano (alta resistência e durabilidade).",
    preco: 300,
    foto: "/colecao/top-nanda.jpg",
    fotoHover: "/colecao/top-nanda-2.jpg",
    categoria: "Tops",
    producao: "até 5 dias úteis",
  },
  {
    id: "top-ananda",
    nome: "Top Ananda",
    detalhes:
      "Feito à mão, sob medida, com miçangas de acrílico e de madeira. Possui corrente de aço banhada em verniz italiano para ajuste nas costas e pescoço.",
    preco: 300,
    foto: "/colecao/top-ananda.jpg",
    categoria: "Tops",
    producao: "até 5 dias úteis",
  },
  {
    id: "top-shirlene",
    nome: "Top Shirlene",
    detalhes:
      "Feito à mão, sob medida, com um mix de pérolas e correntes. Possui acabamento e correntes de aço banhados em verniz italiano (alta resistência e durabilidade).",
    preco: 270,
    foto: "/colecao/top-shirlene.jpg",
    categoria: "Tops",
    producao: "até 5 dias úteis",
  },

  // ---- Tops da coleção Brilho Tropical (continuam à venda) ----
  {
    id: "top-hexa",
    nome: "Top Hexa é Luxo",
    detalhes:
      "Feito à mão com um mix de miçangas e cristais, brilho intenso para o verão. Acompanha pulseira combinando.",
    preco: 400,
    foto: "/colecao/top-hexa-frente-v4.jpg",
    fotoHover: "/colecao/top-hexa-costas.jpg",
    categoria: "Tops",
    producao: "até 5 dias úteis",
  },
  {
    id: "top-aguas",
    nome: "Top Águas Brasileiras",
    detalhes:
      "Feito à mão com um mix de miçangas e cristais em tons de azul turquesa e royal com detalhes dourados.",
    preco: 570,
    foto: "/colecao/top-aguas-frente.jpg",
    fotoHover: "/colecao/top-aguas-lateral.jpg",
    categoria: "Tops",
    producao: "até 10 dias úteis",
  },
  {
    id: "top-floresce",
    nome: "Top Floresce",
    detalhes:
      "Feito à mão com correntes entrelaçadas, pedrarias caídas e chocker integrada.",
    preco: 550,
    foto: "/colecao/top-floresce-frente.jpg",
    fotoHover: "/colecao/top-floresce-lateral.jpg",
    categoria: "Tops",
    producao: "até 10 dias úteis",
  },

  // ============================================================
  //  SAIAS
  // ============================================================
  {
    id: "saia-brisa",
    nome: "Saia Brisa",
    detalhes:
      "Feito à mão, sob medida, com um mix de cristais e conchas naturais. Possui correntes e acabamento de aço banhado em verniz italiano (alta resistência e durabilidade).",
    preco: 650,
    foto: "/colecao/saia-brisa.jpg",
    fotoHover: "/colecao/saia-brisa-2.jpg",
    categoria: "Saias",
    producao: "até 15 dias úteis",
  },
  {
    id: "saia-crystal",
    nome: "Saia Crystal",
    detalhes:
      "Feito à mão, sob medida, com um mix de cristais, contas de acrílico e correntes em acabamento de aço banhado em verniz italiano (alta resistência e durabilidade).",
    preco: 600,
    foto: "/colecao/saia-crystal.jpg",
    fotoHover: "/colecao/saia-crystal-2.jpg",
    fotosExtra: ["/colecao/conjunto-crystal.jpg"],
    categoria: "Saias",
    producao: "até 10 dias úteis",
  },
  {
    id: "saia-duda",
    nome: "Saia Duda",
    detalhes:
      "Feito à mão, sob medida, com um mix de pedrarias e miçangas. Possui acabamento de aço banhado em verniz italiano (alta resistência e durabilidade).",
    preco: 600,
    foto: "/colecao/saia-duda.jpg",
    fotoHover: "/colecao/saia-duda-2.jpg",
    fotosExtra: ["/colecao/conjunto-duda.jpg"],
    categoria: "Saias",
    producao: "até 10 dias úteis",
  },
  {
    id: "saia-gio",
    nome: "Saia Giô",
    detalhes:
      "Feito à mão, sob medida, com um mix de pedrarias e correntes de aço banhado em verniz italiano (alta resistência e durabilidade).",
    preco: 600,
    foto: "/colecao/saia-gio.jpg",
    fotoHover: "/colecao/saia-gio-2.jpg",
    fotosExtra: ["/colecao/conjunto-gio.jpg"],
    categoria: "Saias",
    producao: "até 12 dias úteis",
  },
  {
    id: "saia-sarah",
    nome: "Saia Sarah",
    detalhes:
      "Feito à mão, sob medida, com um mix de cristais e conchas naturais. Possui correntes e acabamento de aço banhado em verniz italiano (alta resistência e durabilidade).",
    preco: 580,
    foto: "/colecao/saia-sarah.jpg",
    fotoHover: "/colecao/saia-sarah-2.jpg",
    categoria: "Saias",
    producao: "até 15 dias úteis",
  },

  // ============================================================
  //  ACESSÓRIOS (bodies, harnesses, headpieces e chocker)
  // ============================================================
  {
    id: "acessorio-marea",
    nome: "Acessório Marea",
    detalhes:
      "Feito à mão, sob medida, com um mix de miçangas de acrílico e pérolas. Possui correntes e acabamento de aço banhado em verniz italiano (alta resistência e durabilidade).",
    preco: 380,
    foto: "/colecao/acessorio-marea.jpg",
    categoria: "Tops",
    producao: "até 5 dias úteis",
  },
  {
    id: "acessorio-maris",
    nome: "Acessório Maris",
    detalhes:
      "Feito à mão, sob medida, com um mix de pérolas e miçangas que representam o fundo do mar. Possui corrente de aço banhada em verniz italiano para ajuste nas costas e pescoço.",
    preco: 320,
    foto: "/colecao/acessorio-maris.jpg",
    fotoHover: "/colecao/acessorio-maris-2.jpg",
    fotosExtra: ["/colecao/acessorio-maris-3.jpg"],
    categoria: "Acessórios",
    producao: "até 5 dias úteis",
  },
  {
    id: "headpiece-luna",
    nome: "Headpiece Luna",
    detalhes:
      "Feito à mão, com um mix de miçangas e acabamento de aço banhado em verniz italiano (alta resistência e durabilidade).",
    preco: 200,
    foto: "/colecao/headpiece-luna.jpg",
    fotoHover: "/colecao/headpiece-luna-2.jpg",
    categoria: "Acessórios",
    producao: "até 3 dias úteis",
  },
  {
    id: "headpiece-crystal",
    nome: "Headpiece Crystal",
    detalhes:
      "Feito à mão, com um mix de miçangas e corrente de aço banhado em verniz italiano (alta resistência e durabilidade).",
    preco: 170,
    foto: "/colecao/headpiece-crystal.jpg",
    fotoHover: "/colecao/headpiece-crystal-2.jpg",
    categoria: "Acessórios",
    producao: "até 3 dias úteis",
  },
  {
    id: "headpiece-moonlight",
    nome: "Headpiece Moonlight",
    detalhes:
      "Feito à mão, com um mix de miçangas e corrente de aço banhado em verniz italiano (alta resistência e durabilidade).",
    preco: 170,
    foto: "/colecao/headpiece-moonlight.jpg",
    fotoHover: "/colecao/headpiece-moonlight-2.jpg",
    categoria: "Acessórios",
    producao: "até 3 dias úteis",
  },
  {
    id: "chocker-ouro-verde",
    nome: "Chocker Ouro Verde",
    detalhes:
      "Feito à mão, com cristais facetados em verde esmeralda e pingente banhado a ouro. Delicada e sofisticada.",
    preco: 70,
    foto: "/colecao/chocker-ouro-verde-01.jpg",
    fotoHover: "/colecao/chocker-ouro-verde-02.jpg",
    categoria: "Acessórios",
    producao: "até 2 dias úteis",
  },
];

// Peças da Coleção Solaris (renderizadas em bloco próprio na home e na loja).
export const colecaoSolaris = produtos.filter((p) => p.categoria === "Coleção Solaris");

// Seção da vitrine em que a peça aparece nas categorias. As peças Solaris
// coexistem: além do bloco "Coleção Solaris", os tops entram em "Tops" e os
// headpieces em "Acessórios".
export function secaoVitrine(p: Produto): Exclude<Produto["categoria"], "Coleção Solaris"> {
  if (p.categoria === "Coleção Solaris") {
    return p.nome.startsWith("Headpiece") ? "Acessórios" : "Tops";
  }
  return p.categoria;
}

// Ordem das categorias na vitrine (a Coleção Solaris entra à parte, no topo).
export const categoriasOrdem: Exclude<Produto["categoria"], "Coleção Solaris">[] = [
  "Conjuntos",
  "Vestidos",
  "Tops",
  "Saias",
  "Acessórios",
];

// id âncora de cada seção (usado pela navegação rápida da loja).
export const secaoId: Record<string, string> = {
  "Coleção Solaris": "colecao-solaris",
  Conjuntos: "conjuntos",
  Vestidos: "vestidos",
  Tops: "tops",
  Saias: "saias",
  Acessórios: "acessorios",
};
