/** Lead pipeline: sales → registration → enrollment (roll number assigned on enrolled only). */

export type LeadStatus =
  | "new"
  | "contacted"
  | "converted"
  | "registered"
  | "enrolled"
  | "discontinued"
  | "declined";

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone?: string;
  message: string;
  status: LeadStatus;
  createdAt: string; // ISO
  rollNumber?: string;
  enrolledAt?: string; // ISO — set when status becomes enrolled
}
