import { beforeEach, describe, expect, it, vi } from "vitest";
import { EMPTY_PLANNER_STATE, getLinkedStudentName, getLearnerNotes, getLearnerParentContacts, learnerRoute } from "@shared/types";

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
    state.identity.classes = [{ id: "class-1", name: "9A", room: "101", color: "#2F6F68", members: [{ id: "member-1", name: "Alex Rivera" }] }];
    const result = await appRouter.createCaller(context()).planner.save({ state });
    expect(result.identity.teacherName).toBe("A. Teacher");
    expect(result.identity.classes[0].members).toEqual([{ id: "member-1", name: "Alex Rivera" }]);
    expect(savePlannerState).toHaveBeenCalledWith(42, state);
  });

  it("preserves a linked student note and resolves roster renames", async () => {
    savePlannerState.mockImplementation(async (_userId: number, state: unknown) => state);
    const state = structuredClone(EMPTY_PLANNER_STATE);
    state.identity.classes = [{ id: "class-1", name: "9A", room: "101", color: "#2F6F68", members: [{ id: "member-1", name: "Alex Rivera" }] }];
    state.studentNotes = [{ id: "note-1", name: "Alex Rivera", classId: "class-1", rosterMemberId: "member-1", strengths: "Curious", evidence: "", supportNeeds: "", studentVoice: "", nextAction: "", reviewDate: "" }];
    state.parentContacts = [{ id: "contact-1", student: "Alex Rivera", classId: "class-1", rosterMemberId: "member-1", date: "2026-08-13", contact: "Email", reason: "Attendance", summary: "Checked in", agreement: "Follow up", followUpDate: "2026-08-20" }];
    const result = await appRouter.createCaller(context()).planner.save({ state });
    expect(result.studentNotes[0].rosterMemberId).toBe("member-1");
    expect(result.parentContacts[0].rosterMemberId).toBe("member-1");
    expect(getLinkedStudentName(result, result.studentNotes[0])).toBe("Alex Rivera");
    result.identity.classes[0].members[0].name = "Alex R.";
    result.studentNotes[0].strengths = "Thoughtful collaborator";
    expect(getLinkedStudentName(result, result.studentNotes[0])).toBe("Alex R.");
    const edited = await appRouter.createCaller(context()).planner.save({ state: result });
    expect(edited.studentNotes[0].strengths).toBe("Thoughtful collaborator");
  });

  it("builds the learner route and filters linked notes and contacts", () => {
    const state = structuredClone(EMPTY_PLANNER_STATE);
    state.identity.classes = [{ id: "class-1", name: "9A", room: "101", color: "#2F6F68", members: [{ id: "member-1", name: "Alex Rivera" }] }];
    state.studentNotes = [
      { id: "note-1", name: "Alex Rivera", classId: "class-1", rosterMemberId: "member-1", strengths: "", evidence: "", supportNeeds: "", studentVoice: "", nextAction: "", reviewDate: "" },
      { id: "note-2", name: "Other", classId: "class-1", rosterMemberId: "member-2", strengths: "", evidence: "", supportNeeds: "", studentVoice: "", nextAction: "", reviewDate: "" },
    ];
    state.parentContacts = [{ id: "contact-1", student: "Alex Rivera", classId: "class-1", date: "2026-08-13", contact: "Email", reason: "", summary: "", agreement: "", followUpDate: "" }];
    expect(learnerRoute("class 1", "member/1")).toBe("/?section=students&classId=class%201&memberId=member%2F1");
    expect(getLearnerNotes(state, "class-1", "member-1")).toHaveLength(1);
    expect(getLearnerParentContacts(state, "class-1", "member-1", "Alex Rivera")).toHaveLength(1);
  });

  it("resets the authenticated user’s planner to the empty state", async () => {
    savePlannerState.mockResolvedValueOnce(EMPTY_PLANNER_STATE);
    const result = await appRouter.createCaller(context()).planner.reset();
    expect(result).toEqual(EMPTY_PLANNER_STATE);
    expect(savePlannerState).toHaveBeenCalledWith(42, EMPTY_PLANNER_STATE);
  });
});
