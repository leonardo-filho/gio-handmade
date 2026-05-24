import type { ReactNode } from "react";

type CatalogFrameProps = {
  children: ReactNode;
  page: string;
  tone?: "cream" | "ink" | "navy" | "mint";
  full?: boolean;
  id?: string;
};

const toneMap = {
  cream: { bg: "bg-[#EDE7D9]", fg: "text-[#130209]", muted: "text-[#130209]/60", line: "border-[#130209]/25" },
  ink: { bg: "bg-[#130209]", fg: "text-[#EDE7D9]", muted: "text-[#EDE7D9]/55", line: "border-[#EDE7D9]/20" },
  navy: { bg: "bg-[#1B4965]", fg: "text-[#EDE7D9]", muted: "text-[#EDE7D9]/65", line: "border-[#EDE7D9]/25" },
  mint: { bg: "bg-[#C8E1E4]", fg: "text-[#130209]", muted: "text-[#130209]/55", line: "border-[#130209]/20" },
};

export default function CatalogFrame({ children, page, tone = "cream", full = false, id }: CatalogFrameProps) {
  const t = toneMap[tone];
  return (
    <section
      id={id}
      className={`relative w-full ${t.bg} ${t.fg} ${full ? "min-h-screen" : "py-20 md:py-28"} flex flex-col`}
    >
      {/* top header strip */}
      <header
        className={`flex items-center justify-between px-6 md:px-14 pt-6 md:pt-8 text-[10px] md:text-[11px] tracking-[0.28em] uppercase font-[family-name:var(--font-display)] ${t.muted}`}
      >
        <span>GIO HANDMADE · CATÁLOGO 2026</span>
        <span>{page}</span>
      </header>

      {/* main slot */}
      <div className="flex-1 flex flex-col justify-center px-6 md:px-14 py-12 md:py-16">{children}</div>

      {/* bottom signature row */}
      <footer
        className={`flex items-end justify-between px-6 md:px-14 pb-6 md:pb-8 text-[10px] md:text-[11px] tracking-[0.28em] uppercase font-[family-name:var(--font-display)] ${t.muted}`}
      >
        <span>@GIO.HANDMADE__</span>
        <div className={`flex items-center gap-3 border ${t.line} rounded-full px-5 py-2`}>
          <span className="text-[10px] tracking-[0.3em]">CONTINUE</span>
          <svg width="22" height="10" viewBox="0 0 22 10" fill="none" className="opacity-80">
            <path d="M1 5H20M20 5L16 1M20 5L16 9" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
          </svg>
        </div>
      </footer>
    </section>
  );
}
