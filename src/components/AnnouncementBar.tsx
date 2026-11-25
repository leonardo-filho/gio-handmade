// Faixa de aviso do topo (spec v3): uma mensagem só, parada, que sai com a
// rolagem (o cabeçalho que fica preso é a barra de baixo). 28 px, navy, texto
// creme em Questrial 11 px, caixa alta com 0,12em.
//
// O cupom saiu da faixa: só cabe uma mensagem, e a do frete é a que já
// existia. Trocar a mensagem é trocar o texto abaixo.

const MENSAGEM = "Frete grátis acima de R$ 600";

export default function AnnouncementBar() {
  return (
    <div className="flex h-7 w-full items-center justify-center bg-[#1B4965] px-4 text-center text-[11px] uppercase leading-none tracking-[0.12em] text-[#EDE7D9]">
      <p className="truncate">{MENSAGEM}</p>
    </div>
  );
}
