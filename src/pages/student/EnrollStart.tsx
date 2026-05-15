import { useEffect, useState, type FormEvent } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export type EnrollCheckoutState = {
  name: string;
  email: string;
  phone: string;
  age: string;
  city: string;
  country: string;
  courseName: string;
};

const adultCourses = [
  { name: "Shadaj", monthlyRupee: 4000, registrationRupee: 1000 },
  { name: "Pancham", monthlyRupee: 2000, registrationRupee: 1000 },
];

const kidsCourses = [
  { name: "Gandhar", monthlyRupee: 4000, registrationRupee: 1000 },
  { name: "Nishad", monthlyRupee: 2000, registrationRupee: 1000 },
];

const EnrollStart = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const queryTrack = params.get("track") === "kids" ? "kids" : "adults";
  const paramCourse = params.get("course")?.trim() || "";

  const courses = queryTrack === "adults" ? adultCourses : kidsCourses;
  const defaultCourse = paramCourse && courses.find((c) => c.name === paramCourse) ? paramCourse : courses[0]?.name ?? "";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [age, setAge] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [courseName, setCourseName] = useState(defaultCourse);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    const state: EnrollCheckoutState = {
      name,
      email,
      phone,
      age,
      city,
      country,
      courseName: `${queryTrack === "adults" ? "Adults" : "Kids"} - ${courseName}`,
    };
    navigate("/student/enroll/payment", { state });
  };

  return (
    <div className="min-h-screen bg-muted/30 px-4 py-10 overflow-hidden">
      <div className="mx-auto max-w-lg">
        <Card variant="elevated" className="p-8 overflow-visible">
          <button
            type="button"
            onClick={() => navigate("/fees/new-student")}
            className="mb-4 text-sm text-[#4A5E52] hover:text-[#C9922A] transition-colors"
          >
            ← Back to Courses
          </button>
          <h1 className="font-display text-2xl font-bold text-[#1B4D3E] mb-2">Enroll · Your details</h1>
          <p className="text-sm text-muted-foreground mb-6">
            Enter your information, then continue to review payment breakdown and terms.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="enroll-name">Full name</Label>
                <Input
                  id="enroll-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="enroll-email">Email</Label>
                <Input
                  id="enroll-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="enroll-phone">Phone</Label>
                <Input
                  id="enroll-phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  autoComplete="tel"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="enroll-age">Age</Label>
                <Input
                  id="enroll-age"
                  inputMode="numeric"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="enroll-city">City</Label>
                <Input
                  id="enroll-city"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  autoComplete="address-level2"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="enroll-country">Country</Label>
                <Input
                  id="enroll-country"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  autoComplete="country-name"
                  required
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Program</Label>
                <Input
                  value={queryTrack === "adults" ? "Adults" : "Kids"}
                  disabled
                  className="bg-gray-100 text-[#1B4D3E] cursor-not-allowed"
                />
              </div>
              <div className="space-y-2">
                <Label>Course</Label>
                <select
                  value={courseName}
                  onChange={(e) => setCourseName(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-[#1B4D3E]"
                >
                  {courses.map((c) => (
                    <option key={c.name} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <Button type="submit" variant="hero" className="w-full mt-4">
              Continue
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default EnrollStart;