"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";

// ── Employer Lead Schema ──────────────────────────────
const employerLeadSchema = z.object({
  companyName: z.string().min(2, "Company name is required"),
  contactPerson: z.string().min(2, "Contact person is required"),
  designation: z.string().optional(),
  businessEmail: z.string().email("Please enter a valid email"),
  phone: z.string().min(5, "Phone number is required"),
  country: z.string().min(2, "Country is required"),
  industry: z.string().min(2, "Industry is required"),
  workforceCategory: z.string().optional(),
  numberOfWorkers: z.coerce.number().int().positive().optional(),
  requiredSkills: z.string().optional(),
  expectedMobilisation: z.string().optional(),
  message: z.string().optional(),
  consentGiven: z.literal(true, {
    message: "You must consent to continue",
  }),
  turnstileToken: z.string().optional(),
  honeypot: z.string().optional(),
});

export type EmployerLeadFormState = {
  success: boolean;
  errors?: Record<string, string[]>;
  message?: string;
};

export async function submitEmployerLead(
  prevState: EmployerLeadFormState,
  formData: FormData
): Promise<EmployerLeadFormState> {
  const rawData = Object.fromEntries(formData.entries());

  if (rawData.honeypot) {
    return { success: true, message: "Thank you for your enquiry. Our team will contact you within 2 business days." };
  }

  // Parse consent checkbox
  const parsed = employerLeadSchema.safeParse({
    ...rawData,
    consentGiven: rawData.consentGiven === "on" || rawData.consentGiven === "true",
    numberOfWorkers: rawData.numberOfWorkers
      ? Number(rawData.numberOfWorkers)
      : undefined,
  });

  if (!parsed.success) {
    return {
      success: false,
      errors: parsed.error.flatten().fieldErrors,
      message: "Please correct the errors below.",
    };
  }

  const reqHeaders = await headers();
  const ip = getClientIp(reqHeaders);
  if (ip === "unknown") return { success: false, message: "Security error: Cannot verify client network." };
  
  const rateLimit = await checkRateLimit("employer", ip);
  if (!rateLimit.success) {
    return { success: false, message: rateLimit.message };
  }

  const turnstileResult = await verifyTurnstileToken(parsed.data.turnstileToken, "employer_request");
  if (!turnstileResult.success) {
    return { success: false, message: turnstileResult.message || "Security verification failed." };
  }

  try {
    await prisma.employerLead.create({
      data: {
        companyName: parsed.data.companyName,
        contactPerson: parsed.data.contactPerson,
        designation: parsed.data.designation || null,
        businessEmail: parsed.data.businessEmail,
        phone: parsed.data.phone,
        country: parsed.data.country,
        industry: parsed.data.industry,
        workforceCategory: parsed.data.workforceCategory || null,
        numberOfWorkers: parsed.data.numberOfWorkers || null,
        requiredSkills: parsed.data.requiredSkills || null,
        expectedMobilisation: parsed.data.expectedMobilisation
          ? new Date(parsed.data.expectedMobilisation)
          : null,
        message: parsed.data.message || null,
        consentGiven: parsed.data.consentGiven,
        source: "website",
        status: "NEW",
      },
    });

    // TODO: Send admin notification email
    // await sendEmail({ to: ADMIN_EMAIL, subject: "New Workforce Request", ... })

    return {
      success: true,
      message:
        "Thank you for your enquiry. Our team will contact you within 2 business days.",
    };
  } catch (error) {
    console.error("Failed to submit employer lead:", error);
    return {
      success: false,
      message: "Something went wrong. Please try again or contact us directly.",
    };
  }
}

import { verifyTurnstileToken } from "@/services/turnstile.service";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { headers } from "next/headers";

// ── Contact Form Schema ───────────────────────────────
const contactSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Please enter a valid email"),
  phone: z.string().optional(),
  company: z.string().optional(),
  subject: z.string().optional(),
  message: z.string().min(10, "Message must be at least 10 characters"),
  turnstileToken: z.string().optional(), // Will validate separately
  honeypot: z.string().optional(),
});

export type ContactFormState = {
  success: boolean;
  errors?: Record<string, string[]>;
  message?: string;
};

export async function submitContactForm(
  prevState: ContactFormState,
  formData: FormData
): Promise<ContactFormState> {
  const rawData = Object.fromEntries(formData.entries());
  
  // 1. Honeypot check
  if (rawData.honeypot) {
    // If honeypot is filled, silently fail like it worked
    return { success: true, message: "Thank you for your message. We will get back to you shortly." };
  }

  const parsed = contactSchema.safeParse(rawData);

  if (!parsed.success) {
    return {
      success: false,
      errors: parsed.error.flatten().fieldErrors,
      message: "Please correct the errors below.",
    };
  }

  // 2. Rate Limit check
  const reqHeaders = await headers();
  const ip = getClientIp(reqHeaders);
  if (ip === "unknown") return { success: false, message: "Security error: Cannot verify client network." };
  
  const rateLimit = await checkRateLimit("contact", ip);
  if (!rateLimit.success) {
    return {
      success: false,
      message: rateLimit.message,
    };
  }

  // 3. Turnstile check
  const turnstileResult = await verifyTurnstileToken(parsed.data.turnstileToken, "contact_form");
  if (!turnstileResult.success) {
    return {
      success: false,
      message: turnstileResult.message || "Security verification failed.",
    };
  }

  try {
    await prisma.contactSubmission.create({
      data: {
        name: parsed.data.name,
        email: parsed.data.email,
        phone: parsed.data.phone || null,
        company: parsed.data.company || null,
        subject: parsed.data.subject || null,
        message: parsed.data.message,
        type: "general",
      },
    });

    return {
      success: true,
      message: "Thank you for your message. We will get back to you shortly.",
    };
  } catch (error) {
    console.error("Failed to submit contact form:", error);
    return {
      success: false,
      message: "Something went wrong. Please try again.",
    };
  }
}

