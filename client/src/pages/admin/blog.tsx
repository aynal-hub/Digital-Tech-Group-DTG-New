import { useState } from "react";
import { Plus, Edit, Trash2, Search, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { ConfirmDialog, useConfirmDialog } from "@/components/confirm-dialog";
import { ImageInput } from "@/components/image-input";
import type { BlogPost } from "@shared/schema";

export default function AdminBlog() {
  const { toast } = useToast();
  const { confirm, dialogProps } = useConfirmDialog();
  const { data: posts, isLoading } = useQuery<BlogPost[]>({ queryKey: ["/api/admin/blog"] });
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<BlogPost | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState({ title: "", slug: "", content: "", excerpt: "", imageUrl: "", category: "", author: "", isPublished: false, publishedAt: "", metaTitle: "", metaDescription: "" });

  const filtered = posts?.filter((p) => !search || p.title.toLowerCase().includes(search.toLowerCase())) || [];

  const openNew = () => { setEditing(null); setForm({ title: "", slug: "", content: "", excerpt: "", imageUrl: "", category: "", author: "", isPublished: false, publishedAt: "", metaTitle: "", metaDescription: "" }); setIsOpen(true); };
  const openEdit = (p: BlogPost) => { setEditing(p); setForm({ title: p.title, slug: p.slug, content: p.content, excerpt: p.excerpt || "", imageUrl: p.imageUrl || "", category: p.category || "", author: p.author || "", isPublished: p.isPublished || false, publishedAt: p.publishedAt || "", metaTitle: p.metaTitle || "", metaDescription: p.metaDescription || "" }); setIsOpen(true); };

  const save = useMutation({
    mutationFn: async () => {
      if (editing) await apiRequest("PATCH", `/api/admin/blog/${editing.id}`, form);
      else await apiRequest("POST", "/api/admin/blog", form);
    },
    onSuccess: () => { toast({ title: editing ? "Post Updated" : "Post Created" }); queryClient.invalidateQueries({ queryKey: ["/api/admin/blog"] }); queryClient.invalidateQueries({ queryKey: ["/api/blog"] }); setIsOpen(false); },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const del = useMutation({
    mutationFn: async (id: number) => { await apiRequest("DELETE", `/api/admin/blog/${id}`); },
    onSuccess: () => { toast({ title: "Post Deleted" }); queryClient.invalidateQueries({ queryKey: ["/api/admin/blog"] }); queryClient.invalidateQueries({ queryKey: ["/api/blog"] }); },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div><h1 className="text-2xl font-bold">Blog Posts</h1><p className="text-muted-foreground text-sm">Manage your blog</p></div>
        <Button onClick={openNew} data-testid="button-add-blog"><Plus className="w-4 h-4 mr-2" /> New Post</Button>
      </div>
      <div className="relative max-w-sm"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" /><Input placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" /></div>

      {isLoading ? <div className="text-center py-10 text-muted-foreground">Loading...</div> : filtered.length === 0 ? <div className="text-center py-10 text-muted-foreground">No posts found.</div> : (
        <div className="space-y-3">
          {filtered.map((p) => (
            <Card key={p.id} data-testid={`card-admin-blog-${p.id}`}>
              <CardContent className="p-4 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="font-semibold truncate">{p.title}</p>
                  <div className="flex items-center gap-2 flex-wrap mt-1">
                    {p.category && <Badge variant="outline" className="text-xs">{p.category}</Badge>}
                    <Badge variant={p.isPublished ? "default" : "secondary"} className="text-xs">{p.isPublished ? "Published" : "Draft"}</Badge>
                    {p.author && <span className="text-xs text-muted-foreground">by {p.author}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Button size="icon" variant="ghost" onClick={() => openEdit(p)}><Edit className="w-4 h-4" /></Button>
                  <Button size="icon" variant="ghost" onClick={() => confirm(() => del.mutate(p.id), "Delete Post?", "This action cannot be undone.")}><Trash2 className="w-4 h-4" /></Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? "Edit Post" : "New Post"}</DialogTitle></DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); save.mutate(); }} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Title</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required /></div>
              <div className="space-y-2"><Label>Slug</Label><Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} required /></div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Category</Label><Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} /></div>
              <div className="space-y-2"><Label>Author</Label><Input value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} /></div>
            </div>
            <div className="space-y-2"><Label>Excerpt</Label><Input value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} /></div>
            <div className="space-y-2"><Label>Content</Label><Textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} rows={8} required /></div>
            <ImageInput value={form.imageUrl} onChange={(url) => setForm({ ...form, imageUrl: url })} label="Image" />
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Published At</Label><Input value={form.publishedAt} onChange={(e) => setForm({ ...form, publishedAt: e.target.value })} placeholder="2025-01-01" /></div>
              <div className="space-y-2 flex items-end gap-2"><Label>Published</Label><input type="checkbox" checked={form.isPublished} onChange={(e) => setForm({ ...form, isPublished: e.target.checked })} className="w-5 h-5" /></div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Meta Title</Label><Input value={form.metaTitle} onChange={(e) => setForm({ ...form, metaTitle: e.target.value })} /></div>
              <div className="space-y-2"><Label>Meta Description</Label><Input value={form.metaDescription} onChange={(e) => setForm({ ...form, metaDescription: e.target.value })} /></div>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={save.isPending}>{save.isPending ? "Saving..." : "Save"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      <ConfirmDialog {...dialogProps} />
    </div>
  );
}
