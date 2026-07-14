export type ProgressStatusLevel = "on_track" | "ahead" | "behind" | "plateau" | "starting";

/** Overall progress trajectory for the user. */
export interface ProgressStatus {
  level: ProgressStatusLevel;
  label: string;
  summary: string;
}
