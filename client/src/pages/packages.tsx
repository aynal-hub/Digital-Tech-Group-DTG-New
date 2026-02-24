import { useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { CheckCircle, ArrowRight, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SEOHead } from "@/components/seo-head";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import type { Package, Service } from "@shared/schema";

export default function Packages() {
  const { data: packages, isLoading } = useQuery<Package[]>({ queryKey: ["/api/packages"] });
  const { data: services } = useQuery<Service[]>({ queryKey: ["/api/services"] });
  const { data: settings } = useQuery<Record<string, string>>({ queryKey: ["/api/settings"] });
  const [activeService, setActiveService] = useState<number | null>(null);

  const activePackages = packages?.filter((p) => p.isActive) || [];
  const activeServices = services?.filter((s) => s.isActive) || [];

  const grouped = activeServices
    .filter((s) => activeService === null || s.id === activeService)
    .map((s) => ({
      service: s,
      packages: activePackages.filter((p) => p.serviceId === s.id),
    }))
    .filter((g) => g.packages.length > 0);

  return (
    <>
      <SEOHead title={`Pricing Packages - ${settings?.site_name || "Digital Tech Group"}`} description="Explore our affordable pricing packages for recruitment, sourcing & digital marketing services." />

      <section className="pt-32 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div className="text-center max-w-3xl mx-auto" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Badge variant="secondary" className="mb-4">Pricing</Badge>
            <h1 className="text-4xl sm:text-5xl font-bold mb-4">Pricing Packages</h1>
            <p className="text-muted-foreground text-lg">Flexible packages designed to fit every budget</p>
          </motion.div>
        </div>
      </section>

      <section className="pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {activeServices.length > 1 && (
            <div className="flex items-center gap-2 mb-8 flex-wrap justify-center">
              <Button variant={activeService === null ? "default" : "outline"} size="sm" onClick={() => setActiveService(null)}>All Services</Button>
              {activeServices.map((s) => (
                <Button key={s.id} variant={activeService === s.id ? "default" : "outline"} size="sm" onClick={() => setActiveService(s.id)}>{s.title}</Button>
              ))}
            </div>
          )}

          {isLoading ? (
            <div className="grid md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (<Card key={i}><CardContent className="p-6"><Skeleton className="h-6 mb-4" /><Skeleton className="h-10 mb-4" /><Skeleton className="h-32" /></CardContent></Card>))}
            </div>
          ) : grouped.length === 0 ? (
            <div className="text-center py-16"><p className="text-muted-foreground">No packages available.</p></div>
          ) : (
            <div className="space-y-12">
              {grouped.map(({ service, packages: pkgs }) => (
                <div key={service.id}>
                  <h2 className="text-2xl font-bold mb-6">{service.title}</h2>
                  <div className="grid md:grid-cols-3 gap-6">
                    {pkgs.map((pkg, i) => (
                      <motion.div key={pkg.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                        <Card className={`relative h-full ${pkg.isPopular ? "border-primary" : ""}`} data-testid={`card-package-${pkg.id}`}>
                          {pkg.isPopular && <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">Most Popular</Badge>}
                          <CardContent className="p-6 space-y-4 flex flex-col h-full">
                            <h3 className="font-semibold text-lg">{pkg.name}</h3>
                            <p className="text-3xl font-bold text-primary">{pkg.price}</p>
                            {pkg.deliveryTime && <p className="text-sm text-muted-foreground">{pkg.deliveryTime}</p>}
                            {pkg.description && <p className="text-sm text-muted-foreground line-clamp-2">{pkg.description}</p>}
                            {pkg.features && pkg.features.length > 0 && (
                              <ul className="space-y-2 flex-1">
                                {pkg.features.map((f, idx) => (
                                  <li key={idx} className="flex items-center gap-2 text-sm">
                                    <CheckCircle className="w-4 h-4 text-primary shrink-0" />
                                    {f}
                                  </li>
                                ))}
                              </ul>
                            )}
                            <Link href={`/contact?package=${encodeURIComponent(`${service.title}-${pkg.name}-(${pkg.price})`)}`}>
                              <Button className="w-full" variant={pkg.isPopular ? "default" : "outline"}>
                                Order Now <ArrowRight className="ml-2 w-4 h-4" />
                              </Button>
                            </Link>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          <Card className="mt-12 bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
            <CardContent className="p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                  <Gift className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Want a Free Sample?</h3>
                  <p className="text-sm text-muted-foreground">Try our services before committing</p>
                </div>
              </div>
              <Link href="/free-sample"><Button variant="outline">Request Free Sample <ArrowRight className="ml-2 w-4 h-4" /></Button></Link>
            </CardContent>
          </Card>
        </div>
      </section>
    </>
  );
}
