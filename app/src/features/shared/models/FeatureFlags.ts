/** Remote-configurable feature toggles — keys are explicit for compile-time safety. */
export interface FeatureFlags {
  coachStreaming: boolean;
  barcodeScanner: boolean;
  progressPhotos: boolean;
  socialSharing: boolean;
  offlineMode: boolean;
  betaNutritionAi: boolean;
  advancedRecovery: boolean;
  workoutTemplates: boolean;
}

export type FeatureFlagKey = keyof FeatureFlags;
