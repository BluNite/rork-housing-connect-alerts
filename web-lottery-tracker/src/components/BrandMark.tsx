export function BrandMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 44 44" className={className} aria-hidden="true">
      <rect x="6" y="10" width="20" height="30" rx="2" fill="hsl(var(--primary))" />
      <rect x="26" y="18" width="12" height="22" rx="2" fill="hsl(var(--primary) / 0.75)" />
      {[0, 1, 2, 3].map((r) =>
        [0, 1].map((c) => (
          <rect key={`${r}-${c}`} x={10 + c * 7} y={14 + r * 6} width="4" height="3.5" rx="0.8" fill="hsl(var(--background))" />
        )),
      )}
      <rect x="29" y="22" width="6" height="3" rx="0.8" fill="hsl(var(--background))" />
      <rect x="29" y="28" width="6" height="3" rx="0.8" fill="hsl(var(--background))" />
      <rect x="14" y="34" width="4" height="6" fill="hsl(var(--background))" />
      <circle cx="36" cy="10" r="6" fill="hsl(var(--warn))" />
      <path d="M33.5 11.5h5l-.7-1V9a1.8 1.8 0 0 0-3.6 0v1.5z" fill="#fff" />
    </svg>
  );
}
