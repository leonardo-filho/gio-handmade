"use client";

import { useId, useState, type InputHTMLAttributes, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import type { ItemPedido, Valores } from "@/lib/checkout";
import { formatBRLPreco } from "@/lib/format";
import { rotuloOpcao, textoMedidas } from "@/lib/v2/pedido";
import { IconeSeta } from "@/components/v3/estrutura/Icones";
import { FOCO, HOVER, LINHA } from "@/components/v3/estrutura/estilo";

// Peças do checkout da versão 2: cabeçalho enxuto, barra das cinco etapas,
// campo com rótulo e erro, opção em cartão (rádio grande) e o resumo.

export const ETAPAS = ["Seus dados", "Entrega", "Medidas", "Pagamento", "Confirmação"] as const;

export function CabecalhoCheckout() {
  return (
    <header className="sticky top-0 z-40 bg-[#EDE7D9] text-[#1B4965]">
      <div className="relative flex h-[60px] items-center px-1.5 md:h-[76px] md:px-4 lg:px-6">
        <Link href="/loja" className={`flex h-11 items-center gap-1 rounded-[4px] px-2.5 text-[12px] ${HOVER} ${FOCO}`}>
          <svg aria-hidden viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
            <path d="m15 5-7 7 7 7" />
          </svg>
          Loja
        </Link>
        <Link
          href="/"
          aria-label="Gio Handmade, página inicial"
          className={`absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center rounded-[4px] p-1 ${FOCO}`}
        >
          <Image src="/logo-navy.png" alt="Gio Handmade" width={1200} height={856} priority sizes="(min-width: 768px) 62px, 51px" className="h-9 w-auto md:h-11" />
        </Link>
      </div>
    </header>
  );
}

/** Barra das etapas: cinco traços, as anteriores clicáveis para voltar. */
export function BarraEtapas({ atual, aoIr }: { atual: number; aoIr: (etapa: number) => void }) {
  return (
    <nav aria-label="Etapas da compra">
      <ol className="grid grid-cols-5 gap-1.5">
        {ETAPAS.map((nome, i) => {
          const n = i + 1;
          const feita = n < atual && atual < 5;
          const classe = `block h-1 rounded-full ${n <= atual ? "bg-[#1B4965]" : "bg-[#1B4965]/15"}`;
          return (
            <li key={nome}>
              {feita ? (
                <button
                  type="button"
                  onClick={() => aoIr(n)}
                  aria-label={`Voltar para ${nome}`}
                  // 24 px à vista e 44 px de toque (a área passa 10 px para cima e para baixo).
                  className={`relative flex h-6 w-full items-center rounded-[2px] after:absolute after:-inset-y-2.5 after:inset-x-0 after:content-[''] ${HOVER} ${FOCO}`}
                >
                  <span className={`${classe} w-full`} />
                </button>
              ) : (
                <span aria-current={n === atual ? "step" : undefined} className="flex h-6 items-center">
                  <span className={`${classe} w-full`} />
                  <span className="sr-only">{nome}</span>
                </span>
              )}
            </li>
          );
        })}
      </ol>
      <p className="mt-1 text-[11px] uppercase tracking-[0.14em] text-brand-muted">
        Etapa {atual} de {ETAPAS.length} · {ETAPAS[atual - 1]}
      </p>
    </nav>
  );
}

type CampoProps = Omit<InputHTMLAttributes<HTMLInputElement>, "id"> & {
  rotulo: string;
  erro?: string;
  opcional?: boolean;
  nota?: ReactNode;
};

export function Campo({ rotulo, erro, opcional, nota, className = "", ...input }: CampoProps) {
  const id = useId();
  return (
    <div className={className}>
      <label htmlFor={id} className="block text-[12px] leading-4">
        {rotulo}
        {opcional && <span className="text-brand-muted"> (opcional)</span>}
      </label>
      <input
        id={id}
        {...input}
        aria-invalid={erro ? true : undefined}
        aria-describedby={erro || nota ? `${id}-nota` : undefined}
        className={`mt-1.5 h-11 w-full min-w-0 rounded-[4px] border bg-transparent px-3 text-[16px] text-[#1B4965] outline-none placeholder:text-[#1B4965]/40 focus:border-[#1B4965] focus:ring-1 focus:ring-[#1B4965] ${
          erro ? "border-[#a33]" : "border-[#1B4965]/60"
        }`}
      />
      {(erro || nota) && (
        <p id={`${id}-nota`} className={`mt-1 text-[12px] leading-[18px] ${erro ? "text-[#a33]" : "text-brand-muted"}`}>
          {erro ?? nota}
        </p>
      )}
    </div>
  );
}

/** Rádio grande, em cartão: o escolhido fica menta com borda navy. */
export function OpcaoCartao({
  nome,
  valor,
  marcado,
  aoEscolher,
  titulo,
  direita,
  nota,
}: {
  nome: string;
  valor: string;
  marcado: boolean;
  aoEscolher: () => void;
  titulo: string;
  direita?: ReactNode;
  nota?: ReactNode;
}) {
  return (
    <label
      className={`flex min-h-14 cursor-pointer items-center gap-3 rounded-[4px] border px-3 py-3 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-[#b8902a] motion-safe:transition-colors motion-safe:duration-200 ${
        marcado ? "border-[#1B4965] bg-[#C8E1E4]" : "border-[#1B4965]/40 hover:border-[#1B4965]"
      }`}
    >
      <input type="radio" name={nome} value={valor} checked={marcado} onChange={aoEscolher} className="sr-only" />
      <span aria-hidden className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${marcado ? "border-[#1B4965]" : "border-[#1B4965]/60"}`}>
        {marcado && <span className="h-2.5 w-2.5 rounded-full bg-[#1B4965]" />}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[14px] leading-5">{titulo}</span>
        {nota && <span className="block text-[12px] leading-[18px] text-[#3f6178]">{nota}</span>}
      </span>
      {direita && <span className="nums-preco shrink-0 text-right font-[family-name:var(--font-serif)] text-[17px] font-medium">{direita}</span>}
    </label>
  );
}

/** Linhas de valores do pedido (subtotal, cupom, frete, total e, com sinal, agora e depois). */
export function Valores({
  v,
  forma,
  freteConhecido,
  mostrarAgora,
  cupom,
}: {
  v: Valores;
  forma: "pix" | "cartao";
  freteConhecido: boolean;
  mostrarAgora: boolean;
  cupom?: string;
}) {
  return (
    <dl className="space-y-1.5 text-[13px] leading-5">
      <div className="flex justify-between gap-3">
        <dt className="text-brand-muted">Subtotal {forma === "pix" ? "no pix" : "no cartão"}</dt>
        <dd className="nums-preco">{formatBRLPreco(v.subtotal)}</dd>
      </div>
      {v.desconto > 0 && (
        <div className="flex justify-between gap-3">
          <dt className="text-brand-muted">Cupom {cupom}</dt>
          <dd className="nums-preco text-[#276a3b]">−{formatBRLPreco(v.desconto)}</dd>
        </div>
      )}
      <div className="flex justify-between gap-3">
        <dt className="text-brand-muted">Frete</dt>
        <dd className="nums-preco">{freteConhecido ? formatBRLPreco(v.frete) : "pelo CEP"}</dd>
      </div>
      <div className={`flex items-baseline justify-between gap-3 border-t pt-2 ${LINHA}`}>
        <dt className="text-[12px] uppercase tracking-[0.16em]">Total</dt>
        <dd className="nums-preco font-[family-name:var(--font-serif)] text-[20px] font-medium">{formatBRLPreco(v.total)}</dd>
      </div>
      {mostrarAgora && v.depois > 0 && (
        <>
          <div className="flex justify-between gap-3">
            <dt>Agora</dt>
            <dd className="nums-preco">{formatBRLPreco(v.agora)}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-brand-muted">Antes do envio</dt>
            <dd className="nums-preco text-brand-muted">{formatBRLPreco(v.depois)}</dd>
          </div>
        </>
      )}
    </dl>
  );
}

export function ListaItens({ itens, forma }: { itens: ItemPedido[]; forma: "pix" | "cartao" }) {
  return (
    <ul>
      {itens.map((i) => {
        const medidas = textoMedidas(i);
        return (
          <li key={`${i.id}:${i.opcao}`} className={`flex gap-3 border-b py-3 first:pt-0 ${LINHA}`}>
            <span className="relative h-16 w-12 shrink-0 overflow-hidden bg-[#1B4965]/5">
              <Image src={i.foto} alt="" fill sizes="48px" className="object-cover object-[50%_40%]" />
              {i.qty > 1 && (
                <span className="nums-preco absolute right-0.5 top-0.5 rounded-full bg-[#1B4965] px-1.5 text-[10px] leading-4 text-[#EDE7D9]">{i.qty}</span>
              )}
            </span>
            <div className="min-w-0 flex-1 text-[13px] leading-5">
              <div className="flex justify-between gap-3">
                <p className="truncate">{i.nome}</p>
                <p className="nums-preco shrink-0">{formatBRLPreco((forma === "pix" ? i.precoPix : i.precoCartao) * i.qty)}</p>
              </div>
              <p className="text-[12px] leading-[18px] text-brand-muted">{rotuloOpcao(i)}</p>
              {medidas && <p className="text-[12px] leading-[18px] text-brand-muted">{medidas}</p>}
            </div>
          </li>
        );
      })}
    </ul>
  );
}

/** Resumo do celular: fechado, mostra só o total; abre com as peças e os valores. */
export function ResumoRecolhido({ total, pecas, children }: { total: string; pecas: number; children: ReactNode }) {
  const [aberto, setAberto] = useState(false);
  const id = useId();
  return (
    <div className={`border-y ${LINHA} lg:hidden`}>
      <button
        type="button"
        aria-expanded={aberto}
        aria-controls={id}
        onClick={() => setAberto((a) => !a)}
        className={`flex h-12 w-full items-center justify-between gap-3 text-left ${FOCO}`}
      >
        <span className="flex items-center gap-2 text-[12px] uppercase tracking-[0.14em]">
          Resumo · {pecas} {pecas === 1 ? "peça" : "peças"}
          <IconeSeta className={`h-4 w-4 motion-safe:transition-transform motion-safe:duration-200 ${aberto ? "rotate-180" : ""}`} />
        </span>
        <span className="nums-preco font-[family-name:var(--font-serif)] text-[17px] font-medium">{total}</span>
      </button>
      <div id={id} hidden={!aberto} className="pb-4">
        {children}
      </div>
    </div>
  );
}
