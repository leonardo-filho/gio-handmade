"use client";

import { useCallback, useEffect } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";

type Testimonial = {
  id: number;
  name: string;
  role: string;
  content: string;
  rating: number;
};

const testimonials: Testimonial[] = [
  {
    id: 1,
    name: "Mariana Silva",
    role: "Cliente Fiel",
    content: "Simplesmente perfeito! A Gio capturou exatamente o que eu queria. A qualidade e o acabamento são impecáveis. Recebi tantos elogios!",
    rating: 5,
  },
  {
    id: 2,
    name: "Júlia Santos",
    role: "Noiva",
    content: "Fiz meu vestido de noiva civil com a Gio e foi a melhor escolha! Ela é super atenciosa e criativa. Minha peça ficou única e perfeita.",
    rating: 5,
  },
  {
    id: 3,
    name: "Beatriz Costa",
    role: "Fashionista",
    content: "Já comprei vários tops e conjuntos. Cada peça é uma obra de arte! O trabalho manual é visível em cada detalhe. Super recomendo!",
    rating: 5,
  },
  {
    id: 4,
    name: "Amanda Oliveira",
    role: "Festeira",
    content: "Usei um conjunto da Gio num festival e me senti incrível! As pessoas não paravam de perguntar onde eu comprei. Qualidade excepcional!",
    rating: 5,
  },
  {
    id: 5,
    name: "Camila Rodrigues",
    role: "Cliente Satisfeita",
    content: "O atendimento é maravilhoso e o prazo foi respeitado. A Gio me ajudou em todo o processo, inclusive nas medidas. Amei minha peça!",
    rating: 5,
  },
];

export default function TestimonialsCarousel() {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      loop: true,
      align: 'center',
      skipSnaps: false,
    },
    [Autoplay({ delay: 5000, stopOnInteraction: false })]
  );

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  useEffect(() => {
    if (emblaApi) {
      // Optional: Log events for debugging
      emblaApi.on('select', () => {
        // console.log('Slide changed');
      });
    }
  }, [emblaApi]);

  return (
    <section className="py-20 bg-gradient-to-b from-stone-50 to-white overflow-hidden flex flex-col items-center">
      <div className="w-full max-w-6xl mx-auto px-4 flex flex-col items-center">

        {/* Header */}
        <div className="text-center mb-16 w-full">
          <span className="text-xs font-bold tracking-[0.2em] text-stone-400 uppercase">
            O que dizem
          </span>
          <h2 className="mt-2 text-3xl md:text-4xl font-serif text-stone-900 mb-4">
            Depoimentos de Clientes
          </h2>
          <p className="text-stone-600 font-light w-full mx-auto text-sm md:text-base">
            Cada peça conta uma história. Veja o que nossas clientes têm a dizer.
          </p>
        </div>

        {/* Carousel Container */}
        <div className="relative">
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex">
              {testimonials.map((testimonial) => (
                <div
                  key={testimonial.id}
                  className="flex-[0_0_100%] min-w-0 md:flex-[0_0_50%] lg:flex-[0_0_33.333%] px-4"
                >
                  <div className="bg-white border border-stone-200 rounded-lg p-8 h-full shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">

                    {/* Rating Stars */}
                    <div className="flex gap-1 mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <svg
                          key={i}
                          className="w-5 h-5 text-amber-400 fill-current"
                          viewBox="0 0 20 20"
                        >
                          <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                        </svg>
                      ))}
                    </div>

                    {/* Content */}
                    <p className="text-stone-700 leading-relaxed mb-6 min-h-[6rem] text-sm md:text-base">
                      &ldquo;{testimonial.content}&rdquo;
                    </p>

                    {/* Author */}
                    <div className="border-t border-stone-100 pt-4">
                      <p className="font-semibold text-stone-900">{testimonial.name}</p>
                      <p className="text-xs text-stone-500 uppercase tracking-wider mt-1">
                        {testimonial.role}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation Buttons */}
          <button
            onClick={scrollPrev}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-12 w-10 h-10 rounded-full bg-white border border-stone-200 shadow-md hover:shadow-lg hover:border-stone-300 transition-all duration-300 flex items-center justify-center group"
            aria-label="Previous testimonial"
          >
            <svg
              className="w-5 h-5 text-stone-600 group-hover:text-stone-900 transition-colors"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <button
            onClick={scrollNext}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-12 w-10 h-10 rounded-full bg-white border border-stone-200 shadow-md hover:shadow-lg hover:border-stone-300 transition-all duration-300 flex items-center justify-center group"
            aria-label="Next testimonial"
          >
            <svg
              className="w-5 h-5 text-stone-600 group-hover:text-stone-900 transition-colors"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* CTA Below Carousel */}
        <div className="text-center mt-12">
          <p className="text-sm text-stone-600 mb-4">
            Faça parte das clientes satisfeitas
          </p>
          <a
            href="https://wa.me/5591992342017?text=Ol%C3%A1!%20Gostaria%20de%20realizar%20um%20or%C3%A7amento."
            className="inline-block px-8 py-3 bg-stone-900 text-white text-xs uppercase tracking-widest font-bold rounded-sm hover:bg-stone-700 transition-all duration-300 hover:shadow-lg"
          >
            Encomendar Minha Peça
          </a>
        </div>
      </div>
    </section>
  );
}
