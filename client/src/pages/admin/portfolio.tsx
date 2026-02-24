import { useState } from "react";
import { Plus, Edit, Trash2, Search } from "lucide-react";
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
import type { Project } from "@shared/schema";

export default function AdminPortfolio() {
  const { toast } = useToast();
  const { confirm, dialogProps } = useConfirmDialog();
  const { data: projects, isLoading } = useQuery<Project[]>({ queryKey: ["/api/projects"] });
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<Project | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState({ title: "", slug: "", description: "", shortDescription: "", imageUrl: "", category: "", clientName: "", completionDate: "", projectUrl: "", technologies: "", isActive: true, metaTitle: "", metaDescription: "" });

  const filtered = projects?.filter((p) => !search || p.title.toLowerCase().includes(search.toLowerCase())) || [];

  const openNew = () => { setEditing(null); setForm({ title: "", slug: "", description: "", shortDescription: "", imageUrl: "", category: "", clientName: "", completionDate: "", projectUrl: "", technologies: "", isActive: true, metaTitle: "", metaDescription: "" }); setIsOpen(true); };
  const openEdit = (p: Project) => { setEditing(p); setForm({ title: p.title, slug: p.slug, description: p.description, shortDescription: p.shortDescription || "", imageUrl: p.imageUrl || "", category: p.category || "", clientName: p.clientName || "", completionDate: p.completionDate || "", projectUrl: p.projectUrl || "", technologies: (p.technologies || []).join(", "), isActive: p.isActive !== false, metaTitle: p.metaTitle || "", metaDescription: p.metaDescription || "" }); setIsOpen(true); };

  const save = useMutation({
    mutationFn: async () => {
      const body = { ...form, technologies: form.technologies.split(",").map((t) => t.trim()).filter(Boolean) };
      if (editing) await apiRequest("PATCH", `/api/admin/portfolio/${editing.id}`, body);
      else await apiRequest("POST", "/api/admin/portfolio", body);
    },
    onSuccess: () => { toast({ title: editing ? "Updated" : "Created" }); queryClient.invalidateQueries({ queryKey: ["/api/projects"] }); setIsOpen(false); },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const del = useMutation({
    mutationFn: async (id: number) => { await apiRequest("DELETE", `/api/admin/portfolio/${id}`); },
    onSuccess: () => { toast({ title: "Deleted" }); queryClient.invalidateQueries({ queryKey: ["/api/projects"] }); },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div><h1 className="text-2xl font-bold">Portfolio</h1><p className="text-muted-foreground text-sm">Manage your projects</p></div>
        <Button onClick={openNew}><Plus className="w-4 h-4 mr-2" /> Add Project</Button>
      </div>
      <div className="relative max-w-sm"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" /><Input placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" /></div>

      {isLoading ? <div className="text-center py-10 text-muted-foreground">Loading...</div> : filtered.length === 0 ? <div className="text-center py-10 text-muted-foreground">No projects found.</div> : (
        <div className="space-y-3">
          {filtered.map((p) => (
            <Card key={p.id}>
              <CardContent className="p-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 min-w-0">
                  {p.imageUrl && <img src={p.imageUrl} alt={p.title} className="w-12 h-12 rounded-md object-cover shrink-0" />}
                  <div className="min-w-0">
                    <p className="font-semibold truncate">{p.title}</p>
                    <div className="flex items-center gap-2 flex-wrap mt-1">
                      {p.category && <Badge variant="outline" className="text-xs">{p.category}</Badge>}
                      <Badge variant={p.isActive ? "default" : "secondary"} className="text-xs">{p.isActive ? "Active" : "Inactive"}</Badge>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Button size="icon" variant="ghost" onClick={() => openEdit(p)}><Edit className="w-4 h-4" /></Button>
                  <Button size="icon" variant="ghost" onClick={() => confirm(() => del.mutate(p.id), "Delete Project?", "This action cannot be undone.")}><Trash2 className="w-4 h-4" /></Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? "Edit Project" : "New Project"}</DialogTitle></DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); save.mutate(); }} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Title</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required /></div>
              <div className="space-y-2"><Label>Slug</Label><Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} required /></div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Category</Label><Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} /></div>
              <div className="space-y-2"><Label>Client Name</Label><Input value={form.clientName} onChange={(e) => setForm({ ...form, clientName: e.target.value })} /></div>
            </div>
            <div className="space-y-2"><Label>Short Description</Label><Input value={form.shortDescription} onChange={(e) => setForm({ ...form, shortDescription: e.target.value })} /></div>
            <div className="space-y-2"><Label>Description</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={4} required /></div>
            <ImageInput value={form.imageUrl} onChange={(url) => setForm({ ...form, imageUrl: url })} label="Image" />
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Project URL</Label><Input value={form.projectUrl} onChange={(e) => setForm({ ...form, projectUrl: e.target.value })} /></div>
              <div className="space-y-2"><Label>Completion Date</Label><Input value={form.completionDate} onChange={(e) => setForm({ ...form, completionDate: e.target.value })} placeholder="2025-01" /></div>
            </div>
            <div className="space-y-2"><Label>Technologies (comma separated)</Label><Input value={form.technologies} onChange={(e) => setForm({ ...form, technologies: e.target.value })} /></div>
            <div className="flex items-center gap-2"><Label>Active</Label><input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="w-5 h-5" /></div>
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
