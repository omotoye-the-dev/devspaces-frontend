import type { JSX } from "react";

export function HeroBanner(): JSX.Element {
  return (
    <div className="relative w-full rounded-xl overflow-hidden h-44 sm:h-48 md:h-52 group">
      <img
        src="/hero-banner.jpg"
        alt="Where developers learn in public"
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
        onError={(e) => {
          (e.target as HTMLImageElement).src =
            "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=1200&auto=format&fit=crop";
        }}
      />
      <div className="absolute inset-0 flex flex-col justify-center px-6 sm:px-10 md:px-12 bg-black/30">
        <h1 className="text-white text-xl sm:text-2xl md:text-3xl font-bold tracking-tight leading-tight max-w-md">
          Where developers learn in public.
        </h1>
        <p className="text-white/80 text-xs sm:text-sm mt-1.5 max-w-sm">
          Share what you know. Learn from the community.
        </p>
      </div>
    </div>
  );
}

export default HeroBanner;
