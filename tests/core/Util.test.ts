import { getClientID } from "../../src/core/Util";

describe("Util", () => {
  class InMemoryLocalStorage {
    private store = new Map<string, string>();
    getItem(key: string): string | null {
      return this.store.has(key) ? this.store.get(key)! : null;
    }
    setItem(key: string, value: string): void {
      this.store.set(key, String(value));
    }
    removeItem(key: string): void {
      this.store.delete(key);
    }
    clear(): void {
      this.store.clear();
    }
  }

  beforeEach(() => {
    (globalThis as any).localStorage = new InMemoryLocalStorage();
  });

  test("creates and persists a new client when absent", () => {
    expect((globalThis as any).localStorage.getItem("client_id")).toBeNull();

    const id = getClientID("testGameID");

    expect(typeof id).toBe("string");
    expect(id).toMatch(/^[0-9a-zA-Z]{8}$/);

    const stored = (globalThis as any).localStorage.getItem("client_id");
    expect(stored).not.toBeNull();

    const parsed = JSON.parse(stored) as any;
    expect(parsed).toHaveProperty("testGameID");
    expect(parsed.testGameID).toHaveProperty("id", id);
  });
});
