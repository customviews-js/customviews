// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest';
import { calculateNewSelection, isGenericWrapper, isExcluded } from '$features/share/share-logic';
import { CV_SHARE_IGNORE_ATTRIBUTE } from '$lib/exclusion-defaults';
import { SvelteSet } from 'svelte/reactivity';

describe('share-logic', () => {
  describe('isGenericWrapper', () => {
    it('should identify elements with generic IDs', () => {
      const el = document.createElement('div');
      el.id = 'flex-body';
      expect(isGenericWrapper(el)).toBe(true);
    });

    it('should identify plain divs with no styling/ID', () => {
      const el = document.createElement('div');
      document.body.appendChild(el);
      expect(isGenericWrapper(el)).toBe(true);
      document.body.removeChild(el);
    });

    it('should NOT identify elements with meaningful tags', () => {
      const el = document.createElement('section');
      expect(isGenericWrapper(el)).toBe(false);
    });

    it('should NOT identify elements with custom IDs', () => {
      const el = document.createElement('div');
      el.id = 'my-specific-content';
      expect(isGenericWrapper(el)).toBe(false);
    });
  });

  describe('calculateNewSelection', () => {
    let container: HTMLElement;
    let parent: HTMLElement;
    let child1: HTMLElement;
    let child2: HTMLElement;

    beforeEach(() => {
      container = document.createElement('div');
      parent = document.createElement('div');
      child1 = document.createElement('p');
      child2 = document.createElement('p');

      parent.appendChild(child1);
      parent.appendChild(child2);
      container.appendChild(parent);
    });

    it('should add element if selection is empty', () => {
      const current = new SvelteSet<HTMLElement>();
      const { updatedSelection, changesMade } = calculateNewSelection(current, child1);

      expect(changesMade).toBe(true);
      expect(updatedSelection.size).toBe(1);
      expect(updatedSelection.has(child1)).toBe(true);
    });

    it('should remove element if already selected (toggle)', () => {
      const current = new SvelteSet<HTMLElement>([child1]);
      const { updatedSelection, changesMade } = calculateNewSelection(current, child1);

      expect(changesMade).toBe(true);
      expect(updatedSelection.size).toBe(0);
    });

    it('should ignore selection if ancestor is already selected (Scenario B)', () => {
      const current = new SvelteSet<HTMLElement>([parent]);
      const { updatedSelection, changesMade } = calculateNewSelection(current, child1);

      expect(changesMade).toBe(false);
      expect(updatedSelection.size).toBe(1);
      expect(updatedSelection.has(parent)).toBe(true);
      expect(updatedSelection.has(child1)).toBe(false);
    });

    it('should replace children if parent is selected (Scenario A)', () => {
      const current = new SvelteSet<HTMLElement>([child1, child2]);
      const { updatedSelection, changesMade } = calculateNewSelection(current, parent);

      expect(changesMade).toBe(true);
      expect(updatedSelection.size).toBe(1);
      expect(updatedSelection.has(parent)).toBe(true);
      expect(updatedSelection.has(child1)).toBe(false);
      expect(updatedSelection.has(child2)).toBe(false);
    });

    it('should add independent elements', () => {
      const independent = document.createElement('span');
      container.appendChild(independent);

      const current = new SvelteSet<HTMLElement>([child1]);
      const { updatedSelection, changesMade } = calculateNewSelection(current, independent);

      expect(changesMade).toBe(true);
      expect(updatedSelection.size).toBe(2);
      expect(updatedSelection.has(child1)).toBe(true);
      expect(updatedSelection.has(independent)).toBe(true);
    });
  });

  describe('isExcluded', () => {

    it('should exclude elements with data share ignore attribute', () => {
      const el = document.createElement('div');
      el.setAttribute(CV_SHARE_IGNORE_ATTRIBUTE, '');
      expect(isExcluded(el)).toBe(true);
    });

    it('should exclude children of elements with data share ignore attribute', () => {
      const parent = document.createElement('div');
      parent.setAttribute(CV_SHARE_IGNORE_ATTRIBUTE, '');
      const child = document.createElement('div');
      parent.appendChild(child);
      expect(isExcluded(child)).toBe(true);
    });

    it('should NOT exclude normal elements', () => {
      const el = document.createElement('div');
      expect(isExcluded(el)).toBe(false);
    });

    it('should exclude matched tags', () => {
      const el = document.createElement('nav');
      const excludedTags = new Set(['NAV']);
      expect(isExcluded(el, excludedTags)).toBe(true);
    });

    it('should exclude matched IDs', () => {
      const el = document.createElement('div');
      el.id = 'my-id';
      const excludedIds = new Set(['my-id']);
      expect(isExcluded(el, undefined, excludedIds)).toBe(true);
    });
  });
});
