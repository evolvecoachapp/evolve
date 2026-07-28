import type { PersistenceRecord } from "../../../core/persistence/contracts/PersistenceRecord";
import { ValidationError } from "../../../core/persistence/errors";
import { createSQLiteRow, type SQLiteRow } from "./SQLiteRow";

/**
 * Pure PersistenceRecord ↔ SQLiteRow mapping helpers.
 */

export function mapRecordToRow(record: PersistenceRecord): SQLiteRow {
  if (!record || typeof record.id !== "string" || record.id.trim().length === 0) {
    throw new ValidationError(["Invalid PersistenceRecord.id"]);
  }
  return createSQLiteRow({ id: record.id, payload: "{}" });
}

export function mapRowToRecord(row: SQLiteRow): PersistenceRecord {
  if (!row || typeof row.id !== "string" || row.id.trim().length === 0) {
    throw new ValidationError(["Invalid SQLiteRow.id"]);
  }
  if (typeof row.payload !== "string") {
    throw new ValidationError(["Invalid SQLiteRow.payload"]);
  }
  return Object.freeze({ id: row.id });
}

function createNamedMapper(name: string) {
  return Object.freeze({
    name,
    toRow(record: PersistenceRecord): SQLiteRow {
      return mapRecordToRow(record);
    },
    toRecord(row: SQLiteRow): PersistenceRecord {
      return mapRowToRecord(row);
    },
  });
}

export type PersistenceMapper = ReturnType<typeof createNamedMapper>;

export const AthleteMapper = createNamedMapper("AthleteMapper");
export const IdentityMapper = createNamedMapper("IdentityMapper");
export const WorkspaceMapper = createNamedMapper("WorkspaceMapper");
export const SnapshotMapper = createNamedMapper("SnapshotMapper");
export const TimelineMapper = createNamedMapper("TimelineMapper");
export const WorkoutMapper = createNamedMapper("WorkoutMapper");
export const NutritionMapper = createNamedMapper("NutritionMapper");
export const RecoveryMapper = createNamedMapper("RecoveryMapper");
export const SettingsMapper = createNamedMapper("SettingsMapper");
export const RuntimeMapper = createNamedMapper("RuntimeMapper");
