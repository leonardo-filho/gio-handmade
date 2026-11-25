"use client";

import type { InputHTMLAttributes, ReactNode } from "react";
import FotoSuave from "@/components/v3/estrutura/FotoSuave";
import { FOCO, HOVER, LINHA } from "@/components/v3/estrutura/estilo";
import type { ItemPedido, Valores } from "@/lib/checkout";
import { formatBRLPreco } from "@/lib/format";
import { IconeCheck } from "../icones";

// Peças do checkout da versão 1: campo com rótulo e erro, a casca de cada
// etapa (número, título, resumo quando pronta e "Alterar"), a escolha em
// cartão (forma de pagamento e quanto pagar agora) e o resumo do pedido.

export const ERRO = "text-[#a33]";

type CampoProps = Omit<InputHTMLAttributes<HTMLInputElement>, "id"> & {
  id: string;
  rotulo: string;
  erro?: string;
  opcional?: boolean;
  classe?: string;
};

export function Campo({ id, rotulo, erro, opcional, classe = "", ...input }: CampoProps) {
  return (
    <div className={classe}>
      <label htmlFor={id} className="block text-[12px] leading-4">
        {rotulo}
        {opcional && <span className="text-brand-muted"> (opcional)</span>}
      </label>
      <input
        id={id}
        {...input}
        aria-invalid={erro ? true : undefined}
        aria-describedby={erro ? `${id}-erro` : input["aria-describedby"]}
        className="mt-1.5 h-11 w-full rounded-[4px] border border-[#1B4965]/60 bg-transparent px-3 text-[16px] text-[#1B4965] outline-none focus:border-[#1B4965] focus:ring-1 focus:ring-[#1B4965] aria-invalid:border-[#a33] aria-invalid:focus:ring-[#a33] disabled:opacity-60"
      />
      {erro && (
        <p id={`${id}-erro`} className={`mt-1 text-[12px] leading-4 ${ERRO}`}>
          {erro}
        </p>
      )}
    </div>
  );
}

export type EstadoEtapa = "ativa" | "feita" | "futura";

type EtapaProps = {
  numero: number;
  titulo: string;
  estado: EstadoEtapa;
  /** Resumo de uma linha ou duas quando a etapa está pronta. */
  resumo?: ReactNode;
  aoAlterar?: () => void;
  children?: ReactNode;
};

export function Etapa({ numero, titulo, estado, resumo, aoAlterar, children }: EtapaProps) {
  const ativa = estado === "ativa";
  return (
    <section aria-labelledby={`etapa-${numero}`} aria-current={ativa ? "step" : undefined} className={`scroll-mt-4 border-b py-5 ${LINHA}`} id={`etapa-${numero}-bloco`}>
      <div className="flex items-start gap-3">
        <span
          aria-hidden
          className={`nums-preco mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[12px] ${
            estado === "futura" ? "border border-[#1B4965]/30 text-brand-muted" : "bg-[#1B4965] text-[#EDE7D9]"
          }`}
        >
          {estado === "feita" ? <IconeCheck className="h-3.5 w-3.5" /> : numero}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex min-h-7 items-center justify-between gap-3">
            <h2
              id={`etapa-${numero}`}
              className={`font-[family-name:var(--font-serif)] text-[20px] leading-7 ${estado === "futura" ? "text-brand-muted" : ""}`}
            >
              <span className="sr-only">Etapa {numero} de 5: </span>
              {titulo}
              {estado === "feita" && <span className="sr-only"> (pronta)</span>}
            </h2>
            {estado === "feita" && aoAlterar && (
              <button
                type="button"
                onClick={aoAlterar}
                aria-label={`Alterar ${titulo.toLowerCase()}`}
                className={`-my-2 -mr-2 flex min-h-11 items-center rounded-[4px] px-2 text-[12px] underline underline-offset-4 ${HOVER} ${FOCO}`}
              >
                Alterar
              </button>
            )}
          </div>
          {estado === "feita" && resumo && <div className="mt-1 text-[13px] leading-5 text-brand-muted">{resumo}</div>}
          {ativa && <div className="mt-4">{children}</div>}
        </div>
      </div>
    </section>
  );
}

type EscolhaProps = {
  nome: string;
  valor: string;
  marcada: boolean;
  aoEscolher: () => void;
  titulo: ReactNode;
  detalhe?: ReactNode;
  lado?: ReactNode;
};

