import { useEffect, useState, type FormEvent } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import {
  adultCourses,
  kidsCourses,
  type CourseFormat,
  type FeeTrack,
  getCourse,
} from "@/lib/fees-courses";
import {
  countryNameFromCode,
  countryNameFromPhoneNumber,
  normalizePhoneNumber,
  validatePhoneNumber,
} from "@/lib/phone";

export type EnrollCheckoutState = {
  name: string;
  email: string;
  phone: string;
  age: string;
  city: string;
  country: string;
  track: FeeTrack;
  courseName: string;
  format: CourseFormat;
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
  const queryFormat: CourseFormat = params.get("format") === "offline" ? "offline" : "online";

  const [name, setName] = useState(pref.name ?? "");
  const [email, setEmail] = useState(pref.email ?? "");
  const initialPhone = normalizePhoneNumber(pref.phone ?? "");
  const [phone, setPhone] = useState(initialPhone);
  const [age, setAge] = useState(pref.age ?? "");
  const [city, setCity] = useState(pref.city ?? "");
  const [country, setCountry] = useState(pref.country ?? countryNameFromPhoneNumber(initialPhone));
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [track] = useState<FeeTrack>(initialTrack);
  const [format] = useState<CourseFormat>(
    pref.format === "offline" || pref.format === "online" ? pref.format : queryFormat,
  );

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

    const validationError = validatePhoneNumber(phone);
    if (validationError) {
      setPhoneError(validationError);
      return;
    }

    setPhoneError(null);
    const state: EnrollCheckoutState = {
      name,
      email,
      phone: normalizePhoneNumber(phone),
      age,
      city,
      country,
      track,
      courseName: fc.name,
      format,
    };
    navigate("/student/enroll/payment", { state });
  };

  return (
    <div className="min-h-screen bg-muted/30 px-4 py-10 overflow-hidden">
      <div className="mx-auto max-w-lg">
        <Card variant="elevated" className="p-8 overflow-visible">
          <button
            type="button"
            onClick={() => navigate("/registration/course-details")}
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
                  placeholder="Your full name"
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
                  placeholder="you@example.com"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="enroll-phone">Phone</Label>
                <PhoneInput
                  id="enroll-phone"
                  international
                  value={phone}
                  onChange={(value) => {
                    setPhone(value ?? "");
                    setPhoneError(null);
                  }}
                  onCountryChange={(selectedCountry) => {
                    const selectedCountryName = countryNameFromCode(selectedCountry);
                    if (selectedCountryName) setCountry(selectedCountryName);
                  }}
                  autoComplete="tel"
                  placeholder="Enter mobile number"
                  required
                  className="phone-input h-10 rounded-md border border-input bg-background px-3 text-sm"
                  aria-invalid={!!phoneError}
                  aria-describedby={phoneError ? "enroll-phone-error" : undefined}
                />
                {phoneError && (
                  <p id="enroll-phone-error" className="text-sm text-destructive" role="alert">
                    {phoneError}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="enroll-age">Age</Label>
                <Input
                  id="enroll-age"
                  inputMode="numeric"
                  value={age}
                  onChange={(e) => setAge(e.target.value.replace(/\D/g, ""))}
                  placeholder="18"
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
                  placeholder="Mumbai"
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
                  placeholder="India"
                  required
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
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
              <div className="space-y-2">
                <Label>Format</Label>
                <Input
                  value={format === "online" ? "Online" : "Offline"}
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
