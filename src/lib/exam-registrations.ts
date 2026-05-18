import type { ExamRegistration } from "@/lib/exam-registrations.types";

export type { ExamRegistration };

const KEY = "swarshiksha:exam-registrations";
const EVENT = "swarshiksha:exam-registrations:changed";

function normalizeRollNumber(rollNumber: string) {
  return rollNumber.trim().toLowerCase();
}

function coerceRegistration(raw: unknown): ExamRegistration | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const id = typeof o.id === "string" ? o.id : "";
  const rollNumber = typeof o.rollNumber === "string" ? o.rollNumber : "";
  if (!id || !rollNumber) return null;

  return {
    id,
    rollNumber,
    createdAt: typeof o.createdAt === "string" ? o.createdAt : new Date().toISOString(),
  };
}

function read(): ExamRegistration[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map(coerceRegistration).filter(Boolean) as ExamRegistration[];
  } catch {
    return [];
  }
}

function write(registrations: ExamRegistration[]) {
  localStorage.setItem(KEY, JSON.stringify(registrations));
  window.dispatchEvent(new Event(EVENT));
}

export const examRegistrationsStore = {
  list() {
    return read().sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  },

  findByRollNumber(rollNumber: string): ExamRegistration | null {
    const needle = normalizeRollNumber(rollNumber);
    if (!needle) return null;
    return (
      read().find(
        (registration) => normalizeRollNumber(registration.rollNumber) === needle,
      ) ?? null
    );
  },

  add(rollNumber: string): ExamRegistration {
    const registration: ExamRegistration = {
      id: crypto.randomUUID(),
      rollNumber: rollNumber.trim(),
      createdAt: new Date().toISOString(),
    };
    write([registration, ...read()]);
    return registration;
  },

  remove(id: string) {
    write(read().filter((registration) => registration.id !== id));
  },

  subscribe(cb: () => void): () => void {
    const handler = () => cb();
    window.addEventListener(EVENT, handler);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener(EVENT, handler);
      window.removeEventListener("storage", handler);
    };
  },
};
