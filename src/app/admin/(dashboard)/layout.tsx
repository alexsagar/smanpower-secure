import { redirect } from "next/navigation";
import { requireCurrentAdminUser, type CurrentAdminUser } from "@/lib/permissions";
import { SessionInvalidError, UnauthenticatedError } from "@/lib/auth-errors";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminTopBar } from "@/components/admin/AdminTopBar";
import { Toaster } from "sonner";
import { manrope } from "@/lib/fonts";
import "@/app/globals.css";
import type { Metadata } from "next";
import { SessionTimeoutManager } from "@/components/admin/SessionTimeoutManager";
import { SESSION_CONFIG } from "@/lib/session-config";

export const metadata: Metadata = {
  title: { default: "Admin | Seven Seas", template: "%s | Admin | Seven Seas" },
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Validate the session against the database on every admin render.
  // A missing / disabled / stale user is invalidated and redirected to
  // login instead of crashing with a 500. `redirect()` throws its own
  // control-flow signal, so it must run OUTSIDE the try/catch.
  let admin: CurrentAdminUser | null = null;
  let sessionExpired = false;
  try {
    admin = await requireCurrentAdminUser();
  } catch (err) {
    if (err instanceof SessionInvalidError) {
      sessionExpired = true;
    } else if (err instanceof UnauthenticatedError) {
      sessionExpired = false;
    } else {
      throw err;
    }
  }

  if (!admin) {
    redirect(
      sessionExpired ? "/admin/login?error=session_expired" : "/admin/login"
    );
  }

  const user = {
    name: admin.name || "Admin",
    email: admin.email || "",
    role: admin.role,
  };

  const sessionTimeoutConfig = {
    idleTimeoutMinutes: SESSION_CONFIG.IDLE_TIMEOUT_MINUTES,
    idleWarningSeconds: SESSION_CONFIG.IDLE_WARNING_SECONDS,
    absoluteTimeoutMinutes: SESSION_CONFIG.ABSOLUTE_TIMEOUT_MINUTES,
    activityRefreshSeconds: SESSION_CONFIG.ACTIVITY_REFRESH_SECONDS,
  };

  return (
    <html lang="en" className={`h-full antialiased ${manrope.variable}`} data-scroll-behavior="smooth">
      <body className="h-full font-sans bg-brand-off-white text-brand-charcoal">
        <SessionTimeoutManager config={sessionTimeoutConfig} />
        <div className="flex h-full">
          <AdminSidebar user={user} />
          <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
            <AdminTopBar user={user} />
            {process.env.DEMO_MODE === "true" && (
              <div className="bg-amber-100 border-b border-amber-200 px-6 py-2 text-amber-800 text-sm flex items-center justify-center gap-2">
                <span className="font-bold uppercase tracking-wider text-xs">Demo Mode Active</span>
                <span>— Content changes are preview-only and will not be permanently saved until the production database is connected.</span>
              </div>
            )}
            <main className="flex-1 overflow-y-auto p-6 lg:p-8">
              {children}
            </main>
          </div>
        </div>
        <Toaster position="top-center" richColors theme="light" />
      </body>
    </html>
  );
}
