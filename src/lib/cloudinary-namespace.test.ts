import {
  afterEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import {
  assertCloudinaryNamespaceConfiguration,
  isCloudinaryFolderOwnedByCurrentEnvironment,
  isCloudinaryPublicIdInsideFolder,
  isCloudinaryPublicIdOwnedByCurrentEnvironment,
  resolveCloudinaryFolder,
} from "./cloudinary-namespace";

describe("Cloudinary environment namespace", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("requires the staging namespace in staging", () => {
    vi.stubEnv("APP_ENV", "staging");
    vi.stubEnv("CLOUDINARY_FOLDER_PREFIX", "");

    expect(() =>
      assertCloudinaryNamespaceConfiguration()
    ).toThrow(
      'Staging requires CLOUDINARY_FOLDER_PREFIX="staging".'
    );
  });

  it("resolves approved staging folders under staging/", () => {
    vi.stubEnv("APP_ENV", "staging");
    vi.stubEnv("CLOUDINARY_FOLDER_PREFIX", "staging");

    expect(resolveCloudinaryFolder("seven-seas-cms")).toBe(
      "staging/seven-seas-cms"
    );
    expect(resolveCloudinaryFolder("seven-seas-candidates")).toBe(
      "staging/seven-seas-candidates"
    );
  });

  it("does not treat legacy shared folders as staging-owned", () => {
    vi.stubEnv("APP_ENV", "staging");
    vi.stubEnv("CLOUDINARY_FOLDER_PREFIX", "staging");

    expect(
      isCloudinaryFolderOwnedByCurrentEnvironment(
        "seven-seas-cms"
      )
    ).toBe(false);

    expect(
      isCloudinaryPublicIdOwnedByCurrentEnvironment(
        "seven-seas-cms/legacy-image"
      )
    ).toBe(false);

    expect(
      isCloudinaryPublicIdOwnedByCurrentEnvironment(
        "staging/seven-seas-cms/new-image"
      )
    ).toBe(true);
  });

  it("keeps approved legacy folders owned in production", () => {
    vi.stubEnv("APP_ENV", "production");
    vi.stubEnv("CLOUDINARY_FOLDER_PREFIX", "");

    expect(resolveCloudinaryFolder("seven-seas-cms")).toBe(
      "seven-seas-cms"
    );

    expect(
      isCloudinaryPublicIdOwnedByCurrentEnvironment(
        "seven-seas-cms/production-image"
      )
    ).toBe(true);
  });

  it("rejects a namespace on the production environment", () => {
    vi.stubEnv("APP_ENV", "production");
    vi.stubEnv("CLOUDINARY_FOLDER_PREFIX", "staging");

    expect(() =>
      assertCloudinaryNamespaceConfiguration()
    ).toThrow(
      "Production must not use CLOUDINARY_FOLDER_PREFIX."
    );
  });

  it("rejects arbitrary non-project folders", () => {
    vi.stubEnv("APP_ENV", "qa");
    vi.stubEnv("CLOUDINARY_FOLDER_PREFIX", "");

    expect(() =>
      resolveCloudinaryFolder("untrusted-folder")
    ).toThrow("Cloudinary base folder is not approved.");

    expect(
      isCloudinaryPublicIdOwnedByCurrentEnvironment(
        "untrusted-folder/file"
      )
    ).toBe(false);
  });

  it("checks public IDs against an exact folder path boundary", () => {
    expect(
      isCloudinaryPublicIdInsideFolder(
        "staging/seven-seas-cms/file",
        "staging/seven-seas-cms"
      )
    ).toBe(true);

    expect(
      isCloudinaryPublicIdInsideFolder(
        "staging/seven-seas-cms/nested/file",
        "staging/seven-seas-cms"
      )
    ).toBe(true);

    expect(
      isCloudinaryPublicIdInsideFolder(
        "staging/seven-seas-cms-evil/file",
        "staging/seven-seas-cms"
      )
    ).toBe(false);
  });
});
