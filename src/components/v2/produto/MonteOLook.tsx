"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Produto } from "@/data/produtos";
import { formatBRLPreco } from "@/lib/format";
import { somaDoLook } from "@/lib/v2/look";
import { precosDe } from "@/components/v3/loja/precos";
import { BOTAO_CONTORNO, FOCO, HOVER, LINHA } from "@/components/v3/estrutura/estilo";

type Props = {
  peca: Produto;
  sugestoes: Produto[];
  /** "Monte o look" (top e saia) ou "Complete o look" (conjunto e vestido). */
  titulo: string;
  /** As medidas do provador vão junto (mostra a linha que avisa). */
  levaMedidas: boolean;
  aoAdicionar: (pecas: Produto[]) => void;
};

// Monte o look (versão 2): a peça aberta e as 2 ou 3 que combinam com ela
// (lib/v2/look.ts), cada uma com a sua caixa de marcar. A soma muda com o que
// fica marcado, no cartão primeiro e no pix depois, como em toda a loja.
// "Adicionar o look" põe tudo na sacola de uma vez, com as medidas do provador
// nas peças de vestir.
export default function MonteOLook({ peca, sugestoes, titulo, levaMedidas, aoAdicionar }: Props) {
  const [marcadas, setMarcadas] = useState<Set<string>>(() => new Set(sugestoes.map((s) => s.id)));
  const escolhidas = sugestoes.filter((s) => marcadas.has(s.id));
  const pecas = [peca, ...escolhidas];
  const soma = somaDoLook(pecas);

  function alternar(id: string) {
    setMarcadas((atual) => {
      const nova = new Set(atual);
      if (nova.has(id)) nova.delete(id);
      else nova.add(id);
      return nova;
    });
  }

  return (
    <section aria-labelledby="look-titulo" className="mt-8">
      <h2 id="look-titulo" className="font-[family-name:var(--font-serif)] text-[22px] leading-7">
        {titulo}
      </h2>

      <ul className={`mt-2 border-t ${LINHA}`}>
        <Linha produto={peca} rotulo="Esta peça" />
        {sugestoes.map((s) => (
          <Linha key={s.id} produto={s} marcada={marcadas.has(s.id)} aoAlternar={() => alternar(s.id)} />
        ))}
      </ul>

      <div className="mt-4 flex items-baseline justify-between gap-3">
        <p className="text-[12px] leading-4 text-brand-muted">
          Look com {pecas.length} {pecas.length === 1 ? "peça" : "peças"}
        </p>
        <div className="text-right">
          <p aria-live="polite" className="nums-preco font-[family-name:var(--font-serif)] text-[20px] font-medium leading-6">
            {formatBRLPreco(soma.cartao)}
          </p>
          {soma.pix < soma.cartao && (
            <p className="nums-preco text-[12px] leading-4 text-brand-muted">ou {formatBRLPreco(soma.pix)} no pix</p>
          )}
        </div>
      </div>

      <button
        type="button"
        disabled={escolhidas.length === 0}
        onClick={() => aoAdicionar(pecas)}
        className={`mt-4 w-full disabled:cursor-not-allowed disabled:opacity-40 ${BOTAO_CONTORNO}`}
      >
        Adicionar o look
      </button>
      {levaMedidas && (
        <p className="mt-2 text-center text-[12px] leading-[18px] text-brand-muted">Suas medidas seguem com as peças de vestir.</p>
      )}
    </section>
  );
}

function Linha({
  produto,
  rotulo,
  marcada,
  aoAlternar,
}: {
  produto: Produto;
  rotulo?: string;
  marcada?: boolean;
  aoAlternar?: () => void;
}) {
  const precos = precosDe(produto);
  const fixa = !aoAlternar;
  return (
    <li className={`flex items-center gap-3 border-b py-3 ${LINHA}`}>
      {fixa ? (
        <span className="relative h-[85px] w-16 shrink-0 overflow-hidden bg-[#1B4965]/5">
          {/* Mesma foto da galeria: carrega junto, senão o Next a toma pela foto principal preguiçosa. */}
          <Image src={produto.foto} alt="" fill sizes="64px" loading="eager" className="object-cover object-[50%_40%]" />
        </span>
      ) : (
        <Link
          href={`/loja/${produto.id}`}
          tabIndex={-1}
          aria-hidden
          // Desmarcada, só a foto apaga (o texto segue com contraste AA).
          className={`relative h-[85px] w-16 shrink-0 overflow-hidden bg-[#1B4965]/5 motion-safe:transition-opacity motion-safe:duration-200 ${marcada ? "" : "opacity-35"}`}
        >
          <Image src={produto.foto} alt="" fill sizes="64px" className="object-cover object-[50%_40%]" />
        </Link>
      )}
      <div className="min-w-0 flex-1">
        {fixa ? (
          <p className="truncate text-[14px] leading-5">{produto.nome}</p>
        ) : (
          // O ::after leva o toque a 44 px (passa 12 px para cima e para baixo, sobre o preço).
          <Link
            href={`/loja/${produto.id}`}
            className={`relative block rounded-[2px] text-[14px] leading-5 underline-offset-4 after:absolute after:inset-x-0 after:-inset-y-3 after:content-[''] hover:underline ${FOCO}`}
          >
            <span className="block truncate">{produto.nome}</span>
          </Link>
        )}
        {rotulo && <p className="text-[12px] leading-4 text-brand-muted">{rotulo}</p>}
        <p className="nums-preco mt-1 font-[family-name:var(--font-serif)] text-[15px] font-medium leading-5">{precos.cartao}</p>
      </div>
      {fixa ? (
        <span aria-hidden className="-mr-2 flex h-11 w-11 shrink-0 items-center justify-center">
          <Marca marcada />
        </span>
      ) : (
        <button
          type="button"
          role="checkbox"
          aria-checked={marcada}
          aria-label={`Incluir ${produto.nome} no look`}
          onClick={aoAlternar}
          className={`-mr-2 flex h-11 w-11 shrink-0 items-center justify-center rounded-[4px] ${HOVER} ${FOCO}`}
        >
          <Marca marcada={!!marcada} />
        </button>
      )}
    </li>
  );
}

function Marca({ marcada }: { marcada: boolean }) {
  return (
    <span
      className={`flex h-5 w-5 items-center justify-center rounded-[3px] border ${
        marcada ? "border-[#1B4965] bg-[#1B4965] text-[#EDE7D9]" : "border-[#1B4965]/60 bg-transparent"
      }`}
    >
      {marcada && (
        <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden>
          <path d="M3.5 8.5l3 3 6-7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </span>
  );
}
