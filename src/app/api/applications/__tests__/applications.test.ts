import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';
import { ApplicationSubmissionService } from '@/services/applicationSubmission.service';
import { CandidateMatchingService } from '@/services/candidateMatching.service';
import { prisma } from '@/lib/prisma';
import * as cloudinaryService from '@/services/cloudinary.service';
import { PassportStatus } from '@prisma/client';

// Mock cloudinary and checkRateLimit
vi.mock('@/services/cloudinary.service', () => ({
  uploadBufferToCloudinary: vi.fn(),
  deletePrivateAsset: vi.fn(),
}));
vi.mock('@/lib/rate-limit', () => ({
  checkRateLimit: vi.fn().mockResolvedValue({ success: true }),
  getIpAddress: vi.fn().mockReturnValue('127.0.0.1'),
}));
vi.mock('@/lib/privacy', () => ({
  hashIp: vi.fn().mockReturnValue('hashed-ip'),
  hashUserAgent: vi.fn().mockReturnValue('hashed-ua'),
}));

// Mock prisma transactions to just pass through
vi.mock('@/lib/prisma', () => {
  const mPrisma = {
    demand: { findUnique: vi.fn() },
    applicationDocumentRequirement: { findMany: vi.fn() },
    candidateProfile: { findMany: vi.fn(), create: vi.fn(), update: vi.fn() },
    candidateDocument: { create: vi.fn() },
    demandApplication: { create: vi.fn() },
    $transaction: vi.fn(async (cb) => cb(mPrisma)),
  };
  return { prisma: mPrisma };
});

describe('ApplicationSubmissionService', () => {
  const originalTurnstile = process.env.TURNSTILE_ENABLED;
  const originalPublicTurnstile = process.env.NEXT_PUBLIC_TURNSTILE_ENABLED;
  const originalPrivacySecret = process.env.PRIVACY_HASH_SECRET;

  beforeAll(() => {
    process.env.TURNSTILE_ENABLED = 'false';
    process.env.NEXT_PUBLIC_TURNSTILE_ENABLED = 'false';
    process.env.PRIVACY_HASH_SECRET = 'test-secret';
  });

  afterAll(() => {
    process.env.TURNSTILE_ENABLED = originalTurnstile;
    process.env.NEXT_PUBLIC_TURNSTILE_ENABLED = originalPublicTurnstile;
    process.env.PRIVACY_HASH_SECRET = originalPrivacySecret;
  });

  it('rejects un-published demands', async () => {
    vi.mocked(prisma.demand.findUnique).mockResolvedValueOnce({
      id: 'd-1',
      status: 'DRAFT',
      enableApplication: true,
      positions: [{ id: 'p-1', status: 'OPEN', isPublic: true }],
    } as any);

    const formData = new FormData();
    formData.append('demandId', 'd-1');
    formData.append('positionId', 'p-1');
    formData.append('fullName', 'John Doe');
    formData.append('phone', '1234567890');
    formData.append('provinceDistrict', 'Bagmati');
    formData.append('dateOfBirth', '1990-01-01');
    formData.append('educationLevel', 'High School');
    formData.append('skillCategory', 'IT');
    formData.append('workExperience', '2 years');
    formData.append('passportStatus', 'VALID');
    formData.append('availableForInterview', 'true');
    formData.append('demandDetailsRead', 'true');
    formData.append('privacyConsentGiven', 'true');
    formData.append('safetyAcknowledgement', 'true');
    formData.append('cfTurnstileResponse', 'VALID_MOCK_TOKEN');

    const result = await ApplicationSubmissionService.submitApplication(formData, '127.0.0.1', 'test-agent');
    
    expect(result.success).toBe(false);
    expect(result.formError).toBe('CLOSED');
  });

  it('rejects if required document is missing', async () => {
    vi.mocked(prisma.demand.findUnique).mockResolvedValueOnce({
      id: 'd-1',
      status: 'PUBLISHED',
      enableApplication: true,
      positions: [{ id: 'p-1', status: 'OPEN', isPublic: true }],
    } as any);

    vi.mocked(prisma.applicationDocumentRequirement.findMany).mockResolvedValue([
      { documentType: 'CV', required: true, maxSizeMb: 2, allowedMimeTypes: 'application/pdf' } as any,
    ]);

    const formData = new FormData();
    // omit file
    formData.append('demandId', 'd-1');
    formData.append('positionId', 'p-1');
    formData.append('fullName', 'John Doe');
    formData.append('phone', '1234567890');
    formData.append('provinceDistrict', 'Bagmati');
    formData.append('dateOfBirth', '1990-01-01');
    formData.append('educationLevel', 'High School');
    formData.append('skillCategory', 'IT');
    formData.append('workExperience', '2 years');
    formData.append('passportStatus', 'VALID');
    formData.append('availableForInterview', 'true');
    formData.append('demandDetailsRead', 'true');
    formData.append('privacyConsentGiven', 'true');
    formData.append('safetyAcknowledgement', 'true');
    formData.append('cfTurnstileResponse', 'VALID_MOCK_TOKEN');

    const result = await ApplicationSubmissionService.submitApplication(formData, '127.0.0.1', 'test-agent');
    
    expect(result.success).toBe(false);
    expect(result.formError).toBe('MISSING_DOCUMENT');
  });
});
