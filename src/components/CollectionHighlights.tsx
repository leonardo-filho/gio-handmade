import Link from "next/link";

const categories = [
  {
    id: "tops",
    title: "Tops & Croppeds",
    description: "Modelos exclusivos feitos sob medida para o seu corpo.",
    color: "bg-stone-200", // Cinza claro
  },
  {
    id: "saias",
    title: "Saias",
    description: "Do curto ao longo, com o caimento perfeito das miçangas.",
    color: "bg-zinc-200", // Cinza médio
  },
  {
    id: "conjuntos",
    title: "Conjuntos",
    description: "A combinação completa para festivais e ocasiões especiais.",
    color: "bg-stone-300", // Bege acinzentado
  },
  {
    id: "pronta-entrega",
    title: "Pronta Entrega",
    description: "Peças únicas disponíveis para envio imediato.",
    color: "bg-orange-100", // Destaque sutil
  }
];

export default function CollectionHighlights() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-4">
        
        <div className="text-center mb-12">
          <span className="text-xs font-bold tracking-[0.2em] text-gray-400 uppercase">
            O que você procura?
          </span>
          <h2 className="mt-2 text-3xl md:text-4xl font-serif text-gray-900">
            Categorias
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((item) => (
            <Link key={item.id} href="https://wa.me/SEUNUMERO" className="group">
              <div className="flex flex-col h-full">
                {/* Placeholder da Imagem */}
                <div className={`relative w-full aspect-[3/4] ${item.color} mb-4 overflow-hidden`}>
                  <div className="absolute inset-0 flex items-center justify-center opacity-30 group-hover:opacity-50 transition-opacity">
                    <span className="uppercase tracking-widest text-xs font-bold text-gray-600">
                      {item.title}
                    </span>
                  </div>
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-500" />
                </div>

                <div className="text-center">
                  <h3 className="text-lg font-serif text-gray-900 group-hover:underline decoration-1 underline-offset-4">
                    {item.title}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    {item.description}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>

      </div>
    </section>
  );
}