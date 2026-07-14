/** Workout logging and session UX preferences. */
export interface WorkoutPreferences {
  defaultRestTimerSeconds: number;
  autoStartRestTimer: boolean;
  showRpePrompt: boolean;
  showWarmupSets: boolean;
  plateCalculatorEnabled: boolean;
  weightIncrement: number;
  soundEnabled: boolean;
  hapticFeedbackEnabled: boolean;
  keepScreenAwake: boolean;
}
