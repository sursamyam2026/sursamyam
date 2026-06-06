export type AttendanceStatus = "present" | "absent";

export interface AttendanceRecord {
  id: string;
  sessionId: string;
  leadId: string;
  classDate: string;
  status: AttendanceStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AttendanceInput {
  sessionId: string;
  leadId: string;
  status: AttendanceStatus;
  notes?: string;
}

export interface ClassSession {
  id: string;
  classDate: string;
  classDay: string;
  classTime: string;
  courseType: string;
  createdAt: string;
  updatedAt: string;
}

export interface ClassSessionInput {
  classDate: string;
  classDay: string;
  classTime: string;
  courseType: string;
}

export interface ClassRosterMember {
  id: string;
  sessionId: string;
  leadId: string;
  createdAt: string;
}
