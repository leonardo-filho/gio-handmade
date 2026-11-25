"use client";

import { useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FILTROS, ORDENS, type Ordem } from "./dados";
import { EASE, atraso } from "./movimento";
import s from "./vitrine.module.css";

type Props = {
  ativo: string;
  ordem: Ordem;
  onFiltro: (id: string) => void;
  onOrdem: (ordem: Ordem) => void;
};

const MOLA = { type: "spring", bounce: 0.18, duration: 0.55 } as const;

// Barra do celular e do tablet: presa logo abaixo do header (que publica a
// própria altura em --header-h), com os filtros num trilho de lado e o botão
// de ordenar fixo na ponta. A pílula do filtro ativo desliza até o novo.
export function BarraFiltros({ ativo, ordem, onFiltro, onOrdem }: Props) {
  const trilhoRef = useRef<HTMLDivElement>(null);
  const primeira = useRef(true);

  // Leva o filtro ativo para o meio do trilho (rola só o trilho).
  useEffect(() => {
    const trilho = trilhoRef.current;
    const chip = trilho?.querySelector<HTMLElement>(`[data-chip="${ativo}"]`);
    if (!trilho || !chip || trilho.scrollWidth <= trilho.clientWidth) return;
    const esquerda = chip.offsetLeft - (trilho.clientWidth - chip.offsetWidth) / 2;
    const reduz = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    trilho.scrollTo({ left: esquerda, behavior: primeira.current || reduz ? "auto" : "smooth" });
    primeira.current = false;
  }, [ativo]);

  return (
    <div
      data-barra-filtros
      className={`${s.surgir} sticky top-[var(--header-h,102px)] z-30 border-y border-[#1B4965]/10 bg-[#EDE7D9]/92 backdrop-blur-md md:top-[var(--header-h,109px)] lg:hidden`}
      style={atraso(150)}
    >
      <div className="flex items-center">
        <motion.div
          ref={trilhoRef}
          layoutScroll
          role="group"
          aria-label="Filtrar peças"
          className={`flex min-w-0 flex-1 gap-1.5 overflow-x-auto py-2 pl-4 pr-6 [mask-image:linear-gradient(to_right,#000_calc(100%-28px),transparent)] ${s.semBarra}`}
        >
          {FILTROS.map((f) => {
            const on = f.id === ativo;
            return (
              <button
                key={f.id}
                type="button"
                data-chip={f.id}
                aria-pressed={on}
                onClick={() => onFiltro(f.id)}
                className="relative flex h-10 shrink-0 cursor-pointer items-center whitespace-nowrap rounded-full px-3.5 font-[family-name:var(--font-serif)] text-[17px] leading-none transition-transform duration-150 after:absolute after:inset-x-0 after:-inset-y-1 after:content-[''] active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1B4965] focus-visible:ring-offset-2 focus-visible:ring-offset-[#EDE7D9]"
              >
                {on ? (
                  <motion.span layoutId="filtro-pilula" aria-hidden className="absolute inset-0 rounded-full bg-[#1B4965]" transition={MOLA} />
                ) : (
                  <span aria-hidden className="absolute inset-0 rounded-full border border-[#1B4965]/20" />
                )}
                <span className={`relative transition-colors duration-300 ${on ? "italic text-[#EDE7D9]" : "text-[#1B4965]"}`}>
                  {f.rotulo}
                  <sup className="ml-0.5 font-sans text-[10px] not-italic tabular-nums opacity-80">{f.total}</sup>
                </span>
              </button>
            );
          })}
        </motion.div>
        <Ordenar ordem={ordem} onOrdem={onOrdem} />
      </div>
    </div>
  );
}

