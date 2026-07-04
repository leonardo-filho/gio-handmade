// Catálogo completo da vitrine (loja). Fonte única de dados dos produtos
// mostrados em /loja e adicionados ao carrinho.
//
// Observação de negócio: as peças são feitas à mão, sob encomenda. Os preços
// são "a partir de" (aPartirDe: true) — o valor final é confirmado no WhatsApp
// conforme customização. As de pronta entrega têm preço fechado.
//
// A "Coleção Solaris" é a nova coleção de verão (5 tops + 2 headpieces) e ainda
// está como placeholder em src/data/solaris.ts. Quando as fotos/preços chegarem,
// as peças entram aqui com categoria "Coleção Solaris".

export type Produto = {
  id: string;
  nome: string;
  descricao: string;
  preco: number;
  foto: string;
  categoria: "Coleção Solaris" | "Tops" | "Conjuntos" | "Saias" | "Vestidos" | "Acessórios";
  aPartirDe: boolean;
  prontaEntrega?: boolean;
  producao?: string;
  tamanho?: string;
};

export const produtos: Produto[] = [
  // ---------------- Pronta entrega ----------------
  {
    id: "conjunto-cristal-correntes",
    nome: "Conjunto Cristal & Correntes",
    descricao: "Peça única já finalizada, pronta para envio imediato. Regulável no top e na saia.",
    preco: 1000,
    foto: "/conjunto-pronta.png",
    categoria: "Conjuntos",
    aPartirDe: false,
    prontaEntrega: true,
    tamanho: "36 a 40",
  },

  // ---------------- Conjuntos ----------------
  {
    id: "conjunto-cristais",
    nome: "Conjunto Cristais",
    descricao: "Top + saia em conjunto bordado, totalmente coordenados. Peça hero da coleção.",
    preco: 1000,
    foto: "/peca-cristal.png",
    categoria: "Conjuntos",
    aPartirDe: true,
    producao: "20 dias",
  },

  // ---------------- Vestidos ----------------
  {
    id: "vestido-cristais",
    nome: "Vestido Cristais",
    descricao: "Vestido completo bordado à mão, comprimento midi ou longo.",
    preco: 1000,
    foto: "/vestido.png",
    categoria: "Vestidos",
    aPartirDe: true,
    producao: "20 a 25 dias",
  },

  // ---------------- Tops (inclui as peças da antiga Brilho Tropical) ----------------
  {
    id: "top-hexa",
    nome: "Top Hexa é Luxo",
    descricao: "Feito à mão com miçangas e cristais, brilho intenso para o verão. Acompanha pulseira combinando.",
    preco: 400,
    foto: "/colecao/top-hexa-frente-v4.jpg",
    categoria: "Tops",
    aPartirDe: true,
    producao: "até 3 dias úteis",
  },
  {
    id: "top-aguas",
    nome: "Top Águas Brasileiras",
    descricao: "Mix de miçangas e cristais em tons de azul turquesa e royal com detalhes dourados. Um mergulho de estilo.",
    preco: 570,
    foto: "/colecao/top-aguas-frente.jpg",
    categoria: "Tops",
    aPartirDe: true,
    producao: "até 4 dias úteis",
  },
  {
    id: "top-floresce",
    nome: "Top Floresce",
    descricao: "Correntes entrelaçadas com pedrarias caídas e chocker integrada. Puro movimento e sofisticação.",
    preco: 550,
    foto: "/colecao/top-floresce-frente.jpg",
    categoria: "Tops",
    aPartirDe: true,
    producao: "até 4 dias úteis",
  },
  {
    id: "top-beaded",
    nome: "Top Beaded",
    descricao: "Top com pedrarias e miçangas aplicadas em padrão geométrico.",
    preco: 550,
    foto: "/tops.png",
    categoria: "Tops",
    aPartirDe: true,
    producao: "15 a 20 dias",
  },
  {
    id: "top-cristais",
    nome: "Top Cristais",
    descricao: "Top em malha bordado com cristais aplicados um a um.",
    preco: 500,
    foto: "/peca-preta-correntes.png",
    categoria: "Tops",
    aPartirDe: true,
    producao: "15 a 20 dias",
  },

  // ---------------- Saias ----------------
  {
    id: "saia-conchas",
    nome: "Saia Conchas",
    descricao: "Saia com aplicações de conchas naturais e pedrarias. Movimento fluido.",
    preco: 600,
    foto: "/saias.png",
    categoria: "Saias",
    aPartirDe: true,
    producao: "15 a 20 dias",
  },

  // ---------------- Acessórios (inclui a Chocker da antiga Brilho Tropical) ----------------
  {
    id: "chocker-ouro-verde",
    nome: "Chocker Ouro Verde",
    descricao: "Cristais facetados em verde esmeralda com pingente banhado a ouro. Delicada e sofisticada.",
    preco: 70,
    foto: "/colecao/chocker-ouro-verde-01.jpg",
    categoria: "Acessórios",
    aPartirDe: true,
    producao: "até 2 dias úteis",
  },
  {
    id: "headpiece",
    nome: "Headpiece",
    descricao: "Headpiece exclusivo, bordado à mão com cristais, pedrarias e correntes.",
    preco: 150,
    foto: "/headpiece.png",
    categoria: "Acessórios",
    aPartirDe: true,
    producao: "10 a 15 dias",
  },
];

// Ordem das categorias na vitrine (a Coleção Solaris é renderizada à parte,
// como "em breve", enquanto as peças novas não chegam).
export const categoriasOrdem: Produto["categoria"][] = [
  "Conjuntos",
  "Vestidos",
  "Tops",
  "Saias",
  "Acessórios",
];
