import { Prisma, CandidateProfile } from '@prisma/client';
import { prisma } from '@/lib/prisma';

export class CandidateMatchingService {
  /**
   * Normalizes a phone number by removing all non-numeric characters.
   */
  static normalizePhone(phone: string): string {
    return phone.replace(/[^\d+]/g, '');
  }

  /**
   * Normalizes an email by trimming and converting to lowercase.
   */
  static normalizeEmail(email: string | undefined | null): string | null {
    if (!email) return null;
    return email.trim().toLowerCase();
  }

  /**
   * Matches a candidate based on strict deduplication rules.
   * @returns The resolved CandidateProfile ID and a flag indicating if it's a possible duplicate.
   */
  static async resolveCandidate(
    params: {
      fullName: string;
      phone: string;
      email?: string;
      province?: string;
      district?: string;
      educationLevel?: string;
      workExperience?: string;
      skillCategory?: string;
    },
    tx: Prisma.TransactionClient = prisma
  ): Promise<{ candidate: CandidateProfile; isPossibleDuplicate: boolean }> {
    const normPhone = this.normalizePhone(params.phone);
    const normEmail = this.normalizeEmail(params.email);

    // Find all potential matches
    const OR_conditions: any[] = [{ phone: normPhone }];
    if (normEmail) {
      OR_conditions.push({ email: normEmail });
    }

    const potentialMatches = await tx.candidateProfile.findMany({
      where: {
        OR: OR_conditions,
      },
    });

    // Rule 1: No match -> create new, not a duplicate
    if (potentialMatches.length === 0) {
      const newCandidate = await tx.candidateProfile.create({
        data: {
          fullName: params.fullName,
          phone: normPhone,
          email: normEmail || '', // Email is required in schema
          province: params.province,
          district: params.district,
          educationLevel: params.educationLevel,
          workExperience: params.workExperience,
          skillCategory: params.skillCategory,
        },
      });
      return { candidate: newCandidate, isPossibleDuplicate: false };
    }

    // Rule 2: Exactly one match, and BOTH phone AND email match it exactly.
    if (potentialMatches.length === 1 && (normEmail ? potentialMatches[0].email === normEmail : true) && potentialMatches[0].phone === normPhone) {
      const match = potentialMatches[0];
      
      // Update only missing fields, never overwrite populated fields with empty/lower-quality data
      const updateData: any = {};
      if (!match.province && params.province) updateData.province = params.province;
      if (!match.district && params.district) updateData.district = params.district;
      if (!match.educationLevel && params.educationLevel) updateData.educationLevel = params.educationLevel;
      if (!match.workExperience && params.workExperience) updateData.workExperience = params.workExperience;
      if (!match.skillCategory && params.skillCategory) updateData.skillCategory = params.skillCategory;

      let finalCandidate = match;
      if (Object.keys(updateData).length > 0) {
        finalCandidate = await tx.candidateProfile.update({
          where: { id: match.id },
          data: updateData,
        });
      }

      return { candidate: finalCandidate, isPossibleDuplicate: false };
    }

    // Rule 3: Any other case (only phone matches, only email matches, multiple matches) -> create new, flag duplicate
    const duplicateCandidate = await tx.candidateProfile.create({
      data: {
        fullName: params.fullName,
        phone: normPhone,
        email: normEmail || '',
        province: params.province,
        district: params.district,
        educationLevel: params.educationLevel,
        workExperience: params.workExperience,
        skillCategory: params.skillCategory,
      },
    });
    return { candidate: duplicateCandidate, isPossibleDuplicate: true };
  }
}
