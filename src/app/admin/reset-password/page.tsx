import ResetPasswordForm from "./ResetPasswordForm";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedParams = await searchParams;
  const token = typeof resolvedParams.token === "string" ? resolvedParams.token : undefined;
  const email = typeof resolvedParams.email === "string" ? resolvedParams.email.toLowerCase() : undefined;

  if (!token || !email) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
        <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-sm text-center">
          <h1 className="text-2xl font-semibold mb-4 text-red-600">Invalid Link</h1>
          <p className="text-gray-600">This password reset link is missing required parameters.</p>
        </div>
      </div>
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
      <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
        <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-sm text-center">
          <h1 className="text-2xl font-semibold mb-4 text-red-600">Invalid or Expired Link</h1>
          <p className="text-gray-600">This password reset link has expired, already been used, or is invalid.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-sm">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-semibold text-gray-900">Reset Password</h1>
          <p className="text-sm text-gray-600 mt-2">
            Create a new password for <strong>{email}</strong>
          </p>
        </div>
        
        <ResetPasswordForm token={token} email={email} />
      </div>
    </div>
  );
}
