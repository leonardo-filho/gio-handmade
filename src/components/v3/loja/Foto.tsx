import Image, { type ImageProps } from "next/image";
import FotoSuave from "../estrutura/FotoSuave";

type Props = Omit<ImageProps, "loading" | "fetchPriority" | "preload" | "priority"> & {
  /** Foto da primeira tela: carrega na hora e aparece sem fade. */
  prioridade?: boolean;
};

// Foto de peça da loja e da galeria. A da primeira tela aparece direto, sem
// esperar o fade nem a hidratação (é a maior pintura da página). As outras
// carregam preguiçosas e entram com o fade de 0,2 s da estrutura (FotoSuave),
// sobre o fundo navy a 5% de quem as contém.
export default function Foto({ prioridade = false, alt, ...props }: Props) {
  if (prioridade) return <Image {...props} alt={alt} loading="eager" fetchPriority="high" />;
  return <FotoSuave {...props} alt={alt} loading="lazy" />;
}
