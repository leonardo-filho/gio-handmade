import { TABELA_MEDIDAS, formatarFaixa } from "@/data/medidas";

// Tabela de medidas da Gio (PP a GG, em cm). A linha do tamanho mais perto
// das medidas digitadas fica marcada em menta.
export default function TabelaMedidas({ destaque }: { destaque?: string | null }) {
  return (
    <table className="w-full border-collapse text-left text-[13px] leading-5 text-[#1B4965]">
      <caption className="sr-only">Tabela de medidas em centímetros</caption>
      <thead>
        <tr className="border-b border-[#1B4965]/15 text-[10px] uppercase tracking-[0.14em]">
          <th scope="col" className="py-2 pr-2 font-normal">
            Tam.
          </th>
          <th scope="col" className="py-2 pr-2 font-normal">
            Busto
          </th>
          <th scope="col" className="py-2 pr-2 font-normal">
            Cintura
          </th>
          <th scope="col" className="py-2 font-normal">
            Quadril
          </th>
        </tr>
      </thead>
      <tbody className="nums-preco">
        {TABELA_MEDIDAS.map((l) => {
          const marcada = l.tamanho === destaque;
          return (
            <tr
              key={l.tamanho}
              aria-current={marcada || undefined}
              className={`border-b border-[#1B4965]/10 ${marcada ? "bg-[#C8E1E4]" : ""}`}
            >
              <th scope="row" className="py-2 pl-1 pr-2 font-normal">
                {l.tamanho} <span className="text-brand-muted">({l.numero})</span>
              </th>
              <td className="py-2 pr-2">{formatarFaixa(l.busto)}</td>
              <td className="py-2 pr-2">{formatarFaixa(l.cintura)}</td>
              <td className="py-2">{formatarFaixa(l.quadril)}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
