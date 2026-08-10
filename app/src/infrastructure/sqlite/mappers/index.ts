import type { PersistenceRecord } from "../../../core/persistence/contracts/PersistenceRecord";
import { ValidationError } from "../../../core/persistence/errors";
import {
  AthleteIdentitySerializer,
  CoachTimelineSerializer,
  RuntimeEnvironmentSerializer,
  WorkspaceSerializer,
  WorkspaceSnapshotSerializer,
  getRecordPayload,
  type DomainSerializer,
} from "../../repositories/serialization";
import { createSQLiteRow, type SQLiteRow } from "./SQLiteRow";

/**
 * Pure PersistenceRecord ↔ SQLiteRow mapping helpers.
 */

function assertRecordId(record: PersistenceRecord | null | undefined): string {
  if (!record || typeof record.id !== "string" || record.id.trim().length === 0) {
    throw new ValidationError(["Invalid PersistenceRecord.id"]);
  }
  return record.id;
}

function assertRowShape(row: SQLiteRow | null | undefined): SQLiteRow {
  if (!row || typeof row.id !== "string" || row.id.trim().length === 0) {
    throw new ValidationError(["Invalid SQLiteRow.id"]);
  }
  if (typeof row.payload !== "string") {
    throw new ValidationError(["Invalid SQLiteRow.payload"]);
  }
  return row;
}

export function mapRecordToRow(record: PersistenceRecord): SQLiteRow {
  const id = assertRecordId(record);
  return createSQLiteRow({ id, payload: "{}" });
}

export function mapRowToRecord(row: SQLiteRow): PersistenceRecord {
  const validRow = assertRowShape(row);
  return Object.freeze({ id: validRow.id });
}

function createDomainMapper<T>(
  name: string,
  serializer: DomainSerializer<T>,
) {
  return Object.freeze({
    name,
    toRow(record: PersistenceRecord): SQLiteRow {
      const id = assertRecordId(record);
      const payload = getRecordPayload<T>(record);
      return createSQLiteRow({
        id,
        payload: payload ? serializer.serialize(payload) : "{}",
      });
    },
    toRecord(row: SQLiteRow): PersistenceRecord {
      const validRow = assertRowShape(row);
      const domain = serializer.deserialize(validRow.payload);
      if (domain) {
        return Object.freeze({ id: validRow.id, payload: domain });
      }
      return Object.freeze({ id: validRow.id });
    },
  });
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
export const IdentityMapper = createDomainMapper(
  "IdentityMapper",
  AthleteIdentitySerializer,
);
export const WorkspaceMapper = createDomainMapper(
  "WorkspaceMapper",
  WorkspaceSerializer,
);
export const SnapshotMapper = createDomainMapper(
  "SnapshotMapper",
  WorkspaceSnapshotSerializer,
);
export const TimelineMapper = createDomainMapper(
  "TimelineMapper",
  CoachTimelineSerializer,
);
export const WorkoutMapper = createNamedMapper("WorkoutMapper");
export const NutritionMapper = createNamedMapper("NutritionMapper");
export const RecoveryMapper = createNamedMapper("RecoveryMapper");
export const SettingsMapper = createNamedMapper("SettingsMapper");
export const RuntimeMapper = createDomainMapper(
  "RuntimeMapper",
  RuntimeEnvironmentSerializer,
);
