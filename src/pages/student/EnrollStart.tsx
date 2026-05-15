import { useEffect, useState, type FormEvent } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  adultCourses,
  kidsCourses,
  type FeeTrack,
  getCourse,
} from "@/lib/fees-courses";

export type EnrollCheckoutState = {
  name: string;
  email: string;
  phone: string;
  age: string;
  city: string;
  country: string;
  track: FeeTrack;
  courseName: string;
};

const EnrollStart = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [params] = useSearchParams();

  const pref = (location.state as Partial<EnrollCheckoutState> | null) ?? {};

  const queryTrack: FeeTrack | null = params.get("track") === "kids" ? "kids" : params.get("track") === "adults" ? "adults" : null;
  const initialTrack: FeeTrack =
    (pref.track === "adults" || pref.track === "kids" ? pref.track : null) ?? queryTrack ?? "adults";
  const paramCourse = params.get("course")?.trim() || "";

  const [name, setName] = useState(pref.name ?? "");
  const [email, setEmail] = useState(pref.email ?? "");
  const [phone, setPhone] = useState(pref.phone ?? "");
  const [age, setAge] = useState(pref.age ?? "");
  const [city, setCity] = useState(pref.city ?? "");
  const [country, setCountry] = useState(pref.country ?? "");
  const [track] = useState<FeeTrack>(initialTrack);

  const [courseName] = useState(() => {
    const starter = initialTrack === "adults" ? adultCourses : kidsCourses;
    if (pref.courseName && getCourse(initialTrack, pref.courseName)) return pref.courseName;
    if (paramCourse && getCourse(initialTrack, paramCourse)) return paramCourse;
    return starter[0]?.name ?? "";
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const fc = getCourse(track, courseName);
    if (!fc) return;

    const state: EnrollCheckoutState = {
      name,
      email,
      phone,
      age,
      city,
      country,
      track,
      courseName: fc.name,
    };
    navigate("/student/enroll/payment", { state });
  };

  return (
    <div className="min-h-screen bg-muted/30 px-4 py-10 overflow-hidden">
      <div className="mx-auto max-w-lg">
        <Card variant="elevated" className="p-8 overflow-visible">
          <button
            type="button"
            onClick={() => navigate("/fees/course-details")}
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
                  value={track === "adults" ? "Adults" : "Kids"}
                  disabled
                  className="bg-gray-100 text-[#1B4D3E] cursor-not-allowed"
                />
              </div>
              <div className="space-y-2">
                <Label>Course</Label>
                <Input
                  value={courseName}
                  disabled
                  className="bg-gray-100 text-[#1B4D3E] cursor-not-allowed"
                />
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