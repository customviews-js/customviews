import { describe, it, expect } from 'vitest';
import { TabManager } from '../../src/core/tab-manager';

describe('TabManager.splitTabIds', () => {
  it('splits space-separated IDs', () => {
    const result = TabManager['splitTabIds']('linux mac');
    expect(result).toEqual(['linux', 'mac']);
  });

  it('splits pipe-separated IDs', () => {
    expect(TabManager['splitTabIds']('linux|mac')).toEqual(['linux', 'mac']);
  });

  it('splits mixed space and pipe', () => {
    expect(TabManager['splitTabIds']('linux | mac windows')).toEqual(['linux', 'mac', 'windows']);
  });

  it('trims whitespace', () => {
    expect(TabManager['splitTabIds']('  linux   |  mac  ')).toEqual(['linux', 'mac']);
  });

  it('returns single ID', () => {
    expect(TabManager['splitTabIds']('windows')).toEqual(['windows']);
  });

  it('returns empty array for empty string', () => {
    expect(TabManager['splitTabIds']('')).toEqual([]);
  });
});
