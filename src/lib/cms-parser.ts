import { z } from 'zod';

export type CmsParseWarning = {
  blockKey?: string;
  issue: string;
};

export type CmsParseResult<T> = 
  | { success: true; data: T; warnings: CmsParseWarning[] }
  | { success: false; data: null; warnings: CmsParseWarning[] };

/**
 * Safely parse a JSON string or unknown object.
 * If parsing fails completely, it returns a failed result instead of throwing.
 */
export function safeCmsParse<T>(
  data: unknown, 
  schema: z.ZodType<T>, 
  contextName: string = 'unknown'
): CmsParseResult<T> {
  let parsedJson = data;

  if (typeof data === 'string') {
    try {
      parsedJson = JSON.parse(data);
    } catch (e) {
      return {
        success: false,
        data: null,
        warnings: [{ issue: `Invalid JSON string for ${contextName}` }]
      };
    }
  }

  const result = schema.safeParse(parsedJson);

  if (!result.success) {
    return {
      success: false,
      data: null,
      warnings: [{ issue: `Schema validation failed for ${contextName}: ${result.error.message}` }]
    };
  }

  return {
    success: true,
    data: result.data,
    warnings: [] // No warnings for a fully valid block based on the schema
  };
}
