import { describe, expect, it } from 'vitest';
import { safeJsonParse } from '../../repositories/prisma-content-repository';

describe('CMS Parser', () => {
  it('Valid existing CMS JSON parses successfully', () => {
    const validJson = JSON.stringify({ type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Hello' }] }] });
    const result = safeJsonParse(validJson, 'test', {});
    expect(result).toEqual({ type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Hello' }] }] });
  });

  it('Empty CMS content is handled safely', () => {
    expect(safeJsonParse('', 'test', {})).toEqual({});
    expect(safeJsonParse(null, 'test', {})).toEqual({});
  });

  it('Malformed JSON does not crash the page', () => {
    expect(safeJsonParse('{bad json', 'test', {})).toEqual({});
  });

  it('Unsupported block type is handled safely', () => {
    const unsupported = JSON.stringify({ type: 'unknownBlock', text: 'Test' });
    const result = safeJsonParse(unsupported, 'test', {});
    expect(result).toEqual({ type: 'unknownBlock', text: 'Test' });
  });

  it('A collection containing valid and malformed blocks preserves the valid sibling blocks', () => {
    const blocks = [
      '{ "type": "paragraph" }',
      '{bad json',
      '{ "type": "image" }'
    ];
    const parsed = blocks.map(b => safeJsonParse(b, 'testBlock', {}));
    expect(parsed).toEqual([
      { type: 'paragraph' },
      {}, // malformed fallback
      { type: 'image' }
    ]);
  });

  it('English CMS text remains unchanged', () => {
    const text = "Seven Seas Intercontinental Services";
    // Usually rich text is stored as JSON string, but if plain text gets passed:
    expect(safeJsonParse(JSON.stringify(text), 'test', {})).toEqual(text);
  });

  it('Nepali CMS text remains unchanged', () => {
    const text = "सेभेन सिज इन्टरकन्टिनेन्टल सर्भिसेज";
    expect(safeJsonParse(JSON.stringify(text), 'test', {})).toEqual(text);
  });

  it('Invalid block collections return an array-compatible safe fallback, not an unrelated object', () => {
    // Pass [] as fallback for collection expectations
    expect(safeJsonParse('{broken collection', 'collectionTest', [])).toEqual([]);
    expect(safeJsonParse(null, 'collectionTest', [])).toEqual([]);
  });

  it('No raw CMS JSON, stack trace or internal parser error is returned publicly', () => {
    const result = safeJsonParse('{broken', 'testField', {});
    expect(result).toEqual({});
    // It emits a logger warning but returns safe {} payload.
  });
});
