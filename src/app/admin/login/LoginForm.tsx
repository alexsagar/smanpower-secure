"use client";

import { useActionState } from "react";
import { loginAction, type LoginFormState } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import Link from "next/link";
import { AdminAuthShell } from "@/components/admin/AdminAuthShell";

const initialState: LoginFormState = { success: false };

export function LoginForm({
  notice,
  successNotice,
}: {
  notice?: string | null;
  successNotice?: string | null;
}) {
  const [state, formAction, pending] = useActionState(loginAction, initialState);

  return (
    <AdminAuthShell title="Admin Login">
      {successNotice && !state.message && (
        <div className="flex items-center gap-2 p-3 mb-6 bg-green-50 text-sm text-green-800 border border-green-100" role="alert">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          {successNotice}
        </div>
      )}

      {notice && !state.message && !successNotice && (
        <div className="flex items-center gap-2 p-3 mb-6 bg-amber-50 text-sm text-amber-800 border border-amber-100" role="alert">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {notice}
        </div>
      )}

      {state.message && !state.success && (
        <div className="flex items-center gap-2 p-3 mb-6 bg-red-50 text-sm text-red-700 border border-red-100" role="alert">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {state.message}
        </div>
      )}

      <form action={formAction} className="space-y-5">
        <div>
          <Label htmlFor="email" required>
            Email
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            error={state.errors?.email?.[0]}
          />
        </div>
        <div>
          <div className="flex justify-between items-end mb-1.5">
            <Label htmlFor="password" required className="!mb-0">
              Password
            </Label>
            <Link
              href="/admin/forgot-password"
              className="text-sm font-medium text-brand-gold hover:text-brand-charcoal transition-colors mb-0.5"
            >
              Forgot password?
            </Link>
          </div>
          <Input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
            error={state.errors?.password?.[0]}
          />
        </div>
        <Button
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          disabled={pending}
        >
          {pending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Signing in...
            </>
          ) : (
            "Sign In"
          )}
        </Button>
      </form>
    </AdminAuthShell>
  );
}
