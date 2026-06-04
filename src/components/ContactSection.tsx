import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Mail, Phone, MapPin, Send, Music } from "lucide-react";
import { useState } from "react";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import { useToast } from "@/hooks/use-toast";
import { leadsStore } from "@/lib/leads";
import { normalizePhoneNumber, validatePhoneNumber } from "@/lib/phone";

const ContactSection = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationError = validatePhoneNumber(formData.phone);
    if (validationError) {
      setPhoneError(validationError);
      return;
    }

    setPhoneError(null);
    setIsSubmitting(true);
    try {
      await leadsStore.add({
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: normalizePhoneNumber(formData.phone),
        message: formData.message.trim(),
      });
      toast({
        title: "Message sent!",
        description: "Thank you for reaching out. I'll get back to you soon!",
      });
      setFormData({ name: "", email: "", phone: "", message: "" });
    } catch (err) {
      toast({
        title: "Unable to send message",
        description: err instanceof Error ? err.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactInfo = [
    {
      icon: Mail,
      label: "Email",
      value: "sursamyam@gmail.com",
      href: "mailto:sursamyam@gmail.com",
    },
    {
      icon: Phone,
      label: "Phone",
      value: "8328952116 / 9611198173",
      href: "tel:+918328952116",
    },
    {
      icon: MapPin,
      label: "Location",
      value: "Sarjapur, Bangalore, India",
      href: "#",
    },
  ];

  return (
    <>
      <section id="contact" className="scroll-mt-[100px] relative overflow-hidden bg-[#1B4D3E] px-8 py-20">
        <div className="container relative z-10 mx-auto px-4">
          <div className="mx-auto max-w-6xl">
            <div className="text-center">
              <span className="mb-4 inline-block rounded-full border border-[#C9922A] bg-[#F5ECD7] px-4 py-1 text-[0.8rem] font-medium text-[#5C3A00]">
                Get in Touch
              </span>
              <h2 className="mb-6 font-display text-3xl font-bold text-white md:text-4xl lg:text-5xl">
                Ready to Begin Your Journey?
              </h2>
              <p className="mx-auto max-w-2xl text-lg text-[#D9CDB8]">
                Have questions? Want to book a trial class? Reach out and let's start
                your musical adventure together.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#FDF6EC] px-8 py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-5">
            <div className="space-y-8 lg:col-span-2">
              <div>
                <h3 className="mb-4 font-display text-2xl font-semibold text-[#1B4D3E]">
                  Let's Connect
                </h3>
                <p className="text-[#4A5E52]">
                  Whether you're curious about classes, interested in a trial session,
                  or just want to chat about music—I'm here for you.
                </p>
              </div>

              <div className="space-y-4">
                {contactInfo.map((item) => (
                  <a
                    key={item.label}
                    href={item.href}
                    className="group flex items-center gap-4 rounded-xl bg-white p-4 transition-colors hover:bg-white"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#F5ECD7]">
                      <item.icon className="h-5 w-5 text-[#C9922A]" />
                    </div>
                    <div>
                      <p className="text-sm text-[#1B4D3E]">{item.label}</p>
                      <p className="font-medium text-[#1B4D3E]">{item.value}</p>
                    </div>
                  </a>
                ))}
              </div>

              <Card variant="glass" className="mt-8 bg-white p-6">
                <div className="mb-3 flex items-center gap-3">
                  <Music className="h-5 w-5 text-[#C9922A]" />
                  <span className="text-sm font-medium text-[#1B4D3E]">A thought...</span>
                </div>
                <p className="font-display text-lg italic text-[#1B4D3E]">
                  "The voice is the original instrument. Let's discover yours together."
                </p>
              </Card>
            </div>

            <Card variant="elevated" className="bg-white p-8 lg:col-span-3">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-[#1B4D3E]">Your Name</Label>
                    <Input
                      id="name"
                      placeholder="Enter your name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      className="h-12 border-[#C9922A] bg-white text-[#1B4D3E] placeholder:text-[#4A5E52]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-[#1B4D3E]">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                      className="h-12 border-[#C9922A] bg-white text-[#1B4D3E] placeholder:text-[#4A5E52]"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-[#1B4D3E]">Phone Number</Label>
                  <PhoneInput
                    id="phone"
                    international
                    value={formData.phone}
                    onChange={(value) => {
                      setFormData({ ...formData, phone: value ?? "" });
                      setPhoneError(null);
                    }}
                    placeholder="Enter your mobile number"
                    required
                    className="phone-input h-12 rounded-md border border-[#C9922A] bg-white px-3 text-[#1B4D3E]"
                    aria-invalid={!!phoneError}
                    aria-describedby={phoneError ? "phone-error" : undefined}
                  />
                  {phoneError && (
                    <p id="phone-error" className="text-sm text-destructive" role="alert">
                      {phoneError}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message" className="text-[#1B4D3E]">Your Message (Optional)</Label>
                  <Textarea
                    id="message"
                    placeholder="Tell me about your musical interests, experience level, and what you hope to learn..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="min-h-[150px] resize-none border-[#C9922A] bg-white text-[#1B4D3E] placeholder:text-[#4A5E52]"
                  />
                </div>

                <Button
                  type="submit"
                  variant="hero"
                  size="lg"
                  className="w-full bg-[#C9922A] text-[#1B1100]"
                  disabled={isSubmitting}
                >
                  <Send className="mr-2 h-5 w-5" />
                  {isSubmitting ? "Sending..." : "Send Message"}
                </Button>
              </form>
            </Card>
          </div>
        </div>
      </section>
    </>
  );
};

export default ContactSection;
