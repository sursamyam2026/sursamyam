export type EnrollmentFeeTrack = "adults" | "kids";

export interface EnrollmentPaymentSnapshot {
  courseName: string;
  track: EnrollmentFeeTrack;
  monthlyRupee: number;
  registrationRupee: number;
  convenienceRupee: number;
  grandTotalRupee: number;
  demoCompletedAt: string;
  paymentStatus: "demo_completed" | "pending_gateway";
}

export interface StudentAccount {
  id: string;
  email: string;
  name: string;
  /** Demo only — replace with hashed secrets + server auth for production. */
  password: string;
  createdAt: string;
  phone?: string;
  age?: string;
  city?: string;
  country?: string;
  enrollmentSnapshot?: EnrollmentPaymentSnapshot;
}

export interface StudentSession {
  studentId: string;
  email: string;
  name: string;
  loggedInAt: string;
}
