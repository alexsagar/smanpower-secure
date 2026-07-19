import { describe, expect, it } from "vitest";
import {
  FIRST_VISIT_LOADER_KEY,
  markFirstVisitLoaderComplete,
  shouldShowFirstVisitLoader,
} from "./FirstVisitLoader";

function makeStorage(initial?: string) {
  const store = new Map<string, string>();
  if (initial) store.set(FIRST_VISIT_LOADER_KEY, initial);

  return {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => {
      store.set(key, value);
    },
  };
}

describe("FirstVisitLoader session behavior", () => {
  it("appears when the session key is absent", () => {
    expect(shouldShowFirstVisitLoader(makeStorage())).toBe(true);
  });

  it("writes the session key after completion", () => {
    const storage = makeStorage();

    markFirstVisitLoaderComplete(storage);

    expect(storage.getItem(FIRST_VISIT_LOADER_KEY)).toBe("done");
    expect(shouldShowFirstVisitLoader(storage)).toBe(false);
  });

  it("does not appear again in the same session", () => {
    expect(shouldShowFirstVisitLoader(makeStorage("done"))).toBe(false);
  });

  it("fails closed when storage is unavailable", () => {
    expect(shouldShowFirstVisitLoader(null)).toBe(false);
  });
});
