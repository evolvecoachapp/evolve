import type { CoachExercise } from "../models/CoachExercise";
import type { CoachSection } from "../models/CoachSection";
import { CoachSectionKinds } from "../models/CoachSection";
import { freezeExercise } from "../utils/freezeObjects";
import { slugId, stripBulletPrefix } from "../utils/formattingHelpers";
import {
  extractBulletLines,
  findSectionContent,
} from "./sectionHelpers";

/**
 * Parse exercise lines.
 * Supported shapes: "Back Squat | 3 | 5" or "Back Squat — 3x5 — notes"
 */
export class ExerciseParser {
  parse(sections: readonly CoachSection[]): readonly CoachExercise[] {
    const content =
      findSectionContent(sections, CoachSectionKinds.EXERCISES) ?? "";
    if (!content.trim()) {
      return Object.freeze([]);
    }

    return Object.freeze(
      extractBulletLines(content).map((line, index) => {
        const text = stripBulletPrefix(line);
        const pipeParts = text.split("|").map((p) => p.trim());
        if (pipeParts.length >= 2) {
          const sets = Number(pipeParts[1]);
          return freezeExercise({
            id: slugId("exercise", index),
            name: pipeParts[0],
            sets: Number.isFinite(sets) ? sets : null,
            reps: pipeParts[2] ?? null,
            notes: pipeParts[3] ?? null,
          });
        }

        const xMatch = text.match(
          /^(.+?)\s*[—\-–]\s*(\d+)\s*[x×]\s*([^\s—\-–]+)(?:\s*[—\-–]\s*(.+))?$/i,
        );
        if (xMatch) {
          return freezeExercise({
            id: slugId("exercise", index),
            name: xMatch[1].trim(),
            sets: Number(xMatch[2]),
            reps: xMatch[3].trim(),
            notes: xMatch[4]?.trim() ?? null,
          });
        }

        return freezeExercise({
          id: slugId("exercise", index),
          name: text,
          sets: null,
          reps: null,
          notes: null,
        });
      }),
    );
  }
}

export const exerciseParser = new ExerciseParser();
