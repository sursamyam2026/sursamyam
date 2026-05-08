import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import logo from "@/assets/logo.jpeg";

const sectionLinks = [
  { hash: "about", label: "About" },
  { hash: "music", label: "The Music" },
  { hash: "classes", label: "Classes" },
  { hash: "teacher", label: "Your Teacher" },
];

const feesLinks = [
  { to: "/fees/new-student", label: "New Student" },
  { to: "/fees/existing-student", label: "Existing Student" },
  { to: "/fees/exam-registration", label: "Exam Registration" },
];

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [mobileFeesOpen, setMobileFeesOpen] = useState(false);
  const location = useLocation();
  const onHome = location.pathname === "/";

  const sectionHref = (hash: string) => (onHome ? `#${hash}` : `/#${hash}`);
  const contactHref = sectionHref("contact");

  const linkClass =
    "text-foreground/80 hover:text-primary font-medium transition-colors relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-primary hover:after:w-full after:transition-all";

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-popover/95 backdrop-blur-md border-b border-primary/20">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-2 min-h-16 lg:min-h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group py-1">
            <img
              src={logo}
              alt="Sur Samyam School of Music"
              className="h-14 w-14 rounded-full object-cover shadow-md ring-2 ring-primary/40 group-hover:scale-105 transition-transform duration-300"
            />
            <span className="font-display text-xl font-bold text-primary">
              Sur Samyam
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-8">
            {sectionLinks.map((link) => (
              <a key={link.hash} href={sectionHref(link.hash)} className={linkClass}>
                {link.label}
              </a>
            ))}

            <DropdownMenu>
              <DropdownMenuTrigger
                className={`${linkClass} flex items-center gap-1 outline-none`}
              >
                Fees <ChevronDown className="w-4 h-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                {feesLinks.map((l) => (
                  <DropdownMenuItem key={l.to} asChild>
                    <Link to={l.to} className="cursor-pointer">
                      {l.label}
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <a href={contactHref} className={linkClass}>
              Contact
            </a>
          </div>

          {/* CTA Button */}
          <div className="hidden lg:block">
            <Button variant="hero" size="default" asChild>
              <a href={contactHref}>Start Learning</a>
            </Button>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="lg:hidden p-2 text-foreground"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="lg:hidden py-4 border-t border-border/50 animate-fade-up">
            <div className="flex flex-col gap-4">
              {sectionLinks.map((link) => (
                <a
                  key={link.hash}
                  href={sectionHref(link.hash)}
                  className="text-foreground/80 hover:text-primary font-medium py-2 transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  {link.label}
                </a>
              ))}

              <button
                onClick={() => setMobileFeesOpen((v) => !v)}
                className="flex items-center justify-between text-foreground/80 hover:text-primary font-medium py-2 transition-colors"
              >
                Fees
                <ChevronDown
                  className={`w-4 h-4 transition-transform ${
                    mobileFeesOpen ? "rotate-180" : ""
                  }`}
                />
              </button>
              {mobileFeesOpen && (
                <div className="pl-4 flex flex-col gap-3 border-l-2 border-primary/30">
                  {feesLinks.map((l) => (
                    <Link
                      key={l.to}
                      to={l.to}
                      onClick={() => setIsOpen(false)}
                      className="text-foreground/80 hover:text-primary text-sm py-1"
                    >
                      {l.label}
                    </Link>
                  ))}
                </div>
              )}

              <a
                href={contactHref}
                className="text-foreground/80 hover:text-primary font-medium py-2 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Contact
              </a>

              <Button variant="hero" className="mt-2" asChild>
                <a href={contactHref} onClick={() => setIsOpen(false)}>
                  Start Learning
                </a>
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
