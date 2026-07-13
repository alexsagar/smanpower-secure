"use client";

import { useEffect } from "react";
import Link from "next/link";
import { ShieldAlert, AlertTriangle } from "lucide-react";
import {
  isForbiddenDigest,
  isSessionRedirectDigest,
  AUTH_DIGEST,
} from "@/lib/auth-errors";

/**
 * Admin dashboard error boundary. Turns authorization failures into
 * clean screens instead of raw stack traces / 500s:
 *   - stale / invalid session  → redirect to login
 *   - missing permission (403) → clean Access Denied screen
 *   - anything else            → generic recoverable error screen
 *
 * Note: errors thrown by the segment's own layout.tsx are handled in
 * the layout itself (server-side redirect); this boundary catches
 * errors thrown while rendering the pages under it.
 */
export default function AdminDashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const digest = error?.digest;
  const sessionExpired = isSessionRedirectDigest(digest);
  const forbidden = isForbiddenDigest(digest);

  useEffect(() => {
    if (sessionExpired) {
      window.location.href = "/admin/login?error=session_expired";
    }
  }, [sessionExpired]);

  // Extract the missing permission, if the digest encoded one.
  const missingPermission =
    forbidden && digest && digest.startsWith(`${AUTH_DIGEST.FORBIDDEN}:`)
      ? digest.slice(AUTH_DIGEST.FORBIDDEN.length + 1)
      : null;

  if (sessionExpired) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <p className="text-brand-muted text-sm">Redirecting to sign in…</p>
      </div>
    );
  }

  if (forbidden) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-6">
        <div className="max-w-md w-full text-center">
          <div className="mx-auto w-14 h-14 flex items-center justify-center bg-red-50 border border-red-100 rounded-full mb-6">
            <ShieldAlert className="w-7 h-7 text-red-500" />
          </div>
          <span className="text-red-500 text-[10px] font-semibold tracking-[0.3em] uppercase">
            403 // Access Denied
          </span>
          <h1 className="text-2xl font-semibold text-brand-black mt-2 mb-3 tracking-tight">
            You don&apos;t have permission
          </h1>
          <p className="text-brand-muted text-sm mb-2">
            Your account isn&apos;t authorized to view this section. If you
            believe this is a mistake, contact a Super Admin.
          </p>
          {missingPermission && (
            <p className="text-brand-muted/70 text-xs font-mono mb-6">
              Required: {missingPermission}
            </p>
          )}
          <Link
            href="/admin"
            className="inline-flex items-center justify-center bg-brand-black text-white hover:bg-brand-gold px-6 py-3 text-sm font-semibold tracking-widest uppercase transition-colors"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-6">
      <div className="max-w-md w-full text-center">
        <div className="mx-auto w-14 h-14 flex items-center justify-center bg-amber-50 border border-amber-100 rounded-full mb-6">
          <AlertTriangle className="w-7 h-7 text-amber-500" />
        </div>
        <span className="text-amber-500 text-[10px] font-semibold tracking-[0.3em] uppercase">
          Something went wrong
        </span>
        <h1 className="text-2xl font-semibold text-brand-black mt-2 mb-3 tracking-tight">
          Unexpected error
        </h1>
        <p className="text-brand-muted text-sm mb-6">
          We hit a problem loading this page. You can try again or return to the
          dashboard.
        </p>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={reset}
            className="inline-flex items-center justify-center bg-brand-black text-white hover:bg-brand-gold px-6 py-3 text-sm font-semibold tracking-widest uppercase transition-colors"
          >
            Try Again
          </button>
          <Link
            href="/admin"
            className="inline-flex items-center justify-center border border-brand-charcoal/20 text-brand-black hover:border-brand-gold px-6 py-3 text-sm font-semibold tracking-widest uppercase transition-colors"
          >
            Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
