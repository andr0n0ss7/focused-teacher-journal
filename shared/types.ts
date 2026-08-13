/**
 * Unified type exports
 * Import shared types from this single entry point.
 */

export type * from "../drizzle/schema";
export * from "./_core/errors";

export type PlannerMember = {
  id: string;
  name: string;
};

export type PlannerClass = {
  id: string;
  name: string;
  room: string;
  color: string;
  members: PlannerMember[];
};

export type BellPeriod = {
  id: string;
  label: string;
  start: string;
  end: string;
  classId: string;
  room: string;
  transitionNote: string;
};

export type MonthlyEntry = {
  id: string;
  date: string;
  classId: string;
  kind: "deadline" | "holiday" | "task";
  title: string;
  details: string;
};

export type WeeklyPlan = {
  weekOf: string;
  priorities: string[];
  days: Record<string, {
    lessonPrep: string;
    studentFollowUp: string;
    grading: string;
    meetings: string;
    nextStep: string;
  }>;
};

export type DailyEntry = {
  date: string;
  energy: "low" | "steady" | "high" | "";
  quickCapture: string;
  notice: string;
  adjust: string;
  close: string;
};

export type GradingTask = {
  id: string;
  date: string;
  classId: string;
  task: string;
  status: "Collected" | "Missing" | "Late" | "Reviewed" | "Returned";
  nextAction: string;
};

export type StudentNote = {
  id: string;
  name: string;
  classId: string;
  rosterMemberId?: string;
  strengths: string;
  evidence: string;
  supportNeeds: string;
  studentVoice: string;
  nextAction: string;
  reviewDate: string;
};

export type ParentContact = {
  id: string;
  student: string;
  classId: string;
  rosterMemberId?: string;
  date: string;
  contact: string;
  reason: string;
  summary: string;
  agreement: string;
  followUpDate: string;
};

export type ImportantContact = {
  id: string;
  label: string;
  person: string;
  phone: string;
  notes: string;
};

export type Procedure = {
  id: string;
  title: string;
  locationOrWho: string;
  steps: string;
};

export type SupplementaryState = {
  resources: { id: string; resource: string; topic: string; location: string }[];
  meetings: { id: string; date: string; purpose: string; decision: string; ownerDate: string }[];
  handovers: { id: string; date: string; essentials: string; routines: string; materials: string }[];
  professionalLearning: { id: string; date: string; topic: string; keyIdea: string; tryNext: string }[];
  notes: { id: string; title: string; body: string }[];
};

export type PlannerState = {
  identity: {
    teacherName: string;
    subjects: string;
    year: string;
    term: string;
    classes: PlannerClass[];
  };
  bellSchedule: BellPeriod[];
  monthlyEntries: MonthlyEntry[];
  weeklyPlans: Record<string, WeeklyPlan>;
  dailyEntries: Record<string, DailyEntry>;
  gradingTasks: GradingTask[];
  studentNotes: StudentNote[];
  parentContacts: ParentContact[];
  importantContacts: ImportantContact[];
  procedures: Procedure[];
  supplementary: SupplementaryState;
};

export const getLinkedStudentName = (state: PlannerState, note: StudentNote) => state.identity.classes.find(classItem => classItem.id === note.classId)?.members.find(member => member.id === note.rosterMemberId)?.name || note.name;
export const learnerRoute = (classId: string, memberId: string) => `/?section=students&classId=${encodeURIComponent(classId)}&memberId=${encodeURIComponent(memberId)}`;
export const getLearnerNotes = (state: PlannerState, classId: string, memberId: string) => state.studentNotes.filter(note => note.classId === classId && note.rosterMemberId === memberId);
export const getLearnerParentContacts = (state: PlannerState, classId: string, memberId: string, memberName?: string) => state.parentContacts.filter(contact => contact.classId === classId && (contact.rosterMemberId === memberId || (!contact.rosterMemberId && contact.student === memberName)));

export const EMPTY_PLANNER_STATE: PlannerState = {
  identity: { teacherName: "", subjects: "", year: "", term: "", classes: [] },
  bellSchedule: [],
  monthlyEntries: [],
  weeklyPlans: {},
  dailyEntries: {},
  gradingTasks: [],
  studentNotes: [],
  parentContacts: [],
  importantContacts: [],
  procedures: [],
  supplementary: { resources: [], meetings: [], handovers: [], professionalLearning: [], notes: [] },
};
