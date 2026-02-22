import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative h-screen w-full flex items-center justify-center overflow-hidden">
      {/* Fundo: Textura Neutra de Tecido/Papel para destacar o artesanato */}
      <div className="absolute inset-0 bg-stone-100 z-0">
        <div className="w-full h-full bg-[url('https://images.unsplash.com/photo-1453487021979-5b7d97792eb1?q=80&w=2670&auto=format&fit=crop')] bg-cover bg-center opacity-40" />
        {/* Camada suave para garantir leitura do texto */}
        <div className="absolute inset-0 bg-white/30" />
      </div>

      {/* Conteúdo */}
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto text-gray-800">
        <h2 className="mb-4 text-xs md:text-sm uppercase tracking-[0.3em] font-sans text-gray-500">
          Gio Handmade
        </h2>

        <h1 className="text-5xl md:text-7xl font-serif font-medium leading-tight mb-6 text-gray-900">
          Peças feitas à mão,<br />
          <span className="italic text-gray-700">ponto a ponto.</span>
        </h1>

        <p className="text-lg md:text-xl font-light mb-10 max-w-2xl mx-auto text-gray-600">
          Muito mais que acessórios...
          <br />
          cada peça é feita para vestir você e fazer você se sentir incrível.
        </p>


        <div className="flex flex-col md:flex-row gap-4 justify-center">
          <Link
            href="#categorias"
            className="px-8 py-3 bg-gray-900 text-white uppercase tracking-widest text-xs font-bold hover:bg-gray-700 transition-colors duration-300"
          >
            Ver Minhas Criações
          </Link>
          <Link
            href="https://wa.me/5591992342017?text=Ol%C3%A1!%20Gostaria%20de%20realizar%20um%20or%C3%A7amento."
            className="px-8 py-3 border border-gray-900 text-gray-900 uppercase tracking-widest text-xs font-bold hover:bg-gray-900 hover:text-white transition-colors duration-300"
          >
            Encomendar
          </Link>
        </div>
      </div>
    </section>
  );
}