export default function AboutSection() {
    return (
        <section id="sobre" className="py-20 bg-stone-50">
            <div className="max-w-5xl mx-auto px-4">
                <div className="flex flex-col md:flex-row items-center gap-12">

                    {/* Image Placeholder */}
                    <div className="w-full md:w-1/2 aspect-[3/4] bg-stone-200 relative overflow-hidden rounded-sm shadow-md">
                        {/* Replace with actual image of the artisan */}
                        <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                            <span className="uppercase tracking-widest text-xs">Foto da Artesã</span>
                        </div>
                        {/* Optional: Overlay/Texture */}
                        <div className="absolute inset-0 bg-stone-500/10 mix-blend-multiply" />
                    </div>

                    {/* Text Content */}
                    <div className="w-full md:w-1/2 text-center md:text-left">
                        <span className="text-xs font-bold tracking-[0.2em] text-gray-400 uppercase mb-4 block">
                            Quem faz
                        </span>
                        <h2 className="text-3xl md:text-4xl font-serif text-gray-900 mb-6">
                            Uma mulher, <br />
                            múltiplas criações.
                        </h2>
                        <div className="space-y-4 text-gray-600 font-light leading-relaxed">
                            <p>
                                Olá! Eu sou a Giovanna, a mente e as mãos por trás de cada peça da Gio Handmade.
                            </p>
                            <p>
                                Este não é um processo industrial. É um trabalho de paciência, arte e dedicação. Cada top, cada saia e cada acessório é tecido miçanga por miçanga, exclusivamente por mim.
                            </p>
                            <p>
                                Quando você encomenda uma peça, você não está apenas comprando uma roupa; está levando para casa horas de trabalho manual, carinho e um design pensado para valorizar a sua essência.
                            </p>
                        </div>

                        <div className="mt-8">
                            <span className="inline-block border text-stone-500 border-stone-300 px-4 py-2 text-xs uppercase tracking-widest rounded-full">
                                Slow Fashion
                            </span>
                            <span className="inline-block border text-stone-500 border-stone-300 px-4 py-2 text-xs uppercase tracking-widest rounded-full ml-2">
                                100% Artesanal
                            </span>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
}
