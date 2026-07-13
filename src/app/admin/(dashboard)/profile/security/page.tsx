import { requireCurrentAdminUser } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { ChangePasswordForm } from "./ChangePasswordForm";

export const metadata = {
  title: "Change Password | Admin Dashboard",
};

export default async function ChangePasswordPage() {
  const user = await requireCurrentAdminUser();
  
  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { mfaEnabled: true }
  });

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-brand-charcoal">Change Password</h1>
        <p className="text-sm text-brand-muted mt-1">
          Update your account password. If you change your password, all your active sessions will be revoked and you will need to sign in again.
        </p>
      </div>

      <div className="bg-white border border-brand-charcoal/10 p-6 shadow-sm">
        <ChangePasswordForm mfaEnabled={dbUser?.mfaEnabled ?? false} />
      </div>
    </div>
  );
}
