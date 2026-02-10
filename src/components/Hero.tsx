import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative h-screen w-full flex items-center justify-center overflow-hidden">
      {/* Fundo (Substitua por <Image /> depois) */}
      <div className="absolute inset-0 bg-stone-200 z-0">
        {/* Simulação de imagem - remova esta div quando colocar a foto real */}
        <div className="w-full h-full bg-[url('https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=2576&auto=format&fit=crop')] bg-cover bg-center opacity-80 mix-blend-multiply" />
        <div className="absolute inset-0 bg-black/20" /> {/* Filtro escuro suave */}
      </div>

      {/* Conteúdo */}
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto text-white">
        <h2 className="mb-4 text-xs md:text-sm uppercase tracking-[0.3em] font-sans text-gray-200">
          Gio handemade
        </h2>
        
        <h1 className="text-5xl md:text-7xl font-serif font-medium leading-tight mb-6">
          A Arte de Vestir <br />
          <span className="italic">a Exclusividade</span>
        </h1>

        <p className="text-lg md:text-xl font-light mb-10 max-w-2xl mx-auto text-gray-100">
          Feito à mão, ponto a ponto, para quem recusa o comum. 
          Explore nossa coleção de peças bordadas sob medida.
        </p>

        <div className="flex flex-col md:flex-row gap-4 justify-center">
          <Link 
            href="#colecao" 
            className="px-8 py-3 bg-white text-gray-900 uppercase tracking-widest text-xs font-bold hover:bg-gray-100 transition-colors duration-300"
          >
            Ver Coleção
          </Link>
          <Link 
            href="https://wa.me/SEUNUMERO" 
            className="px-8 py-3 border border-white text-white uppercase tracking-widest text-xs font-bold hover:bg-white/10 transition-colors duration-300"
          >
            Encomendar Peça Única
          </Link>
        </div>
      </div>
    </section>
  );
}