import {
  calculateSelectionScore,
  mergeScoreParts,
} from "../calculateSelectionScore";
import { detectDuplicateIds, dedupeById } from "../detectDuplicates";
import { difficultyRank, isDifficultyWithinCap } from "../difficultyRank";
import {
  mapFocusToMovementPatterns,
  mapPriorityToGoalCodes,
} from "../mapFocusToMovementPatterns";
import { normalizeCandidate } from "../normalizeCandidate";
import { rankCandidates } from "../rankCandidates";
import {
  compareCandidatesByScoreThenId,
  sortByIdAsc,
} from "../sortDeterministically";
import { createExerciseDefinition } from "../../../exercise-kb/testSupport/fixtures";
import { buildSelectionContext } from "../buildSelectionContext";
import { createUpperBodySelectionRequest } from "../../testSupport/fixtures";
import { createEmptySelectionScore } from "../../models/SelectionScore";

describe("selection utilities", () => {
  it("maps focus areas to movement patterns deterministically", () => {
    expect(mapFocusToMovementPatterns("push")).toEqual([
      "horizontal_push",
      "vertical_push",
    ]);
    expect(mapFocusToMovementPatterns("legs")).toEqual([
      "squat",
      "hinge",
      "lunge",
    ]);
  });

  it("maps priorities to goal codes", () => {
    expect(mapPriorityToGoalCodes("hypertrophy", "strength")).toEqual([
      "hypertrophy",
      "strength",
    ]);
  });

  it("builds selection context from a request", () => {
    const context = buildSelectionContext(createUpperBodySelectionRequest());
    expect(context.dayId).toBe("day-upper");
    expect(context.requiredMovementPatterns).toContain("horizontal_push");
    expect(context.goalCodes).toContain("hypertrophy");
  });

  it("ranks difficulty levels", () => {
    expect(difficultyRank("beginner")).toBeLessThan(difficultyRank("expert"));
    expect(isDifficultyWithinCap("advanced", "intermediate")).toBe(false);
    expect(isDifficultyWithinCap("beginner", "intermediate")).toBe(true);
  });

  it("calculates and merges selection scores", () => {
    const score = calculateSelectionScore({
      movementPattern: 4,
      equipment: 3,
      goal: 2,
    });
    expect(score.total).toBe(9);

    const merged = mergeScoreParts(
      { movementPattern: 4 },
      { equipment: 3 },
      { goal: 1.5 },
    );
    expect(merged.total).toBe(8.5);
  });

  it("sorts deterministically by id and score", () => {
    const sorted = sortByIdAsc([{ id: "b" }, { id: "a" }, { id: "c" }]);
    expect(sorted.map((entry) => entry.id)).toEqual(["a", "b", "c"]);

    expect(
      compareCandidatesByScoreThenId(
        { exerciseId: "a", score: { total: 1 } },
        { exerciseId: "b", score: { total: 2 } },
      ),
    ).toBeGreaterThan(0);
  });

  it("detects and dedupes duplicate ids", () => {
    expect(detectDuplicateIds(["a", "b", "a", "c", "b"])).toEqual(["a", "b"]);
    expect(
      dedupeById([{ id: "a" }, { id: "b" }, { id: "a" }]).map((e) => e.id),
    ).toEqual(["a", "b"]);
  });

  it("normalizes and ranks candidates", () => {
    const exercise = createExerciseDefinition({
      id: "x",
      name: "X",
      movementPattern: "squat",
      primaryMuscles: ["quads"],
      equipment: ["barbell"],
      pushPullLegs: "legs",
      fatigueScore: 5,
      jointStress: 4,
      axialLoading: false,
    });

    const normalized = normalizeCandidate({
      exercise,
      role: "primary",
      score: createEmptySelectionScore(),
    });
    expect(normalized.exerciseId).toBe("x");
    expect(Object.isFrozen(normalized)).toBe(true);

    const ranked = rankCandidates(
      [
        {
          exerciseId: "b",
          exercise,
          score: calculateSelectionScore({ movementPattern: 1 }),
          reasons: [],
        },
        {
          exerciseId: "a",
          exercise: { ...exercise, id: "a" },
          score: calculateSelectionScore({ movementPattern: 1 }),
          reasons: [],
        },
      ],
      "primary",
      2,
    );
    expect(ranked.map((entry) => entry.exerciseId)).toEqual(["a", "b"]);
    expect(ranked[0]?.rank).toBe(1);
  });
});
