"use client";

import { useActionState, useState } from "react";
import { beginSetupMfaAction, verifyAndEnableMfaAction, disableMfaAction, type SetupMfaState, type VerifyMfaSetupState, type DisableMfaState } from "@/actions/mfa";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import Image from "next/image";

export function MfaSettingsForm({ mfaEnabled }: { mfaEnabled: boolean }) {
  const [setupState, setSetupState] = useState<SetupMfaState | null>(null);
  const [verifyState, verifyFormAction, verifyPending] = useActionState(verifyAndEnableMfaAction, { success: false });
  const [disableState, disableFormAction, disablePending] = useActionState(disableMfaAction, { success: false });

  const handleBeginSetup = async () => {
    const res = await beginSetupMfaAction();
    setSetupState(res);
  };

  if (mfaEnabled) {
    return (
      <div className="bg-white border border-brand-charcoal/10 p-6 max-w-md">
        <h2 className="text-xl font-semibold mb-4">Disable MFA</h2>
        <p className="text-sm text-brand-muted mb-6">
          To disable Two-Factor Authentication, please enter your password. This will also invalidate your current session on other devices.
        </p>

        {disableState.message && !disableState.success && (
          <div className="text-sm text-red-600 bg-red-50 border border-red-100 p-3 mb-4">
            {disableState.message}
          </div>
        )}

        <form action={disableFormAction} className="space-y-4">
          <div>
            <Label htmlFor="disable-password">Password</Label>
            <Input id="disable-password" name="password" type="password" required />
          </div>
          <div>
            <Label htmlFor="disable-code">Authenticator Code (or Recovery Code)</Label>
            <Input id="disable-code" name="code" type="text" placeholder="123456" required autoComplete="off" />
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="isRecovery" name="isRecovery" value="true" />
            <Label htmlFor="isRecovery" className="text-sm font-normal">This is a recovery code</Label>
          </div>
          <Button type="submit" variant="outline" disabled={disablePending}>
            {disablePending ? "Disabling..." : "Disable MFA"}
          </Button>
        </form>
      </div>
    );
  }

  if (verifyState.success && verifyState.recoveryCodes) {
    return (
      <div className="bg-white border border-brand-charcoal/10 p-6 max-w-lg">
        <h2 className="text-xl font-semibold mb-4 text-green-700">MFA Enabled Successfully!</h2>
        <p className="text-sm text-brand-muted mb-6">
          Please save these recovery codes in a secure location. They will only be shown once. You can use them to log in if you lose access to your authenticator app.
        </p>
        <div className="bg-brand-charcoal/5 p-4 rounded grid grid-cols-2 gap-4 font-mono text-sm">
          {verifyState.recoveryCodes.map((c, i) => (
            <div key={i}>{c}</div>
          ))}
        </div>
        <div className="mt-6">
          <Button onClick={() => window.location.href = "/admin/profile"}>Done</Button>
        </div>
      </div>
    );
  }

  if (setupState?.success && setupState.qrCodeUrl) {
    return (
      <div className="bg-white border border-brand-charcoal/10 p-6 max-w-lg">
        <h2 className="text-xl font-semibold mb-4">Scan QR Code</h2>
        <p className="text-sm text-brand-muted mb-6">
          Scan this QR code with your authenticator app (like Google Authenticator or Authy).
        </p>
        
        <div className="flex justify-center mb-6">
          <Image src={setupState.qrCodeUrl} alt="QR Code" width={200} height={200} />
        </div>

        <div className="mb-6 text-center">
          <span className="text-xs text-brand-muted">Or enter this secret manually:</span>
          <br/>
          <code className="text-sm font-mono bg-brand-charcoal/5 px-2 py-1 select-all">{setupState.secretBase32}</code>
        </div>

        {verifyState.message && !verifyState.success && (
          <div className="text-sm text-red-600 bg-red-50 border border-red-100 p-3 mb-4">
            {verifyState.message}
          </div>
        )}

        <form action={verifyFormAction} className="space-y-4">
          <div>
            <Label htmlFor="verify-code">Authenticator Code</Label>
            <Input id="verify-code" name="code" type="text" placeholder="123456" required autoComplete="off" />
          </div>
          <div>
            <Label htmlFor="verify-password">Password (for confirmation)</Label>
            <Input id="verify-password" name="password" type="password" required />
          </div>
          <div className="flex gap-4">
            <Button type="button" variant="outline" onClick={() => setSetupState(null)}>Cancel</Button>
            <Button type="submit" variant="primary" disabled={verifyPending}>
              {verifyPending ? "Verifying..." : "Verify & Enable"}
            </Button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="bg-white border border-brand-charcoal/10 p-6 max-w-md">
      <h2 className="text-xl font-semibold mb-4">Setup MFA</h2>
      <p className="text-sm text-brand-muted mb-6">
        Two-Factor Authentication adds an extra layer of security to your account. You will need an authenticator app to complete this setup.
      </p>
      {setupState?.message && (
        <div className="text-sm text-red-600 mb-4">{setupState.message}</div>
      )}
      <Button onClick={handleBeginSetup}>Begin Setup</Button>
    </div>
  );
}
