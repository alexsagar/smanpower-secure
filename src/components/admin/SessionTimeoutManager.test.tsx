import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { jsx } from "react/jsx-runtime";
import type { SessionTimeoutConfig } from "./SessionTimeoutManager";
import { getSessionTimeoutDurations } from "./SessionTimeoutManager";

type TreeNode =
  | string
  | number
  | boolean
  | null
  | undefined
  | TreeElement
  | TreeNode[];

type TreeElement = {
  type: unknown;
  props: Record<string, unknown> & { children?: TreeNode };
};

type EffectRecord = {
  deps: unknown[] | undefined;
  cleanup?: (() => void) | void;
};

type PendingEffect = {
  index: number;
  deps: unknown[] | undefined;
  callback: () => (() => void) | void;
};

function areDepsEqual(a: unknown[] | undefined, b: unknown[] | undefined) {
  if (a === undefined || b === undefined) return false;
  if (a.length !== b.length) return false;
  return a.every((value, index) => Object.is(value, b[index]));
}

function flattenText(node: TreeNode): string {
  if (node == null || typeof node === "boolean") return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(flattenText).join("");
  if (typeof node.type === "function") {
    return flattenText((node.type as (props: Record<string, unknown>) => TreeNode)(node.props));
  }
  return flattenText(node.props.children);
}

function findElement(node: TreeNode, predicate: (element: TreeElement) => boolean): TreeElement | null {
  if (node == null || typeof node === "boolean" || typeof node === "string" || typeof node === "number") {
    return null;
  }
  if (Array.isArray(node)) {
    for (const child of node) {
      const match = findElement(child, predicate);
      if (match) return match;
    }
    return null;
  }
  if (typeof node.type === "function") {
    return findElement((node.type as (props: Record<string, unknown>) => TreeNode)(node.props), predicate);
  }
  if (predicate(node)) return node;
  return findElement(node.props.children, predicate);
}

function createWindowMock() {
  const listeners = new Map<string, Set<() => void>>();

  return {
    listeners,
    addEventListener: vi.fn((type: string, handler: () => void) => {
      const bucket = listeners.get(type) ?? new Set<() => void>();
      bucket.add(handler);
      listeners.set(type, bucket);
    }),
    removeEventListener: vi.fn((type: string, handler: () => void) => {
      listeners.get(type)?.delete(handler);
    }),
    dispatch(type: string) {
      for (const handler of listeners.get(type) ?? []) {
        handler();
      }
    },
  };
}

function createBroadcastChannelMock() {
  const BroadcastChannelMock = vi.fn(function MockBroadcastChannel(this: {
    onmessage: ((event: { data: unknown }) => void) | null;
    postMessage: ReturnType<typeof vi.fn>;
    close: ReturnType<typeof vi.fn>;
  }) {
    this.onmessage = null;
    this.postMessage = vi.fn();
    this.close = vi.fn();
  });

  return BroadcastChannelMock;
}

function createHookHarness() {
  const state: unknown[] = [];
  const refs: Array<{ current: unknown }> = [];
  const effects: Array<EffectRecord | undefined> = [];
  let pendingEffects: PendingEffect[] = [];
  let hookIndex = 0;
  let rerenderNeeded = false;
  let tree: TreeNode = null;

  const ReactMock = {
    useState<T>(initial: T | (() => T)) {
      const index = hookIndex++;
      if (!(index in state)) {
        state[index] = typeof initial === "function" ? (initial as () => T)() : initial;
      }
      const setState = (value: T | ((current: T) => T)) => {
        const current = state[index] as T;
        state[index] = typeof value === "function" ? (value as (current: T) => T)(current) : value;
        rerenderNeeded = true;
      };
      return [state[index] as T, setState] as const;
    },
    useRef<T>(initial: T) {
      const index = hookIndex++;
      if (!refs[index]) {
        refs[index] = { current: initial };
      }
      return refs[index] as { current: T };
    },
    useEffect(callback: () => (() => void) | void, deps?: unknown[]) {
      const index = hookIndex++;
      const previous = effects[index];
      if (!previous || !areDepsEqual(previous.deps, deps)) {
        pendingEffects.push({ index, deps, callback });
      }
    },
  };

  const runPendingEffects = () => {
    const current = pendingEffects;
    pendingEffects = [];

    for (const effect of current) {
      effects[effect.index]?.cleanup?.();
      effects[effect.index] = {
        deps: effect.deps,
        cleanup: effect.callback(),
      };
    }
  };

  const renderUntilSettled = (Component: () => TreeNode) => {
    do {
      rerenderNeeded = false;
      hookIndex = 0;
      tree = Component();
      runPendingEffects();
    } while (rerenderNeeded || pendingEffects.length > 0);

    return tree;
  };

  const unmount = () => {
    for (const effect of effects) {
      effect?.cleanup?.();
    }
  };

  return {
    ReactMock,
    getTree: () => tree,
    renderUntilSettled,
    unmount,
  };
}

