import { Link, useParams } from "wouter";
import { motion } from "framer-motion";
import { ArrowLeft, CheckCircle, ArrowRight, Package, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SEOHead } from "@/components/seo-head";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import type { Service, Package as PackageType } from "@shared/schema";

export default function ServiceDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { data: services, isLoading } = useQuery<Service[]>({ queryKey: ["/api/services"] });
  const { data: packages } = useQuery<PackageType[]>({ queryKey: ["/api/packages"] });
  const { data: settings } = useQuery<Record<string, string>>({ queryKey: ["/api/settings"] });

  const service = services?.find((s) => s.slug === slug);
  const servicePackages = packages?.filter((p) => p.serviceId === service?.id && p.isActive) || [];

  if (isLoading) {
    return (
      <div className="pt-32 pb-20 max-w-7xl mx-auto px-4">
        <Skeleton className="h-8 w-32 mb-8" />
        <Skeleton className="h-64 mb-6" />
        <Skeleton className="h-10 w-64 mb-4" />
        <Skeleton className="h-24" />
      </div>
    );
  }

  if (!service) {
    return (
      <div className="pt-32 pb-20 max-w-7xl mx-auto px-4 text-center">
        <h1 className="text-2xl font-bold mb-4">Service Not Found</h1>
        <Link href="/services"><Button variant="outline">Back to Services</Button></Link>
      </div>
    );
  }

  return (
    <>
      <SEOHead title={`${service.title} - ${settings?.site_name || "Digital Tech Group"}`} description={service.metaDescription || service.shortDescription || service.description} />

      <section className="pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/services">
            <span className="inline-flex items-center gap-2 text-sm text-muted-foreground mb-8 cursor-pointer" data-testid="link-back-services">
              <ArrowLeft className="w-4 h-4" /> Back to Services
            </span>
          </Link>

          <motion.div className="grid lg:grid-cols-2 gap-10 mb-16" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            {service.imageUrl ? (
              <div className="h-80 lg:h-96 bg-muted rounded-lg">
                <img src={service.imageUrl} alt={service.title} className="w-full h-full object-cover rounded-lg" />
              </div>
            ) : (
              <div className="h-80 lg:h-96 bg-gradient-to-br from-primary/10 to-accent/10 rounded-lg flex items-center justify-center">
                <Package className="w-20 h-20 text-primary/20" />
              </div>
            )}
            <div className="space-y-6">
              {service.category && <Badge variant="secondary">{service.category}</Badge>}
              <h1 className="text-3xl sm:text-4xl font-bold">{service.title}</h1>
              <div className="flex items-center gap-4 flex-wrap">
                {service.price && <span className="text-2xl font-bold text-primary">{service.price}</span>}
                {service.completedOrders && service.completedOrders > 0 && (
                  <Badge variant="outline">{service.completedOrders} orders completed</Badge>
                )}
              </div>
              <p className="text-muted-foreground leading-relaxed">{service.description}</p>
              <Link href={`/contact?package=${encodeURIComponent(service.title)}`}>
                <Button size="lg" data-testid="button-order-service">
                  Order Now <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
            </div>
          </motion.div>

          {service.features && service.features.length > 0 && (
            <div className="mb-16">
              <h2 className="text-2xl font-bold mb-6">What's Included</h2>
              <div className="grid md:grid-cols-2 gap-3">
                {service.features.map((f, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-card">
                    <CheckCircle className="w-5 h-5 text-primary shrink-0" />
                    <span className="text-sm">{f}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {servicePackages.length > 0 && (
            <div className="mb-16">
              <h2 className="text-2xl font-bold mb-6">Available Packages</h2>
              <div className="grid md:grid-cols-3 gap-6">
                {servicePackages.map((pkg) => (
                  <Card key={pkg.id} className={`relative ${pkg.isPopular ? "border-primary" : ""}`} data-testid={`card-package-${pkg.id}`}>
                    {pkg.isPopular && (
                      <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">Most Popular</Badge>
                    )}
                    <CardContent className="p-6 space-y-4">
                      <h3 className="font-semibold text-lg">{pkg.name}</h3>
                      <p className="text-3xl font-bold text-primary">{pkg.price}</p>
                      {pkg.deliveryTime && <p className="text-sm text-muted-foreground">{pkg.deliveryTime}</p>}
                      {pkg.description && <p className="text-sm text-muted-foreground">{pkg.description}</p>}
                      {pkg.features && pkg.features.length > 0 && (
                        <ul className="space-y-2">
                          {pkg.features.map((f, i) => (
                            <li key={i} className="flex items-center gap-2 text-sm">
                              <CheckCircle className="w-4 h-4 text-primary shrink-0" />
                              {f}
                            </li>
                          ))}
                        </ul>
                      )}
                      <Link href={`/contact?package=${encodeURIComponent(`${service.title}-${pkg.name}-(${pkg.price})`)}`}>
                        <Button className="w-full" variant={pkg.isPopular ? "default" : "outline"}>
                          Order Now
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          <Card className="bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
            <CardContent className="p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                  <Gift className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Want to try before you buy?</h3>
                  <p className="text-sm text-muted-foreground">Request a free sample of our work</p>
                </div>
              </div>
              <Link href="/free-sample">
                <Button variant="outline" data-testid="button-free-sample">
                  Request Free Sample <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>
    </>
  );
}