/** Opção em cartão (rádio de verdade por baixo): borda navy e menta quando marcada. */
export function Escolha({ nome, valor, marcada, aoEscolher, titulo, detalhe, lado }: EscolhaProps) {
  return (
    <label
      className={`flex min-h-14 cursor-pointer items-center gap-3 rounded-[4px] border px-3 py-3 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-[#b8902a] ${
        marcada ? "border-[#1B4965] bg-[#C8E1E4]" : `border-[#1B4965]/30 ${HOVER}`
      }`}
    >
      <input type="radio" name={nome} value={valor} checked={marcada} onChange={aoEscolher} className="sr-only" />
      <span
        aria-hidden
        className={`flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full border ${marcada ? "border-[#1B4965]" : "border-[#1B4965]/50"}`}
      >
        {marcada && <span className="block h-2.5 w-2.5 rounded-full bg-[#1B4965]" />}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[14px] leading-5">{titulo}</span>
        {detalhe && <span className="block text-[12px] leading-4 text-brand-muted">{detalhe}</span>}
      </span>
      {lado && <span className="nums-preco shrink-0 font-[family-name:var(--font-serif)] text-[17px] font-medium">{lado}</span>}
    </label>
  );
}

type ResumoProps = {
  itens: ItemPedido[];
  valores: Valores;
  forma: "pix" | "cartao";
  freteConhecido: boolean;
  freteGratis: boolean;
  cupom?: string | null;
  /** Mostra "agora" e "antes do envio" (sinal escolhido). */
  comSinal: boolean;
};

export function Resumo({ itens, valores, forma, freteConhecido, freteGratis, cupom, comSinal }: ResumoProps) {
  return (
    <div>
      <ul>
        {itens.map((i) => (
          <li key={`${i.id}:${i.opcao}`} className="flex gap-3 py-2.5">
            <span className="relative h-[72px] w-[54px] shrink-0 overflow-hidden rounded-[2px] bg-[#1B4965]/5">
              <FotoSuave src={i.foto} alt="" fill sizes="54px" className="object-cover object-[50%_40%]" />
              {i.qty > 1 && (
                <span className="nums-preco absolute right-0.5 top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#1B4965] px-1 text-[11px] text-[#EDE7D9]">
                  {i.qty}
                </span>
              )}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[14px] leading-5">{i.nome}</span>
              <span className="block text-[12px] leading-4 text-brand-muted">
                {i.opcao === "sob-medida" ? "Sob medida" : "Pronta entrega"}
                {i.qty > 1 && ` · ${i.qty} unidades`}
              </span>
            </span>
            <span className="nums-preco shrink-0 font-[family-name:var(--font-serif)] text-[16px] font-medium leading-5">
              {formatBRLPreco((forma === "pix" ? i.precoPix : i.precoCartao) * i.qty)}
            </span>
          </li>
        ))}
      </ul>

      <dl className={`mt-3 space-y-1.5 border-t pt-4 text-[13px] ${LINHA}`}>
        <Linha rotulo={`Subtotal no ${forma === "pix" ? "pix" : "cartão"}`} valor={formatBRLPreco(valores.subtotal)} />
        {cupom && valores.desconto > 0 && (
          <Linha rotulo={`Cupom ${cupom}`} valor={`−${formatBRLPreco(valores.desconto)}`} classe="text-[#276a3b]" />
        )}
        <Linha
          rotulo="Frete"
          valor={freteGratis ? "Grátis" : freteConhecido ? formatBRLPreco(valores.frete) : "pelo CEP"}
          classe={freteConhecido || freteGratis ? "" : "text-brand-muted"}
        />
      </dl>
      <div className={`mt-3 flex items-baseline justify-between border-t pt-3 ${LINHA}`}>
        <span className="text-[12px] uppercase tracking-[0.16em]">Total</span>
        <span aria-live="polite" className="nums-preco font-[family-name:var(--font-serif)] text-[22px] font-medium">
          {formatBRLPreco(valores.total)}
        </span>
      </div>
      {forma === "cartao" && valores.maxParcelas > 1 && (
        <p className="text-right text-[12px] leading-4 text-brand-muted">até {valores.maxParcelas}x sem juros</p>
      )}
      {comSinal && valores.temSobMedida && (
        <dl className="mt-3 space-y-1 rounded-[4px] bg-[#1B4965]/[0.05] px-3 py-2.5 text-[13px]">
          <Linha rotulo="Agora, com o sinal" valor={formatBRLPreco(valores.agora)} />
          <Linha rotulo="Antes do envio" valor={formatBRLPreco(valores.depois)} classe="text-brand-muted" />
        </dl>
      )}
    </div>
  );
}

function Linha({ rotulo, valor, classe = "" }: { rotulo: string; valor: string; classe?: string }) {
  return (
    <div className={`flex justify-between gap-3 ${classe}`}>
      <dt>{rotulo}</dt>
      <dd className="nums-preco">{valor}</dd>
    </div>
  );
}
