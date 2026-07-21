import {
  createConversation,
  createConversationSnapshot,
  createMessage,
  FIXED_TIMESTAMP,
} from "../../testSupport/fixtures";
import { buildConversationContext } from "../buildConversationContext";
import { calculateConversationSize } from "../calculateConversationSize";
import { deepCloneConversation } from "../deepCloneConversation";
import { generateConversationTitle } from "../generateConversationTitle";
import { sortMessages } from "../sortMessages";
import { validateConversation } from "../validateConversation";
import { validateConversationSnapshot } from "../validateConversationSnapshot";
import { validateMessage } from "../validateMessage";

describe("conversation utilities", () => {
  describe("sortMessages", () => {
    it("sorts by createdAt then id", () => {
      const sorted = sortMessages([
        createMessage({
          id: "msg-b",
          createdAt: "2026-07-22T12:02:00.000Z",
        }),
        createMessage({
          id: "msg-a2",
          createdAt: "2026-07-22T12:01:00.000Z",
        }),
        createMessage({
          id: "msg-a1",
          createdAt: "2026-07-22T12:01:00.000Z",
        }),
      ]);

      expect(sorted.map((message) => message.id)).toEqual([
        "msg-a1",
        "msg-a2",
        "msg-b",
      ]);
    });
  });

  describe("buildConversationContext", () => {
    it("maps only sent messages into AI ConversationContext", () => {
      const conversation = createConversation({
        messages: [
          createMessage({ id: "msg-1", status: "sent", content: "Hello" }),
          createMessage({
            id: "msg-2",
            status: "pending",
            content: "Ignore me",
            createdAt: "2026-07-22T12:01:00.000Z",
          }),
          createMessage({
            id: "msg-3",
            role: "assistant",
            status: "sent",
            content: "Hi",
            createdAt: "2026-07-22T12:02:00.000Z",
          }),
          createMessage({
            id: "msg-4",
            status: "failed",
            content: "Failed",
            createdAt: "2026-07-22T12:03:00.000Z",
          }),
        ],
      });

      const context = buildConversationContext(conversation);

      expect(context.conversationId).toBe("conv-1");
      expect(context.messages).toHaveLength(2);
      expect(context.messages.map((message) => message.id)).toEqual([
        "msg-1",
        "msg-3",
      ]);
      expect(context.messages[0]?.role).toBe("user");
    });
  });

  describe("validateMessage", () => {
    it("returns no issues for a valid message", () => {
      expect(validateMessage(createMessage())).toEqual([]);
    });

    it("flags empty content and invalid role", () => {
      const issues = validateMessage(
        createMessage({
          content: "   ",
          role: "narrator" as never,
        }),
      );

      expect(issues).toEqual(
        expect.arrayContaining(["invalid_content", "invalid_role"]),
      );
    });

    it("allows empty content for pending streaming messages", () => {
      expect(
        validateMessage(
          createMessage({
            content: "",
            status: "pending",
            role: "assistant",
          }),
        ),
      ).toEqual([]);
    });
  });

  describe("validateConversation", () => {
    it("returns no issues for a valid empty conversation", () => {
      expect(validateConversation(createConversation())).toEqual([]);
    });

    it("flags metadata and session mismatches", () => {
      const conversation = createConversation({
        messages: [createMessage()],
        metadata: {
          title: "Title",
          messageCount: 99,
          lastMessageAt: FIXED_TIMESTAMP,
          createdAt: FIXED_TIMESTAMP,
          updatedAt: FIXED_TIMESTAMP,
        },
        session: {
          id: "sess-1",
          conversationId: "other",
          startedAt: FIXED_TIMESTAMP,
          endedAt: null,
        },
      });

      const issues = validateConversation(conversation);
      expect(issues).toEqual(
        expect.arrayContaining(["invalid_metadata", "invalid_session"]),
      );
    });
  });

  describe("generateConversationTitle", () => {
    it("returns default title for empty input", () => {
      expect(generateConversationTitle(null)).toBe("New conversation");
      expect(generateConversationTitle("   ")).toBe("New conversation");
    });

    it("truncates long titles", () => {
      const long = "a".repeat(60);
      const title = generateConversationTitle(long);

      expect(title.endsWith("…")).toBe(true);
      expect(title.length).toBe(48);
    });

    it("keeps short titles intact", () => {
      expect(generateConversationTitle("Train today?")).toBe("Train today?");
    });
  });

  describe("deepCloneConversation", () => {
    it("returns an independent frozen clone", () => {
      const original = createConversation({
        messages: [createMessage({ id: "msg-1", status: "sent" })],
      });
      const clone = deepCloneConversation(original);

      expect(clone).toEqual(original);
      expect(clone).not.toBe(original);
      expect(clone.messages).not.toBe(original.messages);
      expect(Object.isFrozen(clone)).toBe(true);
    });
  });

  describe("calculateConversationSize", () => {
    it("returns a positive size for conversations and snapshots", () => {
      const conversation = createConversation({
        messages: [createMessage({ id: "msg-1", status: "sent" })],
      });
      const snapshot = createConversationSnapshot({
        messages: [createMessage({ id: "msg-1", status: "sent" })],
      });

      expect(calculateConversationSize(conversation)).toBeGreaterThan(0);
      expect(calculateConversationSize(snapshot)).toBeGreaterThan(0);
    });
  });

  describe("validateConversationSnapshot", () => {
    it("returns no issues for a valid snapshot", () => {
      expect(validateConversationSnapshot(createConversationSnapshot())).toEqual(
        [],
      );
    });

    it("flags invalid schema version and stream status", () => {
      const issues = validateConversationSnapshot(
        createConversationSnapshot({
          schemaVersion: 0,
          streamStatus: "not-a-status" as never,
        }),
      );

      expect(issues).toEqual(
        expect.arrayContaining([
          "invalid_schema_version",
          "invalid_stream_status",
        ]),
      );
    });
  });
});
