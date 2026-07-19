import { describe, expect, it, vi } from "vitest";
import type { TeamActionState } from "@/actions/team";
import { runTeamActionWithRefresh } from "./TeamManager";

vi.mock("next/image", () => ({ default: "img" }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh: vi.fn() }) }));
vi.mock("@/components/admin/MediaInput", () => ({ MediaInput: () => null }));
vi.mock("@/actions/team", () => ({
  createTeamMemberAction: vi.fn(),
  deleteTeamMemberAction: vi.fn(),
  reorderTeamMemberAction: vi.fn(),
  toggleTeamMemberPublishedAction: vi.fn(),
  updateTeamMemberAction: vi.fn(),
}));

const initialState: TeamActionState = { success: false, message: "" };

async function run(success: boolean, onSuccess?: () => void) {
  const refresh = vi.fn();
  const action = vi.fn(async () => ({ success, message: success ? "ok" : "failed" }));
  const result = await runTeamActionWithRefresh(action, initialState, new FormData(), { refresh }, onSuccess);
  return { action, refresh, result };
}

describe("TeamManager action refresh behavior", () => {
  it("successful create triggers router.refresh and success callback", async () => {
    const onSuccess = vi.fn();
    const { refresh } = await run(true, onSuccess);

    expect(refresh).toHaveBeenCalledTimes(1);
    expect(onSuccess).toHaveBeenCalledTimes(1);
  });

  it("failed create does not trigger router.refresh", async () => {
    const { refresh } = await run(false);

    expect(refresh).not.toHaveBeenCalled();
  });

  it("successful delete triggers router.refresh", async () => {
    const { refresh } = await run(true);

    expect(refresh).toHaveBeenCalledTimes(1);
  });

  it("successful publish or hide triggers router.refresh", async () => {
    const { refresh } = await run(true);

    expect(refresh).toHaveBeenCalledTimes(1);
  });

  it("successful reorder triggers router.refresh", async () => {
    const { refresh } = await run(true);

    expect(refresh).toHaveBeenCalledTimes(1);
  });

  it("successful update closes the editor through callback and refreshes", async () => {
    const closeEditor = vi.fn();
    const { refresh } = await run(true, closeEditor);

    expect(refresh).toHaveBeenCalledTimes(1);
    expect(closeEditor).toHaveBeenCalledTimes(1);
  });

  it("failed actions do not refresh or run success callback", async () => {
    const onSuccess = vi.fn();
    const { refresh } = await run(false, onSuccess);

    expect(refresh).not.toHaveBeenCalled();
    expect(onSuccess).not.toHaveBeenCalled();
  });

  it("the same successful action can refresh repeatedly", async () => {
    const refresh = vi.fn();
    const action = vi.fn(async () => ({ success: true, message: "ok" }));

    await runTeamActionWithRefresh(action, initialState, new FormData(), { refresh });
    await runTeamActionWithRefresh(action, initialState, new FormData(), { refresh });

    expect(refresh).toHaveBeenCalledTimes(2);
  });
});
