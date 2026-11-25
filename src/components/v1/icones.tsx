// Ícones de traço da versão 1 (mesmo traço de 1,5 px dos ícones da v3).
// Herdam a cor do texto.

import type { SVGProps } from "react";

type P = SVGProps<SVGSVGElement>;

const tracado = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

/** Régua (botão "Tabela de medidas"). */
export function IconeRegua(props: P) {
  return (
    <svg {...tracado} {...props}>
      <rect x="2.5" y="8" width="19" height="8" rx="1" />
      <path d="M6 8v3M9.5 8v4.5M13 8v3M16.5 8v4.5M20 8v3" />
    </svg>
  );
}

/** Lupa com "+" (botão "Ver de perto"). */
export function IconeVerDePerto(props: P) {
  return (
    <svg {...tracado} {...props}>
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="m15.5 15.5 5 5M10.5 7.75v5.5M7.75 10.5h5.5" />
    </svg>
  );
}

export function IconeMais(props: P) {
  return (
    <svg {...tracado} {...props}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

export function IconeMenos(props: P) {
  return (
    <svg {...tracado} {...props}>
      <path d="M5 12h14" />
    </svg>
  );
}

export function IconeCadeado(props: P) {
  return (
    <svg {...tracado} {...props}>
      <rect x="5" y="10.5" width="14" height="10" rx="1.5" />
      <path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" />
    </svg>
  );
}

export function IconeCheck(props: P) {
  return (
    <svg {...tracado} {...props}>
      <path d="m5 12.5 4.5 4.5L19 7.5" />
    </svg>
  );
}

export function IconeVoltar(props: P) {
  return (
    <svg {...tracado} {...props}>
      <path d="M15 5 8 12l7 7" />
    </svg>
  );
}
