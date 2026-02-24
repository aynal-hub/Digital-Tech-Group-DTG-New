import { useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { ArrowRight, Search, FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { SEOHead } from "@/components/seo-head";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import type { Project } from "@shared/schema";

export default function Portfolio() {
  const { data: projects, isLoading } = useQuery<Project[]>({ queryKey: ["/api/projects"] });
  const [activeCategory, setActiveCategory] = useState("All");
  const [search, setSearch] = useState("");

  const activeProjects = projects?.filter((p) => p.isActive) || [];
  const categories = ["All", ...new Set(activeProjects.map((p) => p.category).filter(Boolean))];
  const filtered = activeProjects.filter((p) => {
    const matchCat = activeCategory === "All" || p.category === activeCategory;
    const matchSearch = !search || p.title.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <>
      <SEOHead title="Portfolio - Digital Tech Group" description="Explore our portfolio of successful projects." />

      <section className="pt-32 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div className="text-center max-w-3xl mx-auto" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Badge variant="secondary" className="mb-4">Portfolio</Badge>
            <h1 className="text-4xl sm:text-5xl font-bold mb-4">Our Projects</h1>
            <p className="text-muted-foreground text-lg">Showcasing our best work across various industries</p>
          </motion.div>
        </div>
      </section>

      <section className="pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-2 flex-wrap">
              {categories.map((cat) => (
                <Button key={cat} variant={activeCategory === cat ? "default" : "outline"} size="sm" onClick={() => setActiveCategory(cat)}>
                  {cat}
                </Button>
              ))}
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search projects..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" data-testid="input-search-projects" />
            </div>
          </div>

          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (<Card key={i}><CardContent className="p-6"><Skeleton className="h-48 mb-4" /><Skeleton className="h-6 mb-2" /><Skeleton className="h-16" /></CardContent></Card>))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16">
              <FolderOpen className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground">No projects found.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((project, i) => (
                <motion.div key={project.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                  <Link href={`/portfolio/${project.slug}`}>
                    <Card className="hover-elevate cursor-pointer group h-full" data-testid={`card-project-${project.id}`}>
                      {project.imageUrl ? (
                        <div className="h-52 bg-muted rounded-t-md relative">
                          <img src={project.imageUrl} alt={project.title} className="w-full h-full object-cover rounded-t-md transition-transform duration-300 group-hover:scale-105" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent rounded-t-md opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      ) : (
                        <div className="h-52 bg-gradient-to-br from-primary/10 to-accent/10 rounded-t-md flex items-center justify-center">
                          <FolderOpen className="w-12 h-12 text-primary/30" />
                        </div>
                      )}
                      <CardContent className="p-6 space-y-2">
                        {project.category && <Badge variant="secondary">{project.category}</Badge>}
                        <h3 className="text-lg font-semibold">{project.title}</h3>
                        <p className="text-muted-foreground text-sm line-clamp-2">{project.shortDescription || project.description}</p>
                        {project.technologies && project.technologies.length > 0 && (
                          <div className="flex flex-wrap gap-1 pt-1">
                            {project.technologies.slice(0, 3).map((t, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">{t}</Badge>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
