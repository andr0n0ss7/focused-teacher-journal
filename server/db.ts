import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertPlannerDocument, InsertUser, PlannerDocument, plannerDocuments, users } from "../drizzle/schema";
import { EMPTY_PLANNER_STATE, PlannerState } from "@shared/types";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) return;
  const values: InsertUser = { openId: user.openId };
  const updateSet: Record<string, unknown> = {};
  const textFields = ["name", "email", "loginMethod"] as const;
  for (const field of textFields) {
    if (user[field] !== undefined) {
      values[field] = user[field] ?? null;
      updateSet[field] = user[field] ?? null;
    }
  }
  values.lastSignedIn = user.lastSignedIn ?? new Date();
  updateSet.lastSignedIn = values.lastSignedIn;
  if (user.role !== undefined) {
    values.role = user.role;
    updateSet.role = user.role;
  } else if (user.openId === ENV.ownerOpenId) {
    values.role = "admin";
    updateSet.role = "admin";
  }
  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result[0];
}

export async function getPlannerState(userId: number): Promise<PlannerState> {
  const db = await getDb();
  if (!db) return EMPTY_PLANNER_STATE;
  const result = await db.select().from(plannerDocuments).where(eq(plannerDocuments.userId, userId)).limit(1);
  const row = result[0] as PlannerDocument | undefined;
  return (row?.content as PlannerState | undefined) ?? EMPTY_PLANNER_STATE;
}

export async function savePlannerState(userId: number, state: PlannerState): Promise<PlannerState> {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const values: InsertPlannerDocument = { userId, content: state as unknown as Record<string, unknown> };
  await db.insert(plannerDocuments).values(values).onDuplicateKeyUpdate({ set: { content: values.content } });
  return state;
}
