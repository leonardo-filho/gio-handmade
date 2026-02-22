import Link from "next/link";
import Image from "next/image";

const instagramImages = [
  { src: "/foto1.jpeg", alt: "Look 1" },
  { src: "/foto2.jpeg", alt: "Look 2" },
  { src: "/foto3.jpeg", alt: "Look 3" },
  { src: "/foto4.jpeg", alt: "Look 4" },
  { src: "/foto5.jpeg", alt: "Look 5" },
  { src: "/foto6.jpeg", alt: "Look 6" },
  { src: "/foto7.jpeg", alt: "Look 7" },
  { src: "/foto8.jpeg", alt: "Look 8" },
  { src: "/foto9.jpeg", alt: "Look 9" },
];

export default function ProductGrid() {
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

        {/* Grid de Fotos 3x3 */}
        <div className="grid grid-cols-3 gap-1 md:gap-4 max-w-4xl mx-auto">
          {instagramImages.map((image, index) => (
            <div
              key={index}
              className="relative aspect-square overflow-hidden group cursor-pointer"
            >
              <Image
                src={image.src}
                alt={image.alt}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-700"
              />
              {/* Overlay suave no hover */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-500" />
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