import { useState } from "react";
import { Plus, Edit, Trash2 } from "lucide-react";
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
import type { PaymentPlatform } from "@shared/schema";

export default function AdminPaymentPlatforms() {
  const { toast } = useToast();
  const { data: platforms, isLoading } = useQuery<PaymentPlatform[]>({ queryKey: ["/api/payment-platforms"] });
  const [editing, setEditing] = useState<PaymentPlatform | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState({ name: "", tagline: "", logoUrl: "", websiteUrl: "", steps: "", colorClass: "blue", isActive: true, orderIndex: 0 });

  const openNew = () => { setEditing(null); setForm({ name: "", tagline: "", logoUrl: "", websiteUrl: "", steps: "", colorClass: "blue", isActive: true, orderIndex: 0 }); setIsOpen(true); };
  const openEdit = (p: PaymentPlatform) => { setEditing(p); setForm({ name: p.name, tagline: p.tagline || "", logoUrl: p.logoUrl || "", websiteUrl: p.websiteUrl || "", steps: (p.steps || []).join("\n"), colorClass: p.colorClass || "blue", isActive: p.isActive !== false, orderIndex: p.orderIndex || 0 }); setIsOpen(true); };

  const save = useMutation({
    mutationFn: async () => {
      const body = { ...form, steps: form.steps.split("\n").map((s) => s.trim()).filter(Boolean) };
      if (editing) await apiRequest("PATCH", `/api/admin/payment-platforms/${editing.id}`, body);
      else await apiRequest("POST", "/api/admin/payment-platforms", body);
    },
    onSuccess: () => { toast({ title: editing ? "Updated" : "Created" }); queryClient.invalidateQueries({ queryKey: ["/api/payment-platforms"] }); setIsOpen(false); },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const del = useMutation({
    mutationFn: async (id: number) => { await apiRequest("DELETE", `/api/admin/payment-platforms/${id}`); },
    onSuccess: () => { toast({ title: "Deleted" }); queryClient.invalidateQueries({ queryKey: ["/api/payment-platforms"] }); },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div><h1 className="text-2xl font-bold">Payment Platforms</h1><p className="text-muted-foreground text-sm">Manage payment methods</p></div>
        <Button onClick={openNew}><Plus className="w-4 h-4 mr-2" /> Add Platform</Button>
      </div>

      {isLoading ? <div className="text-center py-10 text-muted-foreground">Loading...</div> : !platforms?.length ? <div className="text-center py-10 text-muted-foreground">No platforms.</div> : (
        <div className="space-y-3">
          {platforms.map((p) => (
            <Card key={p.id}>
              <CardContent className="p-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3"><span className="font-semibold">{p.name}</span>{p.tagline && <span className="text-xs text-muted-foreground">{p.tagline}</span>}<Badge variant={p.isActive ? "default" : "secondary"} className="text-xs">{p.isActive ? "Active" : "Inactive"}</Badge></div>
                <div className="flex items-center gap-1 shrink-0">
                  <Button size="icon" variant="ghost" onClick={() => openEdit(p)}><Edit className="w-4 h-4" /></Button>
                  <Button size="icon" variant="ghost" onClick={() => { if (confirm("Delete?")) del.mutate(p.id); }}><Trash2 className="w-4 h-4" /></Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? "Edit Platform" : "New Platform"}</DialogTitle></DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); save.mutate(); }} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></div>
              <div className="space-y-2"><Label>Tagline</Label><Input value={form.tagline} onChange={(e) => setForm({ ...form, tagline: e.target.value })} /></div>
            </div>
            <div className="space-y-2"><Label>Logo URL</Label><Input value={form.logoUrl} onChange={(e) => setForm({ ...form, logoUrl: e.target.value })} /></div>
            <div className="space-y-2"><Label>Website URL</Label><Input value={form.websiteUrl} onChange={(e) => setForm({ ...form, websiteUrl: e.target.value })} /></div>
            <div className="space-y-2"><Label>Steps (one per line)</Label><Textarea value={form.steps} onChange={(e) => setForm({ ...form, steps: e.target.value })} rows={5} /></div>
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="space-y-2"><Label>Color Class</Label><Input value={form.colorClass} onChange={(e) => setForm({ ...form, colorClass: e.target.value })} /></div>
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
    </div>
  );
}
