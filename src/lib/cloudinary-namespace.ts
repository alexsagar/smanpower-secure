const BASE_PROJECT_FOLDER_PATTERN =
  /^seven-seas(?:-[a-z0-9]+)*$/;

const NAMESPACE_PATTERN =
  /^[a-z0-9](?:[a-z0-9_-]*[a-z0-9])?$/;

export function getCloudinaryFolderPrefix(): string | null {
  const value = process.env.CLOUDINARY_FOLDER_PREFIX?.trim();

  if (!value) {
    return null;
  }

  if (!NAMESPACE_PATTERN.test(value)) {
    throw new Error(
      "CLOUDINARY_FOLDER_PREFIX must contain only lowercase letters, numbers, underscores, or hyphens."
    );
  }

  return value;
}

export function assertCloudinaryNamespaceConfiguration(): void {
  const appEnv = process.env.APP_ENV;
  const prefix = getCloudinaryFolderPrefix();

  if (appEnv === "staging" && prefix !== "staging") {
    throw new Error(
      'Staging requires CLOUDINARY_FOLDER_PREFIX="staging".'
    );
  }

  if (appEnv === "production" && prefix !== null) {
    throw new Error(
      "Production must not use CLOUDINARY_FOLDER_PREFIX."
    );
  }
}

export function isApprovedCloudinaryBaseFolder(
  folder: string
): boolean {
  return BASE_PROJECT_FOLDER_PATTERN.test(folder);
}

export function resolveCloudinaryFolder(
  baseFolder: string
): string {
  if (!isApprovedCloudinaryBaseFolder(baseFolder)) {
    throw new Error("Cloudinary base folder is not approved.");
  }

  assertCloudinaryNamespaceConfiguration();

  const prefix = getCloudinaryFolderPrefix();

  return prefix ? `${prefix}/${baseFolder}` : baseFolder;
}

export function isCloudinaryFolderOwnedByCurrentEnvironment(
  folder: string
): boolean {
  const normalized = folder.trim().replace(/^\/+|\/+$/g, "");

  if (!normalized) {
    return false;
  }

  assertCloudinaryNamespaceConfiguration();

  const prefix = getCloudinaryFolderPrefix();

  if (!prefix) {
    const [baseFolder] = normalized.split("/");
    return Boolean(baseFolder) && isApprovedCloudinaryBaseFolder(baseFolder);
  }

  const expectedPrefix = `${prefix}/`;

  if (!normalized.startsWith(expectedPrefix)) {
    return false;
  }

  const [baseFolder] = normalized.slice(expectedPrefix.length).split("/");

  return (
    Boolean(baseFolder) && isApprovedCloudinaryBaseFolder(baseFolder)
  );
}

export function isCloudinaryPublicIdOwnedByCurrentEnvironment(
  publicId: string
): boolean {
  const normalized = publicId.trim().replace(/^\/+|\/+$/g, "");
  const finalSlashIndex = normalized.lastIndexOf("/");

  if (finalSlashIndex <= 0) {
    return false;
  }

  const folder = normalized.slice(0, finalSlashIndex);
  const assetName = normalized.slice(finalSlashIndex + 1);

  if (!assetName || assetName === "." || assetName === "..") {
    return false;
  }

  return isCloudinaryFolderOwnedByCurrentEnvironment(folder);
}

export function isCloudinaryPublicIdInsideFolder(
  publicId: string,
  expectedFolder: string
): boolean {
  const normalizedPublicId = publicId.trim().replace(/^\/+|\/+$/g, "");
  const normalizedFolder = expectedFolder.trim().replace(/^\/+|\/+$/g, "");

  if (!normalizedPublicId || !normalizedFolder) {
    return false;
  }

  return (
    normalizedPublicId.startsWith(`${normalizedFolder}/`) &&
    normalizedPublicId.length > normalizedFolder.length + 1
  );
}
