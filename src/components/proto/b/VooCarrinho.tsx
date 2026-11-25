"use client";

import { createPortal } from "react-dom";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { useHidratado } from "@/components/loja/urlLoja";
import { EASE_ATELIER } from "./animacoes";
import { useReduzirMovimento } from "./useReduzirMovimento";

export type VooItem = {
  chave: number;
  foto: string;
  origem: { x: number; y: number };
  destino: { x: number; y: number };
};

export type PulsoDestino = {
  chave: number;
  x: number;
  y: number;
};

type Props = {
  voos: VooItem[];
  pulsoDestino: PulsoDestino | null;
  onFimVoo: (chave: number, destino: { x: number; y: number }) => void;
};

export default function VooCarrinho({ voos, pulsoDestino, onFimVoo }: Props) {
  const hidratado = useHidratado();
  const reduzir = useReduzirMovimento();

  if (!hidratado || reduzir) return null;

  return createPortal(
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[110] overflow-hidden">
      <AnimatePresence>
        {voos.map((voo) => {
          const meioX = (voo.origem.x + voo.destino.x) / 2;
          const picoY = Math.min(voo.origem.y, voo.destino.y) - 64;

          return (
            <motion.div
              key={voo.chave}
              initial={{
                x: voo.origem.x - 22,
                y: voo.origem.y - 28,
                scale: 1,
                opacity: 0.96,
                rotate: 0,
              }}
              animate={{
                x: [voo.origem.x - 22, meioX - 22, voo.destino.x - 22],
                y: [voo.origem.y - 28, picoY - 28, voo.destino.y - 28],
                scale: [1, 1.08, 0.3],
                opacity: [0.96, 1, 0.25],
                rotate: [0, -6, 8],
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.62, ease: EASE_ATELIER }}
              onAnimationComplete={() => onFimVoo(voo.chave, voo.destino)}
              className="fixed left-0 top-0 h-14 w-11 overflow-hidden rounded-sm bg-white shadow-lg ring-1 ring-[#b8902a]/80"
            >
              <Image src={voo.foto} alt="" fill sizes="44px" className="object-cover" />
            </motion.div>
          );
        })}
      </AnimatePresence>

      <AnimatePresence>
        {pulsoDestino && (
          <motion.span
            key={pulsoDestino.chave}
            initial={{
              x: pulsoDestino.x - 22,
              y: pulsoDestino.y - 22,
              scale: 0.65,
              opacity: 0.9,
            }}
            animate={{
              x: pulsoDestino.x - 22,
              y: pulsoDestino.y - 22,
              scale: 1.9,
              opacity: 0,
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.45, ease: EASE_ATELIER }}
            className="fixed left-0 top-0 h-11 w-11 rounded-full border-2 border-[#b8902a]"
          />
        )}
      </AnimatePresence>
    </div>,
    document.body
  );
}
