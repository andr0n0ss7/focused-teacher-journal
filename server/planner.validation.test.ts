import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
import { EMPTY_PLANNER_STATE } from "@shared/types";

function createContext(): TrpcContext {
  return {
    user: {
      id: 1,
      openId: "planner-test-user",
      email: "planner@example.com",
      name: "Planner Test",
      loginMethod: "test",
      role: "user",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("planner validation", () => {
  it("rejects more than eight classes", async () => {
    const caller = appRouter.createCaller(createContext());
    const state = structuredClone(EMPTY_PLANNER_STATE);
    state.identity.classes = Array.from({ length: 9 }, (_, index) => ({ id: String(index), name: `Class ${index}`, room: "", color: "#000" }));
    await expect(caller.planner.save({ state })).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });

  it("rejects a status outside the exact vocabulary", async () => {
    const caller = appRouter.createCaller(createContext());
    const state = structuredClone(EMPTY_PLANNER_STATE) as any;
    state.gradingTasks = [{ id: "1", date: "2026-08-13", classId: "", task: "Quiz", status: "In progress", nextAction: "" }];
    await expect(caller.planner.save({ state })).rejects.toThrow();
  });
});
