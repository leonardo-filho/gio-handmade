"use client";

import { useId, useState } from "react";
import {
  LIMITES_MEDIDA,
  TABELA_MEDIDAS,
  formatarFaixa,
  medidaValida,
  sugerirTamanho,
  type LinhaTamanho,
  type Medidas,
} from "@/data/medidas";
import { MEDIDAS_INTRO } from "@/data/conteudo-loja";
import { CAMPO, FOCO, HOVER, LINHA } from "../estrutura/estilo";

type PropsSeletor = {
  medidas: Medidas;
  medidasPorVideo: boolean;
  tamanhoReferencia?: string;
  aoMudarMedidas: (novas: Medidas, ref?: string) => void;
  aoMudarPorVideo: (porVideo: boolean) => void;
  compacto?: boolean;
};

// Bloco de medidas do sob medida: campos de busto, cintura e quadril em cm,
// sugestao automatica do tamanho de referencia pela tabela (sugerirTamanho),
// opcao "Prefiro mandar por video depois" e acesso direto a tabela PP a GG.
export function SeletorMedidasSobMedida({
  medidas,
  medidasPorVideo,
  tamanhoReferencia,
  aoMudarMedidas,
  aoMudarPorVideo,
  compacto = false,
}: PropsSeletor) {
  const uid = useId();
  const [mostrarTabela, setMostrarTabela] = useState(false);

  const sugerido: LinhaTamanho | null = sugerirTamanho(medidas);
  const refAtiva = sugerido?.tamanho ?? tamanhoReferencia;

  function atualizarCampo(campo: keyof Medidas, bruto: string) {
    const limpo = bruto.replace(/\D/g, "").slice(0, 3);
    const num = limpo ? Number(limpo) : undefined;
    const novas: Medidas = {
      ...medidas,
      [campo]: num,
    };
    const novaSugestao = sugerirTamanho(novas)?.tamanho;
    aoMudarMedidas(novas, novaSugestao);
  }

  function aplicarLinhaReferencia(linha: LinhaTamanho) {
    const m: Medidas = {
      busto: Math.round((linha.busto.min + linha.busto.max) / 2),
      cintura: Math.round((linha.cintura.min + linha.cintura.max) / 2),
      quadril: Math.round((linha.quadril.min + linha.quadril.max) / 2),
    };
    aoMudarPorVideo(false);
    aoMudarMedidas(m, linha.tamanho);
  }

  const algumForaDaFaixa = (["busto", "cintura", "quadril"] as const).some((c) => {
    const v = medidas[c];
    return typeof v === "number" && !medidaValida(v);
  });

  return (
    <div className={`rounded-[4px] border p-3.5 text-[#1B4965] ${LINHA}`}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-[11px] uppercase tracking-[0.14em]">Medidas do sob medida</p>
        <button
          type="button"
          onClick={() => setMostrarTabela((v) => !v)}
          aria-expanded={mostrarTabela}
          className={`inline-flex min-h-9 items-center rounded-[4px] px-2 text-[12px] text-brand-muted underline underline-offset-4 ${HOVER} ${FOCO}`}
        >
          {mostrarTabela ? "Ocultar tabela" : "Tabela de medidas (PP a GG)"}
        </button>
      </div>

      {/* Escolha: informar medidas em cm agora ou mandar por video depois */}
      <div role="radiogroup" aria-label="Como enviar as medidas" className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
        <button
          type="button"
          role="radio"
          aria-checked={!medidasPorVideo}
          onClick={() => aoMudarPorVideo(false)}
          className={`flex min-h-11 items-center justify-center rounded-[4px] border px-3 text-[11px] uppercase tracking-[0.12em] ${FOCO} ${
            !medidasPorVideo
              ? "border-[#1B4965] bg-[#C8E1E4] text-[#1B4965]"
              : `border-[#1B4965]/40 text-[#1B4965] ${HOVER}`
          }`}
        >
          Informar medidas (cm)
        </button>
        <button
          type="button"
          role="radio"
          aria-checked={medidasPorVideo}
          onClick={() => aoMudarPorVideo(true)}
          className={`flex min-h-11 items-center justify-center rounded-[4px] border px-3 text-[11px] uppercase tracking-[0.12em] ${FOCO} ${
            medidasPorVideo
              ? "border-[#1B4965] bg-[#C8E1E4] text-[#1B4965]"
              : `border-[#1B4965]/40 text-[#1B4965] ${HOVER}`
          }`}
        >
          Prefiro mandar por vídeo depois
        </button>
      </div>

      {medidasPorVideo ? (
        <p className="mt-3 text-[12px] leading-[18px] text-brand-muted">
          Tudo certo: após o pedido, a Gio envia um vídeo explicando como tirar suas medidas em casa.
        </p>
      ) : (
        <div className="mt-3">
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label htmlFor={`${uid}-busto`} className="block text-[11px] text-brand-muted">
                Busto (cm)
              </label>
              <input
                id={`${uid}-busto`}
                type="text"
                inputMode="numeric"
                placeholder="Ex.: 84"
                value={medidas.busto !== undefined ? String(medidas.busto) : ""}
                onChange={(e) => atualizarCampo("busto", e.target.value)}
                className={`mt-1 w-full ${CAMPO}`}
              />
            </div>
            <div>
              <label htmlFor={`${uid}-cintura`} className="block text-[11px] text-brand-muted">
                Cintura (cm)
              </label>
              <input
                id={`${uid}-cintura`}
                type="text"
                inputMode="numeric"
                placeholder="Ex.: 65"
                value={medidas.cintura !== undefined ? String(medidas.cintura) : ""}
                onChange={(e) => atualizarCampo("cintura", e.target.value)}
                className={`mt-1 w-full ${CAMPO}`}
              />
            </div>
            <div>
              <label htmlFor={`${uid}-quadril`} className="block text-[11px] text-brand-muted">
                Quadril (cm)
              </label>
              <input
                id={`${uid}-quadril`}
                type="text"
                inputMode="numeric"
                placeholder="Ex.: 93"
                value={medidas.quadril !== undefined ? String(medidas.quadril) : ""}
                onChange={(e) => atualizarCampo("quadril", e.target.value)}
                className={`mt-1 w-full ${CAMPO}`}
              />
            </div>
          </div>

          <div aria-live="polite" className="mt-2.5 text-[12px] leading-[18px]">
            {algumForaDaFaixa ? (
              <p className="text-[#a33]">
                Confira os valores: informe medidas entre {LIMITES_MEDIDA.min} e {LIMITES_MEDIDA.max} cm.
              </p>
            ) : sugerido ? (
              <p className="text-[#1B4965]">
                Tamanho de referência:{" "}
                <strong className="font-serif text-[15px] font-medium">
                  {sugerido.tamanho} ({sugerido.numero})
                </strong>{" "}
                <span className="text-brand-muted">· feita com os seus centímetros.</span>
              </p>
            ) : (
              !compacto && (
                <p className="text-brand-muted">
                  Opcional agora: você pode preencher aqui, escolher na tabela ou informar no checkout.
                </p>
              )
            )}
          </div>
        </div>
      )}

      {mostrarTabela && (
        <div className={`mt-3 border-t pt-3 ${LINHA}`}>
          <TabelaMedidas
            destaque={refAtiva}
            aoEscolherLinha={aplicarLinhaReferencia}
          />
        </div>
      )}
    </div>
  );
}

type PropsTabela = {
  destaque?: string;
  aoEscolherLinha?: (linha: LinhaTamanho) => void;
};

// Tabela de medidas oficial (src/data/medidas.ts): PP (34) a GG (42) com
// busto, cintura e quadril em cm.
export default function TabelaMedidas({ destaque, aoEscolherLinha }: PropsTabela) {
  return (
    <div className="text-[#1B4965]">
      <p className="text-[12px] leading-[18px] text-brand-muted">{MEDIDAS_INTRO}</p>

      <div className="mt-3 overflow-x-auto">
        <table className="w-full border-collapse text-left text-[12px]">
          <thead>
            <tr className={`border-b text-[10px] uppercase tracking-[0.12em] text-brand-muted ${LINHA}`}>
              <th className="py-2 pr-2 font-normal">Tam.</th>
              <th className="px-2 py-2 font-normal">Nº</th>
              <th className="px-2 py-2 font-normal">Busto (cm)</th>
              <th className="px-2 py-2 font-normal">Cintura (cm)</th>
              <th className="py-2 pl-2 font-normal">Quadril (cm)</th>
            </tr>
          </thead>
          <tbody className="nums-preco">
            {TABELA_MEDIDAS.map((linha) => {
              const ativa = destaque === linha.tamanho;
              return (
                <tr
                  key={linha.tamanho}
                  onClick={aoEscolherLinha ? () => aoEscolherLinha(linha) : undefined}
                  className={`border-b ${LINHA} ${
                    ativa ? "bg-[#C8E1E4] font-medium text-[#1B4965]" : "text-[#1B4965]"
                  } ${aoEscolherLinha ? "cursor-pointer hover:bg-[#1B4965]/5" : ""}`}
                >
                  <td className="py-2 pr-2 font-serif text-[14px] font-medium">{linha.tamanho}</td>
                  <td className="px-2 py-2 text-brand-muted">{linha.numero}</td>
                  <td className="px-2 py-2">{formatarFaixa(linha.busto)}</td>
                  <td className="px-2 py-2">{formatarFaixa(linha.cintura)}</td>
                  <td className="py-2 pl-2">{formatarFaixa(linha.quadril)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {aoEscolherLinha && (
        <p className="mt-2 text-[11px] text-brand-muted">
          Toque em um tamanho da tabela para preencher as medidas médias de referência.
        </p>
      )}
    </div>
  );
}
