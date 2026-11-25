"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

// Estado da gaveta da esquerda (menu e busca dividem a mesma gaveta). A gaveta
// mora no layout, fora do <main>, e o botão que a abre mora no cabeçalho, que
// cada página desenha: o contexto liga os dois.
//
// `modo` guarda o último conteúdo aberto, para a gaveta não trocar de
// conteúdo enquanto desliza para fora. `vezBusca` cresce a cada abertura da
// busca e zera o campo (a busca nasce vazia toda vez).

export type ModoGaveta = "menu" | "busca";

type GavetasValor = {
  aberta: boolean;
  modo: ModoGaveta;
  vezBusca: number;
  abrirMenu: () => void;
  abrirBusca: () => void;
  fechar: () => void;
};

const GavetasContexto = createContext<GavetasValor | null>(null);

export function GavetasProvider({ children }: { children: ReactNode }) {
  const [estado, setEstado] = useState<{ aberta: boolean; modo: ModoGaveta; vezBusca: number }>({
    aberta: false,
    modo: "menu",
    vezBusca: 0,
  });

  const abrirMenu = useCallback(() => setEstado((e) => ({ ...e, aberta: true, modo: "menu" })), []);
  const abrirBusca = useCallback(
    () => setEstado((e) => ({ aberta: true, modo: "busca", vezBusca: e.vezBusca + 1 })),
    []
  );
  const fechar = useCallback(() => setEstado((e) => (e.aberta ? { ...e, aberta: false } : e)), []);

  const valor = useMemo<GavetasValor>(
    () => ({ ...estado, abrirMenu, abrirBusca, fechar }),
    [estado, abrirMenu, abrirBusca, fechar]
  );

  return <GavetasContexto.Provider value={valor}>{children}</GavetasContexto.Provider>;
}

export function useGavetas(): GavetasValor {
  const ctx = useContext(GavetasContexto);
  if (!ctx) throw new Error("useGavetas precisa estar dentro de <GavetasProvider>");
  return ctx;
}
