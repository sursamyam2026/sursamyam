import { Heart, Instagram, Youtube, Mail } from "lucide-react";
import { Link } from "react-router-dom";
import logo from "@/assets/logo.jpeg";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    { icon: Instagram, href: "#", label: "Instagram" },
    { icon: Youtube, href: "#", label: "YouTube" },
    { icon: Mail, href: "mailto:hello@sursamyam.com", label: "Email" },
  ];

  const quickLinks = [
    { href: "#about", label: "About" },
    { href: "#music", label: "The Music" },
    { href: "#teacher", label: "Your Teacher" },
    { href: "#classes", label: "Classes" },
    { href: "/syllabus", label: "Syllabus" },
    { href: "/registration/course-details", label: "Courses" },
    { href: "/registration/exam-registration", label: "Exam Registration" },
    { href: "#contact", label: "Contact" },
  ];

  return (
    <footer className="bg-[#0F2D22] py-16 text-[#D9CDB8]">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-12 mb-12">
            {/* Brand */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <img src={logo} alt="Sur Samyam" className="w-12 h-12 rounded-full object-cover" />
                <span className="font-display text-xl font-semibold text-[#C9922A]">Sur Samyam</span>
              </div>
              <p className="text-sm leading-relaxed text-[#D9CDB8]">
                Discover the beauty of Hindustani classical music through personalized, 
                joyful learning experiences designed for beginners.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-display text-lg font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2">
                {quickLinks.map((link) => (
                  <li key={link.href}>
                    {link.href.startsWith("/") ? (
                      <Link
                        to={link.href}
                        className="text-sm text-[#D9CDB8] transition-colors hover:text-[#C9922A]"
                      >
                        {link.label}
                      </Link>
                    ) : (
                      <a
                        href={link.href}
                        className="text-sm text-[#D9CDB8] transition-colors hover:text-[#C9922A]"
                      >
                        {link.label}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            {/* Social & Contact */}
            <div>
              <h4 className="font-display text-lg font-semibold mb-4">Connect</h4>
              <div className="flex gap-3 mb-6">
                {socialLinks.map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    aria-label={social.label}
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1B4D3E]/25 text-[#C9922A] transition-colors hover:bg-[#1B4D3E]/45"
                  >
                    <social.icon className="h-5 w-5" />
                  </a>
                ))}
              </div>
              <p className="text-sm text-[#D9CDB8]">
                Based in Mumbai, India<br />
                Teaching globally via online sessions
              </p>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="flex flex-col items-center justify-between gap-4 border-t border-[#1B4D3E] pt-8 md:flex-row">
            <p className="text-sm text-[#7A8C7E]">
              © {currentYear} Sur Samyam. All rights reserved.
            </p>
            <p className="flex items-center gap-1 text-sm text-[#7A8C7E]">
              Made with <Heart className="h-4 w-4 fill-[#C9922A] text-[#C9922A]" /> for music lovers
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
