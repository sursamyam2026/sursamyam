import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import CourseDetails from "./pages/fees/CourseDetails";
import ExistingStudent from "./pages/fees/ExistingStudent";
import ExamRegistration from "./pages/fees/ExamRegistration";
import Dashboard from "./pages/admin/Dashboard";
import Leads from "./pages/admin/Leads";
import { AdminLayout } from "./components/admin/AdminLayout";
import { ProtectedRoute } from "./components/admin/ProtectedRoute";
import EnrollStart from "./pages/student/EnrollStart";
import EnrollPayment from "./pages/student/EnrollPayment";
import EnrollSubmitted from "./pages/student/EnrollSubmitted";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/student/enroll" element={<EnrollStart />} />
          <Route path="/student/enroll/payment" element={<EnrollPayment />} />
          <Route path="/student/enroll/submitted" element={<EnrollSubmitted />} />
          <Route path="/fees/course-details" element={<CourseDetails />} />
          <Route path="/fees/existing-student" element={<ExistingStudent />} />
          <Route path="/fees/exam-registration" element={<ExamRegistration />} />
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
          </Route>
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;