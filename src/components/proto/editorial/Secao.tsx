"use client";

import { motion } from "framer-motion";
import CartaoPeca from "./CartaoPeca";
import BlocoTexto from "./BlocoTexto";
import type { Bloco } from "./plano";

const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;

// Classes de cada bloco na grade (2 colunas no celular, 4 no desktop, fluxo
// denso). O plano garante que cada linha fecha nos dois tamanhos.
function classeDoBloco(b: Bloco): string {
  switch (b.tipo) {
    case "destaque":
      return `col-span-2 lg:row-span-2 ${b.lado === "dir" ? "lg:col-start-3" : ""}`;
    case "dupla":
      // Página dupla: a segunda desce no desktop e fica mais estreita, à
      // direita, no celular.
      return b.ordem === 1 ? "col-span-2 max-lg:ml-auto max-lg:w-[84%] lg:mt-32" : "col-span-2";
    case "texto":
      if (b.forma === "largo") return `col-span-2 ${b.lado === "dir" ? "lg:col-start-3" : ""}`;
      if (b.forma === "resto") return "col-span-1 lg:col-span-3";
      return "col-span-1";
    default:
      // Fileira escalonada: a 2ª e a 4ª peça descem um pouco.
      return b.desloca ? "col-span-1 mt-12 lg:mt-24" : "col-span-1";
  }
}

export type CabecalhoSecao = {
  slug: string;
  numero: string;
  titulo: string;
  /** Título visível, quando difere do nome completo (ex.: "Solaris"). */
  tituloCurto?: string;
  joliet?: boolean;
  chapeu?: string;
  linhaFina?: string;
  contagem: string;
  faixa?: string | null;
};

export default function Secao({
  cabecalho,
  blocos,
  onAbrir,
  marcarPronta = true,
}: {
  cabecalho: CabecalhoSecao;
  blocos: Bloco[];
  onAbrir: (id: string) => void;
  /** Na vista "Pronta entrega" a marca em cada card seria repetição. */
  marcarPronta?: boolean;
}) {
  const idTitulo = `ed-secao-${cabecalho.slug}`;
  return (
    <section aria-labelledby={idTitulo} className="scroll-mt-40">
      <Abertura {...cabecalho} idTitulo={idTitulo} />

      <div className="grid grid-cols-2 gap-x-3 gap-y-10 grid-flow-row-dense lg:grid-cols-4 lg:gap-x-6 lg:gap-y-16">
        {blocos.map((b) => (
          <motion.div
            key={b.chave}
            className={classeDoBloco(b)}
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "0px 0px -60px 0px" }}
            transition={{ duration: 0.9, ease: EASE_OUT_EXPO }}
          >
            {b.tipo === "texto" ? (
              <BlocoTexto interludio={b.interludio} forma={b.forma} />
            ) : (
              <CartaoPeca
                produto={b.produto}
                variante={b.tipo === "peca" ? "normal" : b.tipo}
                fotoInicial={b.tipo === "peca" ? 0 : b.fotoInicial}
                sangra={b.tipo !== "dupla" || b.ordem === 0}
                marcarPronta={marcarPronta}
                onAbrir={onAbrir}
              />
            )}
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function Abertura({
  idTitulo,
  numero,
  titulo,
  tituloCurto,
  joliet,
  chapeu,
  linhaFina,
  contagem,
  faixa,
}: CabecalhoSecao & { idTitulo: string }) {
  return (
    <motion.header
      className="mb-8 lg:mb-14"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -60px 0px" }}
      transition={{ duration: 1, ease: EASE_OUT_EXPO }}
    >
      {/* Fio de página: chapéu à esquerda, contagem à direita. */}
      <div className="flex items-baseline justify-between gap-4 border-t border-[#1B4965] pt-2.5">
        <p className="text-[11px] font-bold uppercase tracking-[0.26em] text-brand-gold-text">{chapeu ?? "Gio Handmade · Loja"}</p>
        <p className="text-[11px] uppercase tracking-[0.2em] text-brand-muted">
          {contagem}
          {faixa && <span className="hidden sm:inline">{` · ${faixa}`}</span>}
        </p>
      </div>

      <div className="mt-5 flex items-start gap-3 lg:mt-8 lg:gap-8">
        <span
          aria-hidden
          className="shrink-0 font-serif text-[56px] italic leading-[0.78] text-[#b8902a] [font-variant-numeric:lining-nums] lg:text-[150px]"
        >
          {numero}
        </span>
        <div className="min-w-0">
          <h2
            id={idTitulo}
            className={`text-balance leading-[0.86] text-[#1B4965] ${
              joliet
                ? "font-joliet text-[60px] tracking-[-0.01em] lg:text-[150px]"
                : "font-serif text-[52px] tracking-[-0.025em] lg:text-[136px]"
            }`}
          >
            {tituloCurto ? (
              <>
                <span aria-hidden>{tituloCurto}</span>
                <span className="sr-only">{titulo}</span>
              </>
            ) : (
              titulo
            )}
          </h2>
          {linhaFina && (
            <p className="mt-3 max-w-xl font-serif text-lg italic leading-snug text-brand-muted lg:mt-5 lg:text-2xl">
              {linhaFina}
            </p>
          )}
          {faixa && <p className="mt-2 text-xs text-brand-muted sm:hidden">{faixa}</p>}
        </div>
      </div>
    </motion.header>
  );
}
