/* eslint-disable react-hooks/exhaustive-deps, react-hooks/purity */
"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { refreshSessionAction } from "@/actions/session";
import { logoutAction } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

export type SessionTimeoutConfig = {
  idleTimeoutMinutes: number;
  idleWarningSeconds: number;
  absoluteTimeoutMinutes: number;
  activityRefreshSeconds: number;
};

export function getSessionTimeoutDurations(config: SessionTimeoutConfig) {
  return {
    idleTimeoutMs: config.idleTimeoutMinutes * 60 * 1000,
    idleWarningMs: config.idleWarningSeconds * 1000,
    absoluteTimeoutMs: config.absoluteTimeoutMinutes * 60 * 1000,
    activityRefreshMs: config.activityRefreshSeconds * 1000,
  };
}

export function SessionTimeoutManager({
  config,
}: {
  config: SessionTimeoutConfig;
}) {
  const router = useRouter();
  const durations = getSessionTimeoutDurations(config);
  
  const [warningOpen, setWarningOpen] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(config.idleWarningSeconds);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const isSigningOutRef = useRef(false);

  // We maintain expiration times in refs to avoid constant re-renders from the activity listener.
  // The initial values will be overwritten very quickly if the session is alive,
  // but let's default to some future time so it doesn't instantly fire before the first sync.
  const idleExpiresAtRef = useRef<number>(Date.now() + durations.idleTimeoutMs);
  const absoluteExpiresAtRef = useRef<number>(Date.now() + durations.absoluteTimeoutMs);
  
  const lastRefreshAtRef = useRef<number>(Date.now());
  const channelRef = useRef<BroadcastChannel | null>(null);

  // 1. Setup BroadcastChannel
  useEffect(() => {
    if (typeof window === "undefined") return;

    channelRef.current = new BroadcastChannel("sevenseas-session-sync");
    
    channelRef.current.onmessage = (event) => {
      const { type, payload } = event.data;
      if (type === "SESSION_LOGOUT") {
        router.push("/admin/login");
      } else if (type === "SESSION_REFRESHED") {
        idleExpiresAtRef.current = payload.idleExpiresAt;
        absoluteExpiresAtRef.current = payload.absoluteExpiresAt;
        lastRefreshAtRef.current = Date.now();
        setRemainingSeconds(config.idleWarningSeconds);
        setWarningOpen(false);
      }
    };

    return () => {
      channelRef.current?.close();
    };
  }, [router]);

  // 2. The refresh function
  const triggerRefresh = async () => {
    if (isRefreshing || isSigningOutRef.current) return;
    setIsRefreshing(true);
    try {
      const result = await refreshSessionAction();
      if (result.success && result.idleExpiresAt && result.absoluteExpiresAt) {
        const newIdle = new Date(result.idleExpiresAt).getTime();
        const newAbs = new Date(result.absoluteExpiresAt).getTime();
        
        idleExpiresAtRef.current = newIdle;
        absoluteExpiresAtRef.current = newAbs;
        lastRefreshAtRef.current = Date.now();
        setRemainingSeconds(config.idleWarningSeconds);
        setWarningOpen(false);
        channelRef.current?.postMessage({
          type: "SESSION_REFRESHED",
          payload: { idleExpiresAt: newIdle, absoluteExpiresAt: newAbs }
        });
      } else {
        // Failed to refresh (maybe revoked or expired on server)
        handleLogout();
      }
    } catch (e) {
      handleLogout();
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleLogout = async () => {
    if (isSigningOutRef.current) return;
    isSigningOutRef.current = true;
    setIsSigningOut(true);
    setWarningOpen(false);
    channelRef.current?.postMessage({ type: "SESSION_LOGOUT" });
    await logoutAction();
  };

  // 3. Activity Tracker
  useEffect(() => {
    const handleActivity = () => {
      // Throttle refresh calls to once every 5 minutes (300,000 ms)
      const now = Date.now();
      if (now - lastRefreshAtRef.current > durations.activityRefreshMs) {
        // Only trigger if we aren't already warning (if warning, they must click the button explicitly)
        if (!warningOpen) {
          void triggerRefresh();
        }
      }
    };

    // Attach to standard meaningful events
    window.addEventListener("mousedown", handleActivity);
    window.addEventListener("keydown", handleActivity);
    window.addEventListener("touchstart", handleActivity);

    return () => {
      window.removeEventListener("mousedown", handleActivity);
      window.removeEventListener("keydown", handleActivity);
      window.removeEventListener("touchstart", handleActivity);
    };
  }, [warningOpen]);

  // 4. Expiration Poller
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const timeToIdle = idleExpiresAtRef.current - now;
      const timeToAbsolute = absoluteExpiresAtRef.current - now;

      // Absolute timeout always wins
      if (timeToAbsolute <= 0) {
        void handleLogout();
        return;
      }

      // If we are past idle time completely, log out
      if (timeToIdle <= 0) {
        void handleLogout();
        return;
      }

      // If we are within 2 minutes (120,000 ms) of idle expiration, show warning
      if (timeToIdle <= durations.idleWarningMs) {
        setRemainingSeconds(Math.ceil(timeToIdle / 1000));
        if (!warningOpen) setWarningOpen(true);
      } else {
        if (warningOpen) setWarningOpen(false);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [warningOpen]);

  return warningOpen ? (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-brand-black/45 px-4 py-6"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="session-timeout-title"
      aria-describedby="session-timeout-description"
    >
      <div className="w-full max-w-md border border-brand-gold/25 bg-brand-off-white shadow-[0_30px_80px_-30px_rgba(0,0,0,0.45)]">
        <div className="border-b border-brand-charcoal/10 px-6 py-5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-brand-gold">
            Security Notice
          </p>
          <h2 id="session-timeout-title" className="mt-2 text-2xl font-semibold tracking-tight text-brand-black">
            Session Expiring Soon
          </h2>
        </div>
        <div className="space-y-5 px-6 py-6">
          <p id="session-timeout-description" className="text-sm leading-6 text-brand-charcoal/80">
            You have been inactive for a while. For your security, your admin session will automatically expire in{" "}
            <strong className="font-semibold text-brand-black">{remainingSeconds}</strong> seconds.
          </p>
          <div className="border border-brand-charcoal/10 bg-white px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-muted">Countdown</p>
            <p className="mt-2 text-3xl font-light tracking-tight text-brand-black">{remainingSeconds}s</p>
          </div>
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button variant="outline" onClick={() => void handleLogout()} disabled={isRefreshing || isSigningOut}>
              {isSigningOut ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Sign out now
            </Button>
            <Button onClick={() => void triggerRefresh()} disabled={isRefreshing || isSigningOut}>
              {isRefreshing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Continue session
            </Button>
          </div>
        </div>
      </div>
    </div>
  ) : null;
}
