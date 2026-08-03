import { vi } from 'vitest';

// `server-only` throws when imported outside a React Server Component. Several
// modules under test (e.g. the content repository) import it as a build-time
// guard; in the test runner it is a no-op. Mocking it globally lets any test
// import those modules without repeating the mock in every file.
vi.mock('server-only', () => ({}));

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
