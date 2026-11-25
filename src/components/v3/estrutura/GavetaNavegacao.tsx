"use client";

import { useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { produtos, secaoVitrine, type Produto } from "@/data/produtos";
import { formatBRLPreco } from "@/lib/format";
import { parcelamentoCartao } from "@/lib/parcelas";
import { INSTAGRAM, WA_ORCAMENTO } from "@/components/home/textos";
import Gaveta from "./Gaveta";
import { useGavetas } from "./Gavetas";
import { IconeFechar, IconeLupa } from "./Icones";
import { CAMPO, FOCO, HOVER, LINHA } from "./estilo";

// Gaveta da esquerda: o menu de um nível só e a busca (spec, seção 2).
// Fica no layout, fora do <main>; o cabeçalho abre pelo useGavetas().

const ITENS_MENU = [
  { nome: "Loja", href: "/loja" },
  { nome: "Pronta entrega", href: "/loja?ver=pronta-entrega" },
  { nome: "Tops", href: "/loja?ver=tops" },
  { nome: "Conjuntos", href: "/loja?ver=conjuntos" },
  { nome: "Saias", href: "/loja?ver=saias" },
  { nome: "Vestidos", href: "/loja?ver=vestidos" },
  { nome: "Acessórios", href: "/loja?ver=acessorios" },
  { nome: "Como encomendar", href: "/como-encomendar" },
] as const;

const MAX_SUGESTOES = 8;

export default function GavetaNavegacao() {
  const { aberta, modo, vezBusca, fechar } = useGavetas();
  const fecharRef = useRef<HTMLButtonElement>(null);
  const campoRef = useRef<HTMLInputElement>(null);

  return (
    <Gaveta
      aberta={aberta}
      lado="esquerda"
      aoFechar={fechar}
      rotulo={modo === "busca" ? "Busca" : "Menu"}
      focoInicial={modo === "busca" ? campoRef : fecharRef}
    >
      {/* Topo: X e a linha de 1 px. */}
      <div className={`flex h-14 shrink-0 items-center border-b px-2 md:px-3 ${LINHA}`}>
        <button
          ref={fecharRef}
          type="button"
          onClick={fechar}
          aria-label={modo === "busca" ? "Fechar busca" : "Fechar menu"}
          className={`flex h-11 w-11 items-center justify-center rounded-[4px] ${HOVER} ${FOCO}`}
        >
          <IconeFechar className="h-5 w-5" />
        </button>
      </div>

      {modo === "busca" ? (
        <Busca key={vezBusca} campoRef={campoRef} aoEscolher={fechar} />
      ) : (
        <nav aria-label="Menu" className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain">
          <ul className="px-4 pt-3 md:px-6">
            {ITENS_MENU.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={fechar}
                  className={`flex h-12 items-center rounded-[4px] font-[family-name:var(--font-serif)] text-[20px] leading-none text-[#1B4965] ${HOVER} ${FOCO}`}
                >
                  {item.nome}
                </Link>
              </li>
            ))}
          </ul>

          <div className={`mt-auto flex gap-6 border-t px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 text-[13px] md:px-6 ${LINHA}`}>
            <a href={INSTAGRAM} target="_blank" rel="noopener noreferrer" className={`flex min-h-11 items-center rounded-[4px] ${HOVER} ${FOCO}`}>
              Instagram
            </a>
            <a href={WA_ORCAMENTO} target="_blank" rel="noopener noreferrer" className={`flex min-h-11 items-center rounded-[4px] ${HOVER} ${FOCO}`}>
              WhatsApp
            </a>
          </div>
        </nav>
      )}
    </Gaveta>
  );
}

// ---------------------------------------------------------------------------
// Busca: campo e até 8 sugestões (miniatura, nome e preço). Sem página de
// resultados: cada sugestão leva à página da peça, e o Enter abre a primeira.

