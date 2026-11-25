// Conteúdo da home da versão 2 (Provador). Trocar a peça em destaque é trocar
// o id e as fotos aqui; o nome, o preço e o texto vêm do catálogo.

export const DESTAQUE = {
  id: "top-maya",
  /** Foto grande: a peça no corpo. */
  foto: "/colecao/top-maya-2.jpg",
  alt: "Modelo com o Top Maya, bordado em tons de âmbar e dourado",
  foco: "50% 10%",
  /** Duas fotos de detalhe, só no computador. */
  detalhes: ["/colecao/top-maya.jpg", "/colecao/top-maya-4.jpg"],
};

export type Porta = { slug: string; rotulo: string; foto: string; foco: string };

// Quatro portas de categoria, retrato 3:4. Vestidos (2 peças) fica no menu e na loja.
export const PORTAS: Porta[] = [
  { slug: "tops", rotulo: "Tops", foto: "/colecao/solaris-top-lumina-4.jpg", foco: "50% 30%" },
  { slug: "conjuntos", rotulo: "Conjuntos", foto: "/colecao/conjunto-duda.jpg", foco: "50% 45%" },
  { slug: "saias", rotulo: "Saias", foto: "/colecao/saia-gio.jpg", foco: "50% 50%" },
  { slug: "acessorios", rotulo: "Acessórios", foto: "/colecao/solaris-headpiece-lumina.jpg", foco: "50% 25%" },
];
