"use client";

import { useCallback } from "react";
import { useHidratado } from "@/components/loja/urlLoja";
import { movimentoReduzido } from "@/components/vitrine/movimento";

// Movimento reduzido para os valores que a rolagem conduz (useTransform). Na
// hidratação vale "não": o HTML do servidor não sabe da preferência e os dois
// lados precisam começar iguais. Logo depois o componente renderiza de novo
// e o valor parado entra (fora da tela, porque tudo isso fica abaixo da
// abertura).
export function useParado() {
  const hidratado = useHidratado();
  return useCallback(() => hidratado && movimentoReduzido(), [hidratado]);
}
