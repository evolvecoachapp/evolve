import * as SecureStore from "expo-secure-store";
import {
  clearBackendCoachConversationId,
  loadBackendCoachConversationId,
  persistBackendCoachConversationId,
} from "../backendCoachConversationStore";

jest.mock("expo-secure-store", () => ({
  setItemAsync: jest.fn(),
  getItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

const mockedSecureStore = SecureStore as jest.Mocked<typeof SecureStore>;

describe("backendCoachConversationStore", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it("persists and reads the conversation id through SecureStore", async () => {
    mockedSecureStore.getItemAsync.mockResolvedValue(
      "11111111-1111-4111-8111-111111111111",
    );

    await persistBackendCoachConversationId(
      "11111111-1111-4111-8111-111111111111",
    );
    await expect(loadBackendCoachConversationId()).resolves.toBe(
      "11111111-1111-4111-8111-111111111111",
    );

    expect(mockedSecureStore.setItemAsync).toHaveBeenCalledWith(
      "evolve.coach.conversation_id",
      "11111111-1111-4111-8111-111111111111",
    );
    expect(mockedSecureStore.getItemAsync).toHaveBeenCalledWith(
      "evolve.coach.conversation_id",
    );
  });

  it("clears the persisted conversation id", async () => {
    await clearBackendCoachConversationId();
    expect(mockedSecureStore.deleteItemAsync).toHaveBeenCalledWith(
      "evolve.coach.conversation_id",
    );
  });
});
