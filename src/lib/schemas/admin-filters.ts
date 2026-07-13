import { z } from 'zod';
import { ApplicationStatus, DemandStatus, LeadStatus, JobStatus } from '@prisma/client';

export const PaginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(50),
});

export const DemandFilterSchema = PaginationSchema.extend({
  status: z.nativeEnum(DemandStatus).optional(),
  sortBy: z.enum(['createdAt', 'updatedAt', 'title']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export const ApplicationFilterSchema = PaginationSchema.extend({
  status: z.nativeEnum(ApplicationStatus).optional(),
  sortBy: z.enum(['createdAt', 'updatedAt', 'status']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export const CandidateFilterSchema = PaginationSchema.extend({
  sortBy: z.enum(['createdAt', 'updatedAt', 'fullName']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export const MediaFilterSchema = PaginationSchema.extend({
  visibility: z.enum(['PUBLIC', 'PRIVATE']).optional(),
  sortBy: z.enum(['createdAt', 'updatedAt', 'originalName']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export const LeadFilterSchema = PaginationSchema.extend({
  status: z.nativeEnum(LeadStatus).optional(),
  sortBy: z.enum(['createdAt', 'updatedAt']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export const JobFilterSchema = PaginationSchema.extend({
  status: z.nativeEnum(JobStatus).optional(),
  sortBy: z.enum(['createdAt', 'updatedAt']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});
