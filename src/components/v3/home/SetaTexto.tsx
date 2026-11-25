// Seta "→" dos rótulos em caixa alta. Desenhada em traço porque a Questrial
// não tem o caractere e cada sistema trocaria por uma seta de outra fonte.
export default function SetaTexto({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 14 10"
      width="14"
      height="10"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.1}
      aria-hidden
      className={`shrink-0 ${className}`}
    >
      <path d="M0 5h13M9 1l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
