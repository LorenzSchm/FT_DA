"use client";

import Image from "next/image";

export default function HeroBanner({ src, alt, title, subtitle }) {
  return (
    <section
      className="relative w-full h-[55vh] md:h-[65vh] overflow-hidden"
      data-nav-theme="dark"
    >
      <Image
        src={src}
        alt={alt}
        fill
        priority={false}
        sizes="100vw"
        className="object-cover object-center scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent" />
      <div className="absolute inset-0 flex items-end md:items-center justify-start p-6 md:p-12">
        <div>
          {title && (
            <h2 className="text-white text-3xl md:text-5xl font-swiss font-black ">
              {title}
            </h2>
          )}
          {subtitle && (
            <p className="mt-2 text-white/90 text-base md:text-lg font-medium ">
              {subtitle}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
