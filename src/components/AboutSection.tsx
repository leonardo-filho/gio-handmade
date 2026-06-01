import Image from "next/image";
import { Reveal } from "./Reveal";

export default function AboutSection() {
    return (
        <section id="sobre" className="py-20 bg-[#EDE7D9]">
            <div className="max-w-5xl mx-auto px-4">
                <div className="flex flex-col md:flex-row items-center gap-12">

                    {/* Image */}
                    <Reveal className="w-full md:w-1/2" y={32} duration={1.1}>
                    <div className="aspect-[3/4] bg-[#C8E1E4] relative overflow-hidden shadow-md">
                        <Image
                            src="/eu.jpeg"
                            alt="Giovanna Alves, artesã da Gio Handmade"
                            fill
                            sizes="(min-width: 768px) 512px, 100vw"
                            className="object-cover"
                        />
                    </div>
                    </Reveal>

                    {/* Text Content */}
                    <Reveal className="w-full md:w-1/2 text-center md:text-left" delay={0.2} y={24}>
                        <span className="text-[10px] font-bold tracking-[0.3em] text-[#1B4965]/60 uppercase mb-4 block">
                            Quem faz
                        </span>
                        <h2 className="text-3xl md:text-4xl font-[family-name:var(--font-serif)] text-[#1B4965] mb-6">
                            Uma mulher, <br />
                            <span className="italic">múltiplas criações.</span>
                        </h2>
                        <div className="space-y-4 text-[#1B4965]/80 font-light leading-relaxed">
                            <p>
                                Olá! Eu sou a Giovanna Alves, a mente e as mãos por trás de cada peça da Gio Handmade.
                            </p>
                            <p>
                                Este não é um processo industrial. É um trabalho de paciência, arte e dedicação. Cada top, cada saia e cada acessório é feito exclusivamente por mim.
                            </p>
                            <p>
                                Quando você encomenda uma peça, você não está apenas comprando uma roupa; está levando para casa horas de trabalho manual, carinho e um design pensado para valorizar a sua essência.
                            </p>
                        </div>

                        <div className="mt-8 flex flex-wrap gap-2 justify-center md:justify-start">
                            <span className="inline-block border text-[#1B4965] border-[#1B4965]/30 px-4 py-2 text-xs uppercase tracking-[0.2em] rounded-full">
                                Slow Fashion
                            </span>
                            <span className="inline-block border text-[#1B4965] border-[#1B4965]/30 px-4 py-2 text-xs uppercase tracking-[0.2em] rounded-full">
                                100% Artesanal
                            </span>
                            <span className="inline-block bg-[#1B4965] text-[#EDE7D9] px-4 py-2 text-xs uppercase tracking-[0.2em] rounded-full">
                                Belém · PA
                            </span>
                        </div>
                    </Reveal>

                </div>
            </div>
        </section>
    );
}
