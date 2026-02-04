export type ConfigSectionKey = 'toggles' | 'tabGroups' | 'placeholders';

export function isValidConfigSection(key: string): key is ConfigSectionKey {
  return ['toggles', 'tabGroups', 'placeholders'].includes(key);
}
