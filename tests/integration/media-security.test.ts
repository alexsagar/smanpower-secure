import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock next/server
vi.mock('next/server', () => ({
  NextRequest: class NextRequest {
    url: string;
    constructor(url: string, init?: any) { 
      this.url = url; 
      if (init?.body) {
        this.json = () => Promise.resolve(JSON.parse(init.body));
      } else {
        this.json = () => Promise.resolve({});
      }
    }
    json() { return Promise.resolve({}); }
  },
  NextResponse: {
    json: vi.fn((data, init) => {
      return {
        status: init?.status || 200,
        json: () => Promise.resolve(data)
      }
    }),
    redirect: vi.fn((url, status) => {
      return { status: status || 307, url, headers: { get: () => null } }
    })
  }
}));

import { NextRequest } from 'next/server';
import { GET as signRoute } from '@/app/api/admin/cloudinary/sign/route';
import { POST as completeRoute } from '@/app/api/admin/media/complete/route';
import { POST as deleteRoute } from '@/app/api/admin/media/delete/route';
import { prisma } from '@/lib/prisma';
import cloudinary from '@/lib/cloudinary';

// Mock cloudinary
vi.mock('@/lib/cloudinary', () => ({
  default: {
    utils: {
      api_sign_request: vi.fn().mockReturnValue('mock-signature'),
      private_download_url: vi.fn().mockReturnValue('https://mock-private-url')
    },
    uploader: {
      destroy: vi.fn().mockResolvedValue({ result: 'ok' })
    },
    api: {
      resource: vi.fn()
    }
  }
}));

// Mock auth
vi.mock('@/lib/auth', () => ({
  auth: vi.fn()
}));

// Mock permissions
vi.mock('@/lib/permissions', () => ({
  requirePermission: vi.fn().mockResolvedValue(true),
  MEDIA_PERMISSIONS: {
    VIEW: 'media:view',
    UPLOAD: 'media:upload',
    DELETE_OR_ARCHIVE: 'media:delete'
  }
}));

