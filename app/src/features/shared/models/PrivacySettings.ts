export type ProfileVisibility = "private" | "friends" | "public";

/** Data sharing, visibility, and consent preferences. */
export interface PrivacySettings {
  shareAnalytics: boolean;
  shareCrashReports: boolean;
  profileVisibility: ProfileVisibility;
  showActivityStatus: boolean;
  allowCoachDataAccess: boolean;
  allowProgressPhotoBackup: boolean;
}
