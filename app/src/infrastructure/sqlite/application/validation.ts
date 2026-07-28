import { ValidationError } from "../../../core/persistence/errors";
import type { PersistenceRecord } from "../../../core/persistence/contracts/PersistenceRecord";
import type { SQLiteConnection } from "../connection/SQLiteConnection";
import type { SQLiteAdapter } from "./SQLiteAdapter";
import type { SQLiteRepositories } from "../repositories";
import {
  AthleteMapper,
  IdentityMapper,
  WorkspaceMapper,
  SnapshotMapper,
  TimelineMapper,
  WorkoutMapper,
  NutritionMapper,
  RecoveryMapper,
  SettingsMapper,
  RuntimeMapper,
  mapRecordToRow,
  mapRowToRecord,
} from "../mappers";
import { createSQLiteRow } from "../mappers/SQLiteRow";

export interface SQLiteValidation {
  readonly valid: boolean;
  readonly errors: readonly string[];
}

function freezeValidation(errors: readonly string[]): SQLiteValidation {
  return Object.freeze({
    valid: errors.length === 0,
    errors: Object.freeze([...errors]),
  });
}

const REQUIRED_REPOSITORIES = [
  "athlete",
  "identity",
  "workspace",
  "snapshot",
  "timeline",
  "workout",
  "nutrition",
  "recovery",
  "settings",
  "runtime",
] as const;

/**
 * Validate SQLite adapter integrity.
 */
export function validateSQLiteAdapter(input: {
  readonly connection?: SQLiteConnection | null;
  readonly adapter?: SQLiteAdapter | null;
  readonly repositories?: SQLiteRepositories | null;
}): SQLiteValidation {
  const errors: string[] = [];

  if (!input.connection) {
    errors.push("Missing connection");
  } else if (!input.connection.isConnected()) {
    errors.push("Connection is closed");
  }

  if (!input.adapter) {
    errors.push("Missing SQLiteAdapter");
  } else if (input.adapter.adapterId !== "storage") {
    errors.push("Invalid adapterId: expected storage");
  }

  if (!input.repositories) {
    errors.push("Missing repository registration");
  } else {
    for (const key of REQUIRED_REPOSITORIES) {
      const repo = input.repositories[key];
      if (!repo) {
        errors.push(`Missing repository: ${key}`);
        continue;
      }
      if (repo.repositoryId !== key) {
        errors.push(`Contract compliance failure: ${key}`);
      }
    }
  }

  // Invalid transaction probe
  if (input.connection?.isConnected()) {
    const bogus = Object.freeze({
      sessionId: "invalid",
      startedAt: new Date().toISOString(),
      status: "open" as const,
      backendId: "sqlite" as const,
    });
    const commit = input.connection.transactions.commit(bogus);
    if (commit.success) {
      errors.push("Invalid transaction accepted");
    }
  }

  // Invalid mapping probe
  try {
    mapRecordToRow({ id: "" } as PersistenceRecord);
    errors.push("Invalid mapping accepted empty id");
  } catch (error) {
    if (!(error instanceof ValidationError)) {
      errors.push("Invalid mapping did not raise ValidationError");
    }
  }

  try {
    mapRowToRecord(createSQLiteRow({ id: "ok", payload: "{}" }));
  } catch {
    errors.push("Valid mapping failed");
  }

  // Mapper registration presence
  const mappers = [
    AthleteMapper,
    IdentityMapper,
    WorkspaceMapper,
    SnapshotMapper,
    TimelineMapper,
    WorkoutMapper,
    NutritionMapper,
    RecoveryMapper,
    SettingsMapper,
    RuntimeMapper,
  ];
  for (const mapper of mappers) {
    if (!mapper || typeof mapper.toRow !== "function") {
      errors.push(`Missing mapper: ${mapper?.name ?? "unknown"}`);
    }
  }

  return freezeValidation(errors);
}
