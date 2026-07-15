import type { ExerciseMedia } from "../models/ExerciseMedia";

interface ExerciseMediaInput {
  exerciseName: string;
  imageUrl?: string | null;
  videoUrl?: string | null;
}

interface ExerciseMediaRegistryEntry {
  thumbnail?: string;
  animation?: string;
  video?: string;
}

const FALLBACK_LABEL = "Demonstration media coming soon";

const exerciseMediaRegistry: Record<string, ExerciseMediaRegistryEntry> = {
  "goblet-squat": {
    thumbnail: "goblet-squat-thumbnail",
  },
  "bench-press": {
    thumbnail: "bench-press-thumbnail",
  },
};

export function buildExerciseMediaSlug(exerciseName: string): string {
  const slug = exerciseName
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return slug || "exercise";
}

export function resolveExerciseMedia(input: ExerciseMediaInput): ExerciseMedia {
  const slug = buildExerciseMediaSlug(input.exerciseName);
  const registryEntry = exerciseMediaRegistry[slug];

  const thumbnail = input.imageUrl ?? registryEntry?.thumbnail ?? null;
  const animation = registryEntry?.animation ?? null;
  const video = input.videoUrl ?? registryEntry?.video ?? null;

  const hasThumbnail = Boolean(thumbnail);
  const hasAnimation = Boolean(animation);
  const hasVideo = Boolean(video);
  const isPlaceholder = !hasThumbnail && !hasAnimation && !hasVideo;

  return {
    slug,
    thumbnail,
    animation,
    video,
    hasThumbnail,
    hasAnimation,
    hasVideo,
    isPlaceholder,
    fallbackLabel: FALLBACK_LABEL,
  };
}

export class ExerciseMediaResolver {
  resolve(input: ExerciseMediaInput): ExerciseMedia {
    return resolveExerciseMedia(input);
  }
}
