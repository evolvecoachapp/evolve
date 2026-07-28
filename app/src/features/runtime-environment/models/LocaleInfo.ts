/**
 * Immutable locale descriptors for Runtime Environment (Sprint 29.2).
 */
export interface LocaleInfo {
  readonly languageTag: string;
  readonly language: string;
  readonly region: string | null;
  readonly script: string | null;
}
