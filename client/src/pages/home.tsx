import { Link } from "wouter";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Star, Users, Briefcase, FileText, CheckCircle, Quote } from "lucide-react";
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

export default function Home() {
  const { data: services } = useQuery<Service[]>({ queryKey: ["/api/services"] });
  const { data: projects } = useQuery<Project[]>({ queryKey: ["/api/projects"] });
  const { data: testimonials } = useQuery<Testimonial[]>({ queryKey: ["/api/testimonials"] });
  const { data: team } = useQuery<TeamMember[]>({ queryKey: ["/api/team"] });

  const featuredServices = services?.filter((s) => s.isActive).slice(0, 3) || [];
  const featuredProjects = projects?.filter((p) => p.isActive).slice(0, 4) || [];
  const featuredTestimonials = testimonials?.filter((t) => t.isActive).slice(0, 3) || [];
  const featuredTeam = team?.filter((t) => t.isActive).slice(0, 3) || [];

  return (
    <>
      <SEOHead
        title="Digital Tech Group - Recruitment, Sourcing & Digital Marketing Agency"
        description="Professional Recruitment, Sourcing & Digital Marketing Agency delivering world-class solutions for your business growth."
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
                Welcome to Digital Tech Group
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

            <motion.div
              className="relative hidden lg:block"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <div className="relative w-full aspect-square max-w-lg mx-auto">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 rounded-3xl rotate-6" />
                <div className="absolute inset-0 bg-gradient-to-tl from-primary/10 to-transparent rounded-3xl -rotate-3" />
                <div className="relative bg-card rounded-3xl p-8 border border-border/50 space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                      <Briefcase className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold">Projects Delivered</p>
                      <p className="text-2xl font-bold text-primary">{projects?.length || 0}+</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center">
                      <Users className="w-6 h-6 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <p className="font-semibold">Happy Clients</p>
                      <p className="text-2xl font-bold text-green-600 dark:text-green-400">{testimonials?.length || 0}+</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-orange-500/10 rounded-xl flex items-center justify-center">
                      <FileText className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div>
                      <p className="font-semibold">Services Available</p>
                      <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{services?.length || 0}+</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-card/50" data-testid="section-stats">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { label: "Services", count: services?.filter(s => s.isActive).length || 0, icon: Briefcase, href: "/services", color: "text-primary" },
              { label: "Projects", count: projects?.filter(p => p.isActive).length || 0, icon: FileText, href: "/portfolio", color: "text-green-600 dark:text-green-400" },
              { label: "Blog Posts", count: 0, icon: FileText, href: "/blog", color: "text-orange-600 dark:text-orange-400" },
            ].map((stat) => (
              <Link key={stat.label} href={stat.href}>
                <Card className="hover-elevate cursor-pointer transition-transform" data-testid={`card-stat-${stat.label.toLowerCase()}`}>
                  <CardContent className="p-6 flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
                      <stat.icon className={`w-7 h-7 ${stat.color}`} />
                    </div>
                    <div>
                      <p className="text-3xl font-bold">
                        <AnimatedCounter value={stat.count} />
                      </p>
                      <p className="text-muted-foreground text-sm">{stat.label}</p>
                    </div>
                  </CardContent>
                </Card>
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
