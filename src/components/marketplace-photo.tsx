"use client";

import { useEffect, useState } from "react";

const fallback = "/faculty-placeholder.svg";

export function MarketplacePhoto({ src, alt, className }: { src: string | null; alt: string; className: string }) {
  const [current, setCurrent] = useState(src || fallback);
  useEffect(() => {
    setCurrent(src || fallback);
  }, [src]);
  return (
    <img
      src={current}
      alt={alt}
      className={className}
      onError={() => {
        if (current !== fallback) setCurrent(fallback);
      }}
    />
  );
}
