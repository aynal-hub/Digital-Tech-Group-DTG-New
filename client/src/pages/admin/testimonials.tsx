import { useState } from "react";
import { Plus, Edit, Trash2, Star } from "lucide-react";
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
import type { Testimonial } from "@shared/schema";

export default function AdminTestimonials() {
  const { toast } = useToast();
  const { confirm, dialogProps } = useConfirmDialog();
  const { data: testimonials, isLoading } = useQuery<Testimonial[]>({ queryKey: ["/api/testimonials"] });
  const [editing, setEditing] = useState<Testimonial | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState({ clientName: "", company: "", review: "", rating: 5, avatarUrl: "", isActive: true, orderIndex: 0 });

  const openNew = () => { setEditing(null); setForm({ clientName: "", company: "", review: "", rating: 5, avatarUrl: "", isActive: true, orderIndex: 0 }); setIsOpen(true); };
  const openEdit = (t: Testimonial) => { setEditing(t); setForm({ clientName: t.clientName, company: t.company || "", review: t.review, rating: t.rating || 5, avatarUrl: t.avatarUrl || "", isActive: t.isActive !== false, orderIndex: t.orderIndex || 0 }); setIsOpen(true); };

  const save = useMutation({
    mutationFn: async () => {
      if (editing) await apiRequest("PATCH", `/api/admin/testimonials/${editing.id}`, form);
      else await apiRequest("POST", "/api/admin/testimonials", form);
    },
    onSuccess: () => { toast({ title: editing ? "Updated" : "Created" }); queryClient.invalidateQueries({ queryKey: ["/api/testimonials"] }); setIsOpen(false); },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const del = useMutation({
    mutationFn: async (id: number) => { await apiRequest("DELETE", `/api/admin/testimonials/${id}`); },
    onSuccess: () => { toast({ title: "Deleted" }); queryClient.invalidateQueries({ queryKey: ["/api/testimonials"] }); },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div><h1 className="text-2xl font-bold">Testimonials</h1><p className="text-muted-foreground text-sm">Manage client testimonials</p></div>
        <Button onClick={openNew}><Plus className="w-4 h-4 mr-2" /> Add Testimonial</Button>
      </div>

      {isLoading ? <div className="text-center py-10 text-muted-foreground">Loading...</div> : !testimonials?.length ? <div className="text-center py-10 text-muted-foreground">No testimonials.</div> : (
        <div className="space-y-3">
          {testimonials.map((t) => (
            <Card key={t.id}>
              <CardContent className="p-4 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="font-semibold">{t.clientName}</p>
                  <div className="flex items-center gap-2 mt-1">
                    {t.company && <span className="text-xs text-muted-foreground">{t.company}</span>}
                    <div className="flex gap-0.5">{Array.from({ length: 5 }).map((_, i) => (<Star key={i} className={`w-3 h-3 ${i < (t.rating || 5) ? "text-primary fill-primary" : "text-border"}`} />))}</div>
                    <Badge variant={t.isActive ? "default" : "secondary"} className="text-xs">{t.isActive ? "Active" : "Inactive"}</Badge>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Button size="icon" variant="ghost" onClick={() => openEdit(t)}><Edit className="w-4 h-4" /></Button>
                  <Button size="icon" variant="ghost" onClick={() => confirm(() => del.mutate(t.id), "Delete Testimonial?", "This action cannot be undone.")}><Trash2 className="w-4 h-4" /></Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? "Edit Testimonial" : "New Testimonial"}</DialogTitle></DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); save.mutate(); }} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Client Name</Label><Input value={form.clientName} onChange={(e) => setForm({ ...form, clientName: e.target.value })} required /></div>
              <div className="space-y-2"><Label>Company</Label><Input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} /></div>
            </div>
            <div className="space-y-2"><Label>Review</Label><Textarea value={form.review} onChange={(e) => setForm({ ...form, review: e.target.value })} rows={4} required /></div>
            <ImageInput value={form.avatarUrl} onChange={(url) => setForm({ ...form, avatarUrl: url })} label="Avatar" />
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="space-y-2"><Label>Rating (1-5)</Label><Input type="number" min={1} max={5} value={form.rating} onChange={(e) => setForm({ ...form, rating: parseInt(e.target.value) || 5 })} /></div>
              <div className="space-y-2"><Label>Order Index</Label><Input type="number" value={form.orderIndex} onChange={(e) => setForm({ ...form, orderIndex: parseInt(e.target.value) || 0 })} /></div>
              <div className="space-y-2 flex items-end"><label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="w-4 h-4" /> Active</label></div>
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
