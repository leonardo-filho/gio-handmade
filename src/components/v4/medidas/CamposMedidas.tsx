"use client";

import { useId, useState } from "react";
import { FOCO, HOVER } from "@/components/v3/estrutura/estilo";
import { useMedidas, tamanhoSugerido, type MedidasDigitadas } from "./armazem";
import TabelaMedidas from "./TabelaMedidas";

const CAMPOS: { chave: "busto" | "cintura" | "quadril"; rotulo: string }[] = [
  { chave: "busto", rotulo: "Busto" },
  { chave: "cintura", rotulo: "Cintura" },
  { chave: "quadril", rotulo: "Quadril" },
];

// Busto, cintura e quadril de uma peça sob medida, a opção de mandar por vídeo
// e a tabela de medidas (abre ali mesmo). Usado na ficha da peça e na etapa de
// medidas do checkout; os dois gravam no mesmo lugar.
export default function CamposMedidas({ id, erro }: { id: string; erro?: string | null }) {
  const [medidas, alterar] = useMedidas(id);
  const [tabela, setTabela] = useState(false);
  const base = useId();
  const sugerido = tamanhoSugerido(medidas);
  const porVideo = Boolean(medidas.porVideo);

  return (
    <div className="text-[#1B4965]">
      {!porVideo && (
        <div className="grid grid-cols-3 gap-2">
          {CAMPOS.map((c) => (
            <Campo
              key={c.chave}
              id={`${base}-${c.chave}`}
              rotulo={c.rotulo}
              valor={medidas[c.chave] ?? ""}
              invalido={Boolean(erro) && c.chave !== "quadril" && !medidas[c.chave]}
              aoMudar={(v) => alterar({ [c.chave]: v } as Partial<MedidasDigitadas>)}
            />
          ))}
        </div>
      )}

      <p aria-live="polite" className="mt-2 min-h-[18px] text-[12px] leading-[18px] text-brand-muted">
        {porVideo
          ? "A Gio manda um vídeo explicando como medir."
          : sugerido
            ? `Mais perto do ${sugerido.tamanho} (${sugerido.numero}) da tabela. A peça sai com as suas medidas.`
            : ""}
      </p>
      {erro && (
        <p role="alert" className="mt-1 text-[12px] leading-[18px] text-[#a33]">
          {erro}
        </p>
      )}

      <div className="mt-1 flex flex-wrap items-center justify-between gap-x-4">
        <label className="flex min-h-11 cursor-pointer items-center gap-2.5 text-[13px]">
          <input
            type="checkbox"
            checked={porVideo}
            onChange={(e) => alterar({ porVideo: e.target.checked })}
            className={`h-[18px] w-[18px] shrink-0 accent-[#1B4965] ${FOCO}`}
          />
          Prefiro mandar por vídeo depois
        </label>
        <button
          type="button"
          aria-expanded={tabela}
          aria-controls={`${base}-tabela`}
          onClick={() => setTabela((t) => !t)}
          className={`flex min-h-11 items-center text-[12px] underline underline-offset-4 ${HOVER} ${FOCO}`}
        >
          {tabela ? "Fechar tabela" : "Tabela de medidas"}
        </button>
      </div>
      <div id={`${base}-tabela`} hidden={!tabela} className="pb-2">
        <TabelaMedidas destaque={porVideo ? null : sugerido?.tamanho} />
      </div>
    </div>
  );
}

function Campo({
  id,
  rotulo,
  valor,
  invalido,
  aoMudar,
}: {
  id: string;
  rotulo: string;
  valor: string;
  invalido: boolean;
  aoMudar: (v: string) => void;
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-[10px] uppercase leading-4 tracking-[0.14em]">
        {rotulo}
      </label>
      <div className="relative mt-1">
        <input
          id={id}
          type="text"
          inputMode="decimal"
          autoComplete="off"
          maxLength={5}
          value={valor}
          aria-invalid={invalido || undefined}
          onChange={(e) => aoMudar(e.target.value.replace(/[^\d.,]/g, ""))}
          className="nums-preco h-11 w-full rounded-[4px] border border-[#1B4965]/60 bg-transparent pl-3 pr-8 text-[16px] text-[#1B4965] outline-none focus:border-[#1B4965] focus:ring-1 focus:ring-[#1B4965] aria-[invalid]:border-[#a33]"
        />
        <span aria-hidden className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[12px] text-brand-muted">
          cm
        </span>
      </div>
    </div>
  );
}
