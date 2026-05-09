import { Navigate, useLocation } from "react-router-dom";
import { useStudentAuth } from "@/hooks/use-student-auth";

export const StudentProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useStudentAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/student/login" state={{ from: location.pathname }} replace />;
  }

  return <>{children}</>;
};
