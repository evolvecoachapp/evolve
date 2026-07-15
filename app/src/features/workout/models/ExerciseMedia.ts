export interface ExerciseMedia {
  slug: string;
  thumbnail: string | null;
  animation: string | null;
  video: string | null;
  hasThumbnail: boolean;
  hasAnimation: boolean;
  hasVideo: boolean;
  isPlaceholder: boolean;
  fallbackLabel: string;
}
