import { ConversationError } from "../../models/ConversationError";
import {
  createConversation,
  createMessage,
  FIXED_TIMESTAMP,
} from "../../testSupport/fixtures";
import { InMemoryConversationRepository } from "../InMemoryConversationRepository";

describe("InMemoryConversationRepository", () => {
  let repository: InMemoryConversationRepository;

  beforeEach(() => {
    repository = new InMemoryConversationRepository();
  });

  it("creates and loads a conversation", async () => {
    const conversation = createConversation();
    const created = await repository.create(conversation);

    expect(created.id).toBe("conv-1");
    await expect(repository.getById("conv-1")).resolves.toEqual(created);
  });

  it("rejects duplicate create", async () => {
    await repository.create(createConversation());

    await expect(repository.create(createConversation())).rejects.toBeInstanceOf(
      ConversationError,
    );
  });

  it("appends messages and updates metadata", async () => {
    await repository.create(createConversation());
    const message = createMessage({
      id: "msg-user-1",
      createdAt: "2026-07-22T12:01:00.000Z",
      updatedAt: "2026-07-22T12:01:00.000Z",
    });

    const next = await repository.appendMessage("conv-1", message);

    expect(next.messages).toHaveLength(1);
    expect(next.metadata.messageCount).toBe(1);
    expect(next.metadata.lastMessageAt).toBe("2026-07-22T12:01:00.000Z");
  });

  it("updates message status and marks conversation error on failure", async () => {
    await repository.create(createConversation());
    await repository.appendMessage(
      "conv-1",
      createMessage({ id: "msg-user-1", status: "sent" }),
    );

    const next = await repository.updateMessageStatus(
      "conv-1",
      "msg-user-1",
      "failed",
      "provider_unavailable",
    );

    expect(next.messages[0]?.status).toBe("failed");
    expect(next.messages[0]?.errorCode).toBe("provider_unavailable");
    expect(next.status).toBe("error");
  });

  it("recovers conversation status when failed message is resent", async () => {
    await repository.create(createConversation());
    await repository.appendMessage(
      "conv-1",
      createMessage({ id: "msg-user-1", status: "failed" }),
    );
    await repository.updateMessageStatus(
      "conv-1",
      "msg-user-1",
      "failed",
      "generation_failed",
    );

    const next = await repository.updateMessageStatus(
      "conv-1",
      "msg-user-1",
      "sent",
    );

    expect(next.messages[0]?.status).toBe("sent");
    expect(next.messages[0]?.errorCode).toBeUndefined();
    expect(next.status).toBe("active");
  });

  it("updates title", async () => {
    await repository.create(createConversation());
    const next = await repository.updateTitle("conv-1", "Train today?");

    expect(next.metadata.title).toBe("Train today?");
  });

  it("closes a conversation and ends the session", async () => {
    await repository.create(createConversation());
    const closed = await repository.close("conv-1");

    expect(closed.status).toBe("closed");
    expect(closed.session.endedAt).toBeTruthy();
  });

  it("deletes a conversation", async () => {
    await repository.create(createConversation());
    await repository.delete("conv-1");

    await expect(repository.getById("conv-1")).resolves.toBeNull();
  });

  it("lists conversations newest updated first", async () => {
    await repository.create(
      createConversation({
        id: "conv-old",
        updatedAt: "2026-07-22T10:00:00.000Z",
        metadata: {
          title: "Old",
          messageCount: 0,
          lastMessageAt: null,
          createdAt: FIXED_TIMESTAMP,
          updatedAt: "2026-07-22T10:00:00.000Z",
        },
      }),
    );
    await repository.create(
      createConversation({
        id: "conv-new",
        updatedAt: "2026-07-22T13:00:00.000Z",
        metadata: {
          title: "New",
          messageCount: 0,
          lastMessageAt: null,
          createdAt: FIXED_TIMESTAMP,
          updatedAt: "2026-07-22T13:00:00.000Z",
        },
      }),
    );

    const list = await repository.list();
    expect(list.map((entry) => entry.id)).toEqual(["conv-new", "conv-old"]);
  });

  it("throws not_found for missing conversation operations", async () => {
    await expect(repository.close("missing")).rejects.toMatchObject({
      code: "not_found",
    });
    await expect(repository.delete("missing")).rejects.toMatchObject({
      code: "not_found",
    });
    await expect(
      repository.appendMessage("missing", createMessage()),
    ).rejects.toMatchObject({ code: "not_found" });
  });
});
