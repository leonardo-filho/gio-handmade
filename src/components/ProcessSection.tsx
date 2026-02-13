export default function ProcessSection() {
  const steps = [
    {
      num: "01",
      title: "Inspiração",
      text: "Envie uma referência ou descreva a peça dos seus sonhos pelo WhatsApp.",
      icon: (
        <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
        </svg>
      )
    },
    {
      num: "02",
      title: "Orçamento & Sinal",
      text: "Definimos o valor. A confecção é iniciada após o pagamento de 50% do valor.",
      highlight: "Regra Importante",
      icon: (
        <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
        </svg>
      )
    },
    {
      num: "03",
      title: "Medidas",
      text: "Eu mesma te ajudo! Envio um vídeo explicativo para você tirar suas medidas com perfeição.",
      icon: (
        <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
        </svg>
      )
    },
    {
      num: "04",
      title: "Confecção",
      text: "Sua peça começa a nascer! O prazo de produção é de 7 a 30 dias úteis, dependendo da complexidade.",
      highlight: "Prazo",
      icon: (
        <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    }
  ];

  return (
    <section id="processo" className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-4">

        <div className="text-center mb-16">
          <span className="text-xs font-bold tracking-[0.2em] text-gray-400 uppercase">
            Como funciona
          </span>
          <h2 className="mt-2 text-3xl font-serif text-gray-900 mb-4">
            Do pedido à entrega
          </h2>
          <p className="text-gray-600 font-light max-w-xl mx-auto text-sm md:text-base">
            Cada detalhe importa. Veja como é simples ter sua peça exclusiva.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {steps.map((step) => (
            <div key={step.num} className="group relative flex flex-col items-center text-center p-6 border border-stone-100 rounded-lg hover:shadow-lg transition-all duration-300 bg-stone-50/50 hover:bg-white">
              <div className="w-14 h-14 bg-white text-gray-800 flex items-center justify-center rounded-full mb-6 border border-gray-200 group-hover:border-gray-900 group-hover:bg-gray-900 group-hover:text-white transition-all duration-300 shadow-sm">
                {step.icon}
              </div>

              <h3 className="text-lg font-bold text-gray-900 mb-2">{step.title}</h3>

              <p className="text-sm text-gray-600 leading-relaxed min-h-[4rem]">
                {step.text}
              </p>

              {step.highlight && (
                <span className="mt-4 inline-block px-3 py-1 bg-red-50 text-red-600 text-[10px] font-bold uppercase tracking-widest rounded-full">
                  {step.highlight}
                </span>
              )}
            </div>
          ))}
        </div>

        <div className="mt-16 bg-stone-100 p-8 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6 max-w-4xl mx-auto">
          <div className="text-center md:text-left">
            <h4 className="text-lg font-serif font-bold text-gray-900 mb-1">Formas de Pagamento</h4>
            <p className="text-sm text-gray-600">Para facilitar sua compra, aceitamos diversas formas.</p>
          </div>

          <div className="flex gap-4 items-center">
            <div className="flex flex-col items-center">
              <span className="text-xs font-bold uppercase text-gray-500 mb-1">Pix</span>
              <div className="w-16 h-10 bg-white rounded border border-gray-200 flex items-center justify-center">
                <span className="text-xs text-emerald-600 font-bold">5% OFF</span>
              </div>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-xs font-bold uppercase text-gray-500 mb-1">Cartão</span>
              <div className="w-32 h-10 bg-white rounded border border-gray-200 flex items-center justify-center px-2 text-center">
                <span className="text-[10px] text-gray-600 font-medium">Até 2x sem juros (acima de R$600)</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}