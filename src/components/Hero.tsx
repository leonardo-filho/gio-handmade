import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative h-screen w-full flex items-center justify-center overflow-hidden">
      {/* Background with subtle pattern and gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-stone-100 via-stone-50 to-white z-0">
        {/* Subtle noise texture for depth */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
        {/* Elegant gradient overlay for depth */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/20 via-transparent to-white/40" />
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-stone-200/30 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 right-10 w-40 h-40 bg-amber-100/20 rounded-full blur-3xl animate-pulse delay-1000" />

      {/* Content */}
      <div className="relative z-10 text-center px-4 w-full mx-auto text-stone-800 pt-32 md:pt-40 flex flex-col items-center">
        <div className="animate-[fadeIn_0.8s_ease-out] w-full">
          <h2 className="mb-6 text-xs md:text-sm uppercase tracking-[0.3em] font-sans text-stone-500 font-bold">
            Gio Handmade
          </h2>

          <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif font-medium leading-tight mb-8 text-stone-900 relative z-20">
            Peças feitas à mão,<br />
            <span className="italic bg-gradient-to-r from-stone-700 via-amber-700 to-stone-700 bg-clip-text text-transparent pr-4 pb-2 inline-block relative">
              ponto a ponto.
            </span>
          </h1>

          <p className="text-lg md:text-xl lg:text-2xl font-light mb-12 w-full text-stone-600 leading-relaxed px-4">
            Muito mais que acessórios...
            <br />
            cada peça é feita para vestir você e fazer você se sentir <span className="font-medium text-stone-800">incrível</span>.
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-4 justify-center items-center animate-[slideUp_0.8s_ease-out_0.3s_both]">
          <Link
            href="#categorias"
            className="group px-10 py-4 bg-stone-900 text-white uppercase tracking-widest text-xs font-bold rounded-sm hover:bg-stone-700 transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0"
          >
            <span className="flex items-center gap-2">
              Ver Minhas Criações
              <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </span>
          </Link>
          <Link
            href="https://wa.me/5591992342017?text=Ol%C3%A1!%20Gostaria%20de%20realizar%20um%20or%C3%A7amento."
            className="group px-10 py-4 border-2 border-stone-900 text-stone-900 uppercase tracking-widest text-xs font-bold rounded-sm hover:bg-stone-900 hover:text-white transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0"
          >
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
              </svg>
              Encomendar
            </span>
          </Link>
        </div>

        {/* Trust Indicator */}
        <div className="mt-16 flex flex-col md:flex-row items-center justify-center gap-8 text-xs text-stone-500 uppercase tracking-wider animate-[fadeIn_0.8s_ease-out_0.6s_both]">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>100% Artesanal</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Sob Medida</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            <span>Feito com Amor</span>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <svg className="w-6 h-6 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </div>
    </section>
  );
}
