"use client";

import { useActionState, useState, useRef } from "react";
import { submitResetPassword, ResetPasswordState } from "@/actions/password-reset";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Loader2, AlertCircle, Eye, EyeOff, Lock } from "lucide-react";
import { toast } from "sonner";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Script from "next/script";
import { AdminAuthShell } from "@/components/admin/AdminAuthShell";

export default function ResetPasswordForm({ token, email }: { token: string, email: string }) {
  const [state, formAction, isPending] = useActionState<ResetPasswordState, FormData>(
    submitResetPassword,
    { success: false }
  );
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string>("");

  useEffect(() => {
    if (state.success) {
      toast.success("Password reset successfully! Please login.");
      router.push("/admin/login?message=password_reset");
    }
  }, [state, router]);

  const turnstileRef = useRef<HTMLDivElement>(null);

  return (
    <AdminAuthShell
      title="Set new password"
      description={
        <>
          Create a new password for <strong className="font-semibold">{email}</strong>
        </>
      }
      icon={
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-50 text-blue-600">
          <Lock className="w-6 h-6" />
        </div>
      }
    >
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
        strategy="lazyOnload"
        onLoad={() => {
          if (typeof window !== 'undefined' && (window as any).turnstile && turnstileRef.current) {
            (window as any).turnstile.render(turnstileRef.current, {
              sitekey: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY,
              action: "reset_password",
              callback: (t: string) => {
                setTurnstileToken(t);
              }
            });
          }
        }}
      />

      {state.message && !state.success && (
        <div className="flex items-center gap-2 p-3 mb-6 bg-red-50 text-sm text-red-700 border border-red-100" role="alert">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {state.message}
        </div>
      )}

      <form action={formAction} className="space-y-5">
        <input type="hidden" name="token" value={token} />
        <input type="hidden" name="email" value={email} />
        <input type="hidden" name="cf-turnstile-response" value={turnstileToken} />

        <div>
          <Label htmlFor="password" required>New Password</Label>
          <div className="relative">
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              required
              minLength={8}
              placeholder="At least 8 characters"
              autoComplete="new-password"
              error={state.errors?.password?.[0]}
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-[10px] text-brand-muted hover:text-brand-charcoal transition-colors focus:outline-none"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        <div>
          <Label htmlFor="confirmPassword" required>Confirm Password</Label>
          <div className="relative">
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type={showPassword ? "text" : "password"}
              required
              minLength={8}
              autoComplete="new-password"
              error={state.errors?.confirmPassword?.[0]}
              className="pr-10"
            />
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-xs text-brand-muted">Complete the security check to continue.</p>
          <div ref={turnstileRef}></div>
        </div>

        <Button type="submit" variant="primary" size="lg" fullWidth disabled={isPending || !turnstileToken}>
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Resetting...
            </>
          ) : (
            "Reset Password"
          )}
        </Button>
      </form>
    </AdminAuthShell>
  );
}
