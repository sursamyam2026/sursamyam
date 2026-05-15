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
  { to: "/fees/course-details", label: "Courses" },
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
    "text-[#1B4D3E] hover:text-[#C9922A] font-medium transition-colors relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-[#C9922A] hover:after:w-full after:transition-all";

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-[#E8D5A3] bg-[#FDF6EC]/95 shadow-[0_2px_12px_rgba(0,0,0,0.06)] backdrop-blur-md">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-2 min-h-16 lg:min-h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group py-1">
            <img
              src={logo}
              alt="Sur Samyam School of Music"
              className="h-14 w-14 rounded-full object-cover shadow-md ring-2 ring-primary/40 group-hover:scale-105 transition-transform duration-300"
            />
            <span className="font-display text-xl font-bold text-[#C9922A]">
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
              <DropdownMenuTrigger className={`${linkClass} flex items-center gap-1 outline-none`}>
                Registration <ChevronDown className="h-4 w-4 text-[#1B4D3E]" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56 border-[#E8D5A3] bg-[#FDF6EC] text-[#1B4D3E]">
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
            <Button variant="hero" size="default" className="text-[#1B1100]" asChild>
              <a href={contactHref}>Start Learning</a>
            </Button>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="p-2 text-[#1B4D3E] lg:hidden"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="animate-fade-up border-t border-[#E8D5A3] bg-[#FDF6EC] py-4 lg:hidden">
            <div className="flex flex-col gap-4">
              {sectionLinks.map((link) => (
                <a
                  key={link.hash}
                  href={sectionHref(link.hash)}
                  className="py-2 font-medium text-[#1B4D3E] transition-colors hover:text-[#C9922A]"
                  onClick={() => setIsOpen(false)}
                >
                  {link.label}
                </a>
              ))}

              <button
                onClick={() => setMobileFeesOpen((v) => !v)}
                className="flex items-center justify-between py-2 font-medium text-[#1B4D3E] transition-colors hover:text-[#C9922A]"
              >
                Registration
                <ChevronDown
                  className={`h-4 w-4 text-[#1B4D3E] transition-transform ${
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
                    className="py-1 text-sm text-[#1B4D3E] hover:text-[#C9922A]"
                    >
                      {l.label}
                    </Link>
                  ))}
                </div>
              )}

              <a
                href={contactHref}
                className="py-2 font-medium text-[#1B4D3E] transition-colors hover:text-[#C9922A]"
                onClick={() => setIsOpen(false)}
              >
                Contact
              </a>

              <Button variant="hero" className="mt-2 text-[#1B1100]" asChild>
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
