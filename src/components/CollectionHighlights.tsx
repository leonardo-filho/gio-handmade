import Link from "next/link";
import Image from "next/image";
import { Reveal, StaggerGroup, StaggerItem } from "./Reveal";

type CategoryItem = {
  id: string;
  title: string;
  description: string;
  src?: string;
};

const categories: CategoryItem[] = [
  {
    id: "tops",
    title: "Tops & Croppeds",
    description: "Modelos exclusivos feitos sob medida para o seu corpo.",
    src: "/tops.png",
  },
  {
    id: "Vestido",
    title: "Vestido",
    description: "Do curto ao longo, com o caimento perfeito.",
    src: "/vestido.png",
  },
  {
    id: "conjuntos",
    title: "Conjuntos",
    description: "A combinação completa para festivais e ocasiões especiais.",
    src: "/conjuntos.png",
  },
  {
    id: "saia-cinto",
    title: "Saia & Cinto",
    description: "Saias e cintos feitos sob medida para o seu corpo.",
    src: "/saias.png",
  },
  {
    id: "headpiece",
    title: "Headpiece",
    description: "Acessórios para cabeça feitos à mão com correntes e cristais.",
    src: "/headpiece.png",
  },
];

export default function CollectionHighlights() {
  return (
    <section id="categorias" className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-4">

        <Reveal className="text-center mb-12">
          <span className="text-[10px] font-bold tracking-[0.3em] text-[#1B4965]/60 uppercase">
            O que você procura?
          </span>
          <h2 className="mt-3 text-3xl md:text-4xl font-[family-name:var(--font-serif)] text-[#1B4965]">
            Categorias
          </h2>
          <div className="mt-4 mx-auto w-12 h-px bg-[#1B4965]/30" />
        </Reveal>

        <StaggerGroup className="flex flex-wrap justify-center gap-4 md:gap-6 max-w-5xl mx-auto">
          {categories.map((item) => (
            <StaggerItem key={item.id} className="w-[calc(50%-8px)] md:w-[calc(20%-20px)]">
            <Link href="https://wa.me/559192982017?text=Ol%C3%A1%2C%20gostaria%20de%20realizar%20um%20or%C3%A7amento." className="group block">
              <div className="flex flex-col h-full">
                <div className="relative w-full aspect-[3/4] bg-[#EDE7D9] mb-4 overflow-hidden">
                  {item.src ? (
                    <Image
                      src={item.src}
                      alt={item.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center opacity-30 group-hover:opacity-50 transition-opacity">
                      <span className="uppercase tracking-widest text-xs font-bold text-[#1B4965]">
                        {item.title}
                      </span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-[#1B4965]/0 group-hover:bg-[#1B4965]/10 transition-colors duration-500" />
                </div>

                <div className="text-center">
                  <h3 className="text-lg font-[family-name:var(--font-serif)] text-[#1B4965] group-hover:underline decoration-1 underline-offset-4">
                    {item.title}
                  </h3>
                  <p className="text-xs text-[#1B4965]/60 mt-1">
                    {item.description}
                  </p>
                </div>
              </div>
            </Link>
            </StaggerItem>
          ))}
        </StaggerGroup>

      </div>
    </section>
  );
}
