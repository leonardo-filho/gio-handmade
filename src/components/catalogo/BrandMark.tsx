import Image from "next/image";

type Tone = "cream" | "ink" | "navy" | "mint";

const variantByTone: Record<Tone, string> = {
  cream: "/brand/logo/gio-ink.png",
  ink: "/brand/logo/gio-cream.png",
  navy: "/brand/logo/gio-mint.png",
  mint: "/brand/logo/gio-ink.png",
};

type BrandMarkProps = {
  tone?: Tone;
  className?: string;
  width?: number;
  height?: number;
  alt?: string;
  priority?: boolean;
};

export default function BrandMark({
  tone = "cream",
  className = "",
  width = 260,
  height = 260,
  alt = "Gio Handmade",
  priority = false,
}: BrandMarkProps) {
  return (
    <Image
      src={variantByTone[tone]}
      alt={alt}
      width={width}
      height={height}
      priority={priority}
      className={className}
    />
  );
}

export function Sparkle({ className = "", size = 18, color = "currentColor" }: { className?: string; size?: number; color?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <path
        d="M12 2 L13.4 9.3 L20 11 L13.4 12.6 L12 22 L10.6 12.6 L4 11 L10.6 9.3 Z"
        fill={color}
      />
    </svg>
  );
}
