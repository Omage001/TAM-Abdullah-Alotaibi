import { Link, useLocation } from "wouter";
import { useUser, useLogout } from "@/hooks/use-auth";
import { 
  LayoutDashboard, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  LogOut, 
  Menu,
  X,
  Shield
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { LightPullThemeSwitcher } from "@/components/ui/light-pull-theme-switcher";
import { Badge } from "@/components/ui/badge";

export function Sidebar() {
  const [location] = useLocation();
  const { data: user } = useUser();
  const { mutate: logout } = useLogout();
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const navItems = [
    { href: "/", label: "All Tasks", icon: LayoutDashboard },
    { href: "/pending", label: "Pending", icon: Clock },
    { href: "/high-priority", label: "High Priority", icon: AlertCircle },
    { href: "/completed", label: "Completed", icon: CheckCircle2 },
  ];

  // Add admin link if user is admin
  const adminNavItems = user?.role === "admin" 
    ? [{ href: "/admin", label: "Admin Panel", icon: Shield, admin: true }]
    : [];

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-sidebar border-r border-sidebar-border w-full md:w-64 transition-all duration-300">
      <div className="p-6 border-b border-sidebar-border/50">
        <h1 className="text-2xl font-bold font-display text-sidebar-foreground flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground">
            <CheckCircle2 size={20} />
          </span>
          TaskFlow
        </h1>
      </div>

      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = location === item.href;
          return (
            <Link key={item.href} href={item.href} className="block w-full" onClick={() => setIsOpen(false)}>
              <div
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 cursor-pointer
                  ${isActive 
                    ? "bg-primary/10 text-primary font-semibold shadow-sm" 
                    : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  }
                `}
              >
                <item.icon size={20} className={isActive ? "text-primary" : "text-muted-foreground"} />
                {item.label}
              </div>
            </Link>
          );
        })}
        
        {/* Admin Section */}
        {adminNavItems.length > 0 && (
          <>
            <div className="my-4 px-4">
              <div className="h-px bg-sidebar-border/50" />
            </div>
            {adminNavItems.map((item) => {
              const isActive = location === item.href;
              return (
                <Link key={item.href} href={item.href} className="block w-full" onClick={() => setIsOpen(false)}>
                  <div
                    className={`
                      flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 cursor-pointer
                      ${isActive 
                        ? "bg-purple-500/10 text-purple-600 font-semibold shadow-sm border border-purple-500/20" 
                        : "text-muted-foreground hover:bg-purple-500/5 hover:text-purple-600 border border-transparent"
                      }
                    `}
                  >
                    <item.icon size={20} className={isActive ? "text-purple-600" : "text-muted-foreground"} />
                    {item.label}
                    <Badge className="ml-auto bg-purple-500 hover:bg-purple-600 text-xs">Admin</Badge>
                  </div>
                </Link>
              );
            })}
          </>
        )}
      </nav>

      <div className="flex flex-col items-center justify-center border-t border-sidebar-border/50 py-2">
        <LightPullThemeSwitcher />
        <p className="text-xs text-muted-foreground">Pull down to toggle theme</p>
      </div>

      <div className="p-4 border-t border-sidebar-border/50 bg-sidebar-background/50">
        <div className="flex items-center gap-3 mb-4 px-2">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-purple-600 flex items-center justify-center text-white font-bold relative">
            {user?.username.charAt(0).toUpperCase()}
            {user?.role === "admin" && (
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center border-2 border-background">
                <Shield size={12} className="text-white" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm truncate">{user?.username}</p>
            <div className="flex items-center gap-2">
              <p className="text-xs text-muted-foreground truncate">
                {user?.role === "admin" ? "Administrator" : "Pro Member"}
              </p>
            </div>
          </div>
        </div>
        <Button 
          variant="outline" 
          className="w-full justify-start gap-2 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/20"
          onClick={() => logout()}
        >
          <LogOut size={16} />
          Sign Out
        </Button>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <div className="fixed top-0 left-0 p-4 z-50">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button size="icon" variant="outline" className="bg-background shadow-md">
              <Menu size={20} />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-80 border-r border-sidebar-border">
            <SidebarContent />
          </SheetContent>
        </Sheet>
      </div>
    );
  }

  return (
    <aside className="fixed inset-y-0 left-0 z-10 w-64 bg-sidebar border-r border-sidebar-border hidden md:block">
      <SidebarContent />
    </aside>
  );
}
