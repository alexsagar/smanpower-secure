"use client";

import { ReactLenis } from "lenis/react";

export function SmoothScroll({ children }: { children: React.ReactNode }) {
  return (
    <ReactLenis
      root
      options={{
        lerp: 0.2, // Higher lerp = much snappier/faster catch-up
        wheelMultiplier: 1.2, // Slightly faster scroll distance per tick
        smoothWheel: true,
      }}
    >
      {children}
    </ReactLenis>
  );
}
