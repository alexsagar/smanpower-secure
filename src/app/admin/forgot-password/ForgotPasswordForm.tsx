"use client";

import { useActionState, useRef, useState } from "react";
import { submitForgotPassword, ForgotPasswordState } from "@/actions/password-reset";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Loader2, MailCheck, AlertCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";
import Script from "next/script";
import { AdminAuthShell } from "@/components/admin/AdminAuthShell";

export default function ForgotPasswordForm() {
  const [state, formAction, isPending] = useActionState<ForgotPasswordState, FormData>(
    submitForgotPassword,
    { success: false }
  );

  const turnstileRef = useRef<HTMLDivElement>(null);
  const [turnstileToken, setTurnstileToken] = useState<string>("");

  if (state.success) {
    return (
      <AdminAuthShell
        title="Check your email"
        description="We've processed your password reset request."
        icon={
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-green-50 text-green-600">
            <MailCheck className="w-6 h-6" />
          </div>
        }
      >
        <div className="text-center space-y-6">
          <p className="text-brand-charcoal text-sm leading-relaxed">
            If an account exists for the provided email address, a password reset link has been sent. Please check your inbox and spam folder.
          </p>
          <div className="pt-2">
            <Link
              href="/admin/login"
              className="inline-flex items-center justify-center font-medium transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-gold bg-brand-black text-white hover:bg-brand-charcoal h-13 px-8 text-base w-full"
            >
              Return to Login
            </Link>
          </div>
        </div>
      </AdminAuthShell>
    );
  }

  const footer = (
    <Link
      href="/admin/login"
      className="inline-flex items-center text-sm font-medium text-brand-muted hover:text-brand-charcoal transition-colors"
    >
      <ArrowLeft className="w-4 h-4 mr-2" />
      Back to login
    </Link>
  );

  return (
    <AdminAuthShell
      title="Forgot Password"
      description="Enter your email to receive a password reset link."
      footerContent={footer}
    >
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
        strategy="lazyOnload"
        onLoad={() => {
          if (typeof window !== 'undefined' && (window as any).turnstile && turnstileRef.current) {
            (window as any).turnstile.render(turnstileRef.current, {
              sitekey: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY,
              action: "forgot_password",
              callback: (token: string) => {
                setTurnstileToken(token);
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
        <input type="hidden" name="cf-turnstile-response" value={turnstileToken} />

        <div>
          <Label htmlFor="email" required>Email Address</Label>
          <Input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            error={state.errors?.email?.[0]}
          />
        </div>

        <div className="space-y-2">
          <p className="text-xs text-brand-muted">Complete the security check to continue.</p>
          <div ref={turnstileRef}></div>
        </div>

        <Button type="submit" variant="primary" size="lg" fullWidth disabled={isPending || !turnstileToken}>
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Sending...
            </>
          ) : (
            "Send Reset Link"
          )}
        </Button>
      </form>
    </AdminAuthShell>
  );
}
