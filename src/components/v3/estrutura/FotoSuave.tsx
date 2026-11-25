"use client";

import Image, { type ImageProps } from "next/image";

// Foto que entra em fade de 0,2 s quando termina de carregar, sobre o fundo
// navy a 5% de quem a contém (spec, seção 5: sem pulsar). Com movimento
// reduzido, aparece na hora. O next/image chama o onLoad também quando a foto
// já veio do cache antes da hidratação, então ela nunca fica apagada.
export default function FotoSuave({ className = "", onLoad, alt, ...props }: ImageProps) {
  return (
    <Image
      {...props}
      alt={alt}
      onLoad={(e) => {
        e.currentTarget.dataset.carregou = "";
        onLoad?.(e);
      }}
      className={`opacity-0 transition-opacity duration-200 data-[carregou]:opacity-100 motion-reduce:transition-none ${className}`}
    />
  );
}
