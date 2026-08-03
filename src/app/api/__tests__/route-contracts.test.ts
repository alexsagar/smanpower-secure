import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { UnauthenticatedError } from "@/lib/auth-errors";
import { auth } from "@/lib/auth";
import { requirePermission } from "@/lib/permissions";
import { POST as ApplicationPOST } from "../applications/route";
import { POST as MediaCompletePOST } from "../admin/media/complete/route";
import { GET as DocumentGET } from "../documents/[id]/view/route";

vi.mock("@/lib/auth", () => ({
  auth: vi.fn(),
  signOut: vi.fn(),
}));

vi.mock("@/lib/permissions", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/permissions")>();

  return {
    ...actual,
    requirePermission: vi.fn(),
  };
});

vi.mock("next-auth", () => ({
  default: vi.fn(() => ({
    handlers: {},
    auth: vi.fn(),
    signIn: vi.fn(),
    signOut: vi.fn(),
  })),
  CredentialsSignin: class CredentialsSignin extends Error {},
}));

const authMock = vi.mocked(auth);
const requirePermissionMock = vi.mocked(requirePermission);

describe("Route Error Contracts", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Exercise the validation/error contracts of the applications route; the
    // "applications disabled" (403) path is a separate concern.
    vi.stubEnv("PUBLIC_APPLICATIONS_ENABLED", "true");
    authMock.mockResolvedValue({
      user: { id: "test-admin-user" },
    } as Awaited<ReturnType<typeof auth>>);
    requirePermissionMock.mockResolvedValue({
      id: "test-admin-user",
      email: "admin@example.test",
      name: "Test Admin",
      role: "super_admin",
      permissions: [],
      sessionVersion: 1,
    });
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("Application API malformed FormData returns a safe validation response", async () => {
    const req = new NextRequest("http://localhost/api/applications", {
      method: "POST",
      body: new FormData(),
    });

    const res = await ApplicationPOST(req);
    const json = (await res.json()) as { error?: string; code?: string };

    expect(res.status).toBe(400);
    expect(json.error).toBeDefined();
    expect(json.code).toBe("VALIDATION_FAILED");
  });

  it("Application API unknown errors return a generic safe response", async () => {
    const req = {
      formData: vi
        .fn()
        .mockRejectedValue(new Error("Internal DB Crash with credentials")),
    } as unknown as NextRequest;

    const res = await ApplicationPOST(req);
    const json = (await res.json()) as { error?: string };

    expect(res.status).toBe(500);
    expect(json.error).toBe("Internal Server Error");
    expect(JSON.stringify(json)).not.toContain("credentials");
  });

  it("Media completion handles authenticated validation and unauthenticated rejection", async () => {
    const req = new Request("http://localhost/api/admin/media/complete", {
      method: "POST",
      body: JSON.stringify({
        public_id: "",
        purpose: "",
      }),
    });

    const res = await MediaCompletePOST(req);
    const json = (await res.json()) as { error?: string };

    expect(authMock).toHaveBeenCalled();
    expect(requirePermissionMock).not.toHaveBeenCalled();
    expect(res.status).toBe(400);
    expect(json.error).toBe("Invalid purpose");

    authMock.mockResolvedValueOnce(null);

    const unauthReq = new Request("http://localhost/api/admin/media/complete", {
      method: "POST",
      body: JSON.stringify({
        public_id: "",
        purpose: "",
      }),
    });

    const unauthRes = await MediaCompletePOST(unauthReq);
    const unauthJson = (await unauthRes.json()) as { error?: string };

    expect(requirePermissionMock).not.toHaveBeenCalled();
    expect(unauthRes.status).toBe(401);
    expect(unauthJson.error).toBe("Unauthorized");
  });

  it("Private-document unauthorized response is safe and contains no internal details", async () => {
    requirePermissionMock.mockRejectedValueOnce(new UnauthenticatedError());

    const req = new NextRequest("http://localhost/api/documents/123/view");
    const res = await DocumentGET(req, {
      params: Promise.resolve({ id: "123" }),
    });
    const body = await res.text();

    expect(res.status).toBe(401);
    expect(body).toBe("Unauthorized");
    expect(body).not.toContain("stack");
  });
});
