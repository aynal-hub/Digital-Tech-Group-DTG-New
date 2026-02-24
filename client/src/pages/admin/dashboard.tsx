import { Link } from "wouter";
import { motion } from "framer-motion";
import { Briefcase, FileText, FolderOpen, Users, Star, Mail, Package, MessageSquare, BarChart3 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import type { Service, BlogPost, Project, TeamMember, Testimonial, ContactMessage, SampleRequest, Package as PkgType } from "@shared/schema";

export default function AdminDashboard() {
  const { data: services } = useQuery<Service[]>({ queryKey: ["/api/services"] });
  const { data: blog } = useQuery<BlogPost[]>({ queryKey: ["/api/admin/blog"] });
  const { data: projects } = useQuery<Project[]>({ queryKey: ["/api/projects"] });
  const { data: team } = useQuery<TeamMember[]>({ queryKey: ["/api/team"] });
  const { data: testimonials } = useQuery<Testimonial[]>({ queryKey: ["/api/testimonials"] });
  const { data: messages } = useQuery<ContactMessage[]>({ queryKey: ["/api/admin/messages"] });
  const { data: samples } = useQuery<SampleRequest[]>({ queryKey: ["/api/admin/sample-requests"] });
  const { data: packages } = useQuery<PkgType[]>({ queryKey: ["/api/packages"] });

  const unreadMessages = messages?.filter((m) => !m.isRead).length || 0;
  const pendingSamples = samples?.filter((s) => s.status === "pending").length || 0;

  const quickCards = [
    { label: "Unread Messages", value: unreadMessages, icon: Mail, href: "/admin/messages", color: "text-red-500 dark:text-red-400" },
    { label: "Pending Samples", value: pendingSamples, icon: MessageSquare, href: "/admin/sample-requests", color: "text-orange-500 dark:text-orange-400" },
    { label: "Active Services", value: services?.filter((s) => s.isActive).length || 0, icon: Briefcase, href: "/admin/services", color: "text-blue-500 dark:text-blue-400" },
    { label: "Blog Posts", value: blog?.length || 0, icon: FileText, href: "/admin/blog", color: "text-green-500 dark:text-green-400" },
    { label: "Projects", value: projects?.filter((p) => p.isActive).length || 0, icon: FolderOpen, href: "/admin/portfolio", color: "text-purple-500 dark:text-purple-400" },
    { label: "Team Members", value: team?.filter((t) => t.isActive).length || 0, icon: Users, href: "/admin/team", color: "text-cyan-500 dark:text-cyan-400" },
  ];

  const contentCards = [
    { label: "Services", count: services?.length || 0, icon: Briefcase, href: "/admin/services" },
    { label: "Packages", count: packages?.length || 0, icon: Package, href: "/admin/packages" },
    { label: "Portfolio", count: projects?.length || 0, icon: FolderOpen, href: "/admin/portfolio" },
    { label: "Blog Posts", count: blog?.length || 0, icon: FileText, href: "/admin/blog" },
    { label: "Testimonials", count: testimonials?.length || 0, icon: Star, href: "/admin/testimonials" },
    { label: "Team Members", count: team?.length || 0, icon: Users, href: "/admin/team" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold" data-testid="text-dashboard-title">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back! Here's your overview.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {quickCards.map((card, i) => (
          <motion.div key={card.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Link href={card.href}>
              <Card className="hover-elevate cursor-pointer" data-testid={`card-quick-${card.label.toLowerCase().replace(/\s/g, '-')}`}>
                <CardContent className="p-4 text-center space-y-2">
                  <card.icon className={`w-6 h-6 mx-auto ${card.color}`} />
                  <p className="text-2xl font-bold">{card.value}</p>
                  <p className="text-xs text-muted-foreground">{card.label}</p>
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        ))}
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-4">Content Overview</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {contentCards.map((card) => (
            <Card key={card.label} data-testid={`card-content-${card.label.toLowerCase().replace(/\s/g, '-')}`}>
              <CardContent className="p-4 flex items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <card.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xl font-bold">{card.count}</p>
                    <p className="text-xs text-muted-foreground">{card.label}</p>
                  </div>
                </div>
                <Link href={card.href}>
                  <Button size="sm" variant="outline">Manage</Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
