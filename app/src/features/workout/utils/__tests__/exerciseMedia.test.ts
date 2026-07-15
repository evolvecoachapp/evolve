import { ExerciseMediaResolver, buildExerciseMediaSlug, resolveExerciseMedia } from "../exerciseMedia";

describe("exercise media resolver", () => {
  it("resolves registry media for a known exercise slug", () => {
    const media = resolveExerciseMedia({ exerciseName: "Goblet Squat" });

    expect(media.slug).toBe("goblet-squat");
    expect(media.hasThumbnail).toBe(true);
    expect(media.hasAnimation).toBe(false);
    expect(media.hasVideo).toBe(false);
    expect(media.isPlaceholder).toBe(false);
  });

  it("falls back to remote media values when no registry entry is available", () => {
    const media = resolveExerciseMedia({
      exerciseName: "Romanian Deadlift",
      imageUrl: "https://cdn.example.com/romanian-deadlift.jpg",
      videoUrl: "https://cdn.example.com/romanian-deadlift.mp4",
    });

    expect(media.slug).toBe("romanian-deadlift");
    expect(media.thumbnail).toBe("https://cdn.example.com/romanian-deadlift.jpg");
    expect(media.video).toBe("https://cdn.example.com/romanian-deadlift.mp4");
    expect(media.isPlaceholder).toBe(false);
  });

  it("returns placeholder metadata when no media exists", () => {
    const media = resolveExerciseMedia({ exerciseName: "Deadlift" });

    expect(media.hasThumbnail).toBe(false);
    expect(media.hasAnimation).toBe(false);
    expect(media.hasVideo).toBe(false);
    expect(media.isPlaceholder).toBe(true);
    expect(media.fallbackLabel).toBe("Demonstration media coming soon");
  });

  it("builds a clear slug naming convention", () => {
    expect(buildExerciseMediaSlug("Goblet Squat")).toBe("goblet-squat");
    expect(buildExerciseMediaSlug("Bench Press!")).toBe("bench-press");
    expect(buildExerciseMediaSlug("  ")).toBe("exercise");
  });

  it("uses a resolver instance for consistent behavior", () => {
    const resolver = new ExerciseMediaResolver();
    const media = resolver.resolve({ exerciseName: "Bench Press" });

    expect(media.slug).toBe("bench-press");
    expect(media.hasThumbnail).toBe(true);
  });
});
