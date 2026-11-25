import { TEXTO_MEDIDAS, TEXTO_PAGAMENTO } from "@/components/loja/ComoFunciona";

const WA_LINK =
  "https://wa.me/559192982017?text=Ol%C3%A1%2C%20gostaria%20de%20realizar%20um%20or%C3%A7amento.";

// Última página da revista: como a compra acontece. Só o que o site já diz
// (texto da loja e o passo a passo do modal da peça).
const PASSOS = [
  { titulo: "Carrinho", texto: "monte seu carrinho e calcule o frete. Envio para todo o Brasil." },
  { titulo: "WhatsApp", texto: "finalize o pedido pelo WhatsApp, direto com a Gio." },
  { titulo: "Medidas", texto: TEXTO_MEDIDAS },
  { titulo: "Pagamento", texto: TEXTO_PAGAMENTO },
];

export default function ComoComprar() {
  return (
    <section aria-labelledby="ed-comprar-titulo" className="border-t border-[#1B4965] bg-[#EDE7D9]">
      <div className="mx-auto max-w-[1320px] px-4 py-14 lg:grid lg:grid-cols-[1fr_1.4fr] lg:gap-20 lg:px-10 lg:py-24">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.26em] text-brand-gold-text">Como comprar</p>
          <h2
            id="ed-comprar-titulo"
            className="mt-3 font-serif text-[44px] leading-[0.92] tracking-[-0.02em] text-[#1B4965] lg:text-[84px]"
          >
            Do carrinho
            <br />
            <em>ao WhatsApp.</em>
          </h2>
          <a
            href={WA_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-7 inline-flex min-h-12 items-center justify-center gap-2.5 bg-[#1B4965] px-7 text-xs font-bold uppercase tracking-[0.2em] text-[#EDE7D9] transition-colors hover:bg-[#130209] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1B4965] focus-visible:ring-offset-2 focus-visible:ring-offset-[#EDE7D9] lg:mt-10"
          >
            Falar com a Gio
            <svg width="18" height="9" viewBox="0 0 22 10" fill="none" aria-hidden>
              <path d="M1 5H20M20 5L16 1M20 5L16 9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
          </a>
        </div>

        <ol className="mt-10 border-t border-[#1B4965]/30 lg:mt-0">
          {PASSOS.map((p, i) => (
            <li key={p.titulo} className="flex gap-4 border-b border-[#1B4965]/20 py-5 lg:gap-8 lg:py-7">
              <span
                aria-hidden
                className="w-8 shrink-0 font-serif text-2xl italic leading-none text-brand-gold-text [font-variant-numeric:lining-nums] lg:w-12 lg:text-4xl"
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <p className="text-[15px] leading-relaxed text-brand-muted lg:text-base">
                <span className="font-serif text-xl text-[#1B4965] lg:text-2xl">{p.titulo}:</span>{" "}
                {p.texto}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
