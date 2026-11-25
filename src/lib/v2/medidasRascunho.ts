// Medidas do provador (versão 2), parte sem estado: os campos, os textos e as
// contas sobre o que a cliente digitou. Pode ser usada no servidor. O
// armazém que guarda as medidas no aparelho fica em medidasCliente.ts.

import { medidaValida, sugerirTamanho, type LinhaTamanho, type Medidas } from "@/data/medidas";

export type CampoMedida = "busto" | "cintura" | "quadril";

export const CAMPOS: CampoMedida[] = ["busto", "cintura", "quadril"];

export const NOME_CAMPO: Record<CampoMedida, string> = {
  busto: "Busto",
  cintura: "Cintura",
  quadril: "Quadril",
};

/** Onde passar a fita, uma linha por medida (aparece com o campo em foco). */
export const COMO_MEDIR: Record<CampoMedida, string> = {
  busto: "Meça na parte mais cheia do peito.",
  cintura: "Meça na parte mais fina da cintura.",
  quadril: "Meça na parte mais larga do quadril.",
};

/** O que a cliente digitou (texto, como está no campo) e se prefere vídeo. */
export type Rascunho = Record<CampoMedida, string> & { porVideo: boolean };

export const RASCUNHO_VAZIO: Rascunho = { busto: "", cintura: "", quadril: "", porVideo: false };

/** Só os dígitos (até 3) do que foi digitado. */
export function limparNumero(texto: string): string {
  return texto.replace(/\D/g, "").slice(0, 3);
}

/** Texto do campo para número (undefined se vazio). */
export function numero(texto: string): number | undefined {
  const n = Number.parseInt(texto, 10);
  return Number.isFinite(n) ? n : undefined;
}

/** As medidas em número, só as válidas (fora de 50 a 160 cm não entram). */
export function medidasDoRascunho(r: Rascunho): Medidas {
  const m: Medidas = {};
  for (const c of CAMPOS) {
    const v = numero(r[c]);
    if (medidaValida(v)) m[c] = v;
  }
  return m;
}

/** Algum campo com número fora do aceito (para avisar "confira"). */
export function camposForaDoLimite(r: Rascunho): CampoMedida[] {
  return CAMPOS.filter((c) => r[c] !== "" && !medidaValida(numero(r[c])));
}

/** Busto e cintura válidos: o mínimo que a Gio precisa para começar a peça. */
export function rascunhoCompleto(r: Rascunho): boolean {
  const m = medidasDoRascunho(r);
  return m.busto !== undefined && m.cintura !== undefined;
}

export function tamanhoDoRascunho(r: Rascunho): LinhaTamanho | null {
  return sugerirTamanho(medidasDoRascunho(r));
}

/** "86 · 68 · 96 cm" (só as que existem). */
export function resumoMedidas(m: Medidas | undefined): string {
  if (!m) return "";
  const partes = CAMPOS.map((c) => m[c]).filter((v): v is number => typeof v === "number");
  return partes.length ? `${partes.join(" · ")} cm` : "";
}
