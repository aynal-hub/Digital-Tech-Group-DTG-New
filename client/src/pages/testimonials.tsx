import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { SEOHead } from "@/components/seo-head";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import type { Testimonial } from "@shared/schema";

export default function Testimonials() {
  const { data: testimonials, isLoading } = useQuery<Testimonial[]>({ queryKey: ["/api/testimonials"] });
  const activeTestimonials = testimonials?.filter((t) => t.isActive) || [];

  return (
    <>
      <SEOHead title="Client Testimonials - Digital Tech Group" description="See what our clients say about working with Digital Tech Group." />

      <section className="pt-32 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div className="text-center max-w-3xl mx-auto" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Badge variant="secondary" className="mb-4">Testimonials</Badge>
            <h1 className="text-4xl sm:text-5xl font-bold mb-4">What Clients Say</h1>
            <p className="text-muted-foreground text-lg">Real feedback from real clients around the world</p>
          </motion.div>
        </div>
      </section>

      <section className="pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (<Card key={i}><CardContent className="p-6"><Skeleton className="h-32" /></CardContent></Card>))}
            </div>
          ) : activeTestimonials.length === 0 ? (
            <div className="text-center py-16"><p className="text-muted-foreground">No testimonials yet.</p></div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeTestimonials.map((t, i) => (
                <motion.div key={t.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                  <Card className="h-full" data-testid={`card-testimonial-${t.id}`}>
                    <CardContent className="p-6 space-y-4 flex flex-col h-full">
                      <Quote className="w-8 h-8 text-primary/30 shrink-0" />
                      <p className="text-muted-foreground italic leading-relaxed flex-1">"{t.review}"</p>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: 5 }).map((_, idx) => (
                          <Star key={idx} className={`w-4 h-4 ${idx < (t.rating || 5) ? "text-primary fill-primary" : "text-border"}`} />
                        ))}
                      </div>
                      <div className="flex items-center gap-3 pt-2">
                        <Avatar className="w-10 h-10">
                          <AvatarFallback>{t.clientName[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold text-sm">{t.clientName}</p>
                          {t.company && <p className="text-xs text-muted-foreground">{t.company}</p>}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
