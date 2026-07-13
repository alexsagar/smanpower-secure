export async function validateCandidateFile(file: File, maxSizeMb: number, allowedMimeTypes: string[]): Promise<{ valid: boolean, error?: string }> {
  if (file.size === 0) {
    return { valid: false, error: 'File is empty.' };
  }

  const maxSizeBytes = maxSizeMb * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    return { valid: false, error: `File exceeds the maximum allowed size of ${maxSizeMb}MB.` };
  }

  if (!allowedMimeTypes.includes(file.type)) {
    return { valid: false, error: `File type ${file.type} is not allowed.` };
  }

  const expectedTypes: string[] = [];
  if (file.type === 'application/pdf') expectedTypes.push('pdf');
  if (file.type === 'image/jpeg') expectedTypes.push('jpg');
  if (file.type === 'image/png') expectedTypes.push('png');

  if (expectedTypes.length === 0) {
    return { valid: false, error: 'Unsupported file type.' };
  }

  // Read magic bytes
  const buffer = await file.slice(0, 4).arrayBuffer();
  const uint8 = new Uint8Array(buffer);
  const hex = Array.from(uint8).map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase();
  
  let signatureMatch = false;
  if (expectedTypes.includes("pdf") && hex.startsWith("25504446")) signatureMatch = true;
  if (expectedTypes.includes("png") && hex.startsWith("89504E47")) signatureMatch = true;
  if (expectedTypes.includes("jpg") && hex.startsWith("FFD8FF")) signatureMatch = true;

  if (!signatureMatch) {
    return { valid: false, error: 'File content does not match its expected format (possible fake or corrupted file).' };
  }

  return { valid: true };
}
