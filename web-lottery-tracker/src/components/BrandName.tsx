// Brand wordmark: "NYC" carries extra weight, "Lottery Tracker" inherits
// the parent's weight. Use for every brand lockup so the treatment stays
// identical everywhere; plain-text mentions write the name out directly.
export function BrandName({ className = "" }: { className?: string }) {
  return (
    <span className={className}>
      <span className="font-extrabold">NYC</span> Lottery Tracker
    </span>
  );
}
