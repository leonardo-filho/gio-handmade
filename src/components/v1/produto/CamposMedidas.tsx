"use client";

import { useId } from "react";
import { FOCO, HOVER } from "@/components/v3/estrutura/estilo";
import { useTabela } from "../estado/TabelaMedidas";
import { campoInvalido, tamanhoSugerido, useMedidas, type MedidasDigitadas } from "../estado/medidasSalvas";
import { IconeRegua } from "../icones";

// Os três campos do sob medida (busto, cintura e quadril, em cm), a sugestão
// de tamanho pela tabela e a opção de mandar as medidas por vídeo depois.
// Usado aberto na etapa 3 do checkout e dentro da linha recolhida da página
// da peça. O valor mora em medidasSalvas (o mesmo nos dois lugares).

const CAMPOS: { chave: "busto" | "cintura" | "quadril"; nome: string }[] = [
  { chave: "busto", nome: "Busto" },
  { chave: "cintura", nome: "Cintura" },
  { chave: "quadril", nome: "Quadril" },
];

type Props = {
  produtoId: string;
  /** Mostra o erro de "faltam medidas" (o checkout liga ao tentar seguir). */
  exigir?: boolean;
  /** Link para a tabela ao lado da opção de vídeo (a página da peça já tem o seu). */
  comTabela?: boolean;
};

export default function CamposMedidas({ produtoId, exigir = false, comTabela = true }: Props) {
  const base = useId();
  const [medidas, mudar] = useMedidas(produtoId);
  const { abrir } = useTabela();
  const sugerido = tamanhoSugerido(medidas);
  const faltam = exigir && !medidas.porVideo && (!medidas.busto.trim() || !medidas.cintura.trim());

  return (
    <div>
      <div className="grid grid-cols-3 gap-2">
        {CAMPOS.map((c) => {
          const id = `${base}-${c.chave}`;
          const valor = medidas[c.chave];
          const invalido = campoInvalido(valor) || (faltam && c.chave !== "quadril" && !valor.trim());
          return (
            <div key={c.chave}>
              <label htmlFor={id} className="block text-[10px] uppercase leading-4 tracking-[0.14em]">
                {c.nome}
                {c.chave === "quadril" && <span className="sr-only"> (opcional)</span>}
              </label>
              <div className="relative mt-1">
                <input
                  id={id}
                  inputMode="decimal"
                  autoComplete="off"
                  value={valor}
                  maxLength={5}
                  onChange={(e) => mudar({ [c.chave]: e.target.value } as Partial<MedidasDigitadas>)}
                  aria-invalid={invalido || undefined}
                  aria-describedby={`${base}-nota`}
                  className="h-11 w-full rounded-[4px] border border-[#1B4965]/60 bg-transparent pl-3 pr-9 text-[16px] text-[#1B4965] outline-none focus:border-[#1B4965] focus:ring-1 focus:ring-[#1B4965] aria-invalid:border-[#a33] nums-preco"
                />
                <span aria-hidden className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[12px] text-brand-muted">
                  cm
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div id={`${base}-nota`} aria-live="polite" className="mt-2 min-h-[18px] text-[12px] leading-[18px]">
        {CAMPOS.some((c) => campoInvalido(medidas[c.chave])) ? (
          <p className="text-[#a33]">Use centímetros, entre 50 e 160.</p>
        ) : faltam ? (
          <p className="text-[#a33]">Informe busto e cintura, ou escolha mandar por vídeo.</p>
        ) : sugerido ? (
          <p>
            Tamanho de referência:{" "}
            <span className="font-[family-name:var(--font-serif)] text-[15px]">
              {sugerido.tamanho} ({sugerido.numero})
            </span>
          </p>
        ) : (
          <p className="text-brand-muted">Busto e cintura bastam. O quadril ajuda nas saias e conjuntos.</p>
        )}
      </div>

      <div className="mt-1 flex flex-wrap items-center justify-between gap-x-4">
        <label className="relative -ml-1 flex min-h-11 cursor-pointer items-center gap-2.5 pl-1 text-[13px]">
          <input
            type="checkbox"
            checked={medidas.porVideo}
            onChange={(e) => mudar({ porVideo: e.target.checked })}
            className="peer h-[18px] w-[18px] shrink-0 cursor-pointer appearance-none rounded-[3px] border border-[#1B4965]/60 checked:border-[#1B4965] checked:bg-[#1B4965] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#b8902a]"
          />
          <svg
            aria-hidden
            viewBox="0 0 12 12"
            className="pointer-events-none absolute left-[7px] hidden h-3 w-3 text-[#EDE7D9] peer-checked:block"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.8}
          >
            <path d="M2.5 6.2 5 8.5l4.5-5" />
          </svg>
          Prefiro mandar por vídeo depois
        </label>
        {comTabela && (
        <button
          type="button"
          onClick={() => abrir(medidas)}
          className={`-mr-1 flex min-h-11 items-center gap-1.5 rounded-[4px] px-1 text-[12px] underline underline-offset-4 ${HOVER} ${FOCO}`}
        >
          <IconeRegua className="h-4 w-4" />
          Tabela de medidas
        </button>
        )}
      </div>
    </div>
  );
}
