import { beforeEach, describe, expect, it, vi } from "vitest";
import { EMPTY_PLANNER_STATE } from "@shared/types";

const { getPlannerState, savePlannerState } = vi.hoisted(() => ({ getPlannerState: vi.fn(), savePlannerState: vi.fn() }));
vi.mock("./db", () => ({ getPlannerState, savePlannerState }));

import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function context(): TrpcContext {
  return {
    user: { id: 42, openId: "persistence-test", name: "Test", email: "test@example.com", loginMethod: "test", role: "user", createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("planner persistence procedures", () => {
  beforeEach(() => vi.clearAllMocks());

  it("loads the authenticated user’s planner", async () => {
    getPlannerState.mockResolvedValueOnce(EMPTY_PLANNER_STATE);
    const result = await appRouter.createCaller(context()).planner.get();
    expect(result).toEqual(EMPTY_PLANNER_STATE);
    expect(getPlannerState).toHaveBeenCalledWith(42);
  });

  it("saves the complete planner state for the authenticated user", async () => {
    savePlannerState.mockImplementation(async (_userId: number, state: unknown) => state);
    const state = structuredClone(EMPTY_PLANNER_STATE);
    state.identity.teacherName = "A. Teacher";
    state.identity.classes = [{ id: "class-1", name: "9A", room: "101", color: "#2F6F68", members: ["Alex Rivera"] }];
    const result = await appRouter.createCaller(context()).planner.save({ state });
    expect(result.identity.teacherName).toBe("A. Teacher");
    expect(result.identity.classes[0].members).toEqual(["Alex Rivera"]);
    expect(savePlannerState).toHaveBeenCalledWith(42, state);
  });

  it("resets the authenticated user’s planner to the empty state", async () => {
    savePlannerState.mockResolvedValueOnce(EMPTY_PLANNER_STATE);
    const result = await appRouter.createCaller(context()).planner.reset();
    expect(result).toEqual(EMPTY_PLANNER_STATE);
    expect(savePlannerState).toHaveBeenCalledWith(42, EMPTY_PLANNER_STATE);
  });
});
