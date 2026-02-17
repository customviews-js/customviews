/**
 * Definition for a placeholder variable.
 * Placeholders allow dynamic value substitution in the UI/Logic.
 */
export interface PlaceholderDefinition {
  name: string;
  settingsLabel?: string | undefined;
  settingsHint?: string | undefined;
  defaultValue?: string | undefined;
  hiddenFromSettings?: boolean | undefined;
  /** If true, this placeholder is only shown in settings if detected on the page */
  isLocal?: boolean | undefined;
  /** Internal tracking of where this definition came from to detect conflicts */
  source?: 'config' | 'tabgroup' | undefined;
  /** The ID of the component (e.g. TabGroup groupId) that registered this placeholder */
  ownerTabGroupId?: string | undefined;
}
