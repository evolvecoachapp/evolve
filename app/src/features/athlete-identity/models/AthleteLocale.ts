/**
 * Immutable athlete locale (Sprint 29.1).
 *
 * BCP-47 language tag foundation — not i18n runtime, not persistence.
 */
export interface AthleteLocale {
  readonly languageTag: string;
  readonly language: string;
  readonly region: string | null;
  readonly script: string | null;
}
