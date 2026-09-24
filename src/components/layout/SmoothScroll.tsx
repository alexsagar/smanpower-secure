"use client";

import { ReactLenis } from "lenis/react";
import { useReducedMotion } from "framer-motion";

import "lenis/dist/lenis.css";

// Deliberately conservative: the wheel keeps its native travel distance
// (wheelMultiplier 1) and the interpolation is fast enough to feel like
// damping rather than a cinematic glide.
const LENIS_OPTIONS = {
  lerp: 0.14,
  wheelMultiplier: 1,
  smoothWheel: true,
  // Touch stays fully native — smoothing a finger drag feels laggy on mobile.
  syncTouch: false,
  // Lenis honours `scroll-margin-top`, so hash links keep clearing the fixed
  // header exactly as they do with native smooth scrolling.
  anchors: true,
  // Lets the mobile menu panel and other `overflow-y-auto` regions scroll
  // themselves instead of driving the page behind them.
  allowNestedScroll: true,
  // Kills leftover inertia when an internal link starts a route change.
  stopInertiaOnNavigate: true,
  autoRaf: true,
} as const;

/**
 * Global smooth-scroll provider for the public site.
 *
 * `root` means Lenis drives the document scroller and renders no wrapper
 * element, so the fixed header, sticky elements and layout are untouched.
 * Readers who ask for reduced motion get the browser's native scrolling with
 * no Lenis instance mounted at all.
 */
export function SmoothScroll({ children }: { children: React.ReactNode }) {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return <>{children}</>;
  }

  return (
    <ReactLenis root options={LENIS_OPTIONS}>
      {children}
    </ReactLenis>
  );
}
