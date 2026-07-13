"use client";

import { useActionState } from "react";
import { submitResetPassword, ResetPasswordState } from "@/actions/password-reset";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Script from "next/script";

export default function ResetPasswordForm({ token, email }: { token: string, email: string }) {
  const [state, formAction, isPending] = useActionState<ResetPasswordState, FormData>(
    submitResetPassword,
    { success: false }
  );
  const router = useRouter();

  useEffect(() => {
    if (state.success) {
      toast.success("Password reset successfully! Please login.");
      router.push("/admin/login?message=password_reset");
    } else if (state.message) {
      toast.error(state.message);
    }
  }, [state, router]);

  return (
    <>
      <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer />
      <form action={formAction} className="space-y-4">
        <input type="hidden" name="token" value={token} />
        <input type="hidden" name="email" value={email} />

        <div className="space-y-2">
          <label htmlFor="password" className="text-sm font-medium">New Password</label>
          <Input
            id="password"
            name="password"
            type="password"
            required
            minLength={8}
            placeholder="At least 8 characters"
            className={state.errors?.password ? "border-red-500" : ""}
          />
          {state.errors?.password && (
            <p className="text-sm text-red-500">{state.errors.password[0]}</p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="confirmPassword" className="text-sm font-medium">Confirm Password</label>
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            required
            minLength={8}
            className={state.errors?.confirmPassword ? "border-red-500" : ""}
          />
          {state.errors?.confirmPassword && (
            <p className="text-sm text-red-500">{state.errors.confirmPassword[0]}</p>
          )}
        </div>

        <div className="cf-turnstile" data-sitekey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY} data-action="reset_password"></div>

        <Button type="submit" className="w-full" disabled={isPending}>
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
    </>
  );
}
