import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { MfaSettingsForm } from "./MfaSettingsForm";

export default async function MfaManagementPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/admin/login");
  }

  const { prisma } = await import("@/lib/prisma");
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { mfaEnabled: true }
  });

  if (!user) {
    redirect("/admin/login");
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">MFA Settings</h1>
        <p className="text-brand-muted text-sm mt-1">Manage your Two-Factor Authentication</p>
      </div>
      
      <MfaSettingsForm mfaEnabled={user.mfaEnabled} />
    </div>
  );
}
