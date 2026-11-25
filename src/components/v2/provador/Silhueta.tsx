import type { CSSProperties } from "react";
import type { Medidas } from "@/data/medidas";
import type { CampoMedida } from "@/lib/v2/medidasRascunho";

// Silhueta do provador: o manequim de costura do ateliê (é nele que a Gio
// fotografa as peças), com uma fita em volta do busto, da cintura e do
// quadril. A largura do manequim acompanha as medidas digitadas, dentro de
// limites que mantêm o desenho bonito. A fita da medida em foco engrossa e
// ganha a faixa menta; a medida preenchida fica com a fita cheia.
//
// A troca de forma desliza em 0,35 s onde o navegador anima o `d` do SVG
// (classe .silhueta-forma no globals.css, desligada com movimento reduzido);
// nos outros, troca seca. O desenho é decorativo: os campos dizem tudo.

type Props = {
  medidas: Medidas;
  ativo: CampoMedida | null;
  /** Medidas por vídeo: as fitas ficam apagadas. */
  apagado?: boolean;
  className?: string;
};

const CX = 80;

/** Medida em cm para meia largura no desenho, com teto e piso. */
function meia(valor: number | undefined, padrao: number, [lo, hi]: [number, number], [a, b]: [number, number]) {
  const v = Math.min(hi, Math.max(lo, valor ?? padrao));
  return a + ((v - lo) / (hi - lo)) * (b - a);
}

const ALTURA: Record<CampoMedida, number> = { busto: 96, cintura: 146, quadril: 190 };

function larguras(m: Medidas) {
  const busto = meia(m.busto, 86, [70, 115], [30, 46]);
  const cintura = meia(m.cintura, 68, [55, 105], [21, 39]);
  const quadril = meia(m.quadril, 96, [80, 125], [33, 50]);
  return { busto, cintura, quadril };
}

const r = (n: number) => Math.round(n * 10) / 10;

function contorno(m: Medidas): string {
  const { busto: b, cintura: w, quadril: h } = larguras(m);
  const ombro = 33 + (b - 30) * 0.65;
  const pescoco = 9;
  // Lado direito, de cima para baixo; o esquerdo é o espelho, de baixo para cima.
  const dir = (dx: number) => r(CX + dx);
  const esq = (dx: number) => r(CX - dx);
  return [
    `M ${dir(pescoco)} 18`,
    `L ${dir(pescoco)} 30`,
    `C ${dir(pescoco + 2)} 40 ${dir(ombro - 14)} 42 ${dir(ombro)} 50`,
    `C ${dir(ombro + 7)} 54 ${dir(b + 1)} 76 ${dir(b)} 96`,
    `C ${dir(b)} 116 ${dir(w)} 126 ${dir(w)} 146`,
    `C ${dir(w)} 166 ${dir(h)} 172 ${dir(h)} 190`,
    `C ${dir(h)} 204 ${dir(h - 2)} 214 ${dir(h - 5)} 222`,
    `Q ${CX} 231 ${esq(h - 5)} 222`,
    `C ${esq(h - 2)} 214 ${esq(h)} 204 ${esq(h)} 190`,
    `C ${esq(h)} 172 ${esq(w)} 166 ${esq(w)} 146`,
    `C ${esq(w)} 126 ${esq(b)} 116 ${esq(b)} 96`,
    `C ${esq(b + 1)} 76 ${esq(ombro + 7)} 54 ${esq(ombro)} 50`,
    `C ${esq(ombro - 14)} 42 ${esq(pescoco + 2)} 40 ${esq(pescoco)} 30`,
    `L ${esq(pescoco)} 18 Z`,
  ].join(" ");
}

/** Meia elipse da fita: a da frente passa por baixo, a de trás por cima. */
function arco(y: number, rx: number, frente: boolean): string {
  const ry = 5;
  return `M ${r(CX - rx)} ${y} A ${r(rx)} ${ry} 0 0 ${frente ? 0 : 1} ${r(CX + rx)} ${y}`;
}

// O `d` vai no atributo (todo navegador) e no estilo (quem anima o `d`).
function forma(d: string): { d: string; style: CSSProperties } {
  return { d, style: { d: `path("${d}")` } as CSSProperties };
}

export default function Silhueta({ medidas, ativo, apagado = false, className = "" }: Props) {
  const l = larguras(medidas);
  const fitas: { campo: CampoMedida; rx: number }[] = [
    { campo: "busto", rx: l.busto + 1.5 },
    { campo: "cintura", rx: l.cintura + 1.5 },
    { campo: "quadril", rx: l.quadril + 1.5 },
  ];

  return (
    <svg viewBox="0 0 160 262" aria-hidden className={className} fill="none">
      {/* Corpo do manequim: linho um tom abaixo do creme. */}
      <path className="silhueta-forma" {...forma(contorno(medidas))} fill="#E3DAC7" stroke="#1B4965" strokeWidth={1.25} strokeLinejoin="round" />
      {/* Costura do meio. */}
      <path d={`M ${CX} 30 L ${CX} 228`} stroke="#1B4965" strokeOpacity={0.14} strokeWidth={1} />
      {/* Tampa do pescoço. */}
      <ellipse cx={CX} cy={18} rx={9} ry={2.6} fill="#EDE7D9" stroke="#1B4965" strokeWidth={1.25} />
      {/* Haste e pé. */}
      <path d={`M ${CX} 229 L ${CX} 252`} stroke="#1B4965" strokeWidth={1.5} strokeLinecap="round" />
      <ellipse cx={CX} cy={255} rx={22} ry={3.4} stroke="#1B4965" strokeWidth={1.25} fill="#EDE7D9" />

      {fitas.map(({ campo, rx }) => {
        const y = ALTURA[campo];
        const foco = ativo === campo && !apagado;
        const cheia = medidas[campo] !== undefined && !apagado;
        return (
          <g key={campo} opacity={apagado ? 0.35 : 1}>
            {foco && (
              <ellipse cx={CX} cy={y} rx={rx + 1} ry={7} fill="#C8E1E4" fillOpacity={0.85} className="silhueta-forma" />
            )}
            <path
              className="silhueta-forma"
              {...forma(arco(y, rx, false))}
              stroke="#1B4965"
              strokeOpacity={cheia || foco ? 0.45 : 0.25}
              strokeWidth={1}
              strokeDasharray="2 2.5"
            />
            <path
              className="silhueta-forma"
              {...forma(arco(y, rx, true))}
              stroke="#1B4965"
              strokeOpacity={cheia || foco ? 1 : 0.5}
              strokeWidth={foco ? 2.4 : cheia ? 1.6 : 1.1}
              strokeDasharray={cheia || foco ? undefined : "3 2.5"}
              strokeLinecap="round"
            />
            {(foco || cheia) && <circle cx={r(CX + rx)} cy={y} r={foco ? 2.6 : 1.9} fill="#1B4965" />}
          </g>
        );
      })}
    </svg>
  );
}
