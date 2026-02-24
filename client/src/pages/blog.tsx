import { useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { ArrowRight, Search, Calendar, User, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { SEOHead } from "@/components/seo-head";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import type { BlogPost } from "@shared/schema";

export default function Blog() {
  const { data: posts, isLoading } = useQuery<BlogPost[]>({ queryKey: ["/api/blog"] });
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const publishedPosts = posts?.filter((p) => p.isPublished) || [];
  const categories = ["All", ...new Set(publishedPosts.map((p) => p.category).filter(Boolean))];
  const filtered = publishedPosts.filter((p) => {
    const matchCat = activeCategory === "All" || p.category === activeCategory;
    const matchSearch = !search || p.title.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <>
      <SEOHead title="Blog - Digital Tech Group" description="Read our latest insights on recruitment, sourcing & digital marketing." />

      <section className="pt-32 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div className="text-center max-w-3xl mx-auto" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Badge variant="secondary" className="mb-4">Blog</Badge>
            <h1 className="text-4xl sm:text-5xl font-bold mb-4">Latest Insights</h1>
            <p className="text-muted-foreground text-lg">Expert tips and insights on recruitment, sourcing & digital marketing</p>
          </motion.div>
        </div>
      </section>

      <section className="pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-2 flex-wrap">
              {categories.map((cat) => (
                <Button key={cat} variant={activeCategory === cat ? "default" : "outline"} size="sm" onClick={() => setActiveCategory(cat)}>{cat}</Button>
              ))}
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search blog..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" data-testid="input-search-blog" />
            </div>
          </div>

          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (<Card key={i}><CardContent className="p-6"><Skeleton className="h-48 mb-4" /><Skeleton className="h-6 mb-2" /><Skeleton className="h-16" /></CardContent></Card>))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16">
              <FileText className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground">No blog posts found.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((post, i) => (
                <motion.div key={post.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                  <Link href={`/blog/${post.slug}`}>
                    <Card className="hover-elevate cursor-pointer h-full" data-testid={`card-blog-${post.id}`}>
                      {post.imageUrl ? (
                        <div className="h-48 bg-muted rounded-t-md">
                          <img src={post.imageUrl} alt={post.title} className="w-full h-full object-cover rounded-t-md" />
                        </div>
                      ) : (
                        <div className="h-48 bg-gradient-to-br from-primary/10 to-accent/10 rounded-t-md flex items-center justify-center">
                          <FileText className="w-12 h-12 text-primary/30" />
                        </div>
                      )}
                      <CardContent className="p-6 space-y-3">
                        <div className="flex items-center gap-2 flex-wrap">
                          {post.category && <Badge variant="secondary">{post.category}</Badge>}
                        </div>
                        <h3 className="text-lg font-semibold line-clamp-2">{post.title}</h3>
                        <p className="text-muted-foreground text-sm line-clamp-3">{post.excerpt}</p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2">
                          {post.author && <span className="flex items-center gap-1"><User className="w-3 h-3" /> {post.author}</span>}
                          {post.publishedAt && <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {post.publishedAt}</span>}
                        </div>
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
