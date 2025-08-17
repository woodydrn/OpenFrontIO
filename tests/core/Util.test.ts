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

    const parsed = JSON.parse(stored) as any;
    expect(parsed).toHaveProperty("testGameID");
    expect(parsed.testGameID).toHaveProperty("id", id);
    expect(typeof parsed.testGameID.expiresAt).toBe("number");

    const now = Date.now();
    expect(parsed.testGameID.expiresAt).toBeGreaterThan(now);
    expect(parsed.testGameID.expiresAt).toBeLessThanOrEqual(now + 24 * 60 * 60 * 1000 + 5000);
  });

  test("reuses existing client if already set", () => {
    const existing = "Ab12Cd34";
    const expiresAt = Date.now() + 60 * 60 * 1000; // 1 hour ahead

    (globalThis as any).localStorage.setItem(
      "game_clients",
      JSON.stringify({ testGameID: { id: existing, expiresAt } }),
    );

    const id = generateClientID("testGameID");

    expect(id).toBe(existing);
    const stored = (globalThis as any).localStorage.getItem("game_clients");
    expect(JSON.parse(stored)).toEqual({ testGameID: { id: existing, expiresAt } });
  });

  test("returns same id across multiple calls (persistence)", () => {
    const first = generateClientID("testGameID");
    const second = generateClientID("testGameID");

    expect(second).toBe(first);
    const stored = (globalThis as any).localStorage.getItem("game_clients");
    const parsed = JSON.parse(stored) as any;
    expect(parsed.testGameID.id).toBe(first);
    expect(typeof parsed.testGameID.expiresAt).toBe("number");
  });

  test("clearClientID removes existing entry and deletes storage when empty", () => {
    (globalThis as any).localStorage.setItem(
      "game_clients",
      JSON.stringify({ testGameID: { id: "Ab12Cd34", expiresAt: Date.now() + 1000 } }),
    );

    clearClientID("testGameID");

    expect((globalThis as any).localStorage.getItem("game_clients")).toBeNull();
  });

  test("clearClientID removes only specified gameID and preserves others", () => {
    (globalThis as any).localStorage.setItem(
      "game_clients",
      JSON.stringify({
        game1: { id: "ID111111", expiresAt: Date.now() + 1000 },
        game2: { id: "ID222222", expiresAt: Date.now() + 1000 },
      }),
    );

    clearClientID("game1");

    const stored = (globalThis as any).localStorage.getItem("game_clients");
    expect(stored).not.toBeNull();
    expect(JSON.parse(stored)).toEqual({ game2: { id: "ID222222", expiresAt: expect.any(Number) } });
  });

  test("clearClientID is a no-op when gameID doesn't exist", () => {
    (globalThis as any).localStorage.setItem(
      "game_clients",
      JSON.stringify({ game2: { id: "ID222222", expiresAt: Date.now() + 1000 } }),
    );

    clearClientID("missing");

    const stored = (globalThis as any).localStorage.getItem("game_clients");
    expect(JSON.parse(stored)).toEqual({ game2: { id: "ID222222", expiresAt: expect.any(Number) } });
  });

  test("readGameClients returns {} when storage key is missing", () => {
    expect((globalThis as any).localStorage.getItem("game_clients")).toBeNull();
    expect(readGameClients()).toEqual({});
  });

  test("readGameClients returns parsed object when valid JSON present", () => {
    const data = {
      a: { id: "IDAAAAAA", expiresAt: Date.now() + 1000 },
      b: { id: "IDBBBBBB", expiresAt: Date.now() + 1000 },
    };
    (globalThis as any).localStorage.setItem("game_clients", JSON.stringify(data));
    expect(readGameClients()).toEqual(data);
  });

  test("readGameClients handles corrupt JSON by returning {}", () => {
    (globalThis as any).localStorage.setItem("game_clients", "{not-json");
    expect(readGameClients()).toEqual({});
  });

  test("readGameClients passes through non-object JSON (current behavior)", () => {
    (globalThis as any).localStorage.setItem("game_clients", JSON.stringify("string"));
    // Current implementation does not coerce to object; it returns the parsed value directly.
    // This asserts the status quo. If desired, update readGameClients to coerce to {} instead.
    expect(readGameClients()).toEqual("string");
  });

  test("writeGameClients writes JSON and removes key when empty", () => {
    writeGameClients({ foo: { id: "BAR00000", expiresAt: Date.now() + 1000 } });
    const stored1 = (globalThis as any).localStorage.getItem("game_clients");
    expect(JSON.parse(stored1)).toEqual({ foo: { id: "BAR00000", expiresAt: expect.any(Number) } });

    writeGameClients({});
    const stored2 = (globalThis as any).localStorage.getItem("game_clients");
    expect(stored2).toBeNull();
  });

  test("readGameClients prunes expired entries", () => {
    const expired = Date.now() - 1000;
    const future = Date.now() + 1000;
    (globalThis as any).localStorage.setItem(
      "game_clients",
      JSON.stringify({
        expiredGame: { id: "EXPIRED1", expiresAt: expired },
        validGame: { id: "VALID123", expiresAt: future },
      }),
    );

    const result = readGameClients() as any;
    expect(result).toEqual({ validGame: { id: "VALID123", expiresAt: future } });
  });
});
