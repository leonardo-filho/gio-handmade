// Faixa "Como comprar", entre o desfile e o rodapé. Só o que o site já
// promete: carrinho com frete, pedido pelo WhatsApp, medidas por vídeo, sinal
// de 50% e pronta entrega com envio imediato (textos do ComoFunciona).

import { TEXTO_MEDIDAS, TEXTO_PAGAMENTO } from "@/components/loja/ComoFunciona";

const maiuscula = (t: string) => t.charAt(0).toUpperCase() + t.slice(1);

const PASSOS = [
  {
    titulo: "Monte seu carrinho",
    texto: "Adicione as peças que você ama e calcule o frete no próprio carrinho.",
  },
  {
    titulo: "Finalize pelo WhatsApp",
    texto: "O pedido chega para a Gio com as peças e os valores. É só conversar com ela.",
  },
  {
    titulo: "Feita para você",
    texto: `${maiuscula(TEXTO_MEDIDAS)} ${maiuscula(TEXTO_PAGAMENTO)}`,
  },
];

export default function ComoComprar() {
  return (
    <section aria-labelledby="como-comprar-titulo" className="border-t border-[#b8902a]/25 bg-[#130209] text-[#EDE7D9]">
      <div className="mx-auto max-w-6xl px-5 py-14 lg:px-8 lg:py-20">
        <div className="text-center">
          <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-[#d2ad55]">Depois do desfile</p>
          <h2 id="como-comprar-titulo" className="mt-2 font-[family-name:var(--font-serif)] text-[34px] leading-tight lg:text-5xl">
            Como comprar
          </h2>
        </div>
        <ol className="mt-10 grid gap-8 md:grid-cols-3 md:gap-10 lg:mt-14">
          {PASSOS.map((p, i) => (
            <li key={p.titulo} className="flex gap-4 md:flex-col md:gap-3">
              <span aria-hidden className="nums-preco font-[family-name:var(--font-serif)] text-[40px] italic leading-none text-[#d2ad55]">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div>
                <h3 className="font-[family-name:var(--font-serif)] text-[22px] leading-tight">{p.titulo}</h3>
                <p className="mt-1.5 text-[14px] leading-relaxed text-[#EDE7D9]/80">{p.texto}</p>
              </div>
            </li>
          ))}
        </ol>
        <p className="mx-auto mt-10 max-w-xl text-center text-[13px] leading-relaxed text-[#EDE7D9]/75">
          <span className="font-bold uppercase tracking-[0.16em] text-[#C8E1E4]">Pronta entrega:</span> peça já finalizada,
          com envio imediato. Confira no WhatsApp o tamanho disponível.
        </p>
      </div>
    </section>
  );
}
