"use client";

import { useReducedMotion } from "framer-motion";
import { useHidratado } from "@/components/loja/urlLoja";

// Devolve false no servidor e na primeira hidratacao do cliente, evitando
// divergencia de HTML quando o aparelho esta com prefers-reduced-motion ativo.
export function useReduzirMovimento(): boolean {
  const hidratado = useHidratado();
  const reduz = useReducedMotion();
  return hidratado ? Boolean(reduz) : false;
}
