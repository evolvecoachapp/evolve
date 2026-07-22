/**
 * Extensible key/value metadata attached to an achievement.
 */
export interface AchievementMetadata {
  readonly tags: readonly string[];
  readonly attributes: Readonly<Record<string, string | number | boolean>>;
}
