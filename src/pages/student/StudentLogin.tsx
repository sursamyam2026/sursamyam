import { useState, type FormEvent } from "react";
import { Link, Navigate, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useStudentAuth } from "@/hooks/use-student-auth";
import { useToast } from "@/hooks/use-toast";
import { LogIn } from "lucide-react";

const StudentLogin = () => {
  const { isAuthenticated, login } = useStudentAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const from = (location.state as { from?: string } | null)?.from || "/student/dashboard";

  if (isAuthenticated) {
    return <Navigate to="/student/dashboard" replace />;
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    const result = login(email.trim(), password);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    toast({ title: "Signed in", description: "Welcome back." });
    navigate(from, { replace: true });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4">
      <Card variant="elevated" className="w-full max-w-md p-8">
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
            <LogIn className="w-5 h-5 text-primary" />
          </div>
          <h1 className="font-display text-2xl font-bold">Student Login</h1>
          <p className="text-sm text-muted-foreground mt-1">Access your student profile</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="login-email">Email</Label>
            <Input
              id="login-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="login-password">Password</Label>
            <Input
              id="login-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </div>

          {error && (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          )}

          <Button type="submit" variant="hero" className="w-full">
            Sign In
          </Button>
        </form>

        <p className="mt-6 text-sm text-muted-foreground text-center">
          Need an account?{" "}
          <Link to="/student/register" className="text-primary hover:underline">
            Register here
          </Link>
        </p>
      </Card>
    </div>
  );
};

export default StudentLogin;
