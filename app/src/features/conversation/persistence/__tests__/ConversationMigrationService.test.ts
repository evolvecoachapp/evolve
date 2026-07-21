import {
  createConversationSnapshot,
  createMessage,
} from "../../testSupport/fixtures";
import { ConversationMigrationService } from "../ConversationMigrationService";

describe("ConversationMigrationService", () => {
  const service = new ConversationMigrationService();

  it("accepts the current schema version", () => {
    const snapshot = createConversationSnapshot({
      messages: [createMessage({ id: "msg-1", status: "sent" })],
    });

    const result = service.migrate(snapshot);

    expect(result.success).toBe(true);
    expect(result.fromVersion).toBe(1);
    expect(result.toVersion).toBe(1);
    expect(result.snapshot?.id).toBe("conv-1");
    expect(result.reason).toBeNull();
  });

  it("fails gracefully for invalid payloads without throwing", () => {
    expect(() => service.migrate(null)).not.toThrow();

    const result = service.migrate("not-an-object");
    expect(result.success).toBe(false);
    expect(result.snapshot).toBeNull();
    expect(result.reason).toBe("invalid_payload");
  });

  it("fails gracefully for unsupported legacy versions", () => {
    const result = service.migrate({
      ...createConversationSnapshot(),
      schemaVersion: 0,
    });

    expect(result.success).toBe(false);
    expect(result.reason).toBe("unsupported_legacy_version");
  });

  it("fails gracefully for future versions with invalid shape", () => {
    const result = service.migrate({
      schemaVersion: 42,
      id: "conv-x",
    });

    expect(result.success).toBe(false);
    expect(result.reason).toBe("unsupported_future_version");
  });
});
