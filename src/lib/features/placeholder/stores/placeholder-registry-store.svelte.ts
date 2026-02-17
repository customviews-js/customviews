import { SvelteMap } from 'svelte/reactivity';
import type { PlaceholderDefinition } from '../types';

export class PlaceholderRegistryStore {
  // Reactivity: Map is deeply reactive in Svelte 5 with $state
  private _definitions = new SvelteMap<string, PlaceholderDefinition>();

  // Public getter for array access
  get definitions(): PlaceholderDefinition[] {
    return Array.from(this._definitions.values());
  }

  register(def: PlaceholderDefinition) {
    if (this._definitions.has(def.name)) {
      this.updateExisting(def);
    } else {
      this.addNew(def);
    }
  }

  get(name: string): PlaceholderDefinition | undefined {
    return this._definitions.get(name);
  }

  has(name: string): boolean {
    return this._definitions.has(name);
  }

  private updateExisting(newDef: PlaceholderDefinition) {
    const existing = this._definitions.get(newDef.name);
    if (existing && this.hasChanged(existing, newDef)) {
      this._definitions.set(newDef.name, newDef);
    }
  }

  private addNew(def: PlaceholderDefinition) {
    this._definitions.set(def.name, def);
  }

  private hasChanged(existing: PlaceholderDefinition, newDef: PlaceholderDefinition): boolean {
    return (
      existing.settingsLabel !== newDef.settingsLabel ||
      existing.settingsHint !== newDef.settingsHint ||
      existing.defaultValue !== newDef.defaultValue ||
      existing.hiddenFromSettings !== newDef.hiddenFromSettings ||
      existing.isLocal !== newDef.isLocal
    );
  }
}

export const placeholderRegistryStore = new PlaceholderRegistryStore();
