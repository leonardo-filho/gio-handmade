"use client";

import type { ReactNode } from "react";
import { CartProvider } from "./cart/CartProvider";
import { GavetasProvider } from "./v3/estrutura/Gavetas";

// Camada client do layout: a sacola (CartProvider) e a gaveta da esquerda,
// de menu e busca (GavetasProvider). As gavetas ficam no layout, fora do
// <main>; o cabeçalho de cada página as abre por estes contextos.
export default function Providers({ children }: { children: ReactNode }) {
  return (
    <CartProvider>
      <GavetasProvider>{children}</GavetasProvider>
    </CartProvider>
  );
}
