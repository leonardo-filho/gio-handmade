"use client";

import type { ReactNode } from "react";
import { CartProvider } from "./cart/CartProvider";
import { GavetasProvider } from "./v3/estrutura/Gavetas";
import { TabelaProvider } from "./v1/estado/TabelaMedidas";

// Camada client do layout: a sacola (CartProvider), a gaveta da esquerda,
// de menu e busca (GavetasProvider), e a tabela de medidas (TabelaProvider).
// As gavetas ficam no layout, fora do <main>; cada página as abre por estes
// contextos.
export default function Providers({ children }: { children: ReactNode }) {
  return (
    <CartProvider>
      <GavetasProvider>
        <TabelaProvider>{children}</TabelaProvider>
      </GavetasProvider>
    </CartProvider>
  );
}
