import Link from "next/link";
import Image from "next/image";
import { Reveal, StaggerGroup, StaggerItem } from "./Reveal";

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

        <Reveal className="text-center mb-12">
          <span className="text-[10px] font-bold tracking-[0.3em] text-[#1B4965]/60 uppercase">
            Shop The Look
          </span>
          <h2 className="mt-3 text-3xl md:text-4xl font-[family-name:var(--font-serif)] text-[#1B4965]">
            Instagram <span className="italic">@gio.handmade__</span>
          </h2>
          <div className="mt-4 mx-auto w-12 h-px bg-[#1B4965]/30" />
        </Reveal>

        <StaggerGroup className="grid grid-cols-3 gap-[3px] md:gap-4 max-w-4xl mx-auto">
          {instagramImages.map((image, index) => (
            <StaggerItem
              key={index}
              className="relative aspect-square overflow-hidden group cursor-pointer"
            >
              <Image
                src={image.src}
                alt={image.alt}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-[#1B4965]/0 group-hover:bg-[#1B4965]/20 transition-colors duration-500" />
            </StaggerItem>
          ))}
        </StaggerGroup>

        <Reveal className="text-center mt-12">
          <Link
            href="https://instagram.com/gio.handmade__"
            target="_blank"
            className="inline-block border-b border-[#1B4965] pb-1 text-[#1B4965] uppercase text-xs tracking-[0.25em] hover:text-[#1B4965]/60 hover:border-[#1B4965]/60 transition-colors"
          >
            Seguir no Instagram
          </Link>
        </Reveal>

      </div>
    </section>
  );
}