describe('Media Security Integration', () => {
  describe('Signing Endpoints', () => {
    it('rejects arbitrary folder input and uses purpose map', async () => {
      const { auth } = await import('@/lib/auth');
      vi.mocked(auth).mockResolvedValue({ user: { id: 'admin-1', roleId: 'role-1' } } as any);

      // We attempt to pass folder directly, but the route expects purpose.
      const req = new NextRequest('http://localhost/api/admin/cloudinary/sign?folder=hacked-folder&purpose=cms_image');
      const res = await signRoute(req);
      const data = await res.json();
      
      expect(res.status).toBe(200);
      expect(data.folder).toBe('seven-seas-cms'); // Ignored the hacked-folder
    });
    
    it('rejects unknown purpose', async () => {
      const { auth } = await import('@/lib/auth');
      vi.mocked(auth).mockResolvedValue({ user: { id: 'admin-1' } } as any);

      const req = new NextRequest('http://localhost/api/admin/cloudinary/sign?purpose=unknown_purpose');
      const res = await signRoute(req);
      
      expect(res.status).toBe(400);
    });
  });

  describe('Deletion Coordination & Lifecycle', () => {
    it('prevents deletion if referenced by other models', async () => {
      const { auth } = await import('@/lib/auth');
      vi.mocked(auth).mockResolvedValue({ user: { id: 'admin-1' } } as any);

      vi.spyOn(prisma.mediaAsset, 'findUnique').mockResolvedValue({
        id: 'referenced-id',
        publicId: 'some-public-id',
        folder: 'seven-seas-cms',
        mimeType: 'image/jpeg',
        _count: {
          heroImages: 1, // Referenced!
          heroVideos: 0,
          blockImages: 0,
          demandLogos: 0,
          demandDocuments: 0,
          insightImages: 0,
          newsImages: 0,
          careerImages: 0,
          successStoryImages: 0,
        }
      } as any);

      const req = new NextRequest('http://localhost/api/admin/media/delete', {
        method: 'POST',
        body: JSON.stringify({ id: 'referenced-id' })
      });

      const res = await deleteRoute(req);
      expect(res.status).toBe(400);
      
      // Cloudinary destroy should not have been called
      expect(cloudinary.uploader.destroy).not.toHaveBeenCalled();
    });

    it('rejects candidate documents through generic media route', async () => {
      const { auth } = await import('@/lib/auth');
      vi.mocked(auth).mockResolvedValue({ user: { id: 'admin-1' } } as any);

      vi.spyOn(prisma.mediaAsset, 'findUnique').mockResolvedValue({
        id: 'doc-id',
        folder: 'seven-seas-candidates', // Private document
        _count: { heroImages: 0, heroVideos: 0, blockImages: 0, demandLogos: 0, demandDocuments: 0, insightImages: 0, newsImages: 0, careerImages: 0, successStoryImages: 0 }
      } as any);

      const req = new NextRequest('http://localhost/api/admin/media/delete', { method: 'POST', body: JSON.stringify({ id: 'doc-id' }) });
      const res = await deleteRoute(req);
      
      expect(res.status).toBe(400);
      expect(cloudinary.uploader.destroy).not.toHaveBeenCalled();
    });

    it('eligible deletion transitions to PENDING_REMOTE_DELETE and calls Cloudinary', async () => {
      const { auth } = await import('@/lib/auth');
      vi.mocked(auth).mockResolvedValue({ user: { id: 'admin-1' } } as any);

      vi.spyOn(prisma.mediaAsset, 'findUnique').mockResolvedValue({
        id: 'valid-id',
        publicId: 'some-public-id',
        folder: 'seven-seas-cms',
        mimeType: 'image/jpeg',
        deletionState: 'ACTIVE',
        _count: { heroImages: 0, heroVideos: 0, blockImages: 0, demandLogos: 0, demandDocuments: 0, insightImages: 0, newsImages: 0, careerImages: 0, successStoryImages: 0 }
      } as any);

      vi.spyOn(prisma, '$transaction').mockImplementation(async (cb) => {
        // Return updated asset mock
        return {
          id: 'valid-id',
          publicId: 'some-public-id',
          mimeType: 'image/jpeg',
          deletionState: 'PENDING_REMOTE_DELETE'
        };
      });
      vi.mocked(cloudinary.uploader.destroy).mockResolvedValue({ result: 'ok' });

      const req = new NextRequest('http://localhost/api/admin/media/delete', { method: 'POST', body: JSON.stringify({ id: 'valid-id' }) });
      const res = await deleteRoute(req);
      
      expect(res.status).toBe(200);
      expect(prisma.$transaction).toHaveBeenCalled();
      expect(cloudinary.uploader.destroy).toHaveBeenCalledWith('some-public-id', { resource_type: 'image' });
    });

    it('Cloudinary failure preserves the database record and transitions to REMOTE_DELETE_FAILED', async () => {
      const { auth } = await import('@/lib/auth');
      vi.mocked(auth).mockResolvedValue({ user: { id: 'admin-1' } } as any);

      vi.spyOn(prisma.mediaAsset, 'findUnique').mockResolvedValue({
        id: 'valid-id',
        publicId: 'fail-public-id',
        folder: 'seven-seas-cms',
        mimeType: 'image/jpeg',
        deletionState: 'ACTIVE',
        _count: { heroImages: 0, heroVideos: 0, blockImages: 0, demandLogos: 0, demandDocuments: 0, insightImages: 0, newsImages: 0, careerImages: 0, successStoryImages: 0 }
      } as any);

      vi.spyOn(prisma, '$transaction').mockImplementation(async (cb) => {
        return { id: 'valid-id', publicId: 'fail-public-id', mimeType: 'image/jpeg', deletionState: 'PENDING_REMOTE_DELETE' };
      });
      
      // Simulate Cloudinary failure
      vi.mocked(cloudinary.uploader.destroy).mockResolvedValue({ result: 'not found' } as any); // Wait, not found is considered ok! Let's return error
      vi.mocked(cloudinary.uploader.destroy).mockRejectedValue(new Error('Network error'));
      
      vi.spyOn(prisma.mediaAsset, 'update').mockResolvedValue({} as any);
      vi.spyOn(prisma.auditLog, 'create').mockResolvedValue({} as any);

      const req = new NextRequest('http://localhost/api/admin/media/delete', { method: 'POST', body: JSON.stringify({ id: 'valid-id' }) });
      const res = await deleteRoute(req);
      
      expect(res.status).toBe(500);
      expect(prisma.mediaAsset.update).toHaveBeenCalledWith({
        where: { id: 'valid-id' },
        data: { deletionState: 'REMOTE_DELETE_FAILED', lastDeletionErrorCode: 'CLOUDINARY_UNAVAILABLE' }
      });
    });
  });
});
