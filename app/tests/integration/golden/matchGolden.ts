import * as fs from "fs";
import * as path from "path";
import type { WorkoutGenerationResult } from "../../../src/features/program-generation/models/WorkoutGenerationResult";
import { assertSnapshotsEqual } from "../utils/compareSnapshots";
import {
  normalizeWorkoutSnapshot,
  parseSnapshot,
  serializeSnapshot,
} from "../snapshots/normalizeSnapshot";
import type { NormalizedWorkoutSnapshot } from "../shared/types";

const GOLDEN_DIR = path.join(__dirname);

export function getGoldenPath(scenarioId: string): string {
  return path.join(GOLDEN_DIR, `${scenarioId}.golden.json`);
}

export function readGolden(scenarioId: string): NormalizedWorkoutSnapshot {
  const filePath = getGoldenPath(scenarioId);
  if (!fs.existsSync(filePath)) {
    throw new Error(
      `Missing golden snapshot: ${filePath}. Run with UPDATE_GOLDEN=1 to create.`,
    );
  }
  return parseSnapshot<NormalizedWorkoutSnapshot>(
    fs.readFileSync(filePath, "utf8"),
  );
}

export function writeGolden(
  scenarioId: string,
  snapshot: NormalizedWorkoutSnapshot,
): void {
  const filePath = getGoldenPath(scenarioId);
  fs.writeFileSync(filePath, serializeSnapshot(snapshot), "utf8");
}

/**
 * Compare a pipeline result against the committed golden snapshot.
 * Set UPDATE_GOLDEN=1 to rewrite the golden file.
 */
export function matchGolden(
  scenarioId: string,
  result: WorkoutGenerationResult,
): NormalizedWorkoutSnapshot {
  const actual = normalizeWorkoutSnapshot(result, { scenarioId });
  const shouldUpdate =
    process.env.UPDATE_GOLDEN === "1" || process.env.UPDATE_GOLDEN === "true";

  if (shouldUpdate) {
    writeGolden(scenarioId, actual);
  }

  const expected = readGolden(scenarioId);
  assertSnapshotsEqual(actual, expected, `golden:${scenarioId}`);
  return actual;
}

export function listGoldenFiles(): readonly string[] {
  return fs
    .readdirSync(GOLDEN_DIR)
    .filter((name) => name.endsWith(".golden.json"))
    .sort();
}
