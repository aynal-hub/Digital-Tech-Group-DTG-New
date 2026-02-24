import { useState } from "react";
import { Plus, Edit, Trash2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { ConfirmDialog, useConfirmDialog } from "@/components/confirm-dialog";
import type { Package, Service } from "@shared/schema";

export default function AdminPackages() {
  const { toast } = useToast();
  const { confirm, dialogProps } = useConfirmDialog();
  const { data: packages, isLoading } = useQuery<Package[]>({ queryKey: ["/api/packages"] });
  const { data: services } = useQuery<Service[]>({ queryKey: ["/api/services"] });
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<Package | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState({ name: "", serviceId: 0, price: "", description: "", features: "", deliveryTime: "", isPopular: false, isActive: true, orderIndex: 0 });

  const filtered = packages?.filter((p) => !search || p.name.toLowerCase().includes(search.toLowerCase())) || [];

  const openNew = () => { setEditing(null); setForm({ name: "", serviceId: 0, price: "", description: "", features: "", deliveryTime: "", isPopular: false, isActive: true, orderIndex: 0 }); setIsOpen(true); };
  const openEdit = (p: Package) => { setEditing(p); setForm({ name: p.name, serviceId: p.serviceId || 0, price: p.price, description: p.description || "", features: (p.features || []).join(", "), deliveryTime: p.deliveryTime || "", isPopular: p.isPopular || false, isActive: p.isActive !== false, orderIndex: p.orderIndex || 0 }); setIsOpen(true); };

  const save = useMutation({
    mutationFn: async () => {
      const body = { ...form, serviceId: form.serviceId || null, features: form.features.split(",").map((f) => f.trim()).filter(Boolean) };
      if (editing) await apiRequest("PATCH", `/api/admin/packages/${editing.id}`, body);
      else await apiRequest("POST", "/api/admin/packages", body);
    },
    onSuccess: () => { toast({ title: editing ? "Updated" : "Created" }); queryClient.invalidateQueries({ queryKey: ["/api/packages"] }); setIsOpen(false); },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const del = useMutation({
    mutationFn: async (id: number) => { await apiRequest("DELETE", `/api/admin/packages/${id}`); },
    onSuccess: () => { toast({ title: "Deleted" }); queryClient.invalidateQueries({ queryKey: ["/api/packages"] }); },
  });

  const getServiceName = (id: number | null) => services?.find((s) => s.id === id)?.title || "";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div><h1 className="text-2xl font-bold">Packages</h1><p className="text-muted-foreground text-sm">Manage pricing packages</p></div>
        <Button onClick={openNew}><Plus className="w-4 h-4 mr-2" /> Add Package</Button>
      </div>
      <div className="relative max-w-sm"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" /><Input placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" /></div>

      {isLoading ? <div className="text-center py-10 text-muted-foreground">Loading...</div> : filtered.length === 0 ? <div className="text-center py-10 text-muted-foreground">No packages found.</div> : (
        <div className="space-y-3">
          {filtered.map((p) => (
            <Card key={p.id}>
              <CardContent className="p-4 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="font-semibold truncate">{p.name}</p>
                  <div className="flex items-center gap-2 flex-wrap mt-1">
                    <span className="text-sm font-bold text-primary">{p.price}</span>
                    {p.serviceId && <Badge variant="outline" className="text-xs">{getServiceName(p.serviceId)}</Badge>}
                    {p.isPopular && <Badge className="text-xs">Popular</Badge>}
                    <Badge variant={p.isActive ? "default" : "secondary"} className="text-xs">{p.isActive ? "Active" : "Inactive"}</Badge>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Button size="icon" variant="ghost" onClick={() => openEdit(p)}><Edit className="w-4 h-4" /></Button>
                  <Button size="icon" variant="ghost" onClick={() => confirm(() => del.mutate(p.id), "Delete Package?", "This action cannot be undone.")}><Trash2 className="w-4 h-4" /></Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? "Edit Package" : "New Package"}</DialogTitle></DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); save.mutate(); }} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></div>
              <div className="space-y-2"><Label>Price</Label><Input value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required /></div>
            </div>
            <div className="space-y-2">
              <Label>Service</Label>
              <Select value={form.serviceId?.toString() || ""} onValueChange={(v) => setForm({ ...form, serviceId: parseInt(v) || 0 })}>
                <SelectTrigger><SelectValue placeholder="Select service" /></SelectTrigger>
                <SelectContent>
                  {services?.map((s) => <SelectItem key={s.id} value={s.id.toString()}>{s.title}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2"><Label>Description</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} /></div>
            <div className="space-y-2"><Label>Features (comma separated)</Label><Input value={form.features} onChange={(e) => setForm({ ...form, features: e.target.value })} /></div>
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="space-y-2"><Label>Delivery Time</Label><Input value={form.deliveryTime} onChange={(e) => setForm({ ...form, deliveryTime: e.target.value })} placeholder="3-5 days" /></div>
              <div className="space-y-2"><Label>Order Index</Label><Input type="number" value={form.orderIndex} onChange={(e) => setForm({ ...form, orderIndex: parseInt(e.target.value) || 0 })} /></div>
              <div className="space-y-2 flex items-end gap-4">
                <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.isPopular} onChange={(e) => setForm({ ...form, isPopular: e.target.checked })} className="w-4 h-4" /> Popular</label>
                <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="w-4 h-4" /> Active</label>
              </div>
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
