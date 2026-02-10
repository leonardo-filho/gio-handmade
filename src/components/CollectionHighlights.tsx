import Link from "next/link";

const collections = [
  {
    id: "crystal",
    title: "The Crystal Line",
    description: "Brilho máximo para a vida noturna de alto padrão.",
    color: "bg-zinc-200", // Cor provisória (Cinza Prata)
    link: "#crystal"
  },
  {
    id: "pearl",
    title: "The Pearl Line",
    description: "Sofisticação clássica encontra o design moderno.",
    color: "bg-stone-200", // Cor provisória (Off-white/Pérola)
    link: "#pearl"
  },
  {
    id: "boho",
    title: "The Boho Line",
    description: "Cores e texturas vibrantes para o verão.",
    color: "bg-orange-100", // Cor provisória (Tom quente/Areia)
    link: "#boho"
  }
];

export default function CollectionHighlights() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-6xl mx-auto px-4">
        
        {/* Título da Seção */}
        <div className="text-center mb-16">
          <span className="text-xs font-bold tracking-[0.2em] text-gray-400 uppercase">
            Nossas Linhas
          </span>
          <h2 className="mt-3 text-3xl md:text-4xl font-serif text-gray-900">
            Escolha seu Estilo
          </h2>
        </div>

        {/* Grid de Categorias */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {collections.map((item) => (
            <div key={item.id} className="group flex flex-col cursor-pointer">
              
              {/* O "Esqueleto" da Imagem */}
              <div className={`relative w-full aspect-[3/4] ${item.color} mb-6 overflow-hidden`}>
                {/* Texto provisório no centro da caixa */}
                <div className="absolute inset-0 flex items-center justify-center opacity-30 group-hover:opacity-50 transition-opacity">
                  <span className="uppercase tracking-widest text-xs font-bold text-gray-500">
                    Foto: {item.title}
                  </span>
                </div>
                
                {/* Efeito de Overlay ao passar o mouse */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-500" />
              </div>

              {/* Textos */}
              <div className="text-center">
                <h3 className="text-xl font-serif text-gray-900 mb-2 group-hover:text-gray-600 transition-colors">
                  {item.title}
                </h3>
                <p className="text-sm text-gray-500 font-light max-w-[200px] mx-auto leading-relaxed">
                  {item.description}
                </p>
                
                <div className="mt-4 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-2 group-hover:translate-y-0">
                  <span className="text-xs uppercase tracking-widest border-b border-gray-800 pb-1">
                    Ver Peças
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}