"use client";

import { useActionState } from "react";
import { loginAction, type LoginFormState } from "@/actions/auth";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { AlertCircle } from "lucide-react";

const initialState: LoginFormState = { success: false };

export function LoginForm({ notice }: { notice?: string | null }) {
  const [state, formAction, pending] = useActionState(loginAction, initialState);

  return (
    <div className="w-full max-w-md mx-auto p-8">
      <div className="bg-white border border-brand-charcoal/10 p-10">
        <div className="text-center mb-8">
          <Image
            src="/images/SSIS.png"
            alt="Seven Seas Intercontinental"
            width={64}
            height={64}
            className="mx-auto mb-4"
          />
          <h1 className="text-xl font-semibold text-brand-black">Admin Panel</h1>
          <p className="text-sm text-brand-muted mt-1">
            Seven Seas Intercontinental
          </p>
        </div>

        {notice && !state.message && (
          <div className="flex items-center gap-2 p-3 mb-6 bg-amber-50 text-sm text-amber-800 border border-amber-100">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {notice}
          </div>
        )}

        {state.message && !state.success && (
          <div className="flex items-center gap-2 p-3 mb-6 bg-red-50 text-sm text-red-700 border border-red-100">
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
            <Label htmlFor="password" required>
              Password
            </Label>
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
            {pending ? "Signing in..." : "Sign In"}
          </Button>
        </form>
      </div>
      <p className="text-center text-xs text-brand-muted mt-4">
        © {new Date().getFullYear()} Seven Seas Intercontinental
      </p>
    </div>
  );
}
