"use client";

import type { InputHTMLAttributes, ReactNode } from "react";

// Peças de formulário do checkout: campo com rótulo em cima, erro embaixo e
// 48 px de altura; opção (rádio) em cartão. Fonte de 16 px nos campos para o
// iPhone não dar zoom.

type CampoProps = InputHTMLAttributes<HTMLInputElement> & {
  id: string;
  rotulo: string;
  erro?: string;
  dica?: string;
};

export function Campo({ id, rotulo, erro, dica, className = "", ...resto }: CampoProps) {
  const descricao = [erro ? `${id}-erro` : null, dica ? `${id}-dica` : null].filter(Boolean).join(" ") || undefined;
  return (
    <div className={className}>
      <label htmlFor={id} className="block text-[12px] leading-5 text-[#1B4965]">
        {rotulo}
      </label>
      <input
        id={id}
        aria-invalid={erro ? true : undefined}
        aria-describedby={descricao}
        className="mt-1 h-12 w-full rounded-[4px] border border-[#1B4965]/60 bg-transparent px-3 text-[16px] text-[#1B4965] outline-none placeholder:text-brand-muted focus:border-[#1B4965] focus:ring-1 focus:ring-[#1B4965] aria-[invalid]:border-[#a33]"
        {...resto}
      />
      {dica && !erro && (
        <p id={`${id}-dica`} className="mt-1 text-[12px] leading-4 text-brand-muted">
          {dica}
        </p>
      )}
      {erro && (
        <p id={`${id}-erro`} className="mt-1 text-[12px] leading-4 text-[#a33]">
          {erro}
        </p>
      )}
    </div>
  );
}

export function Opcao({
  nome,
  valor,
  marcado,
  aoMarcar,
  titulo,
  detalhe,
  direita,
}: {
  nome: string;
  valor: string;
  marcado: boolean;
  aoMarcar: () => void;
  titulo: string;
  detalhe?: ReactNode;
  direita?: ReactNode;
}) {
  return (
    <label
      className={`flex min-h-14 cursor-pointer items-center gap-3 rounded-[4px] border px-4 py-3 text-[#1B4965] transition-colors duration-200 motion-reduce:transition-none has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-[#b8902a] ${
        marcado ? "border-[#1B4965] bg-[#C8E1E4]" : "border-[#1B4965]/40 hover:border-[#1B4965]"
      }`}
    >
      <input type="radio" name={nome} value={valor} checked={marcado} onChange={aoMarcar} className="sr-only" />
      <span
        aria-hidden
        className={`flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full border ${
          marcado ? "border-[#1B4965]" : "border-[#1B4965]/60"
        }`}
      >
        {marcado && <span className="h-2.5 w-2.5 rounded-full bg-[#1B4965]" />}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[14px] leading-5">{titulo}</span>
        {detalhe && <span className="mt-0.5 block text-[12px] leading-4 text-brand-muted">{detalhe}</span>}
      </span>
      {direita && <span className="nums-preco shrink-0 font-serif text-[16px] font-medium">{direita}</span>}
    </label>
  );
}

export function mascaraTelefone(v: string): string {
  const d = v.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 2) return d.length ? `(${d}` : "";
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

export function mascaraCpf(v: string): string {
  const d = v.replace(/\D/g, "").slice(0, 11);
  return d
    .replace(/^(\d{3})(\d)/, "$1.$2")
    .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d{1,2})$/, ".$1-$2");
}
