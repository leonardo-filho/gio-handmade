"use client";

import { useId, useState } from "react";
import { formatarFaixa, TABELA_MEDIDAS, type Faixa } from "@/data/medidas";
import {
  CAMPOS,
  COMO_MEDIR,
  NOME_CAMPO,
  camposForaDoLimite,
  limparNumero,
  medidasDoRascunho,
  tamanhoDoRascunho,
  type CampoMedida,
  type Rascunho,
} from "@/lib/v2/medidasRascunho";
import { FOCO } from "@/components/v3/estrutura/estilo";
import Silhueta from "./Silhueta";

// Provador de medidas (versão 2). A cliente digita busto, cintura e quadril
// numa linha alinhada às colunas da tabela PP a GG: a faixa de cada medida
// acende na coluna dela, a linha do tamanho sugerido fica menta e o manequim
// ao lado muda de forma. Com "prefiro mandar por vídeo", os campos param e a
// mensagem diz o que acontece depois.
//
// Controlado: quem usa guarda o rascunho (a página da peça grava no aparelho;
// o checkout, em cada peça da sacola).

type Props = {
  valor: Rascunho;
  aoMudar: (novo: Rascunho) => void;
  /** Sem manequim, título e tabela (checkout, uma peça embaixo da outra). */
  compacto?: boolean;
  /** Nome da peça, para os rótulos do leitor de tela no checkout. */
  peca?: string;
};

const dentro = (v: number | undefined, f: Faixa) => v !== undefined && v >= f.min && v <= f.max;

