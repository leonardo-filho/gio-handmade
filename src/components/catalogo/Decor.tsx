type CurveProps = {
  className?: string;
  stroke?: string;
};

// Vertical thin curve with ellipses — main DS motif (right-side of pages)
export function VerticalCurve({ className = "", stroke = "currentColor" }: CurveProps) {
  return (
    <svg
      viewBox="0 0 200 1200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      preserveAspectRatio="none"
    >
      <path
        d="M 100 0 C 220 220, 220 420, 80 600 C -60 780, -60 980, 100 1200"
        stroke={stroke}
        strokeWidth="1"
        opacity="0.45"
      />
    </svg>
  );
}

// Decorative line with ellipses (used in indexes / lists)
type EllipseAnchorProps = {
  label?: string;
  number?: string;
  className?: string;
};

export function EllipseAnchor({ label, number, className = "" }: EllipseAnchorProps) {
  return (
    <div className={`flex items-center gap-5 ${className}`}>
      <span className="relative inline-block">
        <span className="block w-7 h-3.5 rounded-full border border-current opacity-70" />
        {number && (
          <span className="absolute inset-0 flex items-center justify-center text-[9px] tracking-widest font-[family-name:var(--font-display)] opacity-80">
            {number}
          </span>
        )}
      </span>
      {label && (
        <span className="text-[11px] md:text-xs tracking-[0.32em] uppercase font-[family-name:var(--font-display)]">
          {label}
        </span>
      )}
    </div>
  );
}

// Horizontal hair-line with notch
export function NotchedRule({ className = "" }: { className?: string }) {
  return (
    <div className={`relative h-px w-full bg-current/30 ${className}`}>
      <span className="absolute left-1/2 -translate-x-1/2 -top-[6px] w-3 h-3 rounded-full border border-current/40 bg-transparent" />
    </div>
  );
}
