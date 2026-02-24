import { Link, useParams } from "wouter";
import { motion } from "framer-motion";
import { ArrowLeft, Calendar, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SEOHead } from "@/components/seo-head";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import type { BlogPost } from "@shared/schema";

export default function BlogDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { data: posts, isLoading } = useQuery<BlogPost[]>({ queryKey: ["/api/blog"] });
  const { data: settings } = useQuery<Record<string, string>>({ queryKey: ["/api/settings"] });
  const post = posts?.find((p) => p.slug === slug);

  if (isLoading) return <div className="pt-32 pb-20 max-w-4xl mx-auto px-4"><Skeleton className="h-8 w-32 mb-8" /><Skeleton className="h-64 mb-6" /></div>;
  if (!post) return <div className="pt-32 pb-20 max-w-4xl mx-auto px-4 text-center"><h1 className="text-2xl font-bold mb-4">Post Not Found</h1><Link href="/blog"><Button variant="outline">Back to Blog</Button></Link></div>;

  return (
    <>
      <SEOHead title={`${post.title} - ${settings?.site_name || "Digital Tech Group"}`} description={post.metaDescription || post.excerpt || ""} />
      <article className="pt-32 pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/blog"><span className="inline-flex items-center gap-2 text-sm text-muted-foreground mb-8 cursor-pointer"><ArrowLeft className="w-4 h-4" /> Back to Blog</span></Link>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            {post.imageUrl && <div className="h-72 sm:h-96 bg-muted rounded-lg mb-8"><img src={post.imageUrl} alt={post.title} className="w-full h-full object-cover rounded-lg" /></div>}
            <div className="space-y-4 mb-8">
              <div className="flex items-center gap-2 flex-wrap">
                {post.category && <Badge variant="secondary">{post.category}</Badge>}
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold">{post.title}</h1>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                {post.author && <span className="flex items-center gap-1"><User className="w-4 h-4" /> {post.author}</span>}
                {post.publishedAt && <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {post.publishedAt}</span>}
              </div>
            </div>
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <div className="whitespace-pre-wrap leading-relaxed">{post.content}</div>
            </div>
          </motion.div>
        </div>
      </article>
    </>
  );
}
