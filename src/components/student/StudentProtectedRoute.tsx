import { Navigate } from "react-router-dom";
import { useStudentAuth } from "@/hooks/use-student-auth";

export const StudentProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useStudentAuth();
  if (!isAuthenticated) {
    return <Navigate to="/student/enroll" replace />;
  }

  return <>{children}</>;
};