// ── Job Application Schema ────────────────────────────
const applicationSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  phone: z.string().min(5, "Phone number is required"),
  email: z.string().email("Please enter a valid email"),
  address: z.string().optional(),
  dateOfBirth: z.string().optional(),
  educationLevel: z.string().optional(),
  workExperience: z.string().optional(),
  skillCategory: z.string().optional(),
  preferredCountry: z.string().optional(),
  jobId: z.string().min(1, "Job ID is required"),
  consentData: z.literal(true, {
    message: "You must consent to data processing",
  }),
  consentPrivacy: z.literal(true, {
    message: "You must accept the privacy policy",
  }),
  turnstileToken: z.string().optional(),
  honeypot: z.string().optional(),
});

export type ApplicationFormState = {
  success: boolean;
  errors?: Record<string, string[]>;
  message?: string;
};

export async function submitJobApplication(
  prevState: ApplicationFormState,
  formData: FormData
): Promise<ApplicationFormState> {
  const rawData = Object.fromEntries(formData.entries());

  if (rawData.honeypot) {
    return { success: true, message: "Application submitted successfully." };
  }

  const parsed = applicationSchema.safeParse({
    ...rawData,
    consentData:
      rawData.consentData === "on" || rawData.consentData === "true",
    consentPrivacy:
      rawData.consentPrivacy === "on" || rawData.consentPrivacy === "true",
  });

  if (!parsed.success) {
    return {
      success: false,
      errors: parsed.error.flatten().fieldErrors,
      message: "Please correct the errors below.",
    };
  }

  const reqHeaders = await headers();
  const ip = getClientIp(reqHeaders);
  if (ip === "unknown") return { success: false, message: "Security error: Cannot verify client network." };

  const ipLimit = await checkRateLimit("apply_ip", ip);
  if (!ipLimit.success) return { success: false, message: ipLimit.message };
  
  const emailLimit = await checkRateLimit("apply_id", parsed.data.email);
  if (!emailLimit.success) return { success: false, message: emailLimit.message };

  const turnstileResult = await verifyTurnstileToken(parsed.data.turnstileToken, "job_application");
  if (!turnstileResult.success) {
    return { success: false, message: turnstileResult.message || "Security verification failed." };
  }

  try {
    // Find or create candidate profile
    let candidate = await prisma.candidateProfile.findFirst({
      where: { email: parsed.data.email },
    });

    if (!candidate) {
      candidate = await prisma.candidateProfile.create({
        data: {
          fullName: parsed.data.fullName,
          phone: parsed.data.phone,
          email: parsed.data.email,
          address: parsed.data.address || null,
          dateOfBirth: parsed.data.dateOfBirth
            ? new Date(parsed.data.dateOfBirth)
            : null,
          educationLevel: parsed.data.educationLevel || null,
          workExperience: parsed.data.workExperience || null,
          skillCategory: parsed.data.skillCategory || null,
          preferredCountry: parsed.data.preferredCountry || null,
        },
      });
    }

    // Check for duplicate application
    const existingApp = await prisma.jobApplication.findUnique({
      where: {
        jobId_candidateId: {
          jobId: parsed.data.jobId,
          candidateId: candidate.id,
        },
      },
    });

    if (existingApp) {
      return {
        success: false,
        message: "You have already applied for this position.",
      };
    }

    // Create application
    await prisma.jobApplication.create({
      data: {
        jobId: parsed.data.jobId,
        candidateId: candidate.id,
        status: "SUBMITTED",
        statusHistory: [
          {
            status: "SUBMITTED",
            date: new Date().toISOString(),
            note: "Application submitted via website",
          },
        ],
      },
    });

    // Record consent
    await prisma.candidateConsent.create({
      data: {
        candidateId: candidate.id,
        consentType: "data_processing",
        consentGiven: true,
      },
    });

    await prisma.candidateConsent.create({
      data: {
        candidateId: candidate.id,
        consentType: "privacy_policy",
        consentGiven: true,
      },
    });

    return {
      success: true,
      message:
        "Your application has been submitted successfully. You will receive a confirmation notification.",
    };
  } catch (error) {
    console.error("Failed to submit application:", error);
    return {
      success: false,
      message: "There was an error submitting your application. Please try again.",
    };
  }
}
