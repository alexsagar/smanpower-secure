import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/admin/login");
  }

  const { prisma } = await import("@/lib/prisma");
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { mfaEnabled: true, email: true, name: true, role: { select: { name: true } } }
  });

  if (!user) {
    redirect("/admin/login");
  }

  return (
    <div className="p-8 max-w-2xl">
      <h1 className="text-2xl font-semibold mb-6">Profile Settings</h1>
      
      <div className="bg-white border border-brand-charcoal/10 p-6 mb-8">
        <h2 className="text-lg font-medium mb-4">Account Information</h2>
        <div className="space-y-4 text-sm">
          <div>
            <span className="font-semibold block text-brand-muted">Name</span>
            <span>{user.name}</span>
          </div>
          <div>
            <span className="font-semibold block text-brand-muted">Email</span>
            <span>{user.email}</span>
          </div>
          <div>
            <span className="font-semibold block text-brand-muted">Role</span>
            <span>{user.role.name}</span>
          </div>
        </div>
      </div>

      <div className="bg-white border border-brand-charcoal/10 p-6">
        <h2 className="text-lg font-medium mb-4">Two-Factor Authentication (MFA)</h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-brand-muted">
              {user.mfaEnabled 
                ? "MFA is currently enabled for your account." 
                : "MFA is currently disabled. We strongly recommend enabling it."}
            </p>
          </div>
          <Link href="/admin/profile/mfa">
            <Button variant={user.mfaEnabled ? "outline" : "primary"}>
              {user.mfaEnabled ? "Manage MFA" : "Enable MFA"}
            </Button>
          </Link>
        </div>
      </div>

      <div className="bg-white border border-brand-charcoal/10 p-6 mt-8">
        <h2 className="text-lg font-medium mb-4">Security</h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-brand-muted">
              Change your password to secure your account.
            </p>
          </div>
          <Link href="/admin/profile/security">
            <Button variant="outline">
              Change Password
            </Button>
          </Link>
        </div>
      </div>

      <div className="bg-white border border-brand-charcoal/10 p-6 mt-8">
        <h2 className="text-lg font-medium mb-4">Active Sessions</h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-brand-muted">
              Review and manage your active sessions across different devices and browsers.
            </p>
          </div>
          <Link href="/admin/profile/sessions">
            <Button variant="outline">
              Manage Sessions
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
