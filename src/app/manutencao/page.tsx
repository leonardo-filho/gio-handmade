import type { Metadata } from "next";
import BrandMark, { Sparkle } from "@/components/catalogo/BrandMark";

export const metadata: Metadata = {
  title: "Gio Handmade · Voltamos em breve",
  robots: { index: false, follow: false },
};

const WHATSAPP_HREF =
  "https://wa.me/559192982017?text=Ol%C3%A1%2C%20gostaria%20de%20fazer%20uma%20encomenda.";

export default function Manutencao() {
  return (
    <main className="min-h-[100svh] flex items-center justify-center bg-[#EDE7D9] px-6 py-10">
      <div className="max-w-xl w-full text-center">
        <p className="text-[11px] md:text-xs tracking-[0.5em] uppercase font-[family-name:var(--font-display)] text-[#130209]/60">
          Site em atualização
        </p>

        <div className="-my-4 md:-my-8 flex justify-center">
          <BrandMark
            tone="cream"
            priority
            width={520}
            height={520}
            className="w-[200px] md:w-[280px] h-auto"
            alt="Logo Gio Handmade"
          />
        </div>

        <h1 className="mt-2 font-brand text-[#1B4965] lowercase italic text-[clamp(2rem,6vw,3.4rem)] leading-[1.05] tracking-[-0.01em]">
          voltamos em breve
        </h1>

        <div className="mt-5 flex items-center justify-center gap-3 text-[#1B4965]">
          <span className="block w-10 h-px bg-[#1B4965]/35" />
          <Sparkle className="text-[#1B4965]/80" size={14} />
          <span className="block w-10 h-px bg-[#1B4965]/35" />
        </div>

        <p className="mt-5 font-[family-name:var(--font-serif)] text-lg md:text-xl text-[#130209]/80 leading-relaxed">
          Estamos ajustando os detalhes da loja com o mesmo cuidado de cada peça.
          Enquanto isso, as encomendas seguem abertas pelo WhatsApp.
        </p>

        <a
          href={WHATSAPP_HREF}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-8 inline-flex items-center justify-center rounded-full bg-[#1B4965] px-8 py-3.5 text-sm tracking-[0.2em] uppercase font-[family-name:var(--font-display)] text-[#EDE7D9] transition-opacity hover:opacity-90"
        >
          Falar no WhatsApp
        </a>
      </div>
    </main>
  );
}
