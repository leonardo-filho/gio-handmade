import Link from "next/link";

export default function ProductGrid() {
  // Array com 9 itens vazios para gerar os quadrados
  const placeholders = Array.from({ length: 9 });

  return (
    <section id="colecao" className="py-20 px-4 md:px-0 bg-white">
      <div className="max-w-6xl mx-auto">
        
        {/* Cabeçalho */}
        <div className="text-center mb-12">
          <h3 className="text-sm uppercase tracking-widest text-gray-500 mb-2">
            Shop The Look
          </h3>
          <h2 className="text-3xl md:text-4xl font-serif text-gray-900">
            Instagram @gio.handmade__
          </h2>
        </div>

        {/* Grid de "Fotos" (Placeholders) */}
        <div className="grid grid-cols-3 gap-1 md:gap-4">
          {placeholders.map((_, index) => (
            <div 
              key={index} 
              className="relative aspect-square bg-gray-200 hover:bg-gray-300 transition-colors cursor-pointer group flex items-center justify-center"
            >
              <span className="text-gray-400 text-xs uppercase opacity-50 group-hover:opacity-100">
                Post {index + 1}
              </span>
            </div>
          ))}
        </div>

        {/* Botão Final */}
        <div className="text-center mt-12">
          <Link 
            href="https://instagram.com/gio.handmade__" 
            target="_blank"
            className="inline-block border-b border-gray-800 pb-1 text-gray-800 uppercase text-xs tracking-widest hover:text-gray-500 transition-colors"
          >
            Seguir no Instagram
          </Link>
        </div>

      </div>
    </section>
  );
}