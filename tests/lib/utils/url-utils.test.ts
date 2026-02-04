// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { prependBaseUrl } from "../../../src/lib/utils/url-utils";

describe('url-utils', () => {
  describe('prependBaseUrl', () => {
    it('should return path as-is if baseUrl is empty', () => {
      expect(prependBaseUrl('some/path', '')).toBe('some/path');
    });

    it('should return path as-is if it is an absolute HTTP URL', () => {
      expect(prependBaseUrl('http://example.com/file', '/base')).toBe('http://example.com/file');
    });

    it('should return path as-is if it is an absolute HTTPS URL', () => {
      expect(prependBaseUrl('https://example.com/file', '/base')).toBe('https://example.com/file');
    });

    it('should prepend base URL to relative path', () => {
      expect(prependBaseUrl('path/to/file', '/app')).toBe('/app/path/to/file');
    });

    it('should handle base URL with trailing slash', () => {
      expect(prependBaseUrl('path/to/file', '/app/')).toBe('/app/path/to/file');
    });

    it('should handle path with leading slash', () => {
      expect(prependBaseUrl('/path/to/file', '/app')).toBe('/app/path/to/file');
    });

    it('should handle both base URL trailing slash and path leading slash', () => {
      expect(prependBaseUrl('/path/to/file', '/app/')).toBe('/app/path/to/file');
    });

    it('should handle root base URL', () => {
        // Technically / is mostly empty string equivalent for this logic, but good to check
        // prependBaseUrl('path', '/') -> '/path'
        expect(prependBaseUrl('path', '/')).toBe('/path');
    });
  });
});
