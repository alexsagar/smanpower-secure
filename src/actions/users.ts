"use server";

import { requirePermission } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import crypto from "crypto";
import { Resend } from "resend";
import { revalidatePath } from "next/cache";

const inviteSchema = z.object({
  email: z.string().email(),
  name: z.string().optional(),
  role: z.string().min(1),
});

const resend = new Resend(process.env.RESEND_API_KEY || "dummy");

export async function inviteUserAction(formData: FormData) {
  try {
    const user = await requirePermission("users.invite" as any);
    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    const data = {
      email: formData.get("email") as string,
      name: formData.get("name") as string,
      role: formData.get("role") as string,
    };

    const parsed = inviteSchema.safeParse(data);
    if (!parsed.success) {
      return { success: false, error: "Invalid data provided." };
    }

    const { email, role: roleName } = parsed.data;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser && existingUser.isActive) {
      return { success: false, error: "An active user with this email already exists." };
    }

    // Check if role exists
    const role = await prisma.role.findUnique({ where: { name: roleName } });
    if (!role) {
      return { success: false, error: "Invalid role selected." };
    }

    // Generate token
    const token = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7); // 7 days

    // Create pending user and store invite
    await prisma.$transaction(async (tx) => {
      let user = await tx.user.findUnique({ where: { email } });
      if (!user) {
        user = await tx.user.create({
          data: {
            email,
            name: parsed.data.name || email.split("@")[0],
            roleId: role.id,
            accountStatus: "INVITED",
            isActive: false,
          }
        });
      }

      await tx.adminInvitation.upsert({
        where: { email },
        update: {
          tokenHash,
          expiresAt,
          roleId: role.id,
          createdById: user.id,
          usedAt: null,
          revokedAt: null,
        },
        create: {
          email,
          tokenHash,
          expiresAt,
          roleId: role.id,
          createdById: user.id,
        },
      });
    });

    const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/admin/accept-invite?token=${token}&email=${encodeURIComponent(email)}`;

    let inviteLinkForDev = null;

    if (process.env.NODE_ENV === "development" && process.env.ALLOW_DEV_INVITE_LINK_OUTPUT === "true") {
      inviteLinkForDev = inviteUrl;
    }

    // Log the action (Audit)
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: "INVITE_USER",
        entity: "AdminInvitation",
        entityId: email,
        details: { role: roleName },
        ipAddress: "server",
      },
    });

    if (process.env.RESEND_API_KEY) {
      try {
        await resend.emails.send({
          from: "Admin <no-reply@smanpower.com>", // Update with verified domain
          to: email,
          subject: "Invitation to Seven Seas Admin Dashboard",
          html: `<p>You have been invited to join the Seven Seas Admin Dashboard.</p><p><a href="${inviteUrl}">Click here to accept your invitation and set your password.</a></p><p>This link expires in 7 days.</p>`,
        });
        
        await prisma.adminInvitation.update({
          where: { email },
          data: { sentAt: new Date() },
        });
      } catch (err) {
        console.error("Failed to send invite email", err);
        return { success: false, error: "Failed to send email via Resend. Check API Key configuration." };
      }
    } else if (process.env.NODE_ENV !== "development") {
      return { success: false, error: "Email service is not configured." };
    }

    revalidatePath("/admin/users");

    return { success: true, inviteLink: inviteLinkForDev };
  } catch (error: any) {
    console.error("Invite error:", error);
    return { success: false, error: error.message || "Failed to process invitation." };
  }
}
