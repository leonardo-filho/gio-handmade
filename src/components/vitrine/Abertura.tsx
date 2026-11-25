import { atraso } from "./movimento";
import Selo from "./Selo";
import s from "./vitrine.module.css";

// Abertura da loja: o título sobe de dentro das linhas (máscara), a costura
// dourada se desenha e a linha de apoio aparece. Tudo em CSS, na primeira
// pintura do HTML do servidor, e rápido: as peças com preço aparecem logo
// abaixo. No celular é compacta (título numa linha e o selo menor ao lado),
// para o preço da primeira fileira caber na tela também no navegador do
// Instagram (cerca de 390x700).
export default function Abertura() {
  return (
    <header className="relative px-4 pb-4 pt-4 md:px-6 md:pb-8 md:pt-10 lg:px-0 lg:pb-8 lg:pt-14">
      <div
        className={`absolute right-4 top-3 h-[60px] w-[60px] md:right-6 md:top-6 md:h-[116px] md:w-[116px] lg:right-0 lg:top-12 xl:h-[136px] xl:w-[136px] ${s.selo}`}
        style={atraso(220)}
      >
        <Selo className="absolute inset-0" />
      </div>
      <p
        className={`pr-[72px] text-[10px] font-bold uppercase tracking-[0.24em] text-brand-gold-text md:pr-0 md:text-[11px] ${s.surgir}`}
        style={atraso(0)}
      >
        A loja · Belém do Pará
      </p>
      <h1
        id="loja-titulo"
        className="mt-1.5 pr-[70px] font-[family-name:var(--font-serif)] text-[26px] leading-[1.05] tracking-[-0.01em] text-[#1B4965] min-[375px]:text-[29px] md:mt-5 md:pr-0 md:text-[68px] md:leading-[0.98] md:tracking-[-0.015em] xl:text-[80px]"
      >
        <span className={`${s.linha} ${s.linhaJunta}`}>
          <span style={atraso(40)}>Bordado à mão,</span>
        </span>
        <span className={`${s.linha} ${s.linhaJunta}`}>
          <span style={atraso(110)} className="italic">
            um a um.
          </span>
        </span>
      </h1>
      <div className="mt-2.5 flex items-center gap-3 md:mt-6 md:gap-5">
        <span aria-hidden className={`h-[1.5px] w-9 shrink-0 md:w-28 ${s.ponto} ${s.costurar}`} style={atraso(320)} />
        <p className={`text-[12.5px] leading-snug text-brand-muted md:text-[15px] ${s.surgir}`} style={atraso(200)}>
          Monte seu carrinho e finalize pelo WhatsApp.
        </p>
      </div>
    </header>
  );
}
