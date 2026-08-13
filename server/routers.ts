import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { EMPTY_PLANNER_STATE, PlannerState } from "@shared/types";
import { getPlannerState, savePlannerState } from "./db";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { TRPCError } from "@trpc/server";

const statusSchema = z.enum(["Collected", "Missing", "Late", "Reviewed", "Returned"]);
const plannerStateSchema = z.object({
  identity: z.object({
    teacherName: z.string(),
    subjects: z.string(),
    year: z.string(),
    term: z.string(),
    classes: z.array(z.object({ id: z.string(), name: z.string(), room: z.string(), color: z.string(), members: z.array(z.string()).default([]) })).max(8),
  }),
  bellSchedule: z.array(z.object({ id: z.string(), label: z.string(), start: z.string(), end: z.string(), classId: z.string(), room: z.string(), transitionNote: z.string() })),
  monthlyEntries: z.array(z.object({ id: z.string(), date: z.string(), classId: z.string(), kind: z.enum(["deadline", "holiday", "task"]), title: z.string(), details: z.string() })),
  weeklyPlans: z.record(z.string(), z.any()),
  dailyEntries: z.record(z.string(), z.any()),
  gradingTasks: z.array(z.object({ id: z.string(), date: z.string(), classId: z.string(), task: z.string(), status: statusSchema, nextAction: z.string() })),
  studentNotes: z.array(z.any()),
  parentContacts: z.array(z.any()),
  importantContacts: z.array(z.any()),
  procedures: z.array(z.any()),
  supplementary: z.object({ resources: z.array(z.any()), meetings: z.array(z.any()), handovers: z.array(z.any()), professionalLearning: z.array(z.any()), notes: z.array(z.any()) }),
});

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  planner: router({
    get: protectedProcedure.query(async ({ ctx }) => {
      return getPlannerState(ctx.user.id);
    }),
    save: protectedProcedure.input(z.object({ state: plannerStateSchema })).mutation(async ({ ctx, input }) => {
      const state = input.state as PlannerState;
      if (state.identity.classes.length > 8) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "A maximum of 8 classes is supported." });
      }
      return savePlannerState(ctx.user.id, state);
    }),
    reset: protectedProcedure.mutation(async ({ ctx }) => {
      return savePlannerState(ctx.user.id, EMPTY_PLANNER_STATE);
    }),
  }),
});

export type AppRouter = typeof appRouter;
