import { Link, useParams } from "wouter";
import { motion } from "framer-motion";
import { ArrowLeft, ExternalLink, Calendar, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SEOHead } from "@/components/seo-head";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import type { Project } from "@shared/schema";

export default function ProjectDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { data: projects, isLoading } = useQuery<Project[]>({ queryKey: ["/api/projects"] });
  const project = projects?.find((p) => p.slug === slug);

  if (isLoading) {
    return <div className="pt-32 pb-20 max-w-4xl mx-auto px-4"><Skeleton className="h-8 w-32 mb-8" /><Skeleton className="h-64 mb-6" /><Skeleton className="h-10 w-64 mb-4" /></div>;
  }

  if (!project) {
    return <div className="pt-32 pb-20 max-w-4xl mx-auto px-4 text-center"><h1 className="text-2xl font-bold mb-4">Project Not Found</h1><Link href="/portfolio"><Button variant="outline">Back to Portfolio</Button></Link></div>;
  }

  return (
    <>
      <SEOHead title={`${project.title} - Digital Tech Group`} description={project.metaDescription || project.shortDescription || project.description} />
      <section className="pt-32 pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/portfolio"><span className="inline-flex items-center gap-2 text-sm text-muted-foreground mb-8 cursor-pointer"><ArrowLeft className="w-4 h-4" /> Back to Portfolio</span></Link>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            {project.imageUrl && (
              <div className="h-72 sm:h-96 bg-muted rounded-lg mb-8">
                <img src={project.imageUrl} alt={project.title} className="w-full h-full object-cover rounded-lg" />
              </div>
            )}
            <div className="space-y-4 mb-8">
              {project.category && <Badge variant="secondary">{project.category}</Badge>}
              <h1 className="text-3xl sm:text-4xl font-bold">{project.title}</h1>
              <div className="flex items-center gap-4 flex-wrap text-sm text-muted-foreground">
                {project.clientName && <span className="flex items-center gap-1"><User className="w-4 h-4" /> {project.clientName}</span>}
                {project.completionDate && <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {project.completionDate}</span>}
              </div>
            </div>
            <div className="prose prose-sm dark:prose-invert max-w-none mb-8">
              <p className="whitespace-pre-wrap leading-relaxed">{project.description}</p>
            </div>
            {project.technologies && project.technologies.length > 0 && (
              <div className="mb-8">
                <h3 className="font-semibold mb-3">Technologies Used</h3>
                <div className="flex flex-wrap gap-2">
                  {project.technologies.map((t, i) => <Badge key={i} variant="outline">{t}</Badge>)}
                </div>
              </div>
            )}
            {project.projectUrl && (
              <a href={project.projectUrl} target="_blank" rel="noopener noreferrer">
                <Button><ExternalLink className="mr-2 w-4 h-4" /> View Live Project</Button>
              </a>
            )}
          </motion.div>
        </div>
      </section>
    </>
  );
}
