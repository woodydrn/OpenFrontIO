import { generateClientID, clearClientID, readGameClients, writeGameClients } from "../../src/core/Util";

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
    expect((globalThis as any).localStorage.getItem("game_clients")).toBeNull();

    const id = generateClientID("testGameID");

    expect(typeof id).toBe("string");
    expect(id).toMatch(/^[0-9a-zA-Z]{8}$/);
    const stored = (globalThis as any).localStorage.getItem("game_clients");
    expect(stored).not.toBeNull();
    const parsed = JSON.parse(stored);
    expect(parsed).toEqual({ testGameID: id });
  });

  test("reuses existing client if already set", () => {
    const existing = "Ab12Cd34";
    (globalThis as any).localStorage.setItem("game_clients", JSON.stringify({ testGameID: existing }));

    const id = generateClientID("testGameID");

    expect(id).toBe(existing);
    const stored = (globalThis as any).localStorage.getItem("game_clients");
    expect(JSON.parse(stored)).toEqual({ testGameID: existing });
  });

  test("returns same id across multiple calls (persistence)", () => {
    const first = generateClientID("testGameID");
    const second = generateClientID("testGameID");

    expect(second).toBe(first);
    const stored = (globalThis as any).localStorage.getItem("game_clients");
    expect(JSON.parse(stored)).toEqual({ testGameID: first });
  });

  test("clearClientID removes existing entry and deletes storage when empty", () => {
    (globalThis as any).localStorage.setItem("game_clients", JSON.stringify({ testGameID: "Ab12Cd34" }));

    clearClientID("testGameID");

    expect((globalThis as any).localStorage.getItem("game_clients")).toBeNull();
  });

  test("clearClientID removes only specified gameID and preserves others", () => {
    (globalThis as any).localStorage.setItem("game_clients", JSON.stringify({ game1: "ID111111", game2: "ID222222" }));

    clearClientID("game1");

    const stored = (globalThis as any).localStorage.getItem("game_clients");
    expect(stored).not.toBeNull();
    expect(JSON.parse(stored)).toEqual({ game2: "ID222222" });
  });

  test("clearClientID is a no-op when gameID doesn't exist", () => {
    (globalThis as any).localStorage.setItem("game_clients", JSON.stringify({ game2: "ID222222" }));

    clearClientID("missing");

    const stored = (globalThis as any).localStorage.getItem("game_clients");
    expect(JSON.parse(stored)).toEqual({ game2: "ID222222" });
  });

  test("readGameClients returns {} when storage key is missing", () => {
    expect((globalThis as any).localStorage.getItem("game_clients")).toBeNull();
    expect(readGameClients()).toEqual({});
  });

  test("readGameClients returns parsed object when valid JSON present", () => {
    const data = { a: "IDAAAAAA", b: "IDBBBBBB" };
    (globalThis as any).localStorage.setItem("game_clients", JSON.stringify(data));
    expect(readGameClients()).toEqual(data);
  });

  test("readGameClients handles corrupt JSON by returning {}", () => {
    (globalThis as any).localStorage.setItem("game_clients", "{not-json");
    expect(readGameClients()).toEqual({});
  });

  test("readGameClients handles non-object JSON by returning {}", () => {
    (globalThis as any).localStorage.setItem("game_clients", JSON.stringify("string"));
    expect(readGameClients()).toEqual({});
  });

  test("writeGameClients writes JSON and removes key when empty", () => {
    writeGameClients({ foo: "BAR00000" });
    const stored1 = (globalThis as any).localStorage.getItem("game_clients");
    expect(JSON.parse(stored1)).toEqual({ foo: "BAR00000" });

    writeGameClients({});
    const stored2 = (globalThis as any).localStorage.getItem("game_clients");
    expect(stored2).toBeNull();
  });
});
