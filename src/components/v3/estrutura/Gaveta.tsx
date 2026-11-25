"use client";

import { useEffect, useRef, type ReactNode, type RefObject } from "react";
import { isolarFundo, prenderTab, travarRolagem } from "@/lib/travaRolagem";

// Casca das três gavetas (menu, busca e sacola). Tela cheia no celular e
// 420 px do md para cima, sobre um véu navy a 30%.
//
// Movimento (spec, seção 5): a gaveta desliza em 0,3 s e o véu entra em fade
// de 0,2 s. Fechada, ela continua no HTML, mas fora da tela, invisível e
// inerte (sem foco e fora do leitor de tela). A visibilidade só vira
// "hidden" no fim da transição, então a gaveta sai deslizando. Com movimento
// reduzido, abre e fecha na hora.
//
// Aberta: trava a rolagem da página, deixa o <main> inerte, põe o foco no
// primeiro alvo, prende o Tab dentro dela e fecha no Esc. Ao fechar, o foco
// volta para quem abriu (ou para `focoDeVolta`, se quem abriu saiu da tela).

type Props = {
  aberta: boolean;
  lado: "esquerda" | "direita";
  aoFechar: () => void;
  /** Nome da gaveta para o leitor de tela ("Menu", "Busca", "Sacola"). */
  rotulo: string;
  /** Onde o foco entra ao abrir (sem ele, no próprio painel). */
  focoInicial?: RefObject<HTMLElement | null>;
  /** Para onde o foco volta se quem abriu não existe mais. */
  focoDeVolta?: () => HTMLElement | null;
  children: ReactNode;
};

export default function Gaveta({ aberta, lado, aoFechar, rotulo, focoInicial, focoDeVolta, children }: Props) {
  const painelRef = useRef<HTMLDivElement>(null);
  // As funções mais recentes, sem reabrir a gaveta quando o pai recria a função.
  const aoFecharRef = useRef(aoFechar);
  const focoDeVoltaRef = useRef(focoDeVolta);
  useEffect(() => {
    aoFecharRef.current = aoFechar;
    focoDeVoltaRef.current = focoDeVolta;
  });

  useEffect(() => {
    if (!aberta) return;
    const anterior = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const liberarRolagem = travarRolagem();
    const liberarFundo = isolarFundo();
    // Um quadro depois: o painel já está visível e pode receber o foco.
    const quadro = requestAnimationFrame(() => {
      (focoInicial?.current ?? painelRef.current)?.focus({ preventScroll: true });
    });

    const aoTeclar = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        aoFecharRef.current();
      } else if (e.key === "Tab") {
        prenderTab(e, painelRef.current);
      }
    };
    window.addEventListener("keydown", aoTeclar);

    return () => {
      cancelAnimationFrame(quadro);
      window.removeEventListener("keydown", aoTeclar);
      liberarFundo();
      liberarRolagem();
      const voltaPara =
        anterior && anterior.isConnected && anterior !== document.body && anterior.getClientRects().length > 0
          ? anterior
          : (focoDeVoltaRef.current?.() ?? null);
      voltaPara?.focus({ preventScroll: true });
    };
  }, [aberta, focoInicial]);

  const fora = lado === "esquerda" ? "-translate-x-full" : "translate-x-full";

  return (
    <div className={`fixed inset-0 z-[90] ${aberta ? "" : "pointer-events-none"}`} inert={!aberta}>
      {/* Véu: fecha no clique. Fora do Tab: o X da gaveta já cobre o teclado. */}
      <button
        type="button"
        tabIndex={-1}
        aria-hidden="true"
        onClick={aoFechar}
        className={`absolute inset-0 h-full w-full cursor-default bg-[#1B4965]/30 duration-200 motion-reduce:transition-none ${
          aberta ? "visible opacity-100 transition-opacity" : "invisible opacity-0 transition-[opacity,visibility]"
        }`}
      />
      <div
        ref={painelRef}
        role="dialog"
        aria-modal="true"
        aria-label={rotulo}
        tabIndex={-1}
        // Abrindo, só o transform anima (a gaveta fica visível na hora e já
        // recebe o foco); fechando, a visibilidade espera o fim do deslize.
        className={`absolute inset-y-0 ${lado === "esquerda" ? "left-0" : "right-0"} flex h-full w-full flex-col bg-[#EDE7D9] text-[#1B4965] outline-none duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none md:w-[420px] ${
          aberta ? "visible translate-x-0 transition-transform" : `invisible ${fora} transition-[transform,visibility]`
        }`}
      >
        {children}
      </div>
    </div>
  );
}
