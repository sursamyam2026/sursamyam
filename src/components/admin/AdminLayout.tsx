import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  LogOut,
  Menu,
  X,
  Music,
  ImagePlus,
  FileCheck,
  CalendarCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/leads", label: "Leads", icon: Users, end: false },
  { to: "/admin/attendance", label: "Attendance", icon: CalendarCheck, end: false },
  { to: "/admin/exam-registrations", label: "Exam Registrations", icon: FileCheck, end: false },
  { to: "/admin/gallery", label: "Gallery", icon: ImagePlus, end: false },
];

export const AdminLayout = () => {
  const [open, setOpen] = useState(false);
  const { logout, session } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  const SidebarContent = (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 px-6 py-5 border-b border-border">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary via-gold to-primary flex items-center justify-center">
          <Music className="w-4 h-4 text-primary-foreground" />
        </div>
        <span className="font-display font-bold text-lg">Admin</span>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={() => setOpen(false)}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )
            }
          >
            <item.icon className="w-4 h-4" />
            {item.label}
          </NavLink>
        ))}
      </nav>
      <div className="p-4 border-t border-border space-y-2">
        {session && (
          <p className="text-xs text-muted-foreground truncate px-1">{session.email}</p>
        )}
        <Button variant="outline" className="w-full" onClick={handleLogout}>
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-muted/30 flex">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-64 border-r border-border bg-background">
        {SidebarContent}
      </aside>

      {/* Mobile sidebar */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setOpen(false)}
          />
          <aside className="relative w-64 bg-background border-r border-border">
            {SidebarContent}
          </aside>
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile header */}
        <header className="lg:hidden flex items-center justify-between px-4 h-14 border-b border-border bg-background">
          <button
            onClick={() => setOpen(!open)}
            className="p-2 -ml-2"
            aria-label="Toggle menu"
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <span className="font-display font-bold">Admin</span>
          <div className="w-9" />
        </header>

        <main className="flex-1 p-4 lg:p-8 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
