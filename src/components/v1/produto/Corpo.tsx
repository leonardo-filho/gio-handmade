// Desenho do corpo para a tabela de medidas: um busto de costura (o mesmo
// manequim das fotos da Gio), em traço navy, com a fita passando nas três
// alturas que a tabela usa. Ao lado de cada fita, o nome da medida e onde
// medir. A medida em destaque ganha a fita cheia e o fundo menta no rótulo.

export type Parte = "busto" | "cintura" | "quadril";

const FITAS: { parte: Parte; nome: string; onde: string; y: number; x: number }[] = [
  { parte: "busto", nome: "Busto", onde: "na parte mais cheia", y: 104, x: 27 },
  { parte: "cintura", nome: "Cintura", onde: "na parte mais fina", y: 150, x: 45 },
  { parte: "quadril", nome: "Quadril", onde: "na parte mais larga", y: 206, x: 33 },
];

// Metade esquerda do contorno (de cima para baixo); a direita é o espelho.
const LADO =
  "M67 40 C 58 47 44 48 36 55 C 31 60 30 70 31 78 C 28 88 26 98 27 108 C 28 122 41 136 45 150 C 47 160 44 170 40 180 C 34 194 32 206 34 218 C 36 232 43 241 52 246";

const ESPELHO = "translate(160 0) scale(-1 1)";

export default function Corpo({ destaque = null, className = "" }: { destaque?: Parte | null; className?: string }) {
  return (
    <svg viewBox="0 0 300 300" role="img" aria-label="Onde medir busto, cintura e quadril" className={className}>
      <g fill="none" stroke="#1B4965" strokeWidth={1.3} strokeLinecap="round" strokeLinejoin="round">
        {/* Pescoço e tampa do manequim */}
        <ellipse cx="80" cy="18" rx="13" ry="4" />
        <path d="M67 18 L68 40 M93 18 L92 40" />
        {/* Contorno */}
        <path d={LADO} />
        <path d={LADO} transform={ESPELHO} />
        <path d="M52 246 C 68 253 92 253 108 246" />
        {/* Pé */}
        <path d="M80 251 V 284 M58 290 H 102 M80 284 L 62 290 M80 284 L 98 290" strokeWidth={1.1} />
      </g>

      {FITAS.map((f) => {
        const ativa = destaque === f.parte;
        const xDir = 160 - f.x;
        return (
          <g key={f.parte}>
            {/* A fita: arco na frente do corpo */}
            <path
              d={`M${f.x} ${f.y} Q 80 ${f.y + 9} ${xDir} ${f.y}`}
              fill="none"
              stroke="#1B4965"
              strokeWidth={ativa ? 2 : 1.2}
              strokeDasharray={ativa ? undefined : "3 3"}
            />
            {/* Linha de chamada até o rótulo */}
            <path d={`M${xDir + 4} ${f.y} H 168`} stroke="#1B4965" strokeOpacity={0.35} strokeWidth={1} />
            <circle cx={xDir} cy={f.y} r={2.2} fill="#1B4965" />
            {ativa && <rect x="170" y={f.y - 17} width="126" height="34" rx="4" fill="#C8E1E4" />}
            <text x="178" y={f.y - 1} fill="#1B4965" className="font-[family-name:var(--font-serif)]" fontSize="17">
              {f.nome}
            </text>
            <text x="178" y={f.y + 13} fill="#3f6178" fontSize="11.5">
              {f.onde}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
