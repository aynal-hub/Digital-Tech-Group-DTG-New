import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { LayoutDashboard, Briefcase, FileText, FolderOpen, Users, Star, Mail, Package, MessageSquare, Settings, LogOut, Menu, X, CreditCard, Video, Shield, User } from "lucide-react";
import logoImg from "@assets/image_1771920809861.png";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { apiRequest } from "@/lib/queryClient";
import { useQuery } from "@tanstack/react-query";

const sidebarItems = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/admin" },
  { label: "Services", icon: Briefcase, href: "/admin/services" },
  { label: "Packages", icon: Package, href: "/admin/packages" },
  { label: "Portfolio", icon: FolderOpen, href: "/admin/portfolio" },
  { label: "Blog", icon: FileText, href: "/admin/blog" },
  { label: "Testimonials", icon: Star, href: "/admin/testimonials" },
  { label: "Team", icon: Users, href: "/admin/team" },
  { label: "Messages", icon: Mail, href: "/admin/messages" },
  { label: "Sample Requests", icon: MessageSquare, href: "/admin/sample-requests" },
  { label: "Payment Platforms", icon: CreditCard, href: "/admin/payment-platforms" },
  { label: "Payment Videos", icon: Video, href: "/admin/payment-videos" },
  { label: "Site Settings", icon: Settings, href: "/admin/settings" },
  { label: "My Profile", icon: User, href: "/admin/profile" },
];

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { data: admin, isLoading } = useQuery({
    queryKey: ["/api/admin/me"],
    retry: false,
  });

  useEffect(() => {
    if (!isLoading && !admin && location !== "/admin/login") {
      setLocation("/admin/login");
    }
  }, [admin, isLoading, location, setLocation]);

  useEffect(() => {
    setSidebarOpen(false);
  }, [location]);

  const handleLogout = async () => {
    try {
      await apiRequest("POST", "/api/admin/logout");
      setLocation("/admin/login");
    } catch {}
  };

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" /></div>;
  }

  if (!admin) return null;

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar overlay for mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:sticky top-0 left-0 z-50 h-screen w-64 bg-card border-r border-border flex flex-col transition-transform lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="p-4 border-b border-border flex items-center justify-between gap-2">
          <Link href="/admin" className="flex items-center gap-2">
            <img src={logoImg} alt="Logo" className="w-10 h-10 rounded-md" />
            <span className="font-bold text-sm">Admin Panel</span>
          </Link>
          <Button size="icon" variant="ghost" className="lg:hidden" onClick={() => setSidebarOpen(false)}>
            <X className="w-4 h-4" />
          </Button>
        </div>
        <ScrollArea className="flex-1 py-2">
          <nav className="space-y-1 px-2">
            {sidebarItems.map((item) => {
              const isActive = location === item.href || (item.href !== "/admin" && location.startsWith(item.href));
              return (
                <Link key={item.href} href={item.href}>
                  <span className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm cursor-pointer transition-colors ${isActive ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground"}`} data-testid={`link-admin-${item.label.toLowerCase().replace(/\s/g, '-')}`}>
                    <item.icon className="w-4 h-4 shrink-0" />
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </nav>
        </ScrollArea>
        <div className="p-3 border-t border-border space-y-2">
          <Link href="/">
            <span className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-muted-foreground cursor-pointer">
              <img src={logoImg} alt="" className="w-4 h-4 rounded-sm" /> View Website
            </span>
          </Link>
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm text-destructive cursor-pointer" data-testid="button-admin-logout">
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b border-border px-4 py-3 flex items-center justify-between gap-2">
          <Button size="icon" variant="ghost" className="lg:hidden" onClick={() => setSidebarOpen(true)} data-testid="button-admin-menu">
            <Menu className="w-5 h-5" />
          </Button>
          <div className="flex-1" />
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground hidden sm:inline">{(admin as any)?.name || "Admin"}</span>
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="w-4 h-4 text-primary" />
            </div>
          </div>
        </header>
        <main className="flex-1 p-4 sm:p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
