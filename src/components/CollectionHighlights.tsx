import Link from "next/link";
import Image from "next/image";

type CategoryItem = {
  id: string;
  title: string;
  description: string;
  color: string;
  src?: string;
};

const categories: CategoryItem[] = [
  {
    id: "tops",
    title: "Tops & Croppeds",
    description: "Modelos exclusivos feitos sob medida para o seu corpo.",
    color: "bg-stone-200",
    src: "/tops.jpeg",
  },
  {
    id: "Vestido",
    title: "Vestido",
    description: "Do curto ao longo, com o caimento perfeito.",
    color: "bg-zinc-200",
    src: "/vestido.jpg",
  },
  {
    id: "conjuntos",
    title: "Conjuntos",
    description: "A combinação completa para festivais e ocasiões especiais.",
    color: "bg-stone-300",
    src: "/conjuntos.jpeg",
  },
  {
    id: "saia-cinto",
    title: "Saia & Cinto",
    description: "Saias e cintos feitos sob medida para o seu corpo.",
    color: "bg-amber-50",
    src: "/saias.jpeg",
  },
  {
    id: "pronta-entrega",
    title: "Pronta Entrega",
    description: "Peças únicas disponíveis para envio imediato.",
    color: "bg-amber-50",
    src: "/pronta.jpeg",
  }
];

export default function CollectionHighlights() {
  return (
    <section id="categorias" className="py-24 bg-white">
      <div className="max-w-6xl mx-auto px-4">

        <div className="text-center mb-16">
          <span className="text-xs font-bold tracking-[0.2em] text-stone-400 uppercase">
            O que você procura?
          </span>
          <h2 className="mt-3 text-4xl md:text-5xl font-serif text-stone-900 mb-4">
            Categorias
          </h2>
          <div className="w-20 h-1 bg-gradient-to-r from-transparent via-amber-600 to-transparent mx-auto mt-6" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {categories.map((item, index) => (
            <Link 
              key={item.id} 
              href="https://wa.me/5591992342017?text=Ol%C3%A1!%20Gostaria%20de%20realizar%20um%20or%C3%A7amento." 
              className="group"
              style={{
                animation: `slideUp 0.5s ease-out ${index * 0.1}s both`
              }}
            >
              <div className="flex flex-col h-full">
                {/* Image Container with Enhanced Hover Effect */}
                <div className={`relative w-full aspect-[3/4] ${item.color} mb-4 overflow-hidden rounded-sm shadow-md group-hover:shadow-xl transition-all duration-500`}>
                  {item.src ? (
                    <Image
                      src={item.src}
                      alt={item.title}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center opacity-30 group-hover:opacity-50 transition-opacity">
                      <span className="uppercase tracking-widest text-xs font-bold text-stone-600">
                        {item.title}
                      </span>
                    </div>
                  )}
                  {/* Gradient Overlay on Hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  {/* "View" Badge on Hover */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <span className="bg-white text-stone-900 px-6 py-2 text-xs uppercase tracking-wider font-bold rounded-sm shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                      Ver Mais
                    </span>
                  </div>
                </div>

                <div className="text-center">
                  <h3 className="text-lg font-serif text-stone-900 mb-1 group-hover:text-amber-700 transition-colors duration-300">
                    {item.title}
                  </h3>
                  <p className="text-xs text-stone-500 leading-relaxed">
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
