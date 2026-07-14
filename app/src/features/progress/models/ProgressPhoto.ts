export type ProgressPhotoAngle = "front" | "side" | "back";

/** Progress photo captured for visual tracking. */
export interface ProgressPhoto {
  id: string;
  uri: string;
  date: string;
  angle: ProgressPhotoAngle;
  note?: string;
}
