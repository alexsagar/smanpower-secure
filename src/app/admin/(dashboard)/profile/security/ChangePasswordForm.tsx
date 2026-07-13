"use client";

import { useActionState, useState } from "react";
import { changePasswordAction } from "@/actions/profile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, Eye, EyeOff } from "lucide-react";

export function ChangePasswordForm({ mfaEnabled }: { mfaEnabled: boolean }) {
  const [state, formAction, isPending] = useActionState(changePasswordAction, { success: false });
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);

  return (
    <form action={formAction} className="space-y-6">
      {!state.success && state.message && (
        <div className="p-3 bg-red-50 text-red-600 border border-red-200 text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          {state.message}
        </div>
      )}

      {state.success && state.message && (
        <div className="p-3 bg-green-50 text-green-700 border border-green-200 text-sm">
          {state.message}
        </div>
      )}

      <div className="space-y-2 relative">
        <Label htmlFor="currentPassword">Current Password</Label>
        <div className="relative">
          <Input 
            id="currentPassword" 
            name="currentPassword" 
            type={showCurrent ? "text" : "password"} 
            required 
            autoComplete="current-password"
            className="pr-10"
          />
          <button 
            type="button" 
            onClick={() => setShowCurrent(!showCurrent)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-muted hover:text-brand-charcoal"
          >
            {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        {state.errors?.currentPassword && (
          <p className="text-red-500 text-xs">{state.errors.currentPassword[0]}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="newPassword">New Password</Label>
        <div className="relative">
          <Input 
            id="newPassword" 
            name="newPassword" 
            type={showNew ? "text" : "password"} 
            required 
            autoComplete="new-password"
            className="pr-10"
          />
          <button 
            type="button" 
            onClick={() => setShowNew(!showNew)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-muted hover:text-brand-charcoal"
          >
            {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        <p className="text-xs text-brand-muted">
          Must be at least 8 characters. Do not reuse your current password.
        </p>
        {state.errors?.newPassword && (
          <p className="text-red-500 text-xs">{state.errors.newPassword[0]}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirm New Password</Label>
        <Input 
          id="confirmPassword" 
          name="confirmPassword" 
          type="password" 
          required 
          autoComplete="new-password"
        />
        {state.errors?.confirmPassword && (
          <p className="text-red-500 text-xs">{state.errors.confirmPassword[0]}</p>
        )}
      </div>

      {mfaEnabled && (
        <div className="space-y-2">
          <Label htmlFor="totpCode">Authenticator Code (MFA)</Label>
          <Input 
            id="totpCode" 
            name="totpCode" 
            type="text" 
            required 
            placeholder="6-digit code"
            maxLength={6}
            autoComplete="one-time-code"
          />
          <p className="text-xs text-brand-muted">
            Required because you have Two-Factor Authentication enabled.
          </p>
          {state.errors?.totpCode && (
            <p className="text-red-500 text-xs">{state.errors.totpCode[0]}</p>
          )}
        </div>
      )}

      <Button type="submit" disabled={isPending} className="w-full sm:w-auto">
        {isPending ? "Changing Password..." : "Change Password"}
      </Button>
    </form>
  );
}
