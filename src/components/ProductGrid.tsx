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
    <section id="colecao" className="py-24 px-4 flex flex-col items-center bg-white">
      <div className="w-full max-w-6xl mx-auto flex flex-col items-center">

        {/* Header */}
        <div className="text-center mb-16 w-full">
          <span className="text-xs font-bold tracking-[0.2em] text-stone-400 uppercase">
            Shop The Look
          </span>
          <h2 className="mt-3 text-4xl md:text-5xl font-serif text-stone-900 mb-4">
            Instagram @gio.handmade__
          </h2>
          <div className="w-20 h-1 bg-gradient-to-r from-transparent via-amber-600 to-transparent mx-auto mt-6 mb-6" />
          <p className="text-stone-600 font-light w-full mx-auto text-sm md:text-base px-4">
            Veja mais das nossas criações no Instagram
          </p>
        </div>

        {/* Grid de Fotos with Enhanced Hover Effects */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-4 w-full max-w-6xl mx-auto mb-12">
          {instagramImages.map((image, index) => (
            <div
              key={index}
              className="relative aspect-square overflow-hidden group cursor-pointer rounded-sm"
              style={{
                animation: `scaleIn 0.4s ease-out ${index * 0.08}s both`
              }}
            >
              <Image
                src={image.src}
                alt={image.alt}
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
              />
              {/* Gradient Overlay on Hover */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              {/* Instagram Icon on Hover */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                <div className="bg-white/90 backdrop-blur-sm p-3 rounded-full transform scale-75 group-hover:scale-100 transition-transform duration-300 shadow-xl">
                  <svg className="w-6 h-6 text-stone-900" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <Link
            href="https://instagram.com/gio.handmade__"
            target="_blank"
            className="group inline-flex items-center gap-3 border-2 border-stone-900 px-8 py-3 text-stone-900 uppercase text-xs tracking-widest font-bold rounded-sm hover:bg-stone-900 hover:text-white transition-all duration-300 hover:shadow-lg"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
            </svg>
            <span>Seguir no Instagram</span>
            <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>

      </div>
    </section>
  );
}
