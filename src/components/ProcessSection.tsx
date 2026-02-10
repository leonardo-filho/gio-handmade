export default function ProcessSection() {
  const steps = [
    {
      num: "01",
      title: "Inspiração",
      text: "Envie uma referência ou descreva a peça dos seus sonhos pelo WhatsApp."
    },
    {
      num: "02",
      title: "Orçamento & Sinal",
      text: "Definimos o valor. O início da confecção é confirmado mediante 50% de sinal."
    },
    {
      num: "03",
      title: "Medidas",
      text: "Te envio um vídeo tutorial ensinando a tirar as medidas exatas para sua peça."
    },
    {
      num: "04",
      title: "Confecção",
      text: "A mágica acontece! O prazo varia de 7 a 30 dias dependendo da complexidade."
    }
  ];

  return (
    <section className="py-20 bg-stone-50">
      <div className="max-w-5xl mx-auto px-4">
        
        <div className="text-center mb-16">
          <h2 className="text-3xl font-serif text-gray-900 mb-4">
            Como ter sua peça exclusiva
          </h2>
          <p className="text-gray-600 font-light max-w-xl mx-auto text-sm md:text-base">
            Como cada detalhe é feito à mão, nosso processo garante que a roupa vista perfeitamente em você.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
          {/* Linha conectora (apenas desktop) */}
          <div className="hidden md:block absolute top-6 left-0 w-full h-[1px] bg-gray-300 -z-10" />

          {steps.map((step) => (
            <div key={step.num} className="bg-stone-50 md:bg-transparent pt-4 md:pt-0 text-center flex flex-col items-center">
              <div className="w-12 h-12 bg-gray-900 text-white flex items-center justify-center rounded-full text-sm font-bold mb-4 border-4 border-stone-50">
                {step.num}
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">{step.title}</h3>
              <p className="text-sm text-gray-600 leading-relaxed px-2">
                {step.text}
              </p>
            </div>
          ))}
        </div>
        
        <div className="text-center mt-12">
           <p className="text-xs text-gray-500 uppercase tracking-widest mb-2">
             Pagamento facilitado
           </p>
           <p className="text-sm text-gray-700">
             Pix • Cartão de Crédito (até 2x sem juros acima de R$600)
           </p>
        </div>

      </div>
    </section>
  );
}