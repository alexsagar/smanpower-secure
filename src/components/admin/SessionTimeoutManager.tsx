/* eslint-disable react-hooks/exhaustive-deps, react-hooks/purity */
"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { refreshSessionAction } from "@/actions/session";
import { logoutAction } from "@/actions/auth";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

export function SessionTimeoutManager() {
  const router = useRouter();
  
  const [warningOpen, setWarningOpen] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(120);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // We maintain expiration times in refs to avoid constant re-renders from the activity listener.
  // The initial values will be overwritten very quickly if the session is alive,
  // but let's default to some future time so it doesn't instantly fire before the first sync.
  const idleExpiresAtRef = useRef<number>(Date.now() + 30 * 60 * 1000); 
  const absoluteExpiresAtRef = useRef<number>(Date.now() + 8 * 60 * 60 * 1000);
  
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
        setWarningOpen(false);
      }
    };

    return () => {
      channelRef.current?.close();
    };
  }, [router]);

  // 2. The refresh function
  const triggerRefresh = async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    try {
      const result = await refreshSessionAction();
      if (result.success && result.idleExpiresAt && result.absoluteExpiresAt) {
        const newIdle = new Date(result.idleExpiresAt).getTime();
        const newAbs = new Date(result.absoluteExpiresAt).getTime();
        
        idleExpiresAtRef.current = newIdle;
        absoluteExpiresAtRef.current = newAbs;
        lastRefreshAtRef.current = Date.now();
        
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
    channelRef.current?.postMessage({ type: "SESSION_LOGOUT" });
    await logoutAction(); // Note: logoutAction was moved to auth.ts actually, wait! I need to import from auth.ts
    // Wait, let's just do a fetch to a logout route, or import logoutAction from auth.ts
  };

  // 3. Activity Tracker
  useEffect(() => {
    const handleActivity = () => {
      // Throttle refresh calls to once every 5 minutes (300,000 ms)
      const now = Date.now();
      if (now - lastRefreshAtRef.current > 5 * 60 * 1000) {
        // Only trigger if we aren't already warning (if warning, they must click the button explicitly)
        if (!warningOpen) {
          triggerRefresh();
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
        handleLogout();
        return;
      }

      // If we are past idle time completely, log out
      if (timeToIdle <= 0) {
        handleLogout();
        return;
      }

      // If we are within 2 minutes (120,000 ms) of idle expiration, show warning
      if (timeToIdle <= 120 * 1000) {
        setRemainingSeconds(Math.ceil(timeToIdle / 1000));
        if (!warningOpen) setWarningOpen(true);
      } else {
        if (warningOpen) setWarningOpen(false);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [warningOpen]);

  return warningOpen ? (
    <Dialog open={true} onOpenChange={(open: boolean) => {
      // User cannot simply dismiss the modal by clicking outside
      if (!open) return;
    }}>
      <DialogContent className="sm:max-w-md pointer-events-auto" onPointerDownOutside={(e: any) => e.preventDefault()} onEscapeKeyDown={(e: any) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="text-red-600">Session Expiring Soon</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <p className="text-sm text-gray-600">
            You have been inactive for a while. For your security, your admin session will automatically expire in <strong>{remainingSeconds}</strong> seconds.
          </p>
        </div>
        <DialogFooter className="flex space-x-2 justify-end">
          <Button variant="outline" onClick={handleLogout} disabled={isRefreshing}>
            Sign out now
          </Button>
          <Button onClick={triggerRefresh} disabled={isRefreshing}>
            {isRefreshing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
            Continue session
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ) : null;
}
