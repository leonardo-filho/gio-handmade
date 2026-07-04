// Cálculo de frete (estimativa) a partir do ateliê da Gio, em Belém–PA.
//
// Não usamos a API paga dos Correios: fazemos uma estimativa por região do
// Brasil, calculada a partir da UF de destino. O CEP é validado e resolvido
// em cidade/UF pela API pública e gratuita do ViaCEP (sem token, com CORS).
//
// Os valores são propositalmente conservadores e rotulados como "estimativa";
// o valor final é sempre confirmado no WhatsApp junto do pedido.

// Origem dos envios (ateliê da Gio). O endereço completo — Trav. dos
// Mundurucus, 3284 — fica só aqui como referência; NÃO expomos rua/número na
// interface (privacidade), só a cidade/UF. O CEP é de bloco, usado como
// referência para uma futura integração real de frete.
export const ORIGEM = {
  loja: "Gio Handmade",
  cidade: "Belém",
  uf: "PA",
  cep: "66040-100",
} as const;

export type Regiao = "belem" | "norte" | "nordeste" | "centro-oeste" | "sudeste" | "sul";

type RegraRegiao = {
  nome: string;
  ufs: string[];
  valor: number; // R$ (estimativa PAC)
  prazoMin: number; // dias úteis
  prazoMax: number;
};

// Belém é tratada à parte (entrega local, valor menor / a combinar).
const REGRAS: Record<Exclude<Regiao, "belem">, RegraRegiao> = {
  norte: {
    nome: "Norte",
    ufs: ["PA", "AP", "AM", "RR", "AC", "RO", "TO"],
    valor: 28,
    prazoMin: 3,
    prazoMax: 7,
  },
  nordeste: {
    nome: "Nordeste",
    ufs: ["MA", "PI", "CE", "RN", "PB", "PE", "AL", "SE", "BA"],
    valor: 34,
    prazoMin: 5,
    prazoMax: 10,
  },
  "centro-oeste": {
    nome: "Centro-Oeste",
    ufs: ["DF", "GO", "MT", "MS"],
    valor: 42,
    prazoMin: 6,
    prazoMax: 11,
  },
  sudeste: {
    nome: "Sudeste",
    ufs: ["SP", "RJ", "MG", "ES"],
    valor: 46,
    prazoMin: 7,
    prazoMax: 12,
  },
  sul: {
    nome: "Sul",
    ufs: ["PR", "SC", "RS"],
    valor: 52,
    prazoMin: 8,
    prazoMax: 14,
  },
};

export type EnderecoCep = {
  cep: string;
  uf: string;
  localidade: string;
  bairro?: string;
  logradouro?: string;
};

export type FreteEstimado = {
  endereco: EnderecoCep;
  regiao: string;
  valor: number;
  prazoMin: number;
  prazoMax: number;
  local: boolean; // entrega local em Belém
};

export function normalizarCep(cep: string): string {
  return cep.replace(/\D/g, "").slice(0, 8);
}

export function mascararCep(cep: string): string {
  const d = normalizarCep(cep);
  if (d.length <= 5) return d;
  return `${d.slice(0, 5)}-${d.slice(5)}`;
}

function semAcento(texto: string): string {
  return texto.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();
}

/** Consulta o ViaCEP e devolve o endereço, ou null se o CEP for inválido. */
export async function buscarCep(cepBruto: string): Promise<EnderecoCep | null> {
  const cep = normalizarCep(cepBruto);
  if (cep.length !== 8) return null;

  try {
    const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`, {
      headers: { Accept: "application/json" },
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (data?.erro) return null;
    return {
      cep: mascararCep(cep),
      uf: String(data.uf ?? "").toUpperCase(),
      localidade: data.localidade ?? "",
      bairro: data.bairro || undefined,
      logradouro: data.logradouro || undefined,
    };
  } catch {
    return null;
  }
}

function regiaoDaUf(uf: string): RegraRegiao | null {
  const alvo = uf.toUpperCase();
  for (const regra of Object.values(REGRAS)) {
    if (regra.ufs.includes(alvo)) return regra;
  }
  return null;
}

/** Estima o frete a partir de um endereço já resolvido pelo CEP. */
export function estimarFrete(endereco: EnderecoCep): FreteEstimado | null {
  // Entrega local em Belém–PA
  if (endereco.uf === "PA" && semAcento(endereco.localidade) === "belem") {
    return {
      endereco,
      regiao: "Belém (entrega local)",
      valor: 20,
      prazoMin: 1,
      prazoMax: 3,
      local: true,
    };
  }

  const regra = regiaoDaUf(endereco.uf);
  if (!regra) return null;

  return {
    endereco,
    regiao: regra.nome,
    valor: regra.valor,
    prazoMin: regra.prazoMin,
    prazoMax: regra.prazoMax,
    local: false,
  };
}

/** Atalho: consulta o CEP e já devolve a estimativa de frete. */
export async function calcularFrete(cepBruto: string): Promise<FreteEstimado | null> {
  const endereco = await buscarCep(cepBruto);
  if (!endereco) return null;
  return estimarFrete(endereco);
}
