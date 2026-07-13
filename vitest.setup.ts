import { vi } from 'vitest';

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}));

// Mock Email Service
vi.mock('@/services/email.service', () => ({
  EmailService: {
    sendAdminInvitation: vi.fn().mockResolvedValue(true),
    sendPasswordReset: vi.fn().mockResolvedValue(true),
    sendDemandApplicationReceipt: vi.fn().mockResolvedValue(true),
  }
}));
