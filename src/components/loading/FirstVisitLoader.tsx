"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

export const FIRST_VISIT_LOADER_KEY = "smanpower:first-visit-loader:v1";
const MIN_DISPLAY_MS = 3500;
const SAFETY_TIMEOUT_MS = 5000;
const FADE_OUT_MS = 220;

type StorageLike = Pick<Storage, "getItem" | "setItem">;
type LoaderPhase = "hidden" | "visible" | "exiting";

export function shouldShowFirstVisitLoader(storage: StorageLike | undefined | null) {
  if (!storage) return false;

  try {
    return storage.getItem(FIRST_VISIT_LOADER_KEY) !== "done";
  } catch {
    return false;
  }
}

export function markFirstVisitLoaderComplete(storage: StorageLike | undefined | null) {
  try {
    storage?.setItem(FIRST_VISIT_LOADER_KEY, "done");
  } catch {
    // Storage can be unavailable in privacy modes. The loader should still dismiss.
  }
}

export function FirstVisitLoader() {
  const [phase, setPhase] = useState<LoaderPhase>("hidden");

  useEffect(() => {
    if (!shouldShowFirstVisitLoader(window.sessionStorage)) return;

    const startedAt = Date.now();
    let hideTimer = 0;
    let finishTimer = 0;
    let completed = false;
    const finish = () => {
      if (completed) return;
      completed = true;

      const elapsed = Date.now() - startedAt;
      const remaining = Math.max(0, MIN_DISPLAY_MS - elapsed);
      finishTimer = window.setTimeout(() => {
        markFirstVisitLoaderComplete(window.sessionStorage);
        setPhase("exiting");
        hideTimer = window.setTimeout(() => setPhase("hidden"), FADE_OUT_MS);
      }, remaining);
    };

    const showFrame = window.requestAnimationFrame(() => setPhase("visible"));
    let finishFrame = 0;
    const onLoad = () => {
      finishFrame = window.requestAnimationFrame(finish);
    };

    if (document.readyState === "complete") {
      onLoad();
    } else {
      window.addEventListener("load", onLoad, { once: true });
    }

    const timeout = window.setTimeout(finish, SAFETY_TIMEOUT_MS);

    return () => {
      window.cancelAnimationFrame(showFrame);
      window.cancelAnimationFrame(finishFrame);
      window.removeEventListener("load", onLoad);
      window.clearTimeout(timeout);
      window.clearTimeout(finishTimer);
      window.clearTimeout(hideTimer);
    };
  }, []);

  if (phase === "hidden") return null;

  return (
    <div
      className={`fixed inset-0 z-[100] grid place-items-center bg-brand-off-white text-brand-black transition-opacity duration-200 ${
        phase === "exiting" ? "opacity-0" : "opacity-100"
      }`}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="flex flex-col items-center gap-7">
        <Image
          src="/images/SSIS.png"
          alt="Seven Seas Intercontinental"
          width={180}
          height={180}
          priority
          className="h-auto w-[150px] motion-safe:animate-[seven-seas-logo-enter_320ms_ease-out_both] md:w-[180px]"
        />
        <div className="seven-seas-loader-bar" aria-hidden="true" />
        <span className="sr-only">Loading Seven Seas Intercontinental</span>
      </div>
    </div>
  );
}