// Ordenar no celular: um botão redondo que abre um menu curto.
function Ordenar({ ordem, onOrdem }: { ordem: Ordem; onOrdem: (o: Ordem) => void }) {
  const [aberto, setAberto] = useState(false);
  const botaoRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const id = useId();
  const atual = ORDENS.find((o) => o.id === ordem) ?? ORDENS[0];

  useEffect(() => {
    if (!aberto) return;
    menuRef.current?.querySelector<HTMLElement>("[aria-checked='true']")?.focus();
    const fora = (e: PointerEvent) => {
      const alvo = e.target as Node;
      if (!menuRef.current?.contains(alvo) && !botaoRef.current?.contains(alvo)) setAberto(false);
    };
    const tecla = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setAberto(false);
        botaoRef.current?.focus();
      }
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        const itens = Array.from(menuRef.current?.querySelectorAll<HTMLElement>("[role='menuitemradio']") ?? []);
        const i = itens.indexOf(document.activeElement as HTMLElement);
        const prox = (i + (e.key === "ArrowDown" ? 1 : -1) + itens.length) % itens.length;
        itens[prox]?.focus();
      }
    };
    document.addEventListener("pointerdown", fora);
    window.addEventListener("keydown", tecla);
    return () => {
      document.removeEventListener("pointerdown", fora);
      window.removeEventListener("keydown", tecla);
    };
  }, [aberto]);

  return (
    <div className="relative shrink-0 pr-2">
      <button
        ref={botaoRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={aberto}
        aria-controls={id}
        aria-label={`Ordenar peças: ${atual.rotulo}`}
        onClick={() => setAberto((v) => !v)}
        className={`relative flex h-11 w-11 cursor-pointer items-center justify-center rounded-full transition-[background-color,transform] duration-200 active:scale-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1B4965] ${
          aberto ? "bg-[#1B4965] text-[#EDE7D9]" : "text-[#1B4965] hover:bg-[#1B4965]/8"
        }`}
      >
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" d="M7 4v16m0 0-3-3m3 3 3-3M17 20V4m0 0-3 3m3-3 3 3" />
        </svg>
        {ordem !== "relevancia" && (
          <span aria-hidden className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[#b8902a] ring-2 ring-[#EDE7D9]" />
        )}
      </button>
      <AnimatePresence>
        {aberto && (
          <motion.div
            ref={menuRef}
            id={id}
            role="menu"
            aria-label="Ordenar peças"
            initial={{ opacity: 0, scale: 0.94, y: -6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -4, transition: { duration: 0.14 } }}
            transition={{ duration: 0.24, ease: EASE }}
            className="absolute right-2 top-[calc(100%+8px)] z-10 w-56 origin-top-right rounded-2xl bg-[#F7F3EA] p-1.5 shadow-[0_24px_48px_-16px_rgba(19,2,9,0.45)] ring-1 ring-[#1B4965]/10"
          >
            {ORDENS.map((o) => {
              const marcado = o.id === ordem;
              return (
                <button
                  key={o.id}
                  type="button"
                  role="menuitemradio"
                  aria-checked={marcado}
                  onClick={() => {
                    setAberto(false);
                    botaoRef.current?.focus();
                    onOrdem(o.id);
                  }}
                  className={`flex min-h-11 w-full cursor-pointer items-center justify-between rounded-xl px-3.5 text-left font-[family-name:var(--font-serif)] text-[17px] transition-colors focus:outline-none focus-visible:bg-[#1B4965]/8 ${
                    marcado ? "italic text-[#1B4965]" : "text-[#1B4965]/85 hover:bg-[#1B4965]/5"
                  }`}
                >
                  {o.rotulo}
                  {marcado && (
                    <svg className="h-4 w-4 text-brand-gold-text" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 12.5 10 17.5 19 7" />
                    </svg>
                  )}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Índice do desktop: os filtros como sumário tipográfico, preso ao lado da
// grade, com um fio dourado que desliza até o filtro ativo; logo abaixo, a
// ordem por preço.
export function IndiceFiltros({ ativo, ordem, onFiltro, onOrdem }: Props) {
  return (
    <div className="sticky top-[var(--header-h,109px)] pb-10 pt-14">
      <p className="text-[11px] font-bold uppercase tracking-[0.26em] text-brand-gold-text">As peças</p>
      <div role="group" aria-label="Filtrar peças" className="mt-5 flex flex-col">
        {FILTROS.map((f) => {
          const on = f.id === ativo;
          return (
            <button
              key={f.id}
              type="button"
              aria-pressed={on}
              onClick={() => onFiltro(f.id)}
              className="group relative flex min-h-11 cursor-pointer items-center gap-2 rounded-sm text-left font-[family-name:var(--font-serif)] text-[23px] leading-none focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1B4965] focus-visible:ring-offset-4 focus-visible:ring-offset-[#EDE7D9]"
            >
              {on && (
                <motion.span
                  layoutId="filtro-indice"
                  aria-hidden
                  className={`absolute -left-6 top-1/2 h-[1.5px] w-4 ${s.ponto}`}
                  transition={MOLA}
                />
              )}
              <span
                className={`transition-[transform,color] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                  on ? "translate-x-1 italic text-[#1B4965]" : "text-[#1B4965]/70 group-hover:translate-x-1 group-hover:text-[#1B4965]"
                }`}
              >
                {f.rotulo}
              </span>
              <span className="font-sans text-[11px] tabular-nums text-brand-muted">{f.total}</span>
            </button>
          );
        })}
      </div>

      <p className="mt-10 text-[11px] font-bold uppercase tracking-[0.26em] text-brand-gold-text">Ordenar</p>
      <div role="group" aria-label="Ordenar peças" className="mt-3 flex flex-col">
        {ORDENS.map((o) => {
          const on = o.id === ordem;
          return (
            <button
              key={o.id}
              type="button"
              aria-pressed={on}
              onClick={() => onOrdem(o.id)}
              className={`flex min-h-9 cursor-pointer items-center gap-2 rounded-sm text-left text-[14px] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1B4965] ${
                on ? "text-[#1B4965]" : "text-brand-muted hover:text-[#1B4965]"
              }`}
            >
              <span
                aria-hidden
                className={`h-1.5 w-1.5 rounded-full transition-[transform,background-color] duration-300 ${on ? "scale-100 bg-[#b8902a]" : "scale-50 bg-[#1B4965]/30"}`}
              />
              {o.rotulo}
            </button>
          );
        })}
      </div>

      <div className="mt-10 border-t border-[#1B4965]/12 pt-5 text-[13px] leading-relaxed text-brand-muted">
        Monte seu carrinho e finalize o pedido pelo WhatsApp.
      </div>
    </div>
  );
}
