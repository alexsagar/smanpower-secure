import { describe, expect, it, vi } from 'vitest';
import { POST as ApplicationPOST } from '../applications/route';
import { POST as MediaCompletePOST } from '../admin/media/complete/route';
import { POST as MediaDeletePOST } from '../admin/media/delete/route';
import { GET as DocumentGET } from '../documents/[id]/view/route';
import { NextRequest } from 'next/server';

vi.mock('next/server', () => {
  class MockNextResponse {
    status: number;
    _json: any;
    constructor(body?: any, init?: any) {
      this.status = init?.status || 200;
      if (body) {
        if (typeof body === 'string') {
          this._json = { error: body };
        } else {
          this._json = body;
        }
      }
    }
    json() {
      return Promise.resolve(this._json);
    }
    static json(body: any, init?: any) {
      const res = new MockNextResponse(body, init);
      res._json = body;
      return res;
    }
  }

  return {
    NextRequest: class MockNextRequest {
      url: string;
      method: string;
      bodyText: string;
      headers: Map<string, string>;
      constructor(url: string, init?: any) {
        this.url = url;
        this.method = init?.method || 'GET';
        this.bodyText = init?.body || '';
        this.headers = new Map();
        if (init?.headers) {
          Object.entries(init.headers).forEach(([k, v]) => this.headers.set(k.toLowerCase(), v as string));
        }
      }
      json() {
        return Promise.resolve(JSON.parse(this.bodyText));
      }
      formData() {
        return Promise.resolve(new Map());
      }
    },
    NextResponse: MockNextResponse
  };
});


vi.mock('@/auth', () => ({
  auth: vi.fn(() => ({ user: { id: 'test', role: 'super_admin' } }))
}));
vi.mock('next-auth', () => ({
  default: vi.fn(() => ({ handlers: {}, auth: vi.fn(), signIn: vi.fn(), signOut: vi.fn() })),
  CredentialsSignin: class CredentialsSignin extends Error {}
}));



describe('Route Error Contracts', () => {
  it('Application API malformed input response status and shape', async () => {
    const req = new NextRequest('http://localhost/api/applications', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ demandId: "123" }) // Missing required fields
    });
    const res = await ApplicationPOST(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.success).toBe(false);
    expect(json.error.code).toBe('VALIDATION_ERROR');
    expect(json.error.message).toBeDefined();
  });

  it('Application API unknown internal error returns a generic safe error', async () => {
    // We can simulate an internal error by passing invalid JSON body that fails NextRequest parsing 
    // or by mocking a service. Since it's a unit test on the route, let's pass a broken request object
    const req = {
      json: vi.fn().mockRejectedValue(new Error('Internal DB Crash with credentials root:password'))
    } as unknown as NextRequest;
    
    const res = await ApplicationPOST(req);
    expect(res.status).toBe(500);
    const json = await res.json();
    expect(json.success).toBe(false);
    expect(json.error.code).toBe('INTERNAL_ERROR');
    expect(json.error.message).toBe('An unexpected internal error occurred.');
    expect(JSON.stringify(json)).not.toContain('root:password');
  });

  it('Media completion validation error response', async () => {
    const req = new NextRequest('http://localhost/api/admin/media/complete', {
      method: 'POST',
      body: JSON.stringify({ publicId: "" }) // Invalid
    });
    const res = await MediaCompletePOST(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.success).toBe(false);
    expect(json.error.code).toBe('VALIDATION_ERROR');
  });

  it('Private-document unauthorized response', async () => {
    // Assuming unauthenticated request
    const req = new NextRequest('http://localhost/api/documents/123/view');
    const res = await DocumentGET(req, { params: { id: "123" } });
    
    // We expect 401 or redirect to login. The route returns 401 UnauthorizedError.
    expect(res.status).toBe(401);
    const json = await res.json();
    expect(json.success).toBe(false);
    expect(json.error.code).toBe('UNAUTHORIZED_ERROR');
  });
});
