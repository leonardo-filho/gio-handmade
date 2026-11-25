// Ícones de traço da estrutura v3 (traço de 1,5 px, cantos redondos), no
// padrão das três lojas de referência. Herdam a cor do texto.

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

export function IconeMenu(props: P) {
  return (
    <svg {...tracado} {...props}>
      <path d="M3 6.5h18M3 12h18M3 17.5h18" />
    </svg>
  );
}

export function IconeLupa(props: P) {
  return (
    <svg {...tracado} {...props}>
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="m15.5 15.5 5 5" />
    </svg>
  );
}

export function IconeFechar(props: P) {
  return (
    <svg {...tracado} {...props}>
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  );
}

/** Sacola com espaço no corpo para o número de peças. */
export function IconeSacola(props: P) {
  return (
    <svg {...tracado} {...props}>
      <path d="M4.5 8h15l-.9 12.1a1 1 0 0 1-1 .9H6.4a1 1 0 0 1-1-.9z" />
      <path d="M8.5 8V6.5a3.5 3.5 0 0 1 7 0V8" />
    </svg>
  );
}

export function IconeSeta(props: P) {
  return (
    <svg {...tracado} {...props}>
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

export function IconeInstagram(props: P) {
  return (
    <svg {...tracado} {...props}>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function IconeWhatsApp(props: P) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path d="M.057 24l1.687-6.163a11.867 11.867 0 01-1.587-5.945C.16 5.335 5.495 0 12.05 0a11.817 11.817 0 018.413 3.488 11.824 11.824 0 013.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 01-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.821 9.821 0 001.519 5.26l-.999 3.648 3.97-1.317zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
    </svg>
  );
}
