"use client";

import { useActionState } from "react";
import { submitForgotPassword, ForgotPasswordState } from "@/actions/password-reset";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useEffect } from "react";
import Link from "next/link";
import Script from "next/script";

export default function ForgotPasswordForm() {
  const [state, formAction, isPending] = useActionState<ForgotPasswordState, FormData>(
    submitForgotPassword,
    { success: false }
  );

  useEffect(() => {
    if (state.success) {
      toast.success(state.message);
    } else if (state.message) {
      toast.error(state.message);
    }
  }, [state]);

  if (state.success) {
    return (
      <div className="text-center space-y-4">
        <p className="text-green-600 font-medium">Reset link sent!</p>
        <p className="text-gray-600 text-sm">Please check your email and follow the instructions to reset your password.</p>
        <div className="pt-4">
          <Link href="/admin/login" className="text-blue-600 hover:underline text-sm">
            Return to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer />
      <form action={formAction} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium">Email Address</label>
          <Input
            id="email"
            name="email"
            type="email"
            required
            className={state.errors?.email ? "border-red-500" : ""}
          />
          {state.errors?.email && (
            <p className="text-sm text-red-500">{state.errors.email[0]}</p>
          )}
        </div>

        <div className="cf-turnstile" data-sitekey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY} data-action="forgot_password"></div>

        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Sending...
            </>
          ) : (
            "Send Reset Link"
          )}
        </Button>

        <div className="text-center pt-4">
          <Link href="/admin/login" className="text-sm text-gray-500 hover:text-gray-900">
            Back to login
          </Link>
        </div>
      </form>
    </>
  );
}