async function mountSessionTimeoutManager(configOverride: Partial<SessionTimeoutConfig> = {}) {
  vi.resetModules();

  const harness = createHookHarness();
  const pushMock = vi.fn();
  const refreshSessionActionMock = vi.fn();
  const logoutActionMock = vi.fn().mockResolvedValue(undefined);
  const windowMock = createWindowMock();
  const BroadcastChannelMock = createBroadcastChannelMock();

  vi.doMock("react", async () => {
    const actual = await vi.importActual<typeof import("react")>("react");
    return { ...actual, ...harness.ReactMock };
  });

  vi.doMock("next/navigation", () => ({
    useRouter: () => ({
      push: pushMock,
      replace: vi.fn(),
      prefetch: vi.fn(),
    }),
  }));

  vi.doMock("@/actions/session", () => ({
    refreshSessionAction: refreshSessionActionMock,
  }));

  vi.doMock("@/actions/auth", () => ({
    logoutAction: logoutActionMock,
  }));

  vi.doMock("@/components/ui/dialog", () => {
    throw new Error("SessionTimeoutManager should not import dialog.tsx");
  });

  vi.doMock("@/components/ui/button", () => ({
    Button: (props: Record<string, unknown>) => jsx("button", props),
  }));

  vi.doMock("lucide-react", () => ({
    Loader2: (props: Record<string, unknown>) => jsx("loader-icon", props),
  }));

  vi.stubGlobal("window", windowMock);
  vi.stubGlobal("BroadcastChannel", BroadcastChannelMock);

  const { SessionTimeoutManager } = await import("./SessionTimeoutManager");
  const config: SessionTimeoutConfig = {
    idleTimeoutMinutes: 30,
    idleWarningSeconds: 120,
    absoluteTimeoutMinutes: 480,
    activityRefreshSeconds: 300,
    ...configOverride,
  };

  const render = () => harness.renderUntilSettled(() => SessionTimeoutManager({ config }));
  const flush = async () => {
    await Promise.resolve();
    await Promise.resolve();
    render();
  };

  render();

  return {
    BroadcastChannelMock,
    flush,
    logoutActionMock,
    pushMock,
    refreshSessionActionMock,
    render,
    tree: () => harness.getTree(),
    unmount: () => harness.unmount(),
    windowMock,
  };
}

