// ============================================================
// Auth / RBAC Error Types
// ============================================================
// Typed, control-flow errors thrown by the admin authorization
// layer. They carry a stable `digest` string so that Next.js
// preserves it across the server→client boundary and the admin
// error boundary (`(dashboard)/error.tsx`) can decide how to
// respond WITHOUT ever exposing a raw stack trace or 500 page.
//
//   - Unauthenticated  → no session at all → send to login
//   - SessionInvalid   → session references a user that is
//                        missing / disabled / stale → send to login
//   - Forbidden        → valid, active user lacking a permission
//                        → clean 403 screen
//
// `digest` values are intentionally NOT one of Next's reserved
// prefixes (NEXT_REDIRECT, NEXT_NOT_FOUND, …) so they flow through
// to the error boundary as ordinary render errors.
// ============================================================

export const AUTH_DIGEST = {
  UNAUTHENTICATED: "AUTH_UNAUTHENTICATED",
  SESSION_INVALID: "AUTH_SESSION_INVALID",
  FORBIDDEN: "AUTH_FORBIDDEN",
} as const;

export class UnauthenticatedError extends Error {
  digest = AUTH_DIGEST.UNAUTHENTICATED;
  constructor(message = "Not authenticated.") {
    super(message);
    this.name = "UnauthenticatedError";
  }
}

export class SessionInvalidError extends Error {
  digest = AUTH_DIGEST.SESSION_INVALID;
  constructor(message = "Session is no longer valid.") {
    super(message);
    this.name = "SessionInvalidError";
  }
}

export class ForbiddenError extends Error {
  digest: string;
  permission?: string;
  constructor(permission?: string) {
    super(
      permission
        ? `Forbidden: Missing permission "${permission}".`
        : "Forbidden: You do not have access to this resource."
    );
    this.name = "ForbiddenError";
    this.permission = permission;
    // Encode the permission into the digest so the 403 screen can
    // optionally surface it, while still matching by prefix.
    this.digest = permission
      ? `${AUTH_DIGEST.FORBIDDEN}:${permission}`
      : AUTH_DIGEST.FORBIDDEN;
  }
}

/** True when a caught error should redirect the visitor to the login page. */
export function isSessionRedirectDigest(digest?: string): boolean {
  return (
    digest === AUTH_DIGEST.UNAUTHENTICATED ||
    digest === AUTH_DIGEST.SESSION_INVALID
  );
}

/** True when a caught error represents a permission (403) failure. */
export function isForbiddenDigest(digest?: string): boolean {
  return typeof digest === "string" && digest.startsWith(AUTH_DIGEST.FORBIDDEN);
}

import { CredentialsSignin } from "next-auth";

export class MfaRequiredError extends CredentialsSignin {
  code = "MFA_REQUIRED";
}

export class InvalidCredentialsError extends CredentialsSignin {
  code = "INVALID_CREDENTIALS";
}
