import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect } from "react";
import { BrowserRouter, Navigate, Routes, Route, useLocation } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Gallery from "./pages/Gallery";
import Syllabus from "./pages/Syllabus";
import CourseDetails from "./pages/fees/CourseDetails";
import ExistingStudent from "./pages/fees/ExistingStudent";
import ExamRegistration from "./pages/fees/ExamRegistration";
import Dashboard from "./pages/admin/Dashboard";
import GalleryManager from "./pages/admin/GalleryManager";
import Leads from "./pages/admin/Leads";
import ExamRegistrations from "./pages/admin/ExamRegistrations";
import Attendance from "./pages/admin/Attendance";
import { AdminLayout } from "./components/admin/AdminLayout";
import { ProtectedRoute } from "./components/admin/ProtectedRoute";
import EnrollStart from "./pages/student/EnrollStart";
import EnrollPayment from "./pages/student/EnrollPayment";
import EnrollSubmitted from "./pages/student/EnrollSubmitted";

const queryClient = new QueryClient();

const ScrollToTop = () => {
  const location = useLocation();

  useEffect(() => {
    if (location.hash) return;

    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [location.key, location.pathname, location.search, location.hash]);

  return null;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/syllabus" element={<Syllabus />} />
          <Route path="/login" element={<Login />} />
          <Route path="/student/enroll" element={<EnrollStart />} />
          <Route path="/student/enroll/payment" element={<EnrollPayment />} />
          <Route path="/student/enroll/submitted" element={<EnrollSubmitted />} />
          <Route path="/registration/course-details" element={<CourseDetails />} />
          <Route path="/fees/existing-student" element={<ExistingStudent />} />
          <Route path="/registration/exam-registration" element={<ExamRegistration />} />
          <Route
            path="/fees/course-details"
            element={<Navigate to="/registration/course-details" replace />}
          />
          <Route
            path="/fees/exam-registration"
            element={<Navigate to="/registration/exam-registration" replace />}
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="leads" element={<Leads />} />
            <Route path="attendance" element={<Attendance />} />
            <Route path="exam-registrations" element={<ExamRegistrations />} />
            <Route path="gallery" element={<GalleryManager />} />
          </Route>
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