function semAcento(texto: string) {
  return texto.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

// Índice montado uma vez: o nome e, à parte, a categoria e a pronta entrega
// (assim "tops", "saias" e "pronta" também acham as peças).
const INDICE = produtos.map((p) => ({
  p,
  nome: semAcento(p.nome),
  extra: semAcento(`${p.categoria} ${secaoVitrine(p)}${p.prontaEntrega ? " pronta entrega" : ""}`),
}));

function buscar(consulta: string): Produto[] {
  const termos = semAcento(consulta).trim().split(/\s+/).filter(Boolean);
  if (termos.length === 0) return [];
  const achados: { p: Produto; pontos: number; ordem: number }[] = [];
  INDICE.forEach(({ p, nome, extra }, ordem) => {
    if (!termos.every((t) => nome.includes(t) || extra.includes(t))) return;
    const palavras = nome.split(/\s+/);
    let pontos = 0;
    for (const t of termos) {
      if (palavras.some((w) => w.startsWith(t))) pontos += 2;
      else if (nome.includes(t)) pontos += 1;
    }
    achados.push({ p, pontos, ordem });
  });
  return achados
    .sort((a, b) => b.pontos - a.pontos || a.ordem - b.ordem)
    .slice(0, MAX_SUGESTOES)
    .map((a) => a.p);
}

function Busca({
  campoRef,
  aoEscolher,
}: {
  campoRef: React.RefObject<HTMLInputElement | null>;
  aoEscolher: () => void;
}) {
  const router = useRouter();
  const [consulta, setConsulta] = useState("");
  const sugestoes = useMemo(() => buscar(consulta), [consulta]);
  const digitou = consulta.trim().length > 0;

  function abrirPrimeira(e: React.FormEvent) {
    e.preventDefault();
    const primeira = sugestoes[0];
    if (!primeira) return;
    aoEscolher();
    router.push(`/loja/${primeira.id}`);
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <form role="search" onSubmit={abrirPrimeira} className="shrink-0 px-4 pt-4 md:px-6">
        <label htmlFor="busca-pecas" className="sr-only">
          Buscar peças
        </label>
        <div className="relative flex">
          <input
            ref={campoRef}
            id="busca-pecas"
            type="search"
            inputMode="search"
            enterKeyHint="go"
            autoComplete="off"
            spellCheck={false}
            placeholder="Buscar peças"
            value={consulta}
            onChange={(e) => setConsulta(e.target.value)}
            aria-describedby="busca-status"
            className={`${CAMPO} pr-11 [&::-webkit-search-cancel-button]:appearance-none`}
          />
          <IconeLupa aria-hidden className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#1B4965]" />
        </div>
      </form>

      <p id="busca-status" role="status" className={digitou && sugestoes.length === 0 ? "px-4 pt-5 text-[14px] text-brand-muted md:px-6" : "sr-only"}>
        {!digitou
          ? ""
          : sugestoes.length === 0
            ? "Nenhuma peça encontrada."
            : `${sugestoes.length} ${sugestoes.length === 1 ? "sugestão" : "sugestões"}`}
      </p>

      {sugestoes.length > 0 && (
        <ul className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-6 pt-2 md:px-6">
          {sugestoes.map((p) => (
            <li key={p.id}>
              <Link
                href={`/loja/${p.id}`}
                onClick={aoEscolher}
                className={`flex items-center gap-4 rounded-[4px] py-2 ${HOVER} ${FOCO}`}
              >
                <span className="relative h-16 w-12 shrink-0 overflow-hidden bg-[#1B4965]/5">
                  <Image src={p.foto} alt="" fill sizes="48px" className="object-cover" />
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-[14px] leading-[20px] text-[#1B4965]">{p.nome}</span>
                  <span className="nums-preco block font-[family-name:var(--font-serif)] text-[16px] font-medium leading-[22px] text-[#1B4965]">
                    {formatBRLPreco(parcelamentoCartao(p).total)}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
