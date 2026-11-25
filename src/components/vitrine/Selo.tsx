"use client";

import Image from "next/image";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { TOTAL_PECAS } from "@/components/loja/vistas";
import { PAUSA } from "./dados";

// Selo da abertura: um botão de bordado (o Top Maya de perto) dentro de um
// anel de texto que gira com a rolagem, como a etiqueta costurada de uma
// peça. Gira só quando a página rola (sem animação infinita) e fica parado
// com movimento reduzido.
export default function Selo({ className = "" }: { className?: string }) {
  const reduz = useReducedMotion();
  const { scrollY } = useScroll();
  const giro = useTransform(scrollY, [0, 2400], [0, reduz ? 0 : 300]);

  return (
    <div aria-hidden className={`pointer-events-none select-none ${className}`}>
      <motion.svg viewBox="0 0 100 100" style={{ rotate: giro }} className="absolute inset-0 h-full w-full">
        <defs>
          <path id="selo-anel" d="M50,50 m-40,0 a40,40 0 1,1 80,0 a40,40 0 1,1 -80,0" />
        </defs>
        <text
          fill="#7d611c"
          fontSize="8.2"
          fontWeight="700"
          style={{ fontFamily: "var(--font-sans), sans-serif", textTransform: "uppercase" }}
        >
          <textPath href="#selo-anel" textLength="248" lengthAdjust="spacing">
            {`${TOTAL_PECAS} peças · feitas à mão · Belém ·`}
          </textPath>
        </text>
      </motion.svg>
      <div className="absolute inset-[23%] overflow-hidden rounded-full shadow-[0_0_0_1.5px_#b8902a,0_0_0_4px_#EDE7D9,0_0_0_5px_rgba(27,73,101,0.25)]">
        <Image src={PAUSA.foto} alt="" fill sizes="96px" className="scale-[1.7] object-cover" style={{ objectPosition: "40% 36%" }} />
      </div>
    </div>
  );
}
