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
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import cloudinary from '@/lib/cloudinary';

vi.mock('@/services/cloudinary.service', async () => {
  const actual =
    await vi.importActual<typeof import('@/services/cloudinary.service')>(
      '@/services/cloudinary.service'
    );

  return {
    ...actual,
    generateUploadSignature: vi.fn((
      folder: string,
      deliveryType: 'upload' | 'private' = 'upload',
      resourceType: 'image' | 'video' | 'raw' = 'image'
    ) => ({
      timestamp: 1234567890,
      signature: 'mock-signature',
      folder,
      resourceType,
      cloudName: 'mock-cloud',
      apiKey: 'mock-key',
      deliveryType,
    })),
    deleteManagedAsset: vi.fn(async (
      publicId: string,
      options: {
        deliveryType?: 'upload' | 'private';
        resourceType: 'image' | 'video' | 'raw';
      }
    ) => {
      const result = await cloudinary.uploader.destroy(publicId, {
        ...(options.deliveryType === 'private' ? { type: 'private' } : {}),
        resource_type: options.resourceType,
      });
      return result.result === 'ok' || result.result === 'not found';
    }),
  };
});

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
      expect(data.deliveryType).toBe('upload');
      expect(data.resourceType).toBe('image');
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
        publicId: 'seven-seas-cms/some-public-id',
        folder: 'seven-seas-cms',
        mimeType: 'image/jpeg',
        _count: {
          heroImages: 1, // Referenced!
          heroVideos: 0,
          heroPosterImages: 0,
          heroMobileImages: 0,
          blockImages: 0,
          blockVideos: 0,
          blockPosterImages: 0,
          blockMobileImages: 0,
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
        _count: { heroImages: 0, heroVideos: 0, heroPosterImages: 0, heroMobileImages: 0, blockImages: 0, blockVideos: 0, blockPosterImages: 0, blockMobileImages: 0, demandLogos: 0, demandDocuments: 0, insightImages: 0, newsImages: 0, careerImages: 0, successStoryImages: 0 }
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
        publicId: 'seven-seas-cms/some-public-id',
        folder: 'seven-seas-cms',
        mimeType: 'image/jpeg',
        deletionState: 'ACTIVE',
        _count: { heroImages: 0, heroVideos: 0, heroPosterImages: 0, heroMobileImages: 0, blockImages: 0, blockVideos: 0, blockPosterImages: 0, blockMobileImages: 0, demandLogos: 0, demandDocuments: 0, insightImages: 0, newsImages: 0, careerImages: 0, successStoryImages: 0 }
      } as any);

      vi.spyOn(prisma, '$transaction').mockImplementation(async (cb) => {
        // Return updated asset mock
        return {
          id: 'valid-id',
          publicId: 'seven-seas-cms/some-public-id',
          resourceType: 'IMAGE',
          deletionState: 'PENDING_REMOTE_DELETE'
        };
      });
      vi.mocked(cloudinary.uploader.destroy).mockResolvedValue({ result: 'ok' });

      const req = new NextRequest('http://localhost/api/admin/media/delete', { method: 'POST', body: JSON.stringify({ id: 'valid-id' }) });
      const res = await deleteRoute(req);
      
      expect(res.status).toBe(200);
      expect(prisma.$transaction).toHaveBeenCalled();
      expect(cloudinary.uploader.destroy).toHaveBeenCalledWith('seven-seas-cms/some-public-id', { resource_type: 'image' });
    });

    it('Cloudinary failure preserves the database record and transitions to REMOTE_DELETE_FAILED', async () => {
      const { auth } = await import('@/lib/auth');
      vi.mocked(auth).mockResolvedValue({ user: { id: 'admin-1' } } as any);

      vi.spyOn(prisma.mediaAsset, 'findUnique').mockResolvedValue({
        id: 'valid-id',
        publicId: 'seven-seas-cms/fail-public-id',
        folder: 'seven-seas-cms',
        mimeType: 'image/jpeg',
        deletionState: 'ACTIVE',
        _count: { heroImages: 0, heroVideos: 0, heroPosterImages: 0, heroMobileImages: 0, blockImages: 0, blockVideos: 0, blockPosterImages: 0, blockMobileImages: 0, demandLogos: 0, demandDocuments: 0, insightImages: 0, newsImages: 0, careerImages: 0, successStoryImages: 0 }
      } as any);

      vi.spyOn(prisma, '$transaction').mockImplementation(async (cb) => {
        return { id: 'valid-id', publicId: 'seven-seas-cms/fail-public-id', resourceType: 'IMAGE', deletionState: 'PENDING_REMOTE_DELETE' };
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

  describe('Media completion resource typing', () => {
    beforeEach(() => {
      vi.mocked(auth).mockResolvedValue({ user: { id: 'admin-1' } } as any);
      vi.spyOn(prisma.mediaAsset, 'findFirst').mockResolvedValue(null as any);
      vi.mocked(cloudinary.uploader.destroy).mockResolvedValue({ result: 'ok' } as any);
    });

    it('persists authoritative IMAGE resource type for verified image uploads', async () => {
      vi.mocked(cloudinary.api.resource).mockResolvedValue({
        folder: 'seven-seas-cms',
        resource_type: 'image',
        format: 'jpeg',
        bytes: 1024,
        width: 1200,
        height: 800,
        duration: null,
        tags: [],
        public_id: 'seven-seas-cms/cms_image',
        asset_id: 'asset-image',
        secure_url: 'https://cdn.example.com/image.jpeg',
      } as any);

      const createSpy = vi.spyOn(prisma.mediaAsset, 'create').mockResolvedValue({ id: 'media-image' } as any);

      const req = new NextRequest('http://localhost/api/admin/media/complete', {
        method: 'POST',
        body: JSON.stringify({ public_id: 'seven-seas-cms/cms_image', purpose: 'cms_image', original_filename: 'hero.jpg' }),
      });

      const res = await completeRoute(req as any);

      expect(res.status).toBe(200);
      expect(createSpy).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({
          resourceType: 'IMAGE',
          mimeType: 'image/jpeg',
          duration: null,
        }),
      }));
    });

    it('preserves verified video duration when an authoritative VIDEO asset is mapped', async () => {
      const media = {
        id: 'media-video',
        publicId: 'seven-seas-cms/cms_video',
        assetId: 'asset-video',
        fileUrl: 'https://cdn.example.com/video.mp4',
        fileName: 'video.mp4',
        altText: 'Hero video',
        caption: null,
        folder: 'seven-seas-cms',
        tags: [],
        status: 'REAL_APPROVED',
        isPublic: true,
        mimeType: 'video/mp4',
        resourceType: 'VIDEO',
        fileSize: 4096,
        width: 1280,
        height: 720,
        duration: 3.5,
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
        updatedAt: new Date('2026-01-02T00:00:00.000Z'),
      };

      const { mapPrismaMediaAsset } = await import('@/repositories/prisma-content-repository');
      const mapped = mapPrismaMediaAsset(media);

      expect(mapped.resourceType).toBe('video');
      expect(mapped.duration).toBe(3.5);
    });

    it('accepts approved CMS video uploads and preserves duration', async () => {
      vi.mocked(cloudinary.api.resource).mockResolvedValue({
        folder: 'seven-seas-cms',
        resource_type: 'video',
        format: 'mp4',
        bytes: 4096,
        width: 1280,
        height: 720,
        duration: 6.2,
        tags: [],
        public_id: 'seven-seas-cms/cms_video',
        asset_id: 'asset-video',
        secure_url: 'https://cdn.example.com/video.mp4',
      } as any);

      const createSpy = vi.spyOn(prisma.mediaAsset, 'create').mockResolvedValue({ id: 'media-video' } as any);

      const req = new NextRequest('http://localhost/api/admin/media/complete', {
        method: 'POST',
        body: JSON.stringify({ public_id: 'seven-seas-cms/cms_video', purpose: 'cms_video', original_filename: 'hero.mp4' }),
      });

      const res = await completeRoute(req as any);

      expect(res.status).toBe(200);
      expect(createSpy).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({
          resourceType: 'VIDEO',
          mimeType: 'video/mp4',
          duration: 6.2,
        }),
      }));
    });

    it('rejects CMS video uploads when verified duration is missing', async () => {
      vi.mocked(cloudinary.api.resource).mockResolvedValue({
        folder: 'seven-seas-cms',
        resource_type: 'video',
        format: 'mp4',
        bytes: 1024,
        width: 1280,
        height: 720,
        duration: null,
        tags: [],
        public_id: 'seven-seas-cms/cms_video_missing_duration',
        asset_id: 'asset-video',
        secure_url: 'https://cdn.example.com/video.mp4',
      } as any);

      const req = new NextRequest('http://localhost/api/admin/media/complete', {
        method: 'POST',
        body: JSON.stringify({ public_id: 'seven-seas-cms/cms_video_missing_duration', purpose: 'cms_video', original_filename: 'hero.mp4' }),
      });

      const res = await completeRoute(req as any);

      expect(res.status).toBe(400);
      expect(cloudinary.uploader.destroy).toHaveBeenCalledWith('seven-seas-cms/cms_video_missing_duration', { resource_type: 'video' });
    });

    it('rejects mismatched verified Cloudinary resource types', async () => {
      vi.mocked(cloudinary.api.resource).mockResolvedValue({
        folder: 'seven-seas-cms',
        resource_type: 'video',
        format: 'mp4',
        bytes: 1024,
        width: 1280,
        height: 720,
        duration: 3.5,
        tags: [],
        public_id: 'seven-seas-cms/cms_video',
        asset_id: 'asset-video',
        secure_url: 'https://cdn.example.com/video.mp4',
      } as any);

      const req = new NextRequest('http://localhost/api/admin/media/complete', {
        method: 'POST',
        body: JSON.stringify({ public_id: 'seven-seas-cms/cms_video', purpose: 'cms_image', original_filename: 'hero.mp4' }),
      });

      const res = await completeRoute(req as any);

      expect(res.status).toBe(400);
      expect(cloudinary.uploader.destroy).toHaveBeenCalledWith('seven-seas-cms/cms_video', { resource_type: 'video' });
    });
  });
});
