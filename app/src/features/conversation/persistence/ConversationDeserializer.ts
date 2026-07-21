import type { ConversationSnapshot } from "../models/ConversationSnapshot";
import { ConversationMigrationService } from "./ConversationMigrationService";

/**
 * Deserialize a JSON string into a ConversationSnapshot.
 *
 * Applies migration and schema validation. Returns null for expected
 * failures (invalid JSON, unknown versions, failed migration).
 */
export class ConversationDeserializer {
  constructor(
    private readonly migrationService: ConversationMigrationService = new ConversationMigrationService(),
  ) {}

  deserialize(raw: string): ConversationSnapshot | null {
    let parsed: unknown;
    try {
      parsed = JSON.parse(raw) as unknown;
    } catch {
      return null;
    }

    const migrated = this.migrationService.migrate(parsed);
    if (!migrated.success) {
      return null;
    }

    return migrated.snapshot;
  }
}
