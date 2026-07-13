import { describe, it, expect } from 'vitest';
import { validateCandidateFile } from '../file-validation';

describe('validateCandidateFile', () => {
  it('rejects files exceeding max size', async () => {
    const file = new File(['a'.repeat(3 * 1024 * 1024)], 'test.pdf', { type: 'application/pdf' });
    const result = await validateCandidateFile(file, 2, ['application/pdf']);
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/exceeds the maximum/);
  });

  it('rejects files with unsupported mime types', async () => {
    const file = new File(['fake data'], 'test.txt', { type: 'text/plain' });
    const result = await validateCandidateFile(file, 2, ['application/pdf']);
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/not allowed/);
  });

  it('rejects files with mismatched magic bytes', async () => {
    // Fake PDF (text data instead of PDF magic bytes %PDF)
    const file = new File(['Not a PDF file'], 'test.pdf', { type: 'application/pdf' });
    const result = await validateCandidateFile(file, 2, ['application/pdf']);
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/does not match its expected format/);
  });
});
