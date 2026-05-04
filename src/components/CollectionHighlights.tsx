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
    color: "bg-orange-100",
    src: "/saias.jpeg",
  },
  {
    id: "headpiece",
    title: "Headpiece",
    description: "Acessórios para cabeça feitos à mão com correntes e cristais.",
    color: "bg-stone-200",
    src: "/headpiece.jpeg",
  },
];

export default function CollectionHighlights() {
  return (
    <section id="categorias" className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-4">

        <div className="text-center mb-12">
          <span className="text-xs font-bold tracking-[0.2em] text-gray-400 uppercase">
            O que você procura?
          </span>
          <h2 className="mt-2 text-3xl md:text-4xl font-serif text-gray-900">
            Categorias
          </h2>
        </div>

        <div className="flex flex-wrap justify-center gap-4 md:gap-6 max-w-5xl mx-auto">
          {categories.map((item) => (
            <Link key={item.id} href="https://wa.me/559192982017?text=Ol%C3%A1%2C%20gostaria%20de%20realizar%20um%20or%C3%A7amento." className="group w-[calc(50%-8px)] md:w-[calc(20%-20px)]">
              <div className="flex flex-col h-full">
                {/* Imagem ou Placeholder */}
                <div className={`relative w-full aspect-[3/4] ${item.color} mb-4 overflow-hidden`}>
                  {item.src ? (
                    <Image
                      src={item.src}
                      alt={item.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center opacity-30 group-hover:opacity-50 transition-opacity">
                      <span className="uppercase tracking-widest text-xs font-bold text-gray-600">
                        {item.title}
                      </span>
                    </div>
                  )}
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
