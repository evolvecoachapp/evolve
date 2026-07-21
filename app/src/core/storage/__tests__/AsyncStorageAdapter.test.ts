import AsyncStorage from "@react-native-async-storage/async-storage";
import { AsyncStorageAdapter } from "../AsyncStorageAdapter";

jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

const mockedAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;

describe("AsyncStorageAdapter", () => {
  const adapter = new AsyncStorageAdapter();

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it("returns stored values from getItem", async () => {
    mockedAsyncStorage.getItem.mockResolvedValue("payload");

    await expect(adapter.getItem("evolve.test")).resolves.toBe("payload");
    expect(mockedAsyncStorage.getItem).toHaveBeenCalledWith("evolve.test");
  });

  it("returns null from getItem when AsyncStorage throws", async () => {
    mockedAsyncStorage.getItem.mockRejectedValue(new Error("disk full"));

    await expect(adapter.getItem("evolve.test")).resolves.toBeNull();
  });

  it("forwards setItem to AsyncStorage", async () => {
    mockedAsyncStorage.setItem.mockResolvedValue(undefined);

    await adapter.setItem("evolve.test", "value");

    expect(mockedAsyncStorage.setItem).toHaveBeenCalledWith("evolve.test", "value");
  });

  it("forwards removeItem to AsyncStorage", async () => {
    mockedAsyncStorage.removeItem.mockResolvedValue(undefined);

    await adapter.removeItem("evolve.test");

    expect(mockedAsyncStorage.removeItem).toHaveBeenCalledWith("evolve.test");
  });
});
