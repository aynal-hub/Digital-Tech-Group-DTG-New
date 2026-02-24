import { motion } from "framer-motion";
import { Target, Eye, Award, Users, CheckCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SEOHead } from "@/components/seo-head";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";

const fadeUp = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.5 } };

const values = [
  { icon: Target, title: "Mission-Driven", desc: "We're committed to delivering measurable results that drive your business forward." },
  { icon: Eye, title: "Innovative Vision", desc: "Staying ahead with cutting-edge technologies and creative strategies." },
  { icon: Award, title: "Quality First", desc: "Every project meets the highest standards of excellence and professionalism." },
  { icon: Users, title: "Client-Centric", desc: "Your success is our priority. We build lasting partnerships with every client." },
];

const highlights = [
  "Expert team of recruiters and digital marketers",
  "Proven track record across multiple industries",
  "Data-driven strategies for maximum ROI",
  "24/7 support and dedicated account management",
  "Transparent reporting and communication",
  "Scalable solutions for businesses of all sizes",
];

export default function About() {
  const { data: settings } = useQuery<Record<string, string>>({ queryKey: ["/api/settings"] });
  const siteName = settings?.site_name || "Digital Tech Group";
  const founderName = settings?.founder_name || "";
  const siteTagline = settings?.site_tagline || "Recruitment, Sourcing & Digital Marketing Agency";

  return (
    <>
      <SEOHead title={`About Us - ${siteName}`} description={`Learn about ${siteName} - a leading ${siteTagline.toLowerCase()}.`} />

      <section className="pt-32 pb-20" data-testid="section-about-hero">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div className="text-center max-w-3xl mx-auto" {...fadeUp}>
            <Badge variant="secondary" className="mb-4">About Us</Badge>
            <h1 className="text-4xl sm:text-5xl font-bold mb-6">
              Driving Digital <span className="text-primary">Transformation</span>
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              {siteName} is a professional {siteTagline.toLowerCase()} dedicated to helping businesses scale and succeed in the digital landscape.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-20 bg-card/50" data-testid="section-about-founder">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div {...fadeUp}>
              <Badge variant="secondary" className="mb-4">Our Story</Badge>
              <h2 className="text-3xl font-bold mb-6">Founded with a Vision</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                {siteName} was founded{founderName ? ` by ${founderName}` : ""} with a clear vision: to bridge the gap between talented professionals and businesses seeking growth through digital innovation.
              </p>
              <p className="text-muted-foreground leading-relaxed mb-6">
                What started as a small recruitment consultancy has grown into a full-service digital agency, serving clients across multiple industries and geographies. Our commitment to excellence and client satisfaction drives everything we do.
              </p>
              <Link href="/contact">
                <Button data-testid="button-about-contact">
                  Work With Us <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
            </motion.div>
            <motion.div className="grid grid-cols-2 gap-4" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6 }}>
              {values.map((v) => (
                <Card key={v.title}>
                  <CardContent className="p-5 space-y-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <v.icon className="w-5 h-5 text-primary" />
                    </div>
                    <h3 className="font-semibold text-sm">{v.title}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">{v.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-20" data-testid="section-about-highlights">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div className="text-center mb-14" {...fadeUp}>
            <Badge variant="secondary" className="mb-4">Why Choose Us</Badge>
            <h2 className="text-3xl font-bold mb-4">Our Advantages</h2>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
            {highlights.map((h, i) => (
              <motion.div key={i} className="flex items-start gap-3 p-4 rounded-lg bg-card" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}>
                <CheckCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <span className="text-sm">{h}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
