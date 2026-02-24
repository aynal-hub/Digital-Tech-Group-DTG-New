import { Link } from "wouter";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Star, Users, Briefcase, FileText, CheckCircle, Quote, TrendingUp, Globe, Rocket, Target, Award, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { SEOHead } from "@/components/seo-head";
import { useQuery } from "@tanstack/react-query";
import type { Service, Project, TeamMember, Testimonial } from "@shared/schema";

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 },
};

function AnimatedCounter({ value }: { value: number }) {
  return <span>{value}+</span>;
}

function HeroVisual({ services, projects, testimonials, settings }: { services?: Service[]; projects?: Project[]; testimonials?: Testimonial[]; settings?: Record<string, string> }) {
  const projectCount = settings?.stats_projects_done || String(projects?.filter(p => p.isActive).length || 0);
  const clientCount = settings?.stats_happy_clients || String(testimonials?.filter(t => t.isActive).length || 0);
  const serviceCount = settings?.stats_expert_services || String(services?.filter(s => s.isActive).length || 0);
  const totalOrders = settings?.stats_orders_done || String(services?.reduce((acc, s) => acc + (s.completedOrders || 0), 0) || 0);

  const stats = [
    { icon: TrendingUp, value: `${totalOrders}+`, label: "Orders Completed", color: "text-primary", bg: "bg-primary/15" },
    { icon: Globe, value: `${clientCount}+`, label: "Happy Clients", color: "text-emerald-500", bg: "bg-emerald-500/15" },
    { icon: Rocket, value: `${projectCount}+`, label: "Projects Done", color: "text-violet-500", bg: "bg-violet-500/15" },
    { icon: Award, value: `${serviceCount}+`, label: "Expert Services", color: "text-amber-500", bg: "bg-amber-500/15" },
  ];

  return (
    <div className="relative max-w-md mx-auto">
      <div className="absolute -inset-6 bg-gradient-to-br from-primary/20 via-primary/5 to-transparent rounded-3xl blur-2xl" />
      <div className="relative grid grid-cols-2 gap-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            className="bg-card border border-border/50 rounded-2xl p-5 flex flex-col items-center text-center shadow-lg"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3 + i * 0.12 }}
          >
            <div className={`w-12 h-12 rounded-xl ${stat.bg} flex items-center justify-center mb-3`}>
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
            </div>
            <span className="text-3xl font-bold">{stat.value}</span>
            <span className="text-xs text-muted-foreground mt-1 font-medium">{stat.label}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export default function Home() {
  const { data: services } = useQuery<Service[]>({ queryKey: ["/api/services"] });
  const { data: projects } = useQuery<Project[]>({ queryKey: ["/api/projects"] });
  const { data: testimonials } = useQuery<Testimonial[]>({ queryKey: ["/api/testimonials"] });
  const { data: team } = useQuery<TeamMember[]>({ queryKey: ["/api/team"] });
  const { data: settings } = useQuery<Record<string, string>>({ queryKey: ["/api/settings"] });

  const featuredServices = services?.filter((s) => s.isActive).slice(0, 3) || [];
  const featuredProjects = projects?.filter((p) => p.isActive).slice(0, 4) || [];
  const featuredTestimonials = testimonials?.filter((t) => t.isActive).slice(0, 3) || [];
  const featuredTeam = team?.filter((t) => t.isActive).slice(0, 3) || [];

  return (
    <>
      <SEOHead
        title={settings?.meta_title || `${settings?.site_name || "Digital Tech Group"} - ${settings?.site_tagline || "Recruitment, Sourcing & Digital Marketing Agency"}`}
        description={settings?.meta_description || settings?.site_description || "Professional Recruitment, Sourcing & Digital Marketing Agency delivering world-class solutions for your business growth."}
      />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center overflow-hidden" data-testid="section-hero">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/10" />
        <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)", backgroundSize: "40px 40px" }} />
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/4 w-64 h-64 bg-accent/10 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 pt-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div className="space-y-8" {...fadeUp}>
              <Badge variant="secondary" className="gap-2">
                <Sparkles className="w-3 h-3" />
                Welcome to {settings?.site_name || "Digital Tech Group"}
              </Badge>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight tracking-tight">
                We Build Your{" "}
                <span className="bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent">
                  Digital Success
                </span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-lg leading-relaxed">
                Expert recruitment, professional sourcing, and cutting-edge digital marketing solutions to accelerate your business growth globally.
              </p>
              <div className="flex items-center gap-4 flex-wrap">
                <Link href="/contact">
                  <Button size="lg" data-testid="button-get-started">
                    Get Started <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </Link>
                <Link href="/portfolio">
                  <Button size="lg" variant="outline" data-testid="button-view-portfolio">
                    View Portfolio
                  </Button>
                </Link>
              </div>
            </motion.div>

            <div className="relative hidden lg:block">
              <HeroVisual services={services} projects={projects} testimonials={testimonials} settings={settings} />
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 relative overflow-hidden" data-testid="section-stats">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { label: "Expert Services", count: settings?.stats_expert_services || String(services?.filter(s => s.isActive).length || 0), icon: Target, href: "/services", gradient: "from-primary/20 to-primary/5", iconColor: "text-primary" },
              { label: "Projects Done", count: settings?.stats_projects_done || String(projects?.filter(p => p.isActive).length || 0), icon: Rocket, href: "/portfolio", gradient: "from-violet-500/20 to-violet-500/5", iconColor: "text-violet-500" },
              { label: "Happy Clients", count: settings?.stats_happy_clients || String(testimonials?.filter(t => t.isActive).length || 0), icon: Users, href: "/testimonials", gradient: "from-emerald-500/20 to-emerald-500/5", iconColor: "text-emerald-500" },
              { label: "Orders Done", count: settings?.stats_orders_done || String(services?.reduce((a, s) => a + (s.completedOrders || 0), 0) || 0), icon: TrendingUp, href: "/services", gradient: "from-amber-500/20 to-amber-500/5", iconColor: "text-amber-500" },
            ].map((stat, i) => (
              <Link key={stat.label} href={stat.href}>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                  <Card className="hover-elevate cursor-pointer border-border/50 overflow-hidden" data-testid={`card-stat-${stat.label.toLowerCase().replace(/\s/g, "-")}`}>
                    <CardContent className={`p-6 text-center bg-gradient-to-b ${stat.gradient}`}>
                      <div className="w-12 h-12 rounded-xl bg-card/80 flex items-center justify-center mx-auto mb-3 border border-border/50">
                        <stat.icon className={`w-6 h-6 ${stat.iconColor}`} />
                      </div>
                      <p className="text-3xl font-bold mb-1">
                        {stat.count}+
                      </p>
                      <p className="text-muted-foreground text-xs font-medium">{stat.label}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Services */}
      {featuredServices.length > 0 && (
        <section className="py-20" data-testid="section-services">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div className="text-center mb-14" {...fadeUp}>
              <Badge variant="secondary" className="mb-4">Our Services</Badge>
              <h2 className="text-3xl font-bold mb-4">What We Offer</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">Professional services tailored to your business needs</p>
            </motion.div>
            <div className="grid md:grid-cols-3 gap-6">
              {featuredServices.map((service, i) => (
                <motion.div key={service.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                  <Link href={`/services/${service.slug}`}>
                    <Card className="hover-elevate cursor-pointer h-full" data-testid={`card-service-${service.id}`}>
                      {service.imageUrl && (
                        <div className="h-48 bg-muted rounded-t-md">
                          <img src={service.imageUrl} alt={service.title} className="w-full h-full object-cover rounded-t-md" />
                        </div>
                      )}
                      <CardContent className="p-6 space-y-3">
                        {service.completedOrders && service.completedOrders > 0 && (
                          <Badge variant="secondary">{service.completedOrders} orders completed</Badge>
                        )}
                        <h3 className="text-lg font-semibold">{service.title}</h3>
                        <p className="text-muted-foreground text-sm line-clamp-3">{service.shortDescription || service.description}</p>
                        {service.features && service.features.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {service.features.slice(0, 3).map((f, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">{f}</Badge>
                            ))}
                            {service.features.length > 3 && (
                              <Badge variant="outline" className="text-xs">+{service.features.length - 3} more</Badge>
                            )}
                          </div>
                        )}
                        <div className="flex items-center justify-between gap-2 pt-2">
                          {service.price && <span className="font-bold text-primary">{service.price}</span>}
                          <span className="text-primary text-sm font-medium flex items-center gap-1">
                            Learn More <ArrowRight className="w-3 h-3" />
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </div>
            <div className="text-center mt-10">
              <Link href="/services">
                <Button variant="outline" data-testid="button-view-all-services">
                  View All Services <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Featured Projects */}
      {featuredProjects.length > 0 && (
        <section className="py-20 bg-card/50" data-testid="section-projects">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div className="text-center mb-14" {...fadeUp}>
              <Badge variant="secondary" className="mb-4">Portfolio</Badge>
              <h2 className="text-3xl font-bold mb-4">Recent Projects</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">Showcasing our latest successful projects</p>
            </motion.div>
            <div className="grid md:grid-cols-2 gap-6">
              {featuredProjects.map((project, i) => (
                <motion.div key={project.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                  <Link href={`/portfolio/${project.slug}`}>
                    <Card className="hover-elevate cursor-pointer group" data-testid={`card-project-${project.id}`}>
                      {project.imageUrl && (
                        <div className="h-52 bg-muted rounded-t-md relative">
                          <img src={project.imageUrl} alt={project.title} className="w-full h-full object-cover rounded-t-md transition-transform duration-300 group-hover:scale-105" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent rounded-t-md opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      )}
                      <CardContent className="p-6 space-y-2">
                        {project.category && <Badge variant="secondary">{project.category}</Badge>}
                        <h3 className="text-lg font-semibold">{project.title}</h3>
                        <p className="text-muted-foreground text-sm line-clamp-2">{project.shortDescription || project.description}</p>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </div>
            <div className="text-center mt-10">
              <Link href="/portfolio">
                <Button variant="outline" data-testid="button-view-all-projects">
                  View All Projects <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Team Preview */}
      {featuredTeam.length > 0 && (
        <section className="py-20" data-testid="section-team">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div className="text-center mb-14" {...fadeUp}>
              <Badge variant="secondary" className="mb-4">Our Team</Badge>
              <h2 className="text-3xl font-bold mb-4">Meet Our Experts</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">Talented professionals driving your success</p>
            </motion.div>
            <div className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto">
              {featuredTeam.map((member) => (
                <Card key={member.id} className="text-center" data-testid={`card-team-${member.id}`}>
                  <CardContent className="p-6 space-y-4">
                    <Avatar className="w-20 h-20 mx-auto">
                      {member.avatarUrl && <img src={member.avatarUrl} alt={member.name} className="w-full h-full object-cover" />}
                      <AvatarFallback className="text-lg">{member.name.split(" ").map((n) => n[0]).join("")}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold">{member.name}</h3>
                      <p className="text-sm text-muted-foreground">{member.designation}</p>
                      {member.isFounder && <Badge className="mt-2">Founder</Badge>}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="text-center mt-10">
              <Link href="/team">
                <Button variant="outline">Meet Our Team <ArrowRight className="ml-2 w-4 h-4" /></Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Testimonials */}
      {featuredTestimonials.length > 0 && (
        <section className="py-20 bg-card/50" data-testid="section-testimonials">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div className="text-center mb-14" {...fadeUp}>
              <Badge variant="secondary" className="mb-4">Testimonials</Badge>
              <h2 className="text-3xl font-bold mb-4">What Clients Say</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">Trusted by businesses worldwide</p>
            </motion.div>
            <div className="grid md:grid-cols-3 gap-6">
              {featuredTestimonials.map((testimonial) => (
                <Card key={testimonial.id} data-testid={`card-testimonial-${testimonial.id}`}>
                  <CardContent className="p-6 space-y-4">
                    <Quote className="w-8 h-8 text-primary/30" />
                    <p className="text-muted-foreground italic leading-relaxed">"{testimonial.review}"</p>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${i < (testimonial.rating || 5) ? "text-primary fill-primary" : "text-border"}`}
                        />
                      ))}
                    </div>
                    <div className="flex items-center gap-3 pt-2">
                      <Avatar className="w-10 h-10">
                        <AvatarFallback>{testimonial.clientName[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold text-sm">{testimonial.clientName}</p>
                        {testimonial.company && (
                          <p className="text-xs text-muted-foreground">{testimonial.company}</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="text-center mt-10">
              <Link href="/testimonials">
                <Button variant="outline">View All Testimonials <ArrowRight className="ml-2 w-4 h-4" /></Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-20 bg-primary relative" data-testid="section-cta">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)", backgroundSize: "40px 40px" }} />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-primary-foreground mb-6">
            Ready to Grow Your Business?
          </h2>
          <p className="text-primary-foreground/80 text-lg mb-8 max-w-2xl mx-auto">
            Let's work together to bring your vision to life. Contact us today for a free consultation.
          </p>
          <Link href="/contact">
            <Button size="lg" variant="secondary" data-testid="button-cta-contact">
              Get Started Today <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </Link>
        </div>
      </section>
    </>
  );
}