describe("SessionTimeoutManager", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-16T00:00:00.000Z"));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
    vi.useRealTimers();
  });

  it("does not render the warning immediately after mount", async () => {
    const view = await mountSessionTimeoutManager();

    expect(flattenText(view.tree())).not.toContain("Session Expiring Soon");
  });

  it("converts configured timeout values to the expected milliseconds", () => {
    expect(
      getSessionTimeoutDurations({
        idleTimeoutMinutes: 30,
        idleWarningSeconds: 120,
        absoluteTimeoutMinutes: 480,
        activityRefreshSeconds: 300,
      })
    ).toEqual({
      idleTimeoutMs: 1_800_000,
      idleWarningMs: 120_000,
      absoluteTimeoutMs: 28_800_000,
      activityRefreshMs: 300_000,
    });
  });

  it("keeps the warning hidden while idle time is above the threshold", async () => {
    const view = await mountSessionTimeoutManager();

    vi.advanceTimersByTime(27 * 60 * 1000 + 59 * 1000);
    view.render();

    expect(flattenText(view.tree())).not.toContain("Session Expiring Soon");
  });

  it("shows the warning when the 120-second threshold is reached", async () => {
    const view = await mountSessionTimeoutManager();

    vi.advanceTimersByTime(28 * 60 * 1000);
    view.render();

    const text = flattenText(view.tree());
    expect(text).toContain("Session Expiring Soon");
    expect(text).toContain("120");
  });

  it("renders the warning as a fixed centered overlay", async () => {
    const view = await mountSessionTimeoutManager();

    vi.advanceTimersByTime(28 * 60 * 1000);
    view.render();

    const dialog = findElement(
      view.tree(),
      (element) => element.props.role === "alertdialog"
    );

    expect(dialog).not.toBeNull();
    expect(dialog?.props["aria-modal"]).toBe("true");
    expect(String(dialog?.props.className)).toContain("fixed");
    expect(String(dialog?.props.className)).toContain("inset-0");
    expect(String(dialog?.props.className)).toContain("items-center");
    expect(String(dialog?.props.className)).toContain("justify-center");
  });

  it("updates the countdown while the warning is visible", async () => {
    const view = await mountSessionTimeoutManager();

    vi.advanceTimersByTime(28 * 60 * 1000 + 5 * 1000);
    view.render();

    expect(flattenText(view.tree())).toContain("115");
  });

  it("closes the warning and resets the idle timer after continuing the session", async () => {
    const view = await mountSessionTimeoutManager();

    view.refreshSessionActionMock.mockImplementation(async () => ({
      success: true,
      idleExpiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
      absoluteExpiresAt: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(),
    }));

    vi.advanceTimersByTime(28 * 60 * 1000);
    view.render();

    const continueButton = findElement(
      view.tree(),
      (element) => element.type === "button" && flattenText(element).includes("Continue session")
    );

    expect(continueButton).not.toBeNull();

    await (continueButton?.props.onClick as () => Promise<void>)();
    await view.flush();

    expect(view.refreshSessionActionMock).toHaveBeenCalledTimes(1);
    expect(flattenText(view.tree())).not.toContain("Session Expiring Soon");

    vi.advanceTimersByTime(27 * 60 * 1000);
    view.render();
    expect(flattenText(view.tree())).not.toContain("Session Expiring Soon");
  });

  it("invokes the existing sign-out behavior when Sign out now is clicked", async () => {
    const view = await mountSessionTimeoutManager();

    vi.advanceTimersByTime(28 * 60 * 1000);
    view.render();

    const signOutButton = findElement(
      view.tree(),
      (element) => element.type === "button" && flattenText(element).includes("Sign out now")
    );

    expect(signOutButton).not.toBeNull();

    await (signOutButton?.props.onClick as () => Promise<void>)();
    await view.flush();

    expect(view.logoutActionMock).toHaveBeenCalledTimes(1);
  });

  it("automatically signs out when the idle timer reaches zero", async () => {
    const view = await mountSessionTimeoutManager();

    vi.advanceTimersByTime(30 * 60 * 1000);
    view.render();
    await view.flush();
    vi.advanceTimersByTime(5_000);
    view.render();
    await view.flush();

    expect(view.logoutActionMock).toHaveBeenCalledTimes(1);
  });

  it("automatically signs out at the absolute timeout after 480 minutes, not 480 hours", async () => {
    const view = await mountSessionTimeoutManager({
      idleTimeoutMinutes: 600,
    });

    vi.advanceTimersByTime(28_800_000);
    view.render();
    await view.flush();
    vi.advanceTimersByTime(5_000);
    view.render();
    await view.flush();

    expect(view.logoutActionMock).toHaveBeenCalledTimes(1);
  });

  it("cleans up timers and event listeners on unmount", async () => {
    const view = await mountSessionTimeoutManager();

    expect(view.windowMock.addEventListener).toHaveBeenCalledTimes(3);
    expect(vi.getTimerCount()).toBe(1);

    view.unmount();

    expect(view.windowMock.removeEventListener).toHaveBeenCalledTimes(3);
    expect(vi.getTimerCount()).toBe(0);

    const channel = view.BroadcastChannelMock.mock.results[0]?.value as { close: () => void };
    expect(channel.close).toHaveBeenCalledTimes(1);
  });
});
