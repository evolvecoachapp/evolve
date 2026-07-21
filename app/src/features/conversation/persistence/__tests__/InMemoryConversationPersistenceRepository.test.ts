import { ConversationError } from "../../models/ConversationError";
import {
  createConversationSnapshot,
  createMessage,
} from "../../testSupport/fixtures";
import { InMemoryConversationPersistenceRepository } from "../InMemoryConversationPersistenceRepository";
import { InMemoryStorageAdapter } from "../InMemoryStorageAdapter";

describe("InMemoryConversationPersistenceRepository", () => {
  let repository: InMemoryConversationPersistenceRepository;

  beforeEach(() => {
    repository = new InMemoryConversationPersistenceRepository(
      new InMemoryStorageAdapter(),
    );
  });

  it("saves and loads a conversation snapshot", async () => {
    const snapshot = createConversationSnapshot({
      messages: [createMessage({ id: "msg-1", status: "sent" })],
      streamStatus: "completed",
    });

    const saved = await repository.saveConversation(snapshot);
    const loaded = await repository.loadConversation(snapshot.id);

    expect(saved.id).toBe(snapshot.id);
    expect(loaded).toEqual(snapshot);
  });

  it("lists conversations newest first", async () => {
    await repository.saveConversation(
      createConversationSnapshot({
        id: "conv-old",
        updatedAt: "2026-07-22T11:00:00.000Z",
        session: { conversationId: "conv-old" },
      }),
    );
    await repository.saveConversation(
      createConversationSnapshot({
        id: "conv-new",
        updatedAt: "2026-07-22T13:00:00.000Z",
        session: { conversationId: "conv-new" },
      }),
    );

    const listed = await repository.listConversations();
    expect(listed.map((entry) => entry.id)).toEqual(["conv-new", "conv-old"]);
  });

  it("deletes a conversation snapshot", async () => {
    const snapshot = createConversationSnapshot();
    await repository.saveConversation(snapshot);

    await repository.deleteConversation(snapshot.id);
    await expect(repository.loadConversation(snapshot.id)).resolves.toBeNull();
  });

  it("validates snapshots without storing", () => {
    const valid = repository.validateSnapshot(createConversationSnapshot());
    expect(valid).toEqual([]);

    const invalid = repository.validateSnapshot(
      createConversationSnapshot({ id: "" }),
    );
    expect(invalid).toContain("invalid_id");
  });

  it("rejects save for invalid snapshots", async () => {
    await expect(
      repository.saveConversation(createConversationSnapshot({ id: "" })),
    ).rejects.toBeInstanceOf(ConversationError);
  });

  it("survives adapter process boundaries via shared storage", async () => {
    const storage = new InMemoryStorageAdapter();
    const first = new InMemoryConversationPersistenceRepository(storage);
    const second = new InMemoryConversationPersistenceRepository(storage);

    const snapshot = createConversationSnapshot({
      messages: [createMessage({ id: "msg-1", status: "sent" })],
    });
    await first.saveConversation(snapshot);

    await expect(second.loadConversation(snapshot.id)).resolves.toEqual(
      snapshot,
    );
  });
});
