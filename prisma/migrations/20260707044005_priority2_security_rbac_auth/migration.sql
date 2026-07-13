-- CreateEnum
CREATE TYPE "AccountStatus" AS ENUM ('INVITED', 'ACTIVE', 'SUSPENDED', 'DISABLED', 'PASSWORD_RESET_REQUIRED');

-- CreateEnum
CREATE TYPE "LeadStatus" AS ENUM ('NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL_SENT', 'CLOSED', 'LOST');

-- CreateEnum
CREATE TYPE "JobStatus" AS ENUM ('DRAFT', 'PENDING_REVIEW', 'PUBLISHED', 'EXPIRED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "EmploymentType" AS ENUM ('FULL_TIME', 'PART_TIME', 'CONTRACT', 'TEMPORARY');

-- CreateEnum
CREATE TYPE "DemandStatus" AS ENUM ('DRAFT', 'UNDER_REVIEW', 'PUBLISHED', 'CLOSED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "FacilityStatus" AS ENUM ('PROVIDED', 'NOT_PROVIDED', 'ALLOWANCE_PROVIDED', 'NOT_SPECIFIED');

-- CreateEnum
CREATE TYPE "OvertimeStatus" AS ENUM ('YES', 'NO', 'NOT_SPECIFIED');

-- CreateEnum
CREATE TYPE "PositionStatus" AS ENUM ('OPEN', 'CLOSED', 'FILLED', 'ON_HOLD');

-- CreateEnum
CREATE TYPE "DocumentVisibility" AS ENUM ('PUBLIC', 'PRIVATE');

-- CreateEnum
CREATE TYPE "DocumentApprovalStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "PassportStatus" AS ENUM ('VALID', 'EXPIRED_OR_EXPIRING', 'NO_PASSPORT');

-- CreateEnum
CREATE TYPE "ApplicationStatus" AS ENUM ('SUBMITTED', 'UNDER_REVIEW', 'SHORTLISTED', 'INTERVIEW_SCHEDULED', 'SELECTED', 'REJECTED', 'WITHDRAWN');

-- CreateEnum
CREATE TYPE "MediaStatus" AS ENUM ('AI_PLACEHOLDER', 'REAL_APPROVED', 'STOCK_LICENCED', 'PRIVATE_INTERNAL');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "emailVerified" TIMESTAMP(3),
    "passwordHash" TEXT,
    "image" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "accountStatus" "AccountStatus" NOT NULL DEFAULT 'ACTIVE',
    "sessionVersion" INTEGER NOT NULL DEFAULT 1,
    "passwordChangedAt" TIMESTAMP(3),
    "mfaEnabled" BOOLEAN NOT NULL DEFAULT false,
    "mfaVerifiedAt" TIMESTAMP(3),
    "mfaSecretEncrypted" TEXT,
    "mfaKeyVersion" INTEGER NOT NULL DEFAULT 1,
    "lastLoginAt" TIMESTAMP(3),
    "lastLoginIpHash" TEXT,
    "failedLoginCount" INTEGER NOT NULL DEFAULT 0,
    "lockedUntil" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "roleId" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Role" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Permission" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "module" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Permission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RolePermission" (
    "roleId" TEXT NOT NULL,
    "permissionId" TEXT NOT NULL,

    CONSTRAINT "RolePermission_pkey" PRIMARY KEY ("roleId","permissionId")
);

-- CreateTable
CREATE TABLE "Account" (
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("provider","providerAccountId")
);

-- CreateTable
CREATE TABLE "Session" (
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VerificationToken_pkey" PRIMARY KEY ("identifier","token")
);

-- CreateTable
CREATE TABLE "AdminInvitation" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "sentAt" TIMESTAMP(3),
    "createdById" TEXT,
    "revokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdminInvitation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PasswordResetToken" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PasswordResetToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MfaRecoveryCode" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "codeHash" TEXT NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MfaRecoveryCode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmployerLead" (
    "id" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "contactPerson" TEXT NOT NULL,
    "designation" TEXT,
    "businessEmail" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "industry" TEXT NOT NULL,
    "workforceCategory" TEXT,
    "numberOfWorkers" INTEGER,
    "requiredSkills" TEXT,
    "expectedMobilisation" TIMESTAMP(3),
    "message" TEXT,
    "consentGiven" BOOLEAN NOT NULL DEFAULT false,
    "source" TEXT,
    "status" "LeadStatus" NOT NULL DEFAULT 'NEW',
    "followUpDate" TIMESTAMP(3),
    "closedAt" TIMESTAMP(3),
    "closedReason" TEXT,
    "assignedRecruiterId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "EmployerLead_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmployerLeadNote" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EmployerLeadNote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Job" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "requirements" TEXT,
    "benefits" TEXT,
    "responsibilities" TEXT,
    "countryId" TEXT NOT NULL,
    "industryId" TEXT NOT NULL,
    "employerName" TEXT,
    "showEmployerName" BOOLEAN NOT NULL DEFAULT false,
    "salary" TEXT,
    "showSalary" BOOLEAN NOT NULL DEFAULT false,
    "contractPeriod" TEXT,
    "employmentType" "EmploymentType" NOT NULL DEFAULT 'FULL_TIME',
    "experienceRequired" TEXT,
    "skillsRequired" TEXT,
    "educationRequired" TEXT,
    "languageRequired" TEXT,
    "documentsRequired" TEXT,
    "interviewDate" TIMESTAMP(3),
    "deadline" TIMESTAMP(3),
    "status" "JobStatus" NOT NULL DEFAULT 'DRAFT',
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "vacancies" INTEGER NOT NULL DEFAULT 1,
    "feeNotice" TEXT,
    "safetyNotice" TEXT,
    "metaTitle" TEXT,
    "metaDescription" TEXT,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Job_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Demand" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "companyLogoId" TEXT,
    "industryId" TEXT,
    "countryId" TEXT NOT NULL,
    "city" TEXT,
    "employerAddress" TEXT,
    "demandReferenceNumber" TEXT,
    "approvalDate" TIMESTAMP(3),
    "receivedDate" TIMESTAMP(3),
    "applicationStartDate" TIMESTAMP(3),
    "applicationDeadline" TIMESTAMP(3),
    "interviewDate" TIMESTAMP(3),
    "interviewLocation" TEXT,
    "contractType" TEXT,
    "generalNotes" TEXT,
    "status" "DemandStatus" NOT NULL DEFAULT 'DRAFT',
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "enableApplication" BOOLEAN NOT NULL DEFAULT true,
    "requiredApplicationDocuments" TEXT,
    "candidateInstructions" TEXT,
    "feeTransparencyNotice" TEXT,
    "candidateSafetyNotice" TEXT,
    "contactPerson" TEXT,
    "contactPhone" TEXT,
    "contactWhatsapp" TEXT,
    "applicationConfirmationMessage" TEXT,
    "seoTitle" TEXT,
    "metaDescription" TEXT,
    "ogImageUrl" TEXT,
    "canonicalUrl" TEXT,
    "publishedAt" TIMESTAMP(3),
    "closedAt" TIMESTAMP(3),
    "createdById" TEXT,
    "updatedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Demand_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DemandPosition" (
    "id" TEXT NOT NULL,
    "demandId" TEXT NOT NULL,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "title" TEXT NOT NULL,
    "maleCount" INTEGER,
    "femaleCount" INTEGER,
    "totalCount" INTEGER NOT NULL DEFAULT 1,
    "minimumQualification" TEXT,
    "requiredExperience" TEXT,
    "requiredSkills" TEXT,
    "salaryCurrency" TEXT,
    "salaryAmount" TEXT,
    "nprEquivalent" TEXT,
    "overtimeStatus" "OvertimeStatus" NOT NULL DEFAULT 'NOT_SPECIFIED',
    "overtimeNotes" TEXT,
    "workHoursPerDay" TEXT,
    "workDaysPerWeek" TEXT,
    "annualLeave" TEXT,
    "foodFacilityStatus" "FacilityStatus" NOT NULL DEFAULT 'NOT_SPECIFIED',
    "foodFacilityNotes" TEXT,
    "accommodationStatus" "FacilityStatus" NOT NULL DEFAULT 'NOT_SPECIFIED',
    "accommodationNotes" TEXT,
    "contractPeriod" TEXT,
    "otherBenefits" TEXT,
    "deadlineOverride" TIMESTAMP(3),
    "status" "PositionStatus" NOT NULL DEFAULT 'OPEN',
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DemandPosition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DemandDocument" (
    "id" TEXT NOT NULL,
    "demandId" TEXT NOT NULL,
    "mediaAssetId" TEXT,
    "documentType" TEXT NOT NULL,
    "title" TEXT,
    "description" TEXT,
    "issueDate" TIMESTAMP(3),
    "expiryDate" TIMESTAMP(3),
    "visibility" "DocumentVisibility" NOT NULL DEFAULT 'PUBLIC',
    "approvalStatus" "DocumentApprovalStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DemandDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DemandApplication" (
    "id" TEXT NOT NULL,
    "demandId" TEXT NOT NULL,
    "positionId" TEXT,
    "candidateId" TEXT NOT NULL,
    "demandTitle" TEXT,
    "companyName" TEXT,
    "countryName" TEXT,
    "positionName" TEXT,
    "passportStatus" "PassportStatus",
    "availableForInterview" BOOLEAN NOT NULL DEFAULT true,
    "cvFileUrl" TEXT,
    "certificateFileUrl" TEXT,
    "demandDetailsRead" BOOLEAN NOT NULL DEFAULT false,
    "privacyConsentGiven" BOOLEAN NOT NULL DEFAULT false,
    "safetyAcknowledgement" BOOLEAN NOT NULL DEFAULT false,
    "privacyPolicyVersion" TEXT,
    "consentTimestamp" TIMESTAMP(3),
    "safetyAckTimestamp" TIMESTAMP(3),
    "feeAckTimestamp" TIMESTAMP(3),
    "formLanguage" TEXT,
    "applicationSource" TEXT,
    "hashedIp" TEXT,
    "hashedUserAgent" TEXT,
    "status" "ApplicationStatus" NOT NULL DEFAULT 'SUBMITTED',
    "adminNotes" TEXT,
    "statusHistory" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DemandApplication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobApplication" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "candidateId" TEXT NOT NULL,
    "status" "ApplicationStatus" NOT NULL DEFAULT 'SUBMITTED',
    "coverLetter" TEXT,
    "adminNotes" TEXT,
    "statusHistory" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JobApplication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CandidateProfile" (
    "id" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "address" TEXT,
    "dateOfBirth" TIMESTAMP(3),
    "educationLevel" TEXT,
    "workExperience" TEXT,
    "skillCategory" TEXT,
    "preferredCountry" TEXT,
    "previousOverseasExp" BOOLEAN NOT NULL DEFAULT false,
    "languageSkills" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "CandidateProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CandidateDocument" (
    "id" TEXT NOT NULL,
    "candidateId" TEXT NOT NULL,
    "documentType" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileSize" INTEGER,
    "mimeType" TEXT,
    "isPrivate" BOOLEAN NOT NULL DEFAULT true,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CandidateDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CandidateConsent" (
    "id" TEXT NOT NULL,
    "candidateId" TEXT NOT NULL,
    "consentType" TEXT NOT NULL,
    "consentGiven" BOOLEAN NOT NULL,
    "consentDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ipAddress" TEXT,
    "userAgent" TEXT,

    CONSTRAINT "CandidateConsent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Industry" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nameNe" TEXT,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "descriptionNe" TEXT,
    "icon" TEXT,
    "image" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "accountStatus" "AccountStatus" NOT NULL DEFAULT 'ACTIVE',
    "sessionVersion" INTEGER NOT NULL DEFAULT 1,
    "passwordChangedAt" TIMESTAMP(3),
    "mfaEnabled" BOOLEAN NOT NULL DEFAULT false,
    "mfaVerifiedAt" TIMESTAMP(3),
    "mfaSecretEncrypted" TEXT,
    "mfaKeyVersion" INTEGER NOT NULL DEFAULT 1,
    "lastLoginAt" TIMESTAMP(3),
    "lastLoginIpHash" TEXT,
    "failedLoginCount" INTEGER NOT NULL DEFAULT 0,
    "lockedUntil" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Industry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Country" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nameNe" TEXT,
    "code" TEXT NOT NULL,
    "flagEmoji" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "accountStatus" "AccountStatus" NOT NULL DEFAULT 'ACTIVE',
    "sessionVersion" INTEGER NOT NULL DEFAULT 1,
    "passwordChangedAt" TIMESTAMP(3),
    "mfaEnabled" BOOLEAN NOT NULL DEFAULT false,
    "mfaVerifiedAt" TIMESTAMP(3),
    "mfaSecretEncrypted" TEXT,
    "mfaKeyVersion" INTEGER NOT NULL DEFAULT 1,
    "lastLoginAt" TIMESTAMP(3),
    "lastLoginIpHash" TEXT,
    "failedLoginCount" INTEGER NOT NULL DEFAULT 0,
    "lockedUntil" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Country_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrainingProgramme" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nameNe" TEXT,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "descriptionNe" TEXT,
    "duration" TEXT,
    "industry" TEXT,
    "skillLevel" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "accountStatus" "AccountStatus" NOT NULL DEFAULT 'ACTIVE',
    "sessionVersion" INTEGER NOT NULL DEFAULT 1,
    "passwordChangedAt" TIMESTAMP(3),
    "mfaEnabled" BOOLEAN NOT NULL DEFAULT false,
    "mfaVerifiedAt" TIMESTAMP(3),
    "mfaSecretEncrypted" TEXT,
    "mfaKeyVersion" INTEGER NOT NULL DEFAULT 1,
    "lastLoginAt" TIMESTAMP(3),
    "lastLoginIpHash" TEXT,
    "failedLoginCount" INTEGER NOT NULL DEFAULT 0,
    "lockedUntil" TIMESTAMP(3),
    "facilityId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TrainingProgramme_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrainingFacility" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nameNe" TEXT,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "descriptionNe" TEXT,
    "location" TEXT,
    "capacity" INTEGER,
    "images" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "accountStatus" "AccountStatus" NOT NULL DEFAULT 'ACTIVE',
    "sessionVersion" INTEGER NOT NULL DEFAULT 1,
    "passwordChangedAt" TIMESTAMP(3),
    "mfaEnabled" BOOLEAN NOT NULL DEFAULT false,
    "mfaVerifiedAt" TIMESTAMP(3),
    "mfaSecretEncrypted" TEXT,
    "mfaKeyVersion" INTEGER NOT NULL DEFAULT 1,
    "lastLoginAt" TIMESTAMP(3),
    "lastLoginIpHash" TEXT,
    "failedLoginCount" INTEGER NOT NULL DEFAULT 0,
    "lockedUntil" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TrainingFacility_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrainingRecord" (
    "id" TEXT NOT NULL,
    "candidateId" TEXT NOT NULL,
    "programmeId" TEXT NOT NULL,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'enrolled',
    "score" DOUBLE PRECISION,
    "certificate" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TrainingRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ComplianceDocument" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "titleNe" TEXT,
    "description" TEXT,
    "descriptionNe" TEXT,
    "documentType" TEXT NOT NULL,
    "issueDate" TIMESTAMP(3),
    "expiryDate" TIMESTAMP(3),
    "fileUrl" TEXT,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "verificationNote" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "lastUpdated" TIMESTAMP(3),
    "versionHistory" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "ComplianceDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Certification" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nameNe" TEXT,
    "issuingBody" TEXT,
    "certificateNumber" TEXT,
    "issueDate" TIMESTAMP(3),
    "expiryDate" TIMESTAMP(3),
    "imageUrl" TEXT,
    "fileUrl" TEXT,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Certification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PolicyDocument" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "titleNe" TEXT,
    "slug" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "contentNe" TEXT,
    "category" TEXT,
    "effectiveDate" TIMESTAMP(3),
    "version" TEXT,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PolicyDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SuccessStory" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "titleNe" TEXT,
    "slug" TEXT NOT NULL,
    "summary" TEXT,
    "summaryNe" TEXT,
    "content" TEXT NOT NULL,
    "contentNe" TEXT,
    "storyType" TEXT NOT NULL DEFAULT 'candidate',
    "image" TEXT,
    "industryId" TEXT,
    "countryId" TEXT,
    "storyDate" TIMESTAMP(3),
    "personName" TEXT,
    "showPersonName" BOOLEAN NOT NULL DEFAULT false,
    "consentGiven" BOOLEAN NOT NULL DEFAULT false,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "metaTitle" TEXT,
    "metaDescription" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "SuccessStory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Testimonial" (
    "id" TEXT NOT NULL,
    "personName" TEXT NOT NULL,
    "designation" TEXT,
    "companyName" TEXT,
    "content" TEXT NOT NULL,
    "contentNe" TEXT,
    "image" TEXT,
    "rating" INTEGER,
    "storyType" TEXT NOT NULL DEFAULT 'employer',
    "consentGiven" BOOLEAN NOT NULL DEFAULT false,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Testimonial_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClientPartner" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "logoUrl" TEXT,
    "website" TEXT,
    "country" TEXT,
    "industry" TEXT,
    "partnerSince" TIMESTAMP(3),
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClientPartner_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkforceDataset" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "dataSource" TEXT,
    "sampleSize" INTEGER,
    "methodology" TEXT,
    "lastUpdated" TIMESTAMP(3),
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkforceDataset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkforceMetric" (
    "id" TEXT NOT NULL,
    "datasetId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "unit" TEXT,
    "period" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkforceMetric_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ArticleCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nameNe" TEXT,
    "slug" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ArticleCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InsightArticle" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "titleNe" TEXT,
    "slug" TEXT NOT NULL,
    "summary" TEXT,
    "summaryNe" TEXT,
    "content" TEXT NOT NULL,
    "contentNe" TEXT,
    "featuredImage" TEXT,
    "categoryId" TEXT,
    "authorId" TEXT,
    "reviewerId" TEXT,
    "publishDate" TIMESTAMP(3),
    "lastUpdated" TIMESTAMP(3),
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "faqSection" JSONB,
    "sourceReferences" JSONB,
    "relatedContent" JSONB,
    "metaTitle" TEXT,
    "metaDescription" TEXT,
    "focusKeyword" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "InsightArticle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NewsArticle" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "titleNe" TEXT,
    "slug" TEXT NOT NULL,
    "summary" TEXT,
    "summaryNe" TEXT,
    "content" TEXT NOT NULL,
    "contentNe" TEXT,
    "featuredImage" TEXT,
    "categoryId" TEXT,
    "authorId" TEXT,
    "reviewerId" TEXT,
    "publishDate" TIMESTAMP(3),
    "lastUpdated" TIMESTAMP(3),
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "sourceReferences" JSONB,
    "metaTitle" TEXT,
    "metaDescription" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "NewsArticle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MediaAsset" (
    "id" TEXT NOT NULL,
    "publicId" TEXT,
    "assetId" TEXT,
    "fileName" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileSize" INTEGER,
    "mimeType" TEXT,
    "width" INTEGER,
    "height" INTEGER,
    "duration" DOUBLE PRECISION,
    "altText" TEXT,
    "caption" TEXT,
    "folder" TEXT,
    "tags" TEXT[],
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "status" "MediaStatus" NOT NULL DEFAULT 'AI_PLACEHOLDER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MediaAsset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SEOPageMeta" (
    "id" TEXT NOT NULL,
    "pagePath" TEXT NOT NULL,
    "metaTitle" TEXT,
    "metaDescription" TEXT,
    "focusKeyword" TEXT,
    "canonicalUrl" TEXT,
    "ogImage" TEXT,
    "ogTitle" TEXT,
    "ogDescription" TEXT,
    "twitterTitle" TEXT,
    "twitterDescription" TEXT,
    "schemaMarkup" JSONB,
    "noIndex" BOOLEAN NOT NULL DEFAULT false,
    "noFollow" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SEOPageMeta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Redirect" (
    "id" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "destination" TEXT NOT NULL,
    "statusCode" INTEGER NOT NULL DEFAULT 301,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "accountStatus" "AccountStatus" NOT NULL DEFAULT 'ACTIVE',
    "sessionVersion" INTEGER NOT NULL DEFAULT 1,
    "passwordChangedAt" TIMESTAMP(3),
    "mfaEnabled" BOOLEAN NOT NULL DEFAULT false,
    "mfaVerifiedAt" TIMESTAMP(3),
    "mfaSecretEncrypted" TEXT,
    "mfaKeyVersion" INTEGER NOT NULL DEFAULT 1,
    "lastLoginAt" TIMESTAMP(3),
    "lastLoginIpHash" TEXT,
    "failedLoginCount" INTEGER NOT NULL DEFAULT 0,
    "lockedUntil" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Redirect_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContactSubmission" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "company" TEXT,
    "subject" TEXT,
    "message" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'general',
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "repliedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContactSubmission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NewsletterSubscriber" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "accountStatus" "AccountStatus" NOT NULL DEFAULT 'ACTIVE',
    "sessionVersion" INTEGER NOT NULL DEFAULT 1,
    "passwordChangedAt" TIMESTAMP(3),
    "mfaEnabled" BOOLEAN NOT NULL DEFAULT false,
    "mfaVerifiedAt" TIMESTAMP(3),
    "mfaSecretEncrypted" TEXT,
    "mfaKeyVersion" INTEGER NOT NULL DEFAULT 1,
    "lastLoginAt" TIMESTAMP(3),
    "lastLoginIpHash" TEXT,
    "failedLoginCount" INTEGER NOT NULL DEFAULT 0,
    "lockedUntil" TIMESTAMP(3),
    "subscribedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "unsubscribedAt" TIMESTAMP(3),

    CONSTRAINT "NewsletterSubscriber_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "action" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entityId" TEXT,
    "details" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SiteSetting" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "group" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SiteSetting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NavigationItem" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "labelNe" TEXT,
    "href" TEXT,
    "parentId" TEXT,
    "location" TEXT NOT NULL DEFAULT 'header',
    "order" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "accountStatus" "AccountStatus" NOT NULL DEFAULT 'ACTIVE',
    "sessionVersion" INTEGER NOT NULL DEFAULT 1,
    "passwordChangedAt" TIMESTAMP(3),
    "mfaEnabled" BOOLEAN NOT NULL DEFAULT false,
    "mfaVerifiedAt" TIMESTAMP(3),
    "mfaSecretEncrypted" TEXT,
    "mfaKeyVersion" INTEGER NOT NULL DEFAULT 1,
    "lastLoginAt" TIMESTAMP(3),
    "lastLoginIpHash" TEXT,
    "failedLoginCount" INTEGER NOT NULL DEFAULT 0,
    "lockedUntil" TIMESTAMP(3),
    "icon" TEXT,
    "description" TEXT,
    "descriptionNe" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NavigationItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CmsPage" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "subtitle" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CmsPage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CmsHeroSection" (
    "id" TEXT NOT NULL,
    "pageId" TEXT NOT NULL,
    "eyebrow" TEXT,
    "richHeading" JSONB NOT NULL,
    "richDescription" JSONB,
    "imageId" TEXT,
    "videoId" TEXT,
    "overlayEnabled" BOOLEAN NOT NULL DEFAULT true,
    "overlayOpacity" INTEGER NOT NULL DEFAULT 60,
    "accessibilityDescription" TEXT,
    "primaryCtaText" TEXT,
    "primaryCtaHref" TEXT,
    "secondaryCtaText" TEXT,
    "secondaryCtaHref" TEXT,

    CONSTRAINT "CmsHeroSection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CmsContentBlock" (
    "id" TEXT NOT NULL,
    "blockKey" TEXT NOT NULL,
    "blockType" TEXT NOT NULL,
    "pageId" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "visible" BOOLEAN NOT NULL DEFAULT true,
    "richHeading" JSONB,
    "content" JSONB NOT NULL,
    "imageId" TEXT,

    CONSTRAINT "CmsContentBlock_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CmsContentRevision" (
    "id" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "content" JSONB NOT NULL,
    "authorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "commitMessage" TEXT,

    CONSTRAINT "CmsContentRevision_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_roleId_idx" ON "User"("roleId");

-- CreateIndex
CREATE UNIQUE INDEX "Role_name_key" ON "Role"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Permission_name_key" ON "Permission"("name");

-- CreateIndex
CREATE INDEX "Permission_module_idx" ON "Permission"("module");

-- CreateIndex
CREATE UNIQUE INDEX "Permission_module_action_key" ON "Permission"("module", "action");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "AdminInvitation_email_key" ON "AdminInvitation"("email");

-- CreateIndex
CREATE UNIQUE INDEX "PasswordResetToken_tokenHash_key" ON "PasswordResetToken"("tokenHash");

-- CreateIndex
CREATE INDEX "EmployerLead_status_idx" ON "EmployerLead"("status");

-- CreateIndex
CREATE INDEX "EmployerLead_createdAt_idx" ON "EmployerLead"("createdAt");

-- CreateIndex
CREATE INDEX "EmployerLead_assignedRecruiterId_idx" ON "EmployerLead"("assignedRecruiterId");

-- CreateIndex
CREATE INDEX "EmployerLeadNote_leadId_idx" ON "EmployerLeadNote"("leadId");

-- CreateIndex
CREATE UNIQUE INDEX "Job_slug_key" ON "Job"("slug");

-- CreateIndex
CREATE INDEX "Job_status_idx" ON "Job"("status");

-- CreateIndex
CREATE INDEX "Job_countryId_idx" ON "Job"("countryId");

-- CreateIndex
CREATE INDEX "Job_industryId_idx" ON "Job"("industryId");

-- CreateIndex
CREATE INDEX "Job_deadline_idx" ON "Job"("deadline");

-- CreateIndex
CREATE INDEX "Job_slug_idx" ON "Job"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Demand_slug_key" ON "Demand"("slug");

-- CreateIndex
CREATE INDEX "Demand_slug_idx" ON "Demand"("slug");

-- CreateIndex
CREATE INDEX "Demand_status_idx" ON "Demand"("status");

-- CreateIndex
CREATE INDEX "Demand_countryId_idx" ON "Demand"("countryId");

-- CreateIndex
CREATE INDEX "Demand_industryId_idx" ON "Demand"("industryId");

-- CreateIndex
CREATE INDEX "Demand_applicationDeadline_idx" ON "Demand"("applicationDeadline");

-- CreateIndex
CREATE INDEX "Demand_isPublic_status_idx" ON "Demand"("isPublic", "status");

-- CreateIndex
CREATE INDEX "DemandPosition_demandId_idx" ON "DemandPosition"("demandId");

-- CreateIndex
CREATE INDEX "DemandPosition_status_idx" ON "DemandPosition"("status");

-- CreateIndex
CREATE INDEX "DemandDocument_demandId_idx" ON "DemandDocument"("demandId");

-- CreateIndex
CREATE INDEX "DemandDocument_documentType_idx" ON "DemandDocument"("documentType");

-- CreateIndex
CREATE INDEX "DemandApplication_demandId_idx" ON "DemandApplication"("demandId");

-- CreateIndex
CREATE INDEX "DemandApplication_candidateId_idx" ON "DemandApplication"("candidateId");

-- CreateIndex
CREATE INDEX "DemandApplication_positionId_idx" ON "DemandApplication"("positionId");

-- CreateIndex
CREATE INDEX "DemandApplication_status_idx" ON "DemandApplication"("status");

-- CreateIndex
CREATE UNIQUE INDEX "DemandApplication_demandId_candidateId_positionId_key" ON "DemandApplication"("demandId", "candidateId", "positionId");

-- CreateIndex
CREATE INDEX "JobApplication_jobId_idx" ON "JobApplication"("jobId");

-- CreateIndex
CREATE INDEX "JobApplication_candidateId_idx" ON "JobApplication"("candidateId");

-- CreateIndex
CREATE INDEX "JobApplication_status_idx" ON "JobApplication"("status");

-- CreateIndex
CREATE UNIQUE INDEX "JobApplication_jobId_candidateId_key" ON "JobApplication"("jobId", "candidateId");

-- CreateIndex
CREATE INDEX "CandidateProfile_email_idx" ON "CandidateProfile"("email");

-- CreateIndex
CREATE INDEX "CandidateProfile_phone_idx" ON "CandidateProfile"("phone");

-- CreateIndex
CREATE INDEX "CandidateDocument_candidateId_idx" ON "CandidateDocument"("candidateId");

-- CreateIndex
CREATE INDEX "CandidateDocument_documentType_idx" ON "CandidateDocument"("documentType");

-- CreateIndex
CREATE INDEX "CandidateConsent_candidateId_idx" ON "CandidateConsent"("candidateId");

-- CreateIndex
CREATE UNIQUE INDEX "Industry_name_key" ON "Industry"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Industry_slug_key" ON "Industry"("slug");

-- CreateIndex
CREATE INDEX "Industry_slug_idx" ON "Industry"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Country_name_key" ON "Country"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Country_code_key" ON "Country"("code");

-- CreateIndex
CREATE INDEX "Country_code_idx" ON "Country"("code");

-- CreateIndex
CREATE UNIQUE INDEX "TrainingProgramme_slug_key" ON "TrainingProgramme"("slug");

-- CreateIndex
CREATE INDEX "TrainingProgramme_slug_idx" ON "TrainingProgramme"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "TrainingFacility_slug_key" ON "TrainingFacility"("slug");

-- CreateIndex
CREATE INDEX "TrainingFacility_slug_idx" ON "TrainingFacility"("slug");

-- CreateIndex
CREATE INDEX "TrainingRecord_candidateId_idx" ON "TrainingRecord"("candidateId");

-- CreateIndex
CREATE INDEX "TrainingRecord_programmeId_idx" ON "TrainingRecord"("programmeId");

-- CreateIndex
CREATE INDEX "TrainingRecord_status_idx" ON "TrainingRecord"("status");

-- CreateIndex
CREATE INDEX "ComplianceDocument_documentType_idx" ON "ComplianceDocument"("documentType");

-- CreateIndex
CREATE INDEX "ComplianceDocument_isPublic_idx" ON "ComplianceDocument"("isPublic");

-- CreateIndex
CREATE INDEX "ComplianceDocument_expiryDate_idx" ON "ComplianceDocument"("expiryDate");

-- CreateIndex
CREATE UNIQUE INDEX "PolicyDocument_slug_key" ON "PolicyDocument"("slug");

-- CreateIndex
CREATE INDEX "PolicyDocument_slug_idx" ON "PolicyDocument"("slug");

-- CreateIndex
CREATE INDEX "PolicyDocument_category_idx" ON "PolicyDocument"("category");

-- CreateIndex
CREATE UNIQUE INDEX "SuccessStory_slug_key" ON "SuccessStory"("slug");

-- CreateIndex
CREATE INDEX "SuccessStory_slug_idx" ON "SuccessStory"("slug");

-- CreateIndex
CREATE INDEX "SuccessStory_storyType_idx" ON "SuccessStory"("storyType");

-- CreateIndex
CREATE INDEX "SuccessStory_isPublished_idx" ON "SuccessStory"("isPublished");

-- CreateIndex
CREATE INDEX "WorkforceMetric_datasetId_idx" ON "WorkforceMetric"("datasetId");

-- CreateIndex
CREATE INDEX "WorkforceMetric_category_idx" ON "WorkforceMetric"("category");

-- CreateIndex
CREATE UNIQUE INDEX "ArticleCategory_name_key" ON "ArticleCategory"("name");

-- CreateIndex
CREATE UNIQUE INDEX "ArticleCategory_slug_key" ON "ArticleCategory"("slug");

-- CreateIndex
CREATE INDEX "ArticleCategory_slug_idx" ON "ArticleCategory"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "InsightArticle_slug_key" ON "InsightArticle"("slug");

-- CreateIndex
CREATE INDEX "InsightArticle_slug_idx" ON "InsightArticle"("slug");

-- CreateIndex
CREATE INDEX "InsightArticle_categoryId_idx" ON "InsightArticle"("categoryId");

-- CreateIndex
CREATE INDEX "InsightArticle_isPublished_idx" ON "InsightArticle"("isPublished");

-- CreateIndex
CREATE INDEX "InsightArticle_publishDate_idx" ON "InsightArticle"("publishDate");

-- CreateIndex
CREATE UNIQUE INDEX "NewsArticle_slug_key" ON "NewsArticle"("slug");

-- CreateIndex
CREATE INDEX "NewsArticle_slug_idx" ON "NewsArticle"("slug");

-- CreateIndex
CREATE INDEX "NewsArticle_categoryId_idx" ON "NewsArticle"("categoryId");

-- CreateIndex
CREATE INDEX "NewsArticle_isPublished_idx" ON "NewsArticle"("isPublished");

-- CreateIndex
CREATE INDEX "NewsArticle_publishDate_idx" ON "NewsArticle"("publishDate");

-- CreateIndex
CREATE INDEX "MediaAsset_folder_idx" ON "MediaAsset"("folder");

-- CreateIndex
CREATE INDEX "MediaAsset_mimeType_idx" ON "MediaAsset"("mimeType");

-- CreateIndex
CREATE INDEX "MediaAsset_status_idx" ON "MediaAsset"("status");

-- CreateIndex
CREATE UNIQUE INDEX "SEOPageMeta_pagePath_key" ON "SEOPageMeta"("pagePath");

-- CreateIndex
CREATE INDEX "SEOPageMeta_pagePath_idx" ON "SEOPageMeta"("pagePath");

-- CreateIndex
CREATE UNIQUE INDEX "Redirect_source_key" ON "Redirect"("source");

-- CreateIndex
CREATE INDEX "Redirect_source_idx" ON "Redirect"("source");

-- CreateIndex
CREATE INDEX "ContactSubmission_isRead_idx" ON "ContactSubmission"("isRead");

-- CreateIndex
CREATE INDEX "ContactSubmission_type_idx" ON "ContactSubmission"("type");

-- CreateIndex
CREATE INDEX "ContactSubmission_createdAt_idx" ON "ContactSubmission"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "NewsletterSubscriber_email_key" ON "NewsletterSubscriber"("email");

-- CreateIndex
CREATE INDEX "NewsletterSubscriber_email_idx" ON "NewsletterSubscriber"("email");

-- CreateIndex
CREATE INDEX "AuditLog_userId_idx" ON "AuditLog"("userId");

-- CreateIndex
CREATE INDEX "AuditLog_entity_idx" ON "AuditLog"("entity");

-- CreateIndex
CREATE INDEX "AuditLog_action_idx" ON "AuditLog"("action");

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "SiteSetting_key_key" ON "SiteSetting"("key");

-- CreateIndex
CREATE INDEX "SiteSetting_key_idx" ON "SiteSetting"("key");

-- CreateIndex
CREATE INDEX "SiteSetting_group_idx" ON "SiteSetting"("group");

-- CreateIndex
CREATE INDEX "NavigationItem_parentId_idx" ON "NavigationItem"("parentId");

-- CreateIndex
CREATE INDEX "NavigationItem_location_idx" ON "NavigationItem"("location");

-- CreateIndex
CREATE INDEX "NavigationItem_order_idx" ON "NavigationItem"("order");

-- CreateIndex
CREATE UNIQUE INDEX "CmsPage_slug_key" ON "CmsPage"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "CmsHeroSection_pageId_key" ON "CmsHeroSection"("pageId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RolePermission" ADD CONSTRAINT "RolePermission_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RolePermission" ADD CONSTRAINT "RolePermission_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES "Permission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminInvitation" ADD CONSTRAINT "AdminInvitation_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PasswordResetToken" ADD CONSTRAINT "PasswordResetToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MfaRecoveryCode" ADD CONSTRAINT "MfaRecoveryCode_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployerLead" ADD CONSTRAINT "EmployerLead_assignedRecruiterId_fkey" FOREIGN KEY ("assignedRecruiterId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployerLeadNote" ADD CONSTRAINT "EmployerLeadNote_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "EmployerLead"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployerLeadNote" ADD CONSTRAINT "EmployerLeadNote_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Job" ADD CONSTRAINT "Job_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "Country"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Job" ADD CONSTRAINT "Job_industryId_fkey" FOREIGN KEY ("industryId") REFERENCES "Industry"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Demand" ADD CONSTRAINT "Demand_companyLogoId_fkey" FOREIGN KEY ("companyLogoId") REFERENCES "MediaAsset"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Demand" ADD CONSTRAINT "Demand_industryId_fkey" FOREIGN KEY ("industryId") REFERENCES "Industry"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Demand" ADD CONSTRAINT "Demand_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "Country"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Demand" ADD CONSTRAINT "Demand_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Demand" ADD CONSTRAINT "Demand_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DemandPosition" ADD CONSTRAINT "DemandPosition_demandId_fkey" FOREIGN KEY ("demandId") REFERENCES "Demand"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DemandDocument" ADD CONSTRAINT "DemandDocument_demandId_fkey" FOREIGN KEY ("demandId") REFERENCES "Demand"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DemandDocument" ADD CONSTRAINT "DemandDocument_mediaAssetId_fkey" FOREIGN KEY ("mediaAssetId") REFERENCES "MediaAsset"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DemandApplication" ADD CONSTRAINT "DemandApplication_demandId_fkey" FOREIGN KEY ("demandId") REFERENCES "Demand"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DemandApplication" ADD CONSTRAINT "DemandApplication_positionId_fkey" FOREIGN KEY ("positionId") REFERENCES "DemandPosition"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DemandApplication" ADD CONSTRAINT "DemandApplication_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "CandidateProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobApplication" ADD CONSTRAINT "JobApplication_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobApplication" ADD CONSTRAINT "JobApplication_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "CandidateProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CandidateDocument" ADD CONSTRAINT "CandidateDocument_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "CandidateProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CandidateConsent" ADD CONSTRAINT "CandidateConsent_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "CandidateProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainingProgramme" ADD CONSTRAINT "TrainingProgramme_facilityId_fkey" FOREIGN KEY ("facilityId") REFERENCES "TrainingFacility"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainingRecord" ADD CONSTRAINT "TrainingRecord_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "CandidateProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainingRecord" ADD CONSTRAINT "TrainingRecord_programmeId_fkey" FOREIGN KEY ("programmeId") REFERENCES "TrainingProgramme"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SuccessStory" ADD CONSTRAINT "SuccessStory_industryId_fkey" FOREIGN KEY ("industryId") REFERENCES "Industry"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SuccessStory" ADD CONSTRAINT "SuccessStory_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "Country"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkforceMetric" ADD CONSTRAINT "WorkforceMetric_datasetId_fkey" FOREIGN KEY ("datasetId") REFERENCES "WorkforceDataset"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InsightArticle" ADD CONSTRAINT "InsightArticle_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "ArticleCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InsightArticle" ADD CONSTRAINT "InsightArticle_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InsightArticle" ADD CONSTRAINT "InsightArticle_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NewsArticle" ADD CONSTRAINT "NewsArticle_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "ArticleCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NewsArticle" ADD CONSTRAINT "NewsArticle_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NewsArticle" ADD CONSTRAINT "NewsArticle_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NavigationItem" ADD CONSTRAINT "NavigationItem_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "NavigationItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CmsHeroSection" ADD CONSTRAINT "CmsHeroSection_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "CmsPage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CmsHeroSection" ADD CONSTRAINT "CmsHeroSection_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "MediaAsset"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CmsHeroSection" ADD CONSTRAINT "CmsHeroSection_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES "MediaAsset"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CmsContentBlock" ADD CONSTRAINT "CmsContentBlock_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "CmsPage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CmsContentBlock" ADD CONSTRAINT "CmsContentBlock_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "MediaAsset"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CmsContentRevision" ADD CONSTRAINT "CmsContentRevision_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
