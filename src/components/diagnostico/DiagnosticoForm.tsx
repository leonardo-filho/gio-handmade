"use client";

import { useEffect, useState } from "react";

// Formulário de diagnóstico do negócio. A Gio responde pelo celular; no final
// o botão compila tudo numa mensagem de WhatsApp pro Leonardo. As respostas
// ficam salvas no localStorage (ela sai pra olhar o Instagram e volta).

type Pergunta = {
  id: string;
  label: string;
  dica?: string;
  tipo: "texto" | "textarea" | "radio" | "multi";
  opcoes?: string[];
  placeholder?: string;
  curto?: boolean;
};

type Secao = {
  titulo: string;
  sub: string;
  perguntas: Pergunta[];
};

const SECOES: Secao[] = [
  {
    titulo: "Instagram e alcance",
    sub: "Os números ficam no app: perfil → Painel profissional.",
    perguntas: [
      {
        id: "seguidores",
        label: "Quantos seguidores a conta tem hoje?",
        tipo: "texto",
        placeholder: "ex.: 1.850",
        curto: true,
      },
      {
        id: "alcance-posts",
        label: "Qual foi o alcance dos últimos 3 posts/reels da Solaris?",
        dica: 'Abre cada post → "Ver insights" → número de Alcance. Pode escrever os 3 separados por barra.',
        tipo: "texto",
        placeholder: "ex.: 850 / 1.200 / 640",
      },
      {
        id: "alcance-30d",
        label: "Contas alcançadas nos últimos 30 dias?",
        dica: "Painel profissional → Alcance. Se aparecer, anota também o % de não-seguidores.",
        tipo: "texto",
        placeholder: "ex.: 3.400 (62% não-seguidores)",
      },
      {
        id: "stories",
        label: "Quantos stories você posta por semana, em média?",
        tipo: "radio",
        opcoes: ["Quase nenhum", "1 a 5", "5 a 15", "Todo dia, vários"],
      },
    ],
  },
  {
    titulo: "Conversas desde a Solaris",
    sub: "Conta tudo: DM, WhatsApp, comentário perguntando preço.",
    perguntas: [
      {
        id: "conversas",
        label: "Quantas pessoas te chamaram desde o lançamento da Solaris?",
        dica: "Mesmo que só tenham perguntado o preço e sumido.",
        tipo: "texto",
        placeholder: "ex.: 4",
        curto: true,
      },
      {
        id: "sumiram",
        label: "Dessas, quantas pediram o preço e depois sumiram?",
        tipo: "texto",
        placeholder: "ex.: 3",
        curto: true,
      },
      {
        id: "resposta",
        label: "Em quanto tempo você costuma responder uma mensagem?",
        tipo: "radio",
        opcoes: ["Em minutos", "Em poucas horas", "No mesmo dia", "Às vezes passa de um dia"],
      },
    ],
  },
  {
    titulo: "Histórico de vendas",
    sub: "O que já vendeu e como essas clientes chegaram.",
    perguntas: [
      {
        id: "ultima-venda",
        label: "Quando foi a última venda? Qual peça e por quanto?",
        tipo: "texto",
        placeholder: "ex.: abril, Top Lourdes, R$ 900",
      },
      {
        id: "vendas-6m",
        label: "Quantas peças você vendeu nos últimos 6 meses, no total?",
        tipo: "texto",
        placeholder: "ex.: 5",
        curto: true,
      },
      {
        id: "origem-clientes",
        label: "Como as últimas 3 clientes chegaram até você?",
        dica: "Indicação de amiga? Te acharam no Instagram? Evento? Já te conheciam?",
        tipo: "textarea",
        placeholder: "Cliente 1: ... / Cliente 2: ... / Cliente 3: ...",
      },
      {
        id: "recorrentes",
        label: "Alguma cliente já comprou mais de uma vez?",
        tipo: "texto",
        placeholder: "ex.: sim, 2 clientes / não",
      },
    ],
  },
  {
    titulo: "Os dois lançamentos",
    sub: "Brilho Tropical e Solaris — o que foi feito em cada um.",
    perguntas: [
      {
        id: "bt-vendas",
        label: "Quantas peças da Brilho Tropical foram vendidas no total?",
        tipo: "texto",
        placeholder: "ex.: 0",
        curto: true,
      },
      {
        id: "lancamento",
        label: "O que você fez no lançamento das coleções? Marca tudo que aconteceu.",
        tipo: "multi",
        opcoes: [
          "Posts no feed",
          "Stories",
          "Reels",
          "Pré-venda / lista de espera",
          "Mensagem direta pra clientes antigas",
          "Evento presencial",
          "Anúncio pago",
        ],
      },
      {
        id: "lanc-outro",
        label: "Algo mais que fez pra divulgar? Como foi a reação?",
        tipo: "textarea",
        placeholder: "ex.: mandei pra umas amigas, teve elogio mas ninguém perguntou preço...",
      },
    ],
  },
  {
    titulo: "Tempo e caixa",
    sub: "Pra dimensionar o plano do tamanho da tua realidade.",
    perguntas: [
      {
        id: "horas",
        label: "Quantas horas por semana você dedica à marca hoje?",
        dica: "Somando tudo: produção, fotos, conteúdo, atendimento.",
        tipo: "texto",
        placeholder: "ex.: 20",
        curto: true,
      },
      {
        id: "renda",
        label: "A marca é sua renda principal?",
        tipo: "radio",
        opcoes: ["Sim, é a principal", "Não, tenho outra renda", "Divide com outra coisa"],
      },
      {
        id: "caixa",
        label: "Quanto a marca tem em caixa hoje, mais ou menos? E material parado em estoque?",
        dica: "Um chute honesto serve. Fica só entre a gente.",
        tipo: "texto",
        placeholder: "ex.: R$ 800 em caixa, uns R$ 2.000 em material",
      },
    ],
  },
  {
    titulo: "Rede e Belém",
    sub: "Quem conhece a marca fora do teu círculo.",
    perguntas: [
      {
        id: "fora",
        label: "Já vendeu pra alguém de fora do teu círculo — gente que te achou sem indicação?",
        tipo: "radio",
        opcoes: ["Sim, várias", "Uma ou outra", "Acho que não"],
      },
      {
        id: "eventos",
        label: "Já participou de feira, bazar ou evento em Belém com as peças? Como foi?",
        tipo: "textarea",
        placeholder: "ex.: nunca / fui numa feira em 2025, vendi 2 peças...",
      },
      {
        id: "contatos",
        label: "Tem contato com influencers, lojas ou produtoras de evento na cidade?",
        tipo: "textarea",
        placeholder: "ex.: conheço uma menina com 15k seguidores, uma amiga tem loja no...",
      },
    ],
  },
  {
    titulo: "Na tua leitura",
    sub: "Ninguém conhece o negócio melhor que você.",
    perguntas: [
      {
        id: "leitura",
        label: "O que você acha que está travando as vendas?",
        tipo: "textarea",
        placeholder: "Fala o que vier: preço? alcance? cidade? timing?...",
      },
      {
        id: "vontade",
        label: "Tem algo que você queria fazer mas não sabe se vale a pena?",
        tipo: "textarea",
        placeholder: "ex.: impulsionar post, fazer bazar, baixar preço, chamar influencer...",
      },
    ],
  },
];

