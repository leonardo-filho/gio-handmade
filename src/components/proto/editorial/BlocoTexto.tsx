import type { FormaTexto, Interludio } from "./plano";

const WA = "559192982017";
const MSG_PERSONALIZAR = "Oi, Gio! Queria personalizar uma peça (cores e acabamentos). Pode me ajudar?";

// Texto que quebra a grade, como uma página de revista entre as fotos:
// citação grande, nota de serviço (fundo menta) ou frase curta numa célula.
export default function BlocoTexto({ interludio, forma }: { interludio: Interludio; forma: FormaTexto }) {
  if (interludio.tipo === "citacao") {
    return (
      <figure className="flex h-full flex-col justify-center py-6 lg:px-6 lg:py-10">
        <span aria-hidden className="font-serif text-[64px] leading-[0.5] text-[#b8902a] lg:text-[88px]">
          “
        </span>
        <blockquote
          className={`mt-2 text-balance font-serif italic leading-[1.08] tracking-[-0.01em] text-[#1B4965] ${
            forma === "largo" ? "text-[34px] lg:text-[46px]" : "text-[26px] lg:text-[34px]"
          }`}
        >
          {interludio.texto}
        </blockquote>
        {interludio.assinatura && (
          <figcaption className="mt-4 text-[11px] font-bold uppercase tracking-[0.22em] text-brand-gold-text">
            {interludio.assinatura}
          </figcaption>
        )}
      </figure>
    );
  }

  if (interludio.tipo === "nota") {
    return (
      <aside className="flex h-full flex-col justify-between gap-6 bg-[#C8E1E4] p-6 text-[#1B4965] lg:p-9">
        <p className="text-[11px] font-bold uppercase tracking-[0.24em]">{interludio.rotulo}</p>
        <p className="text-balance font-serif text-[26px] leading-[1.15] lg:text-[32px]">
          {interludio.texto}
        </p>
        {interludio.whatsapp && (
          <a
            href={`https://wa.me/${WA}?text=${encodeURIComponent(MSG_PERSONALIZAR)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 items-center gap-2 self-start border-b border-[#1B4965] text-xs font-bold uppercase tracking-[0.18em] transition-colors hover:border-[#130209] hover:text-[#130209] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1B4965] focus-visible:ring-offset-4 focus-visible:ring-offset-[#C8E1E4]"
          >
            Chamar no WhatsApp
            <svg width="18" height="9" viewBox="0 0 22 10" fill="none" aria-hidden>
              <path d="M1 5H20M20 5L16 1M20 5L16 9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
          </a>
        )}
      </aside>
    );
  }

  // Curto: célula do tamanho de um card (ou o resto da linha no desktop).
  return (
    <div
      className={`flex h-full flex-col justify-end border-t border-[#1B4965]/25 pt-4 ${
        forma === "resto" ? "lg:justify-center lg:border-t-0 lg:pl-10 lg:pt-0" : ""
      }`}
    >
      <p
        className={`text-balance font-serif italic leading-[1.02] tracking-[-0.01em] text-[#1B4965] ${
          forma === "resto" ? "text-[30px] lg:text-[64px]" : "text-[30px] lg:text-[40px]"
        }`}
      >
        {interludio.texto}
      </p>
      {interludio.apoio && (
        <p className="mt-3 max-w-[22rem] text-[13px] leading-relaxed text-brand-muted">{interludio.apoio}</p>
      )}
    </div>
  );
}
