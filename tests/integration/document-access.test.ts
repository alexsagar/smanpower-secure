import { describe, it, expect, vi } from 'vitest';

// Mock next/server
vi.mock('next/server', () => ({
  NextRequest: class NextRequest {
    url: string;
    constructor(url: string, init?: any) { 
      this.url = url; 
    }
  },
  NextResponse: class NextResponse {
    constructor(body: string, init?: any) {
      return { status: init?.status || 200, body } as any;
    }
    static json = vi.fn((data, init) => {
      return {
        status: init?.status || 200,
        json: () => Promise.resolve(data)
      }
    });
    static redirect = vi.fn((url, init) => {
      return { status: init?.status || 307, url, headers: new Map() }
    });
  }
}));

// Mock auth completely to avoid env.js next/server dependency
vi.mock('@/lib/auth', () => ({
  auth: vi.fn().mockResolvedValue({ user: { id: 'admin-1' } })
}));
vi.mock('next-auth', () => ({
  default: vi.fn(),
  CredentialsSignin: class CredentialsSignin extends Error {},
  AuthError: class AuthError extends Error {}
}));

import { NextRequest } from 'next/server';
import { GET as viewRoute } from '@/app/api/documents/[id]/view/route';
import { prisma } from '@/lib/prisma';
import cloudinary from '@/lib/cloudinary';

// Mock permissions
vi.mock('@/lib/permissions', () => ({
  requirePermission: vi.fn().mockResolvedValue({ id: 'admin-1' }),
  CANDIDATE_DOCUMENT_PERMISSIONS: {
    VIEW: 'candidate_documents:view'
  }
}));

describe('Private Document Access Integration', () => {
  it('rejects PENDING_SCAN documents', async () => {
    vi.spyOn(prisma.candidateDocument, 'findUnique').mockResolvedValue({
      id: 'doc-1',
      status: 'PENDING_SCAN',
      candidateId: 'cand-1',
      candidate: { fullName: 'Test User', id: 'cand-1' }
    } as any);

    const req = new NextRequest('http://localhost/api/documents/doc-1/view');
    const res = await viewRoute(req, { params: Promise.resolve({ id: 'doc-1' }) });
    
    expect(res.status).toBe(403);
  });

  it('allows SAFE documents and returns short-lived signed URL', async () => {
    vi.spyOn(prisma.candidateDocument, 'findUnique').mockResolvedValue({
      id: 'doc-1',
      status: 'SAFE',
      candidateId: 'cand-1',
      fileUrl: 'private_doc_id',
      mimeType: 'application/pdf',
      fileName: 'test.pdf',
      candidate: { fullName: 'Test User', id: 'cand-1' }
    } as any);

    const createAuditLogSpy = vi.spyOn(prisma.auditLog, 'create').mockResolvedValue({} as any);

    const req = new NextRequest('http://localhost/api/documents/doc-1/view');
    const res = await viewRoute(req, { params: Promise.resolve({ id: 'doc-1' }) });
    
    expect(res.status).toBe(307);
    expect(res.headers.get('Cache-Control')).toBe('no-store, private');
    
    // Check audit log for PII absence
    const auditCallArgs = createAuditLogSpy.mock.calls[0][0];
    expect(auditCallArgs.data.details).toContain('doc-1');
    expect(auditCallArgs.data.details).toContain('cand-1');
    expect(auditCallArgs.data.details).not.toContain('test.pdf');
    expect(auditCallArgs.data.details).not.toContain('Test User');
  });
});
