import { Heart, Instagram, Youtube, Mail } from "lucide-react";
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
    { href: "#classes", label: "Classes" },
    { href: "#teacher", label: "Your Teacher" },
    { href: "/fees/new-student", label: "Fees" },
    { href: "#contact", label: "Contact" },
  ];

  return (
    <footer className="bg-popover text-foreground py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-12 mb-12">
            {/* Brand */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <img src={logo} alt="Sur Samyam" className="w-12 h-12 rounded-full object-cover" />
                <span className="font-display text-xl font-semibold">Sur Samyam</span>
              </div>
              <p className="text-foreground/70 text-sm leading-relaxed">
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
                    <a 
                      href={link.href} 
                      className="text-foreground/70 hover:text-primary transition-colors text-sm"
                    >
                      {link.label}
                    </a>
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
                    className="w-10 h-10 rounded-full bg-primary/10 hover:bg-primary/20 flex items-center justify-center transition-colors"
                  >
                    <social.icon className="w-5 h-5" />
                  </a>
                ))}
              </div>
              <p className="text-foreground/70 text-sm">
                Based in Mumbai, India<br />
                Teaching globally via online sessions
              </p>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-8 border-t border-primary/20 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-foreground/50 text-sm">
              © {currentYear} Sur Samyam. All rights reserved.
            </p>
            <p className="text-foreground/50 text-sm flex items-center gap-1">
              Made with <Heart className="w-4 h-4 text-primary fill-primary" /> for music lovers
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
