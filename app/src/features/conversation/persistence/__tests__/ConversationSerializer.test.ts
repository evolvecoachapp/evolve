import {
  createConversationSnapshot,
  createMessage,
} from "../../testSupport/fixtures";
import { ConversationSerializer } from "../ConversationSerializer";

describe("ConversationSerializer", () => {
  const serializer = new ConversationSerializer();

  it("serializes a valid snapshot to JSON", () => {
    const snapshot = createConversationSnapshot({
      messages: [createMessage({ id: "msg-1", status: "sent" })],
    });

    const raw = serializer.serialize(snapshot);
    const parsed = JSON.parse(raw) as { id: string; schemaVersion: number };

    expect(parsed.id).toBe("conv-1");
    expect(parsed.schemaVersion).toBe(1);
  });

  it("rejects invalid snapshots", () => {
    const snapshot = createConversationSnapshot({
      id: "",
    });

    expect(() => serializer.serialize(snapshot)).toThrow(/invalid snapshot/i);
  });
});
