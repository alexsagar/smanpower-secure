import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import AcceptInviteForm from "./AcceptInviteForm";

export default async function AcceptInvitePage({
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
          <p className="text-gray-600">This invitation link is missing required parameters.</p>
        </div>
      </div>
    );
  }

  // Hash the incoming token
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

  // Verify invitation in DB
  const invitation = await prisma.adminInvitation.findFirst({
    where: {
      email,
      tokenHash,
      usedAt: null,
      revokedAt: null,
      expiresAt: { gt: new Date() }
    },
    include: { role: true }
  });

  if (!invitation) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
        <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-sm text-center">
          <h1 className="text-2xl font-semibold mb-4 text-red-600">Invalid or Expired Link</h1>
          <p className="text-gray-600">This invitation link has expired, already been used, or is invalid.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-sm">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-semibold text-gray-900">Accept Invitation</h1>
          <p className="text-sm text-gray-600 mt-2">
            Set a secure password for <strong>{email}</strong>
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Role: {invitation.role.displayName}
          </p>
        </div>
        
        <AcceptInviteForm token={token} email={email} />
      </div>
    </div>
  );
}
