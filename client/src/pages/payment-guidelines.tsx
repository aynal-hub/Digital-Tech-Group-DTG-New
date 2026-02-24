import { motion } from "framer-motion";
import { Shield, Globe, CreditCard, ExternalLink, Play, Lock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { SEOHead } from "@/components/seo-head";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import type { PaymentPlatform, PaymentVideo } from "@shared/schema";

const trustBadges = [
  { icon: Shield, title: "Bank-Level Security", desc: "Your transactions are protected with industry-standard encryption" },
  { icon: Globe, title: "Send From Anywhere", desc: "Available in 100+ countries worldwide" },
  { icon: CreditCard, title: "Multiple Methods", desc: "Choose from various payment platforms" },
];

const securityPoints = [
  "All transactions are encrypted end-to-end",
  "We never store your payment credentials",
  "Verified payment platforms only",
  "24/7 transaction monitoring",
];

function extractYouTubeId(url: string) {
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/))([^&?\s]+)/);
  return match ? match[1] : null;
}

export default function PaymentGuidelines() {
  const { data: platforms, isLoading: loadingPlatforms } = useQuery<PaymentPlatform[]>({ queryKey: ["/api/payment-platforms"] });
  const { data: videos, isLoading: loadingVideos } = useQuery<PaymentVideo[]>({ queryKey: ["/api/payment-videos"] });
  const { data: settings } = useQuery<Record<string, string>>({ queryKey: ["/api/settings"] });

  const activePlatforms = platforms?.filter((p) => p.isActive) || [];
  const activeVideos = videos?.filter((v) => v.isActive) || [];

  return (
    <>
      <SEOHead title={`Payment Guidelines - ${settings?.site_name || "Digital Tech Group"}`} description={`How to send payments to ${settings?.site_name || "Digital Tech Group"} safely and easily.`} />

      <section className="pt-32 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div className="text-center max-w-3xl mx-auto" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Badge variant="secondary" className="mb-4">Payment</Badge>
            <h1 className="text-4xl sm:text-5xl font-bold mb-4">Payment Guidelines</h1>
            <p className="text-muted-foreground text-lg">Safe, easy, and trusted payment methods for our services</p>
          </motion.div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-6">
            {trustBadges.map((badge) => (
              <Card key={badge.title}>
                <CardContent className="p-6 text-center space-y-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto">
                    <badge.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold">{badge.title}</h3>
                  <p className="text-sm text-muted-foreground">{badge.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Access Platforms */}
      {activePlatforms.length > 0 && (
        <section className="pb-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold mb-6 text-center">Quick Access</h2>
            <div className="flex flex-wrap justify-center gap-3">
              {activePlatforms.map((p) => (
                <a key={p.id} href={p.websiteUrl || "#"} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" className="gap-2" data-testid={`button-platform-${p.id}`}>
                    {p.logoUrl && <img src={p.logoUrl} alt={p.name} className="w-5 h-5 object-contain" />}
                    {p.name}
                    <ExternalLink className="w-3 h-3" />
                  </Button>
                </a>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Step-by-Step Guides */}
      {activePlatforms.length > 0 && (
        <section className="pb-12">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold mb-6 text-center">Step-by-Step Payment Guides</h2>
            <Accordion type="single" collapsible className="space-y-3">
              {activePlatforms.map((p) => (
                <AccordionItem key={p.id} value={`platform-${p.id}`} className="border rounded-lg px-4">
                  <AccordionTrigger className="py-4">
                    <div className="flex items-center gap-3">
                      {p.logoUrl && <img src={p.logoUrl} alt={p.name} className="w-6 h-6 object-contain" />}
                      <div className="text-left">
                        <span className="font-semibold">{p.name}</span>
                        {p.tagline && <span className="text-sm text-muted-foreground ml-2">{p.tagline}</span>}
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pb-4">
                    {p.steps && p.steps.length > 0 ? (
                      <ol className="space-y-3 mb-4">
                        {p.steps.map((step, i) => (
                          <li key={i} className="flex items-start gap-3">
                            <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                              {i + 1}
                            </span>
                            <span className="text-sm">{step}</span>
                          </li>
                        ))}
                      </ol>
                    ) : (
                      <p className="text-sm text-muted-foreground mb-4">Visit the platform website for instructions.</p>
                    )}
                    {p.websiteUrl && (
                      <a href={p.websiteUrl} target="_blank" rel="noopener noreferrer">
                        <Button size="sm" variant="outline">Go to {p.name} <ExternalLink className="ml-2 w-3 h-3" /></Button>
                      </a>
                    )}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>
      )}

      {/* Video Tutorials */}
      {activeVideos.length > 0 && (
        <section className="pb-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold mb-6 text-center">Video Tutorials</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {activeVideos.map((v) => {
                const videoId = extractYouTubeId(v.videoUrl);
                return (
                  <Card key={v.id}>
                    <CardContent className="p-0">
                      {videoId ? (
                        <div className="aspect-video">
                          <iframe src={`https://www.youtube.com/embed/${videoId}`} title={v.title} className="w-full h-full rounded-t-md" allowFullScreen />
                        </div>
                      ) : (
                        <div className="aspect-video bg-muted rounded-t-md flex items-center justify-center">
                          <Play className="w-12 h-12 text-muted-foreground" />
                        </div>
                      )}
                      <div className="p-4 space-y-2">
                        <h3 className="font-semibold">{v.title}</h3>
                        {v.description && <p className="text-sm text-muted-foreground">{v.description}</p>}
                        {v.platformId && <Badge variant="outline">Tutorial</Badge>}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Security Notice */}
      <section className="py-16 bg-card/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-2xl font-bold mb-6">Your Payment is Safe</h2>
          <div className="grid sm:grid-cols-2 gap-3 max-w-2xl mx-auto mb-8">
            {securityPoints.map((point, i) => (
              <div key={i} className="flex items-center gap-2 text-sm">
                <Shield className="w-4 h-4 text-primary shrink-0" />
                {point}
              </div>
            ))}
          </div>
          <Link href="/contact">
            <Button>Need Help With Payment? <ArrowRight className="ml-2 w-4 h-4" /></Button>
          </Link>
        </div>
      </section>
    </>
  );
}
