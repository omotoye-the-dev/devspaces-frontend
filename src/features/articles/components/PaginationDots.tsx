import type { JSX } from "react";

export function PaginationDots({
  total,
  active,
  onPageChange,
}: {
  total: number;
  active: number;
  onPageChange?: (page: number) => void;
}): JSX.Element {
  if (total <= 1) return <div className="py-2" />;

  return (
    <div className="flex items-center justify-center gap-1.5 py-4">
      {Array.from({ length: Math.min(total, 8) }).map((_, i) => (
        <button
          key={i}
          type="button"
          onClick={() => onPageChange?.(i + 1)}
          className={`h-2 rounded-full transition-all duration-200 cursor-pointer ${
            i === active ? "bg-primary w-5" : "bg-border w-2 hover:bg-primary/50"
          }`}
          aria-label={`Go to page ${i + 1}`}
        />
      ))}
    </div>
  );
}

export default PaginationDots;
