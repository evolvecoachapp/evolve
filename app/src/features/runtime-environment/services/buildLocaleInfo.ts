import type { LocaleInfo } from "../models/LocaleInfo";

export interface BuildLocaleInfoInput {
  readonly languageTag: string;
  readonly language?: string | null;
  readonly region?: string | null;
  readonly script?: string | null;
}

/**
 * Builds an immutable LocaleInfo from explicit locale fields.
 */
export function buildLocaleInfo(input: BuildLocaleInfoInput): LocaleInfo {
  const languageTag = input.languageTag.trim();
  const parts = languageTag.split(/[-_]/);
  const language = (input.language ?? parts[0] ?? "").trim().toLowerCase();
  const region =
    input.region !== undefined
      ? input.region
      : parts.length >= 2
        ? parts[parts.length - 1]!.toUpperCase()
        : null;
  const script =
    input.script !== undefined
      ? input.script
      : parts.length === 3
        ? parts[1]!
        : null;

  return Object.freeze({
    languageTag,
    language,
    region: region && region.length > 0 ? region : null,
    script: script && script.length > 0 ? script : null,
  });
}
