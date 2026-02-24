import { useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { ArrowRight, Search, Briefcase, CheckCircle, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { SEOHead } from "@/components/seo-head";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import type { Service } from "@shared/schema";

export default function Services() {
  const { data: services, isLoading } = useQuery<Service[]>({ queryKey: ["/api/services"] });
  const { data: settings } = useQuery<Record<string, string>>({ queryKey: ["/api/settings"] });
  const [activeCategory, setActiveCategory] = useState("All");
  const [search, setSearch] = useState("");

  const activeServices = services?.filter((s) => s.isActive) || [];
  const categories = ["All", ...new Set(activeServices.map((s) => s.category).filter(Boolean))];
  const filteredServices = activeServices.filter((s) => {
    const matchCat = activeCategory === "All" || s.category === activeCategory;
    const matchSearch = !search || s.title.toLowerCase().includes(search.toLowerCase()) || s.description.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const totalOrders = activeServices.reduce((sum, s) => sum + (s.completedOrders || 0), 0);

  return (
    <>
      <SEOHead title={`Services - ${settings?.site_name || "Digital Tech Group"}`} description="Professional recruitment, sourcing & digital marketing services." />

      <section className="pt-32 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div className="text-center max-w-3xl mx-auto" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Badge variant="secondary" className="mb-4">Our Services</Badge>
            <h1 className="text-4xl sm:text-5xl font-bold mb-4">Professional Services</h1>
            <p className="text-muted-foreground text-lg">Comprehensive solutions tailored to your business needs</p>
          </motion.div>

          <div className="grid grid-cols-3 gap-4 mt-10 max-w-2xl mx-auto">
            {[
              { label: "Total Services", value: activeServices.length, icon: Briefcase },
              { label: "Completed Orders", value: totalOrders, icon: CheckCircle },
              { label: "Categories", value: categories.length - 1, icon: BarChart3 },
            ].map((s) => (
              <Card key={s.label}>
                <CardContent className="p-4 text-center">
                  <s.icon className="w-5 h-5 mx-auto text-primary mb-1" />
                  <p className="text-2xl font-bold">{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-2 flex-wrap">
              {categories.map((cat) => (
                <Button key={cat} variant={activeCategory === cat ? "default" : "outline"} size="sm" onClick={() => setActiveCategory(cat)} data-testid={`button-category-${cat}`}>
                  {cat}
                </Button>
              ))}
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search services..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" data-testid="input-search-services" />
            </div>
          </div>

          {isLoading ? (
            <div className="grid md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Card key={i}><CardContent className="p-6"><Skeleton className="h-48 mb-4" /><Skeleton className="h-6 mb-2" /><Skeleton className="h-16" /></CardContent></Card>
              ))}
            </div>
          ) : filteredServices.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-muted-foreground">No services found matching your criteria.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-6">
              {filteredServices.map((service, i) => (
                <motion.div key={service.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                  <Link href={`/services/${service.slug}`}>
                    <Card className="hover-elevate cursor-pointer h-full" data-testid={`card-service-${service.id}`}>
                      {service.imageUrl ? (
                        <div className="h-48 bg-muted rounded-t-md">
                          <img src={service.imageUrl} alt={service.title} className="w-full h-full object-cover rounded-t-md" />
                        </div>
                      ) : (
                        <div className="h-48 bg-gradient-to-br from-primary/10 to-accent/10 rounded-t-md flex items-center justify-center">
                          <Briefcase className="w-12 h-12 text-primary/30" />
                        </div>
                      )}
                      <CardContent className="p-6 space-y-3">
                        {service.completedOrders && service.completedOrders > 0 && (
                          <Badge variant="secondary" className="text-xs">{service.completedOrders} orders completed</Badge>
                        )}
                        <h3 className="text-lg font-semibold">{service.title}</h3>
                        <p className="text-muted-foreground text-sm line-clamp-3">{service.shortDescription || service.description}</p>
                        {service.features && service.features.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {service.features.slice(0, 3).map((f, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">{f}</Badge>
                            ))}
                            {service.features.length > 3 && <Badge variant="outline" className="text-xs">+{service.features.length - 3} more</Badge>}
                          </div>
                        )}
                        <div className="flex items-center justify-between gap-2 pt-2">
                          {service.price && <span className="font-bold text-primary">{service.price}</span>}
                          <span className="text-primary text-sm font-medium flex items-center gap-1">Details <ArrowRight className="w-3 h-3" /></span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}

          <Card className="mt-12 bg-primary/5 border-primary/20">
            <CardContent className="p-8 text-center">
              <h3 className="text-xl font-bold mb-2">Need a Custom Solution?</h3>
              <p className="text-muted-foreground mb-4">We offer tailored services to meet your specific requirements</p>
              <Link href="/contact"><Button data-testid="button-custom-solution">Contact Us <ArrowRight className="ml-2 w-4 h-4" /></Button></Link>
            </CardContent>
          </Card>
        </div>
      </section>
    </>
  );
}
