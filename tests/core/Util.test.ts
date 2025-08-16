import { generateClientID } from "../../src/core/Util";

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

  test("creates and persists a new clientId when absent", () => {
    expect((globalThis as any).localStorage.getItem("clientId")).toBeNull();

    const id = generateClientID();

    expect(typeof id).toBe("string");
    expect(id).toMatch(/^[0-9a-zA-Z]{8}$/);
    expect((globalThis as any).localStorage.getItem("clientId")).toBe(id);
  });

  test("reuses existing clientId if already set", () => {
    const existing = "Ab12Cd34"; // valid 8-char id
    (globalThis as any).localStorage.setItem("clientId", existing);

    const id = generateClientID();

    expect(id).toBe(existing);
    expect((globalThis as any).localStorage.getItem("clientId")).toBe(
      existing,
    );
  });

  test("returns same id across multiple calls (persistence)", () => {
    const first = generateClientID();
    const second = generateClientID();

    expect(second).toBe(first);
    expect((globalThis as any).localStorage.getItem("clientId")).toBe(first);
  });
});
