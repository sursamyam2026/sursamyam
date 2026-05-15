import { useEffect, useState } from "react";
import type { StudentSession } from "@/lib/student-auth.types";
import { studentAuth } from "@/lib/student-auth";

export function useStudentAuth() {
  const [session, setSession] = useState<StudentSession | null>(() => studentAuth.session.getSession());

  useEffect(() => studentAuth.subscribe(() => setSession(studentAuth.session.getSession())), []);

  return {
    session,
    isAuthenticated: session !== null,
    register: studentAuth.register,
    login: studentAuth.login,
    logout: studentAuth.logout,
    completeEnrollmentCheckout: studentAuth.completeEnrollmentCheckout,
  };
}
