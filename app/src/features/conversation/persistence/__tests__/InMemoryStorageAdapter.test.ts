import { InMemoryStorageAdapter } from "../InMemoryStorageAdapter";

describe("InMemoryStorageAdapter", () => {
  let adapter: InMemoryStorageAdapter;

  beforeEach(() => {
    adapter = new InMemoryStorageAdapter();
  });

  it("stores and loads string values", async () => {
    await adapter.setItem("k1", "value");
    await expect(adapter.getItem("k1")).resolves.toBe("value");
  });

  it("returns null for missing keys", async () => {
    await expect(adapter.getItem("missing")).resolves.toBeNull();
  });

  it("removes keys", async () => {
    await adapter.setItem("k1", "value");
    await adapter.removeItem("k1");
    await expect(adapter.getItem("k1")).resolves.toBeNull();
  });

  it("lists keys and clears all entries", async () => {
    await adapter.setItem("a", "1");
    await adapter.setItem("b", "2");

    await expect(adapter.keys()).resolves.toEqual(
      expect.arrayContaining(["a", "b"]),
    );

    await adapter.clear();
    await expect(adapter.keys()).resolves.toEqual([]);
  });
});
