import crypto from "node:crypto";
import type {
  FinalResult,
  Session,
  TestAttempt,
  User,
  UserRole,
} from "@/lib/types";
import { SECTION_ORDER } from "@/lib/questions";
import { SectionType } from "@prisma/client";

type Store = {
  users: User[];
  sessions: Session[];
  attempts: TestAttempt[];
  results: FinalResult[];
};

declare global {
  var __prismStore: Store | undefined;
}

function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex");
}

function makeId(prefix: string): string {
  return `${prefix}_${crypto.randomUUID()}`;
}

function detectRoleByEmail(email: string): UserRole {
  return email.includes("admin") ? "admin" : "student";
}

function seedStore(): Store {
  const now = new Date().toISOString();
  const adminUser: User = {
    id: makeId("user"),
    email: "admin@president.ac.id",
    passwordHash: hashPassword("admin12345"),
    role: "admin",
    fullName: "Campus Admin",
    major: "Operations",
    cohort: "2026",
    createdAt: now,
  };

  const studentUser: User = {
    id: makeId("user"),
    email: "student@studet.president.ac.id",
    passwordHash: hashPassword("student12345"),
    role: "student",
    fullName: "Development Student",
    major: "Informatics",
    cohort: "2026",
    createdAt: now,
  };

  return {
    users: [adminUser, studentUser],
    sessions: [],
    attempts: [],
    results: [],
  };
}

function getStore(): Store {
  if (!globalThis.__prismStore) {
    globalThis.__prismStore = seedStore();
  }

  return globalThis.__prismStore;
}

export function getAllowedDomains(): string[] {
  const defaults = [
    "president.ac.id",
    "studet.president.ac.id",
    "student.president.ac.id",
  ];
  const raw = process.env.CAMPUS_EMAIL_DOMAINS;
  if (!raw) return defaults;

  const parsed = raw
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);

  return parsed.length > 0 ? parsed : defaults;
}

export function isAllowedCampusEmail(email: string): boolean {
  const normalized = email.toLowerCase();
  return getAllowedDomains().some((domain) =>
    normalized.endsWith(`@${domain}`),
  );
}

export function createUser(input: {
  email: string;
  password: string;
  fullName: string;
  major: string;
  cohort: string;
}): User {
  const store = getStore();

  const existing = store.users.find(
    (user) => user.email.toLowerCase() === input.email.toLowerCase(),
  );
  if (existing) {
    throw new Error("EMAIL_EXISTS");
  }

  const user: User = {
    id: makeId("user"),
    email: input.email.toLowerCase(),
    passwordHash: hashPassword(input.password),
    role: detectRoleByEmail(input.email),
    fullName: input.fullName,
    major: input.major,
    cohort: input.cohort,
    createdAt: new Date().toISOString(),
  };

  store.users.push(user);
  return user;
}

export function verifyUser(email: string, password: string): User | null {
  const store = getStore();
  const user = store.users.find(
    (item) => item.email.toLowerCase() === email.toLowerCase(),
  );
  if (!user) return null;

  return user.passwordHash === hashPassword(password) ? user : null;
}

export function createSession(userId: string): Session {
  const store = getStore();
  const session: Session = {
    token: makeId("sess"),
    userId,
    createdAt: new Date().toISOString(),
  };

  store.sessions.push(session);
  return session;
}

export function removeSession(token: string): void {
  const store = getStore();
  store.sessions = store.sessions.filter((session) => session.token !== token);
}

export function findSession(token: string): Session | undefined {
  const store = getStore();
  return store.sessions.find((session) => session.token === token);
}

export function findUserById(userId: string): User | undefined {
  return getStore().users.find((user) => user.id === userId);
}

export function getAttemptByUserId(userId: string): TestAttempt | undefined {
  return getStore().attempts.find((attempt) => attempt.userId === userId);
}

export function createAttempt(userId: string): TestAttempt {
  const store = getStore();

  const existing = store.attempts.find((attempt) => attempt.userId === userId);
  if (existing) {
    return existing;
  }

  const attempt: TestAttempt = {
    id: makeId("attempt"),
    userId,
    status: "in_progress",
    currentSection: SECTION_ORDER[0] as any,
    startedAt: new Date().toISOString(),
    answers: {},
  };

  store.attempts.push(attempt);
  return attempt;
}

export function saveAttempt(input: {
  userId: string;
  answers: Record<string, string>;
  writingResponse?: string;
  speakingResponse?: string;
  currentSection?: TestAttempt["currentSection"];
}): TestAttempt {
  const store = getStore();
  const attempt = store.attempts.find((item) => item.userId === input.userId);

  if (!attempt) {
    throw new Error("ATTEMPT_NOT_FOUND");
  }

  attempt.answers = { ...attempt.answers, ...input.answers };

  if (typeof input.writingResponse === "string") {
    attempt.writingResponse = input.writingResponse;
  }

  if (typeof input.speakingResponse === "string") {
    attempt.speakingResponse = input.speakingResponse;
  }

  if (input.currentSection) {
    attempt.currentSection = input.currentSection as any;
  }

  return attempt;
}

export function submitAttempt(userId: string): TestAttempt {
  const attempt = getStore().attempts.find((item) => item.userId === userId);
  if (!attempt) {
    throw new Error("ATTEMPT_NOT_FOUND");
  }

  if (
    attempt.status === "submitted" ||
    attempt.status === "processing" ||
    attempt.status === "completed"
  ) {
    return attempt;
  }

  attempt.status = "submitted";
  attempt.submittedAt = new Date().toISOString();
  return attempt;
}

export function markAttemptCompleted(attemptId: string): void {
  const attempt = getStore().attempts.find((item) => item.id === attemptId);
  if (!attempt) return;

  attempt.status = "completed";
  attempt.completedAt = new Date().toISOString();
}

export function upsertFinalResult(
  input: Omit<FinalResult, "id" | "computedAt">,
): FinalResult {
  const store = getStore();
  const existing = store.results.find(
    (result) => result.attemptId === input.attemptId,
  );
  const computedAt = new Date().toISOString();

  if (existing) {
    existing.vocabScore = input.vocabScore;
    existing.grammarScore = input.grammarScore;
    existing.readingScore = input.readingScore;
    existing.writingScore = input.writingScore;
    existing.speakingScore = input.speakingScore;
    existing.totalScore = input.totalScore;
    existing.level = input.level;
    existing.computedAt = computedAt;
    return existing;
  }

  const result: FinalResult = {
    id: makeId("result"),
    computedAt,
    ...input,
  };

  store.results.push(result);
  return result;
}

export function getResultByUserId(userId: string): FinalResult | undefined {
  return getStore().results.find((result) => result.userId === userId);
}

export function listResults(filter?: {
  cohort?: string;
  major?: string;
}): Array<FinalResult & { user: User }> {
  const store = getStore();

  return store.results
    .map((result) => {
      const user = store.users.find((item) => item.id === result.userId);
      if (!user) return null;
      return { ...result, user };
    })
    .filter((entry): entry is FinalResult & { user: User } => Boolean(entry))
    .filter((entry) => {
      if (filter?.cohort && entry.user.cohort !== filter.cohort) return false;
      if (filter?.major && entry.user.major !== filter.major) return false;
      return true;
    });
}
