export interface PlaceholderDefinition {
  name: string;
  settingsLabel?: string | undefined;
  settingsHint?: string | undefined;
  defaultValue?: string | undefined;
}

export class PlaceholderRegistryStore {
  definitions = $state<PlaceholderDefinition[]>([]);

  register(def: PlaceholderDefinition) {
    console.log('[PlaceholderRegistryStore] Register called with:', def);
    const existingIndex = this.definitions.findIndex(d => d.name === def.name);
    if (existingIndex !== -1) {
      this.definitions[existingIndex] = def;
    } else {
      this.definitions.push(def);
    }
  }
}

export const placeholderRegistryStore = new PlaceholderRegistryStore();
