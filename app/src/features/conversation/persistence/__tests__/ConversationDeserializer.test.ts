import {
  createConversationSnapshot,
  createMessage,
} from "../../testSupport/fixtures";
import { ConversationDeserializer } from "../ConversationDeserializer";
import { ConversationSerializer } from "../ConversationSerializer";

describe("ConversationDeserializer", () => {
  const serializer = new ConversationSerializer();
  const deserializer = new ConversationDeserializer();

  it("round-trips a serialized snapshot", () => {
    const snapshot = createConversationSnapshot({
      messages: [createMessage({ id: "msg-1", status: "sent" })],
      streamStatus: "completed",
    });

    const restored = deserializer.deserialize(serializer.serialize(snapshot));

    expect(restored).toEqual(snapshot);
  });

  it("returns null for invalid JSON", () => {
    expect(deserializer.deserialize("{not-json")).toBeNull();
  });

  it("returns null for unknown legacy versions", () => {
    const raw = JSON.stringify({
      ...createConversationSnapshot(),
      schemaVersion: 0,
    });

    expect(deserializer.deserialize(raw)).toBeNull();
  });

  it("accepts forward-compatible future versions with valid shape", () => {
    const raw = JSON.stringify({
      ...createConversationSnapshot({
        messages: [createMessage({ id: "msg-1", status: "sent" })],
      }),
      schemaVersion: 99,
      extraFutureField: true,
    });

    const restored = deserializer.deserialize(raw);
    expect(restored?.id).toBe("conv-1");
    expect(restored?.schemaVersion).toBe(1);
  });
});
