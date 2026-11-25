"use client";

import { motion, useInView, useReducedMotion, type Variants } from "framer-motion";
import { useRef, type ReactNode } from "react";

const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;

type RevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  duration?: number;
  once?: boolean;
  /** Primeira dobra: vem visível no HTML do servidor e não anima. */
  imediato?: boolean;
};

export function Reveal({
  children,
  className,
  delay = 0,
  y = 24,
  duration = 1,
  once = true,
  imediato = false,
}: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once, margin: "-80px" });
  const reduce = useReducedMotion();
  const oculto = { opacity: 0, y: reduce ? 0 : y };

  return (
    <motion.div
      ref={ref}
      // initial={false} começa no estado de "animate": com imediato, o conteúdo
      // já sai visível do servidor (sem esperar o JS nem o useInView).
      initial={imediato ? false : oculto}
      animate={imediato || inView ? { opacity: 1, y: 0 } : oculto}
      transition={{ duration: reduce ? 0 : duration, delay, ease: EASE_OUT_EXPO }}
      className={className}
      suppressHydrationWarning
    >
      {children}
    </motion.div>
  );
}

const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

const staggerItem: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.9, ease: EASE_OUT_EXPO },
  },
};

type StaggerProps = {
  children: ReactNode;
  className?: string;
  once?: boolean;
  /** Primeira dobra: os itens vêm visíveis no HTML do servidor e não animam. */
  imediato?: boolean;
};

export function StaggerGroup({ children, className, once = true, imediato = false }: StaggerProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once, margin: "-80px" });

  return (
    <motion.div
      ref={ref}
      variants={staggerContainer}
      // Os StaggerItem herdam o initial={false} e já nascem no estado "visible".
      initial={imediato ? false : "hidden"}
      animate={imediato || inView ? "visible" : "hidden"}
      className={className}
      suppressHydrationWarning
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div variants={staggerItem} className={className} suppressHydrationWarning>
      {children}
    </motion.div>
  );
}
