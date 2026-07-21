import { InMemoryStorageAdapter } from "../InMemoryStorageAdapter";

describe("InMemoryStorageAdapter", () => {
  let adapter: InMemoryStorageAdapter;

  beforeEach(() => {
    adapter = new InMemoryStorageAdapter();
  });

  it("returns null for missing keys", async () => {
    await expect(adapter.getItem("missing")).resolves.toBeNull();
  });

  it("round-trips setItem / getItem", async () => {
    await adapter.setItem("k", "v");
    await expect(adapter.getItem("k")).resolves.toBe("v");
  });

  it("removes keys", async () => {
    await adapter.setItem("k", "v");
    await adapter.removeItem("k");
    await expect(adapter.getItem("k")).resolves.toBeNull();
  });

  it("clear wipes all keys", async () => {
    await adapter.setItem("a", "1");
    await adapter.setItem("b", "2");
    adapter.clear();
    await expect(adapter.getItem("a")).resolves.toBeNull();
    await expect(adapter.getItem("b")).resolves.toBeNull();
  });
});
