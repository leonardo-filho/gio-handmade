// Coleção Solaris — nova coleção de verão (5 tops + 2 headpieces).
//
// As peças ainda não foram cadastradas: por enquanto são "slots" placeholder
// ("foto em breve"). Quando as fotos/nomes/preços chegarem, cada slot vira um
// produto real (categoria "Coleção Solaris" em src/data/produtos.ts) com card
// completo e botão de comprar.

export type SolarisSlot = {
  id: string;
  tipo: "Top" | "Headpiece";
  numero: number; // numeração dentro do tipo
};

export const solarisSlots: SolarisSlot[] = [
  { id: "solaris-top-01", tipo: "Top", numero: 1 },
  { id: "solaris-top-02", tipo: "Top", numero: 2 },
  { id: "solaris-top-03", tipo: "Top", numero: 3 },
  { id: "solaris-top-04", tipo: "Top", numero: 4 },
  { id: "solaris-top-05", tipo: "Top", numero: 5 },
  { id: "solaris-headpiece-01", tipo: "Headpiece", numero: 1 },
  { id: "solaris-headpiece-02", tipo: "Headpiece", numero: 2 },
];

const WA = "559192982017";

export const SOLARIS_WAITLIST =
  `https://wa.me/${WA}?text=` +
  encodeURIComponent("Oi Gio! ☀️ Quero entrar na lista de espera da coleção Solaris. Me avisa quando chegar!");
