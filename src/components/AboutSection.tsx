import Image from "next/image";

export default function AboutSection() {
  return (
    <section id="sobre" className="py-24 bg-gradient-to-b from-stone-50 to-white">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">

          {/* Image with Enhanced Design */}
          <div className="w-full lg:w-1/2">
            <div className="relative group">
              {/* Decorative Background Element */}
              <div className="absolute -inset-4 bg-gradient-to-br from-amber-200 to-stone-200 rounded-lg opacity-20 group-hover:opacity-30 transition-opacity duration-500" />

              {/* Main Image Container */}
              <div className="relative aspect-[3/4] bg-stone-200 overflow-hidden rounded-lg shadow-xl group-hover:shadow-2xl transition-all duration-500">
                <Image
                  src="/eu.jpeg"
                  alt="Giovanna Alves, artesã da Gio Handmade"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                />
                {/* Subtle Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-stone-900/10 to-transparent" />
              </div>

              {/* Floating Badge */}
              <div className="absolute -bottom-6 -right-6 bg-white px-6 py-4 rounded-lg shadow-xl border border-stone-200 hidden sm:block">
                <div className="flex items-center gap-3">
                  <svg className="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <div>
                    <p className="font-bold text-stone-900 text-sm">100% Artesanal</p>
                    <p className="text-xs text-stone-500">Feito à mão</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Text Content with Enhanced Typography */}
          <div className="w-full lg:w-1/2 text-center lg:text-left mt-8 lg:mt-0 flex flex-col">
            <span className="text-xs font-bold tracking-[0.2em] text-stone-400 uppercase mb-4 block">
              Quem faz
            </span>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif text-stone-900 mb-8 leading-tight">
              Uma mulher, <br />
              <span className="bg-gradient-to-r from-stone-700 via-amber-700 to-stone-700 bg-clip-text text-transparent pb-2 pr-2 inline-block">
                múltiplas criações.
              </span>
            </h2>

            <div className="w-20 h-1 bg-gradient-to-r from-amber-600 to-transparent mb-8 mx-auto lg:mx-0" />

            <div className="space-y-4 md:space-y-5 text-stone-600 font-light leading-relaxed text-sm md:text-base lg:text-lg w-full">
              <p>
                Olá! Eu sou a <span className="font-medium text-stone-900">Giovanna Alves</span>, a mente e as mãos por trás de cada peça da Gio Handmade.
              </p>
              <p>
                Este não é um processo industrial. É um trabalho de paciência, arte e dedicação. Cada top, cada saia e cada acessório é feito <span className="font-medium text-stone-900">exclusivamente por mim</span>.
              </p>
              <p>
                Quando você encomenda uma peça, você não está apenas comprando uma roupa; está levando para casa horas de trabalho manual, carinho e um design pensado para valorizar a sua essência.
              </p>
            </div>

            {/* Tags */}
            <div className="mt-10 flex flex-wrap gap-3 justify-center lg:justify-start">
              <span className="inline-flex items-center gap-2 border-2 text-stone-700 border-stone-300 px-5 py-2.5 text-xs uppercase tracking-widest rounded-full hover:border-amber-600 hover:text-amber-700 transition-colors font-semibold">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Slow Fashion
              </span>
              <span className="inline-flex items-center gap-2 border-2 text-stone-700 border-stone-300 px-5 py-2.5 text-xs uppercase tracking-widest rounded-full hover:border-amber-600 hover:text-amber-700 transition-colors font-semibold">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                100% Artesanal
              </span>
            </div>

            {/* CTA */}
            <div className="mt-10">
              <a
                href="https://wa.me/5591992342017?text=Ol%C3%A1!%20Gostaria%20de%20realizar%20um%20or%C3%A7amento."
                className="inline-flex items-center gap-3 px-8 py-4 bg-stone-900 text-white text-xs uppercase tracking-widest font-bold rounded-sm hover:bg-stone-700 transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                </svg>
                Fale Comigo
              </a>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