const STORAGE_KEY = "gio-diagnostico-v1";

type Respostas = Record<string, string | string[]>;

function montarMensagem(respostas: Respostas): string {
  const linhas = ["📋 *Diagnóstico Gio Handmade*", ""];
  SECOES.forEach((secao, i) => {
    linhas.push(`*${i + 1} · ${secao.titulo}*`);
    secao.perguntas.forEach((p) => {
      const v = respostas[p.id];
      const valor = Array.isArray(v)
        ? v.length
          ? v.join(", ")
          : "(não respondi)"
        : v?.trim() || "(não respondi)";
      linhas.push(`${p.label} ${valor}`);
    });
    linhas.push("");
  });
  return linhas.join("\n").trim();
}

export default function DiagnosticoForm() {
  const [respostas, setRespostas] = useState<Respostas>({});
  const [hidratado, setHidratado] = useState(false);
  const [copiado, setCopiado] = useState(false);

  useEffect(() => {
    try {
      const bruto = window.localStorage.getItem(STORAGE_KEY);
      if (bruto) setRespostas(JSON.parse(bruto));
    } catch {
      /* storage indisponível */
    }
    setHidratado(true);
  }, []);

  useEffect(() => {
    if (!hidratado) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(respostas));
    } catch {
      /* ignora */
    }
  }, [respostas, hidratado]);

  function definir(id: string, valor: string) {
    setRespostas((r) => ({ ...r, [id]: valor }));
  }

  function alternarMulti(id: string, opcao: string) {
    setRespostas((r) => {
      const atual = Array.isArray(r[id]) ? (r[id] as string[]) : [];
      const nova = atual.includes(opcao)
        ? atual.filter((o) => o !== opcao)
        : [...atual, opcao];
      return { ...r, [id]: nova };
    });
  }

  const totalPerguntas = SECOES.reduce((acc, s) => acc + s.perguntas.length, 0);
  const respondidas = SECOES.reduce(
    (acc, s) =>
      acc +
      s.perguntas.filter((p) => {
        const v = respostas[p.id];
        return Array.isArray(v) ? v.length > 0 : !!v?.trim();
      }).length,
    0
  );

  function enviarWhatsApp() {
    const url = "https://wa.me/?text=" + encodeURIComponent(montarMensagem(respostas));
    window.open(url, "_blank", "noopener");
  }

  async function copiar() {
    const msg = montarMensagem(respostas);
    try {
      await navigator.clipboard.writeText(msg);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2200);
    } catch {
      window.prompt("Copia daqui:", msg);
    }
  }

  return (
    <main className="min-h-screen bg-[#EDE7D9] text-[#1B4965]">
      <div className="mx-auto max-w-[640px] px-5 pb-20 pt-10">
        <p className="font-[family-name:var(--font-serif)] text-[15px] italic text-[#1B4965]/75">
          Gio handmade
        </p>
        <p className="mt-4 text-[11px] font-bold uppercase tracking-[0.3em] text-[#b8902a]">
          Diagnóstico do negócio
        </p>
        <h1 className="mt-3 font-[family-name:var(--font-serif)] text-[clamp(30px,7vw,40px)] leading-[1.12]">
          Vamos achar onde a venda está travando
        </h1>
        <p className="mt-3 max-w-[46ch] text-[15px] text-[#1B4965]/80">
          Gio, responde com calma e com os <strong>números reais</strong> — sem arredondar pra
          cima nem pra baixo. Não existe resposta feia aqui: quanto mais honesto, mais certeiro
          o plano. Leva uns 10 minutos.
        </p>
        <p className="mt-4 inline-flex items-center gap-2 rounded-sm border border-[#1B4965]/20 bg-white/50 px-3 py-2 text-[12.5px] text-[#1B4965]/60">
          <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" d="M20 6 9 17l-5-5" />
          </svg>
          Suas respostas ficam salvas — pode sair pra olhar o Instagram e voltar depois.
        </p>

        {SECOES.map((secao, i) => (
          <section
            key={secao.titulo}
            className="mt-7 rounded border border-[#1B4965]/15 bg-white px-6 py-7"
          >
            <p className="text-[10.5px] font-bold uppercase tracking-[0.26em] text-[#b8902a]">
              Parte {i + 1} de {SECOES.length}
            </p>
            <h2 className="mt-1 font-[family-name:var(--font-serif)] text-[23px] leading-tight">
              {secao.titulo}
            </h2>
            <p className="mt-1 text-[13.5px] text-[#1B4965]/60">{secao.sub}</p>

            <div className="mt-6 space-y-6">
              {secao.perguntas.map((p) => (
                <div key={p.id}>
                  <label
                    htmlFor={p.tipo === "radio" || p.tipo === "multi" ? undefined : `q-${p.id}`}
                    className="block font-[family-name:var(--font-serif)] text-[16.5px] leading-snug"
                  >
                    {p.label}
                  </label>
                  {p.dica && <p className="mt-1 text-[12.5px] text-[#1B4965]/55">{p.dica}</p>}

                  {p.tipo === "texto" && (
                    <input
                      id={`q-${p.id}`}
                      type="text"
                      value={(respostas[p.id] as string) ?? ""}
                      onChange={(e) => definir(p.id, e.target.value)}
                      placeholder={p.placeholder}
                      className={`mt-2 rounded-sm border border-[#1B4965]/25 bg-white px-3 py-2.5 text-[15px] text-[#1B4965] placeholder:text-[#1B4965]/35 focus:border-[#1B4965] focus:outline-none focus-visible:ring-1 focus-visible:ring-[#1B4965] ${
                        p.curto ? "w-[220px] max-w-full" : "w-full"
                      }`}
                    />
                  )}

                  {p.tipo === "textarea" && (
                    <textarea
                      id={`q-${p.id}`}
                      value={(respostas[p.id] as string) ?? ""}
                      onChange={(e) => definir(p.id, e.target.value)}
                      placeholder={p.placeholder}
                      className="mt-2 min-h-[84px] w-full resize-y rounded-sm border border-[#1B4965]/25 bg-white px-3 py-2.5 text-[15px] text-[#1B4965] placeholder:text-[#1B4965]/35 focus:border-[#1B4965] focus:outline-none focus-visible:ring-1 focus-visible:ring-[#1B4965]"
                    />
                  )}

                  {(p.tipo === "radio" || p.tipo === "multi") && (
                    <div className="mt-2.5 flex flex-wrap gap-2" role={p.tipo === "radio" ? "radiogroup" : "group"}>
                      {p.opcoes!.map((op) => {
                        const marcado =
                          p.tipo === "radio"
                            ? respostas[p.id] === op
                            : Array.isArray(respostas[p.id]) && (respostas[p.id] as string[]).includes(op);
                        return (
                          <label
                            key={op}
                            className={`inline-flex cursor-pointer items-center rounded-full border px-4 py-2 text-[13.5px] transition-colors has-[input:focus-visible]:outline has-[input:focus-visible]:outline-2 has-[input:focus-visible]:outline-offset-2 has-[input:focus-visible]:outline-[#1B4965] ${
                              marcado
                                ? "border-[#1B4965] bg-[#1B4965] text-[#EDE7D9]"
                                : "border-[#1B4965]/30 bg-white text-[#1B4965] hover:border-[#1B4965]/60"
                            }`}
                          >
                            <input
                              type={p.tipo === "radio" ? "radio" : "checkbox"}
                              name={`q-${p.id}`}
                              value={op}
                              checked={marcado}
                              onChange={() =>
                                p.tipo === "radio" ? definir(p.id, op) : alternarMulti(p.id, op)
                              }
                              className="sr-only"
                            />
                            {op}
                          </label>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        ))}

        <div className="mt-9 text-center">
          <p className="text-[13px] text-[#1B4965]/60">
            <strong className="text-[#1B4965]">
              {respondidas} de {totalPerguntas}
            </strong>{" "}
            perguntas respondidas
          </p>
          <div className="mt-4 flex flex-col gap-2.5">
            <button
              type="button"
              onClick={enviarWhatsApp}
              className="inline-flex items-center justify-center gap-2.5 rounded-sm bg-[#1B4965] px-6 py-4 text-xs font-bold uppercase tracking-[0.18em] text-[#EDE7D9] transition-colors hover:bg-[#130209] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1B4965] focus-visible:ring-offset-2"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <path d="M.057 24l1.687-6.163a11.867 11.867 0 01-1.587-5.945C.16 5.335 5.495 0 12.05 0a11.817 11.817 0 018.413 3.488 11.824 11.824 0 013.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 01-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.821 9.821 0 001.519 5.26l-.999 3.648 3.97-1.317z" />
              </svg>
              Enviar pro Leonardo no WhatsApp
            </button>
            <button
              type="button"
              onClick={copiar}
              className={`inline-flex items-center justify-center rounded-sm border px-6 py-3.5 text-xs font-bold uppercase tracking-[0.18em] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1B4965] focus-visible:ring-offset-2 ${
                copiado
                  ? "border-[#2f7a45] bg-[#2f7a45] text-white"
                  : "border-[#1B4965]/40 text-[#1B4965] hover:border-[#1B4965] hover:bg-[#1B4965]/5"
              }`}
            >
              {copiado ? "Copiado ✓" : "Copiar respostas"}
            </button>
          </div>
          <p className="mx-auto mt-4 max-w-[40ch] text-[12.5px] text-[#1B4965]/55">
            O botão monta a mensagem com tudo que você respondeu — é só escolher a conversa e
            enviar. O que ficar em branco vai marcado como &quot;não respondi&quot;.
          </p>
        </div>
      </div>
    </main>
  );
}
