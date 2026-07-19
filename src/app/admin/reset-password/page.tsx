import ResetPasswordForm from "./ResetPasswordForm";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import type { Metadata } from "next";
import { AdminAuthShell } from "@/components/admin/AdminAuthShell";
import Link from "next/link";
import { AlertCircle, ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Reset Password | Admin | Seven Seas Intercontinental",
  robots: { index: false, follow: false },
};

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedParams = await searchParams;
  const token = typeof resolvedParams.token === "string" ? resolvedParams.token : undefined;
  const email = typeof resolvedParams.email === "string" ? resolvedParams.email.toLowerCase() : undefined;

  const footer = (
    <Link
      href="/admin/login"
      className="inline-flex items-center text-sm font-medium text-brand-muted hover:text-brand-charcoal transition-colors"
    >
      <ArrowLeft className="w-4 h-4 mr-2" />
      Back to login
    </Link>
  );

  if (!token || !email) {
    return (
      <AdminAuthShell
        title="Invalid Link"
        description="This password reset link is missing required information."
        footerContent={footer}
        icon={
          <div className="mx-auto w-12 h-12 bg-red-50 rounded-full flex items-center justify-center">
            <AlertCircle className="w-6 h-6 text-red-600" />
          </div>
        }
      >
        <div className="text-center space-y-6">
          <p className="text-brand-charcoal text-sm leading-relaxed">
            Please request a new password reset link to continue.
          </p>
          <div className="pt-2">
            <Link
              href="/admin/forgot-password"
              className="inline-flex items-center justify-center font-medium transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-gold bg-brand-black text-white hover:bg-brand-charcoal h-13 px-8 text-base w-full"
            >
              Request New Link
            </Link>
          </div>
        </div>
      </AdminAuthShell>
    );
  }

  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

  const resetRecord = await prisma.passwordResetToken.findFirst({
    where: {
      tokenHash,
      usedAt: null,
      expiresAt: { gt: new Date() },
      user: {
        email
      }
    },
    include: { user: true }
  });

  if (!resetRecord || resetRecord.user.accountStatus !== "ACTIVE") {
    return (
      <AdminAuthShell
        title="Link Expired or Invalid"
        description="This password reset link is no longer valid."
        footerContent={footer}
        icon={
          <div className="mx-auto w-12 h-12 bg-amber-50 rounded-full flex items-center justify-center">
            <AlertCircle className="w-6 h-6 text-amber-600" />
          </div>
        }
      >
        <div className="text-center space-y-6">
          <p className="text-brand-charcoal text-sm leading-relaxed">
            The link may have expired, already been used, or the account is inactive. Please request a new link.
          </p>
          <div className="pt-2">
            <Link
              href="/admin/forgot-password"
              className="inline-flex items-center justify-center font-medium transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-gold bg-brand-black text-white hover:bg-brand-charcoal h-13 px-8 text-base w-full"
            >
              Request New Link
            </Link>
          </div>
        </div>
      </AdminAuthShell>
    );
  }

  return (
    <ResetPasswordForm token={token} email={email} />
  );
}
