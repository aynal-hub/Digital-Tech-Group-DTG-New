import { useState } from "react";
import { Link } from "wouter";
import { Plus, Edit, Trash2, Eye, EyeOff, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ConfirmDialog, useConfirmDialog } from "@/components/confirm-dialog";
import { ImageInput } from "@/components/image-input";
import type { Service } from "@shared/schema";

export default function AdminServices() {
  const { toast } = useToast();
  const { confirm, dialogProps } = useConfirmDialog();
  const { data: services, isLoading } = useQuery<Service[]>({ queryKey: ["/api/services"] });
  const [search, setSearch] = useState("");
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [form, setForm] = useState({ title: "", slug: "", description: "", shortDescription: "", imageUrl: "", price: "", category: "", features: "", completedOrders: 0, orderIndex: 0, isActive: true, metaTitle: "", metaDescription: "" });

  const filtered = services?.filter((s) => !search || s.title.toLowerCase().includes(search.toLowerCase())) || [];

  const openNew = () => {
    setEditingService(null);
    setForm({ title: "", slug: "", description: "", shortDescription: "", imageUrl: "", price: "", category: "", features: "", completedOrders: 0, orderIndex: 0, isActive: true, metaTitle: "", metaDescription: "" });
    setIsDialogOpen(true);
  };

  const openEdit = (s: Service) => {
    setEditingService(s);
    setForm({ title: s.title, slug: s.slug, description: s.description, shortDescription: s.shortDescription || "", imageUrl: s.imageUrl || "", price: s.price || "", category: s.category || "", features: (s.features || []).join(", "), completedOrders: s.completedOrders || 0, orderIndex: s.orderIndex || 0, isActive: s.isActive !== false, metaTitle: s.metaTitle || "", metaDescription: s.metaDescription || "" });
    setIsDialogOpen(true);
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      const body = { ...form, features: form.features.split(",").map((f) => f.trim()).filter(Boolean) };
      if (editingService) {
        await apiRequest("PATCH", `/api/admin/services/${editingService.id}`, body);
      } else {
        await apiRequest("POST", "/api/admin/services", body);
      }
    },
    onSuccess: () => {
      toast({ title: editingService ? "Service Updated" : "Service Created" });
      queryClient.invalidateQueries({ queryKey: ["/api/services"] });
      setIsDialogOpen(false);
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => { await apiRequest("DELETE", `/api/admin/services/${id}`); },
    onSuccess: () => { toast({ title: "Service Deleted" }); queryClient.invalidateQueries({ queryKey: ["/api/services"] }); },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold">Services</h1>
          <p className="text-muted-foreground text-sm">Manage your services</p>
        </div>
        <Button onClick={openNew} data-testid="button-add-service"><Plus className="w-4 h-4 mr-2" /> Add Service</Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
      </div>

      {isLoading ? (
        <div className="text-center py-10 text-muted-foreground">Loading...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-10 text-muted-foreground">No services found.</div>
      ) : (
        <div className="space-y-3">
          {filtered.map((s) => (
            <Card key={s.id} data-testid={`card-admin-service-${s.id}`}>
              <CardContent className="p-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 min-w-0">
                  {s.imageUrl && <img src={s.imageUrl} alt={s.title} className="w-12 h-12 rounded-md object-cover shrink-0" />}
                  <div className="min-w-0">
                    <p className="font-semibold truncate">{s.title}</p>
                    <div className="flex items-center gap-2 flex-wrap mt-1">
                      {s.category && <Badge variant="outline" className="text-xs">{s.category}</Badge>}
                      <Badge variant={s.isActive ? "default" : "secondary"} className="text-xs">{s.isActive ? "Active" : "Inactive"}</Badge>
                      {s.price && <span className="text-xs text-muted-foreground">{s.price}</span>}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Button size="icon" variant="ghost" onClick={() => openEdit(s)} data-testid={`button-edit-service-${s.id}`}><Edit className="w-4 h-4" /></Button>
                  <Button size="icon" variant="ghost" onClick={() => confirm(() => deleteMutation.mutate(s.id), "Delete Service?", "This action cannot be undone.")} data-testid={`button-delete-service-${s.id}`}><Trash2 className="w-4 h-4" /></Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingService ? "Edit Service" : "New Service"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); saveMutation.mutate(); }} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Title</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required data-testid="input-service-title" /></div>
              <div className="space-y-2"><Label>Slug</Label><Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} required data-testid="input-service-slug" /></div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Category</Label><Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} /></div>
              <div className="space-y-2"><Label>Price</Label><Input value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} /></div>
            </div>
            <div className="space-y-2"><Label>Short Description</Label><Input value={form.shortDescription} onChange={(e) => setForm({ ...form, shortDescription: e.target.value })} /></div>
            <div className="space-y-2"><Label>Description</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={4} required /></div>
            <ImageInput value={form.imageUrl} onChange={(url) => setForm({ ...form, imageUrl: url })} label="Image" />
            <div className="space-y-2"><Label>Features (comma separated)</Label><Input value={form.features} onChange={(e) => setForm({ ...form, features: e.target.value })} placeholder="Feature 1, Feature 2, Feature 3" /></div>
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="space-y-2"><Label>Completed Orders</Label><Input type="number" value={form.completedOrders} onChange={(e) => setForm({ ...form, completedOrders: parseInt(e.target.value) || 0 })} /></div>
              <div className="space-y-2"><Label>Order Index</Label><Input type="number" value={form.orderIndex} onChange={(e) => setForm({ ...form, orderIndex: parseInt(e.target.value) || 0 })} /></div>
              <div className="space-y-2 flex items-end gap-2"><Label>Active</Label><input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="w-5 h-5" /></div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Meta Title</Label><Input value={form.metaTitle} onChange={(e) => setForm({ ...form, metaTitle: e.target.value })} /></div>
              <div className="space-y-2"><Label>Meta Description</Label><Input value={form.metaDescription} onChange={(e) => setForm({ ...form, metaDescription: e.target.value })} /></div>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={saveMutation.isPending}>{saveMutation.isPending ? "Saving..." : "Save"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      <ConfirmDialog {...dialogProps} />
    </div>
  );
}
