"use client";

import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from "react";
import { TABELA_MEDIDAS, formatarFaixa } from "@/data/medidas";
import Gaveta from "@/components/v3/estrutura/Gaveta";
import { IconeFechar } from "@/components/v3/estrutura/Icones";
import { FOCO, HOVER, LINHA } from "@/components/v3/estrutura/estilo";
import Corpo, { type Parte } from "../produto/Corpo";
import { tamanhoSugerido, type MedidasDigitadas } from "./medidasSalvas";

// Gaveta "Tabela de medidas" (pela direita, como a sacola). Mora no layout,
// fora do <main>, e abre de qualquer lugar pelo useTabela(): a página da peça
// e a etapa de medidas do checkout. Quem abre pode mandar as medidas que a
// cliente já digitou, e a linha do tamanho sugerido fica marcada.

type Valor = {
  aberta: boolean;
  abrir: (medidas?: MedidasDigitadas | null) => void;
  fechar: () => void;
  medidas: MedidasDigitadas | null;
};

const Contexto = createContext<Valor | null>(null);

export function TabelaProvider({ children }: { children: ReactNode }) {
  const [estado, setEstado] = useState<{ aberta: boolean; medidas: MedidasDigitadas | null }>({
    aberta: false,
    medidas: null,
  });
  const abrir = useCallback((medidas?: MedidasDigitadas | null) => setEstado({ aberta: true, medidas: medidas ?? null }), []);
  const fechar = useCallback(() => setEstado((e) => ({ ...e, aberta: false })), []);
  const valor = useMemo(() => ({ ...estado, abrir, fechar }), [estado, abrir, fechar]);
  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>;
}

export function useTabela(): Valor {
  const ctx = useContext(Contexto);
  if (!ctx) throw new Error("useTabela precisa estar dentro de <TabelaProvider>");
  return ctx;
}

const COLUNAS: { parte: Parte; nome: string }[] = [
  { parte: "busto", nome: "Busto" },
  { parte: "cintura", nome: "Cintura" },
  { parte: "quadril", nome: "Quadril" },
];

export function GavetaTabela() {
  const { aberta, fechar, medidas } = useTabela();
  const fecharRef = useRef<HTMLButtonElement>(null);
  const [destaque, setDestaque] = useState<Parte | null>(null);
  const sugerido = medidas ? tamanhoSugerido(medidas) : null;

  return (
    <Gaveta aberta={aberta} lado="direita" aoFechar={fechar} rotulo="Tabela de medidas" focoInicial={fecharRef}>
      <div className={`relative flex h-14 shrink-0 items-center justify-center border-b ${LINHA}`}>
        <h2 className="text-[11px] uppercase tracking-[0.16em]">Tabela de medidas</h2>
        <button
          ref={fecharRef}
          type="button"
          onClick={fechar}
          aria-label="Fechar tabela de medidas"
          className={`absolute right-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-[4px] md:right-3 ${HOVER} ${FOCO}`}
        >
          <IconeFechar className="h-5 w-5" />
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-8 pt-6 md:px-6">
        <Corpo destaque={destaque} className="mx-auto block h-auto w-full max-w-[300px]" />

        <table className="mt-6 w-full border-collapse text-left text-[13px]">
          <caption className="pb-3 text-left text-[12px] leading-[18px] text-brand-muted">
            Medidas do corpo, em centímetros.
          </caption>
          <thead>
            <tr className={`border-b ${LINHA}`}>
              <th scope="col" className="h-11 pr-2 text-[10px] font-normal uppercase tracking-[0.14em]">
                Tamanho
              </th>
              {COLUNAS.map((c) => (
                <th key={c.parte} scope="col" className="p-0 font-normal">
                  <button
                    type="button"
                    aria-pressed={destaque === c.parte}
                    onClick={() => setDestaque(c.parte)}
                    onMouseEnter={() => setDestaque(c.parte)}
                    onFocus={() => setDestaque(c.parte)}
                    className={`flex h-11 w-full items-center rounded-[4px] text-[10px] uppercase tracking-[0.14em] underline-offset-4 aria-pressed:underline ${HOVER} ${FOCO}`}
                  >
                    {c.nome}
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {TABELA_MEDIDAS.map((linha) => {
              const marcada = sugerido?.tamanho === linha.tamanho;
              return (
                <tr key={linha.tamanho} className={`border-b ${LINHA} ${marcada ? "bg-[#C8E1E4]" : ""}`}>
                  <th scope="row" className="h-11 pl-2 pr-2 font-normal">
                    <span className="font-[family-name:var(--font-serif)] text-[16px]">{linha.tamanho}</span>
                    <span className="nums-preco ml-1.5 text-[12px] text-brand-muted">{linha.numero}</span>
                  </th>
                  {COLUNAS.map((c) => (
                    <td key={c.parte} className="nums-preco">
                      {formatarFaixa(linha[c.parte])}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>

        {sugerido && (
          <p aria-live="polite" className="mt-4 text-[13px] leading-5">
            Pelas suas medidas, o tamanho de referência é{" "}
            <span className="font-[family-name:var(--font-serif)] text-[16px]">{sugerido.tamanho}</span>.
          </p>
        )}
        <p className="mt-4 text-[12px] leading-[18px] text-brand-muted">
          Na peça sob medida, a Gio usa as suas medidas. A tabela serve de referência.
        </p>
      </div>
    </Gaveta>
  );
}