export default function Provador({ valor, aoMudar, compacto = false, peca }: Props) {
  const id = useId();
  const [ativo, setAtivo] = useState<CampoMedida | null>(null);
  const medidas = medidasDoRascunho(valor);
  const sugestao = valor.porVideo ? null : tamanhoDoRascunho(valor);
  const fora = camposForaDoLimite(valor);
  const digitados = CAMPOS.filter((c) => medidas[c] !== undefined);

  // Alguma medida não cabe na linha sugerida: ou fica entre dois tamanhos, ou
  // passa da tabela (abaixo do PP ou acima do GG).
  const menor = TABELA_MEDIDAS[0];
  const maior = TABELA_MEDIDAS[TABELA_MEDIDAS.length - 1];
  const foraDaTabela = digitados.some((c) => medidas[c]! < menor[c].min || medidas[c]! > maior[c].max);
  const entreTamanhos = sugestao !== null && digitados.some((c) => !dentro(medidas[c], sugestao[c]));

  function mudar(campo: CampoMedida, texto: string) {
    aoMudar({ ...valor, [campo]: limparNumero(texto) });
  }

  const dica = fora.length
    ? `Confira ${fora.length === 1 ? `o ${NOME_CAMPO[fora[0]].toLowerCase()}` : "as medidas"}: em centímetros, entre 50 e 160.`
    : ativo
      ? COMO_MEDIR[ativo]
      : foraDaTabela
        ? "Fora da tabela? Sob medida, a peça segue as suas medidas."
        : entreTamanhos
          ? "Entre dois tamanhos? Sob medida, a peça segue as suas medidas."
          : "";

  const colunas = "grid grid-cols-[52px_1fr_1fr_1fr] gap-x-1.5";

  return (
    <div className="text-[#1B4965]">
      {!compacto && (
        <div className="flex items-center gap-4">
          <Silhueta medidas={medidas} ativo={ativo} apagado={valor.porVideo} className="h-[168px] w-[104px] shrink-0 md:h-[184px] md:w-[114px]" />
          <div className="min-w-0" aria-live="polite">
            <p className="text-[10px] uppercase leading-3 tracking-[0.14em] text-brand-muted">Provador</p>
            {valor.porVideo ? (
              <p className="mt-2 font-[family-name:var(--font-serif)] text-[20px] leading-[26px]">
                Você manda as medidas por vídeo depois do pedido.
              </p>
            ) : sugestao ? (
              <>
                <p className="mt-2 text-[12px] leading-4">Seu tamanho de referência</p>
                <p className="nums-preco mt-1 font-[family-name:var(--font-serif)] text-[40px] leading-none">
                  {sugestao.tamanho}
                  <span className="ml-2 align-middle text-[16px] text-brand-muted">{sugestao.numero}</span>
                </p>
              </>
            ) : (
              <p className="mt-2 font-[family-name:var(--font-serif)] text-[20px] leading-[26px]">Digite suas medidas e veja seu tamanho.</p>
            )}
            <p className="mt-2 text-[12px] leading-[18px] text-brand-muted">A peça é feita com as suas medidas; o tamanho é só referência.</p>
          </div>
        </div>
      )}

      {/* Linha das medidas, alinhada às colunas da tabela. */}
      <div className={`${colunas} ${compacto ? "" : "mt-4"}`}>
        <span aria-hidden />
        {CAMPOS.map((c) => (
          <label key={c} htmlFor={`${id}-${c}`} className="pb-1 text-center text-[10px] uppercase leading-3 tracking-[0.12em]">
            {NOME_CAMPO[c]}
            {peca && <span className="sr-only"> de {peca}, em centímetros</span>}
          </label>
        ))}
        <span className="flex items-center text-[12px] leading-4 text-brand-muted">Você</span>
        {CAMPOS.map((c) => {
          const invalido = fora.includes(c);
          return (
            <div key={c} className="relative">
              <input
                id={`${id}-${c}`}
                inputMode="numeric"
                autoComplete="off"
                enterKeyHint="next"
                placeholder="00"
                value={valor[c]}
                disabled={valor.porVideo}
                onChange={(e) => mudar(c, e.target.value)}
                onFocus={() => setAtivo(c)}
                onBlur={() => setAtivo((a) => (a === c ? null : a))}
                aria-invalid={invalido || undefined}
                aria-describedby={`${id}-dica`}
                className={`nums-preco h-11 w-full min-w-0 rounded-[4px] border bg-[#EDE7D9] pl-2 pr-7 text-center text-[16px] text-[#1B4965] outline-none placeholder:text-[#1B4965]/35 focus:border-[#1B4965] focus:ring-1 focus:ring-[#1B4965] disabled:opacity-40 ${
                  invalido ? "border-[#a33]" : "border-[#1B4965]/60"
                }`}
              />
              <span aria-hidden className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[11px] text-brand-muted">
                cm
              </span>
            </div>
          );
        })}
      </div>

      {/* No checkout (compacto), uma linha com o tamanho de referência no lugar da tabela. */}
      {compacto && (
        <p aria-live="polite" className="mt-2 min-h-5 text-[13px] leading-5">
          {valor.porVideo ? (
            <span className="text-brand-muted">Você manda as medidas por vídeo depois do pedido.</span>
          ) : sugestao ? (
            <>
              Tamanho de referência:{" "}
              <span className="nums-preco font-[family-name:var(--font-serif)] text-[16px] font-medium">
                {sugestao.tamanho} ({sugestao.numero})
              </span>
            </>
          ) : null}
        </p>
      )}

      {/* Tabela PP a GG: a faixa de cada medida acende; a linha sugerida fica menta. */}
      {!compacto && (
        <table
          className={`mt-2 w-full table-fixed border-collapse text-[13px] leading-none motion-safe:transition-opacity motion-safe:duration-200 ${
            valor.porVideo ? "opacity-40" : ""
          }`}
        >
          <caption className="sr-only">Tabela de medidas em centímetros, do PP ao GG</caption>
          <colgroup>
            <col className="w-[58px]" />
            <col />
            <col />
            <col />
          </colgroup>
          <thead className="sr-only">
            <tr>
              <th scope="col">Tamanho</th>
              {CAMPOS.map((c) => (
                <th key={c} scope="col">
                  {NOME_CAMPO[c]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {TABELA_MEDIDAS.map((linha) => {
              const sugerida = sugestao?.tamanho === linha.tamanho;
              return (
                <tr
                  key={linha.tamanho}
                  aria-current={sugerida || undefined}
                  className={`border-b border-[#1B4965]/10 motion-safe:transition-colors motion-safe:duration-200 ${sugerida ? "bg-[#C8E1E4]" : ""}`}
                >
                  <th scope="row" className="h-8 pl-2 text-left font-normal">
                    <span className={sugerida ? "font-[family-name:var(--font-serif)] text-[15px] font-medium" : ""}>{linha.tamanho}</span>
                    <span className="nums-preco ml-1.5 text-[11px] text-brand-muted">{linha.numero}</span>
                  </th>
                  {CAMPOS.map((c) => {
                    const acende = !valor.porVideo && dentro(medidas[c], linha[c]);
                    return (
                      <td key={c} className="h-8 p-0.5 text-center">
                        <span
                          className={`nums-preco inline-flex h-6 items-center justify-center rounded-full px-2.5 ${
                            acende ? "bg-[#1B4965] text-[#EDE7D9]" : sugerida ? "text-[#1B4965]" : "text-brand-muted"
                          }`}
                        >
                          {formatarFaixa(linha[c])}
                        </span>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      )}

      <p id={`${id}-dica`} aria-live="polite" className={`mt-2 min-h-[18px] text-[12px] leading-[18px] ${fora.length ? "text-[#a33]" : "text-brand-muted"}`}>
        {dica}
      </p>

      <label className="mt-1 flex min-h-11 cursor-pointer items-center gap-3 text-[13px] leading-5">
        <input
          type="checkbox"
          checked={valor.porVideo}
          onChange={(e) => aoMudar({ ...valor, porVideo: e.target.checked })}
          className={`h-5 w-5 shrink-0 cursor-pointer appearance-none rounded-[3px] border border-[#1B4965]/60 bg-[#EDE7D9] bg-center bg-no-repeat checked:border-[#1B4965] checked:bg-[#1B4965] checked:bg-[url("data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%2016%2016'%3E%3Cpath%20d='M3.5%208.5l3%203%206-7'%20fill='none'%20stroke='%23EDE7D9'%20stroke-width='1.8'%20stroke-linecap='round'%20stroke-linejoin='round'/%3E%3C/svg%3E")] ${FOCO}`}
        />
        Prefiro mandar minhas medidas por vídeo depois
      </label>
    </div>
  );
}
