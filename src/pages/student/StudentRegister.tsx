import { useState, type FormEvent } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useStudentAuth } from "@/hooks/use-student-auth";
import { useToast } from "@/hooks/use-toast";
import { UserPlus } from "lucide-react";

const StudentRegister = () => {
  const { isAuthenticated, register } = useStudentAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  if (isAuthenticated) {
    return <Navigate to="/student/dashboard" replace />;
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    const result = await register(name.trim(), email.trim(), password);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    toast({ title: "Welcome!", description: "Your student account is ready." });
    navigate("/student/dashboard", { replace: true });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4">
      <Card variant="elevated" className="w-full max-w-md p-8">
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
            <UserPlus className="w-5 h-5 text-primary" />
          </div>
          <h1 className="font-display text-2xl font-bold">Student Registration</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Available after Sur Samyam marks your inquiry as Converted (same email as your contact form).
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="student-name">Full name</Label>
            <Input
              id="student-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="student-email">Email</Label>
            <Input
              id="student-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="student-password">Password</Label>
            <Input
              id="student-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              required
            />
          </div>

          {error && (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          )}

          <Button type="submit" variant="hero" className="w-full">
            Create student account
          </Button>
        </form>

        <p className="mt-6 text-sm text-muted-foreground text-center">
          Already registered?{" "}
          <Link to="/student/login" className="text-primary hover:underline">
            Student login
          </Link>
        </p>
      </Card>
    </div>
  );
};

export default StudentRegister;
