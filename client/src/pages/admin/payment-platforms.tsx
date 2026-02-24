import { useState } from "react";
import { Plus, Edit, Trash2, GripVertical, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { ConfirmDialog, useConfirmDialog } from "@/components/confirm-dialog";
import { ImageInput } from "@/components/image-input";
import type { PaymentPlatform } from "@shared/schema";

export default function AdminPaymentPlatforms() {
  const { toast } = useToast();
  const { confirm, dialogProps } = useConfirmDialog();
  const { data: platforms, isLoading } = useQuery<PaymentPlatform[]>({ queryKey: ["/api/payment-platforms"] });
  const [editing, setEditing] = useState<PaymentPlatform | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState({ name: "", tagline: "", logoUrl: "", websiteUrl: "", steps: [""] as string[], colorClass: "blue", isActive: true, orderIndex: 0 });

  const openNew = () => { setEditing(null); setForm({ name: "", tagline: "", logoUrl: "", websiteUrl: "", steps: [""], colorClass: "blue", isActive: true, orderIndex: 0 }); setIsOpen(true); };
  const openEdit = (p: PaymentPlatform) => {
    setEditing(p);
    const steps = (p.steps || []).length > 0 ? [...p.steps!] : [""];
    setForm({ name: p.name, tagline: p.tagline || "", logoUrl: p.logoUrl || "", websiteUrl: p.websiteUrl || "", steps, colorClass: p.colorClass || "blue", isActive: p.isActive !== false, orderIndex: p.orderIndex || 0 });
    setIsOpen(true);
  };

  const addStep = () => setForm({ ...form, steps: [...form.steps, ""] });
  const removeStep = (i: number) => {
    const steps = form.steps.filter((_, idx) => idx !== i);
    setForm({ ...form, steps: steps.length === 0 ? [""] : steps });
  };
  const updateStep = (i: number, val: string) => {
    const steps = [...form.steps];
    steps[i] = val;
    setForm({ ...form, steps });
  };

  const save = useMutation({
    mutationFn: async () => {
      const body = { ...form, steps: form.steps.map((s) => s.trim()).filter(Boolean) };
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
        <Button onClick={openNew} data-testid="button-add-platform"><Plus className="w-4 h-4 mr-2" /> Add Platform</Button>
      </div>

      {isLoading ? <div className="text-center py-10 text-muted-foreground">Loading...</div> : !platforms?.length ? <div className="text-center py-10 text-muted-foreground">No platforms.</div> : (
        <div className="space-y-3">
          {platforms.map((p) => (
            <Card key={p.id} data-testid={`card-platform-${p.id}`}>
              <CardContent className="p-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  {p.logoUrl && <img src={p.logoUrl} alt={p.name} className="w-8 h-8 rounded object-contain" />}
                  <span className="font-semibold">{p.name}</span>
                  {p.tagline && <span className="text-xs text-muted-foreground">{p.tagline}</span>}
                  <Badge variant={p.isActive ? "default" : "secondary"} className="text-xs">{p.isActive ? "Active" : "Inactive"}</Badge>
                  {p.steps && <span className="text-xs text-muted-foreground">{p.steps.length} steps</span>}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Button size="icon" variant="ghost" onClick={() => openEdit(p)} data-testid={`button-edit-platform-${p.id}`}><Edit className="w-4 h-4" /></Button>
                  <Button size="icon" variant="ghost" onClick={() => confirm(() => del.mutate(p.id), "Delete Platform?", "This action cannot be undone.")} data-testid={`button-delete-platform-${p.id}`}><Trash2 className="w-4 h-4" /></Button>
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
              <div className="space-y-2"><Label>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required data-testid="input-platform-name" /></div>
              <div className="space-y-2"><Label>Tagline</Label><Input value={form.tagline} onChange={(e) => setForm({ ...form, tagline: e.target.value })} /></div>
            </div>
            <ImageInput value={form.logoUrl} onChange={(url) => setForm({ ...form, logoUrl: url })} label="Logo" />
            <div className="space-y-2"><Label>Website URL</Label><Input value={form.websiteUrl} onChange={(e) => setForm({ ...form, websiteUrl: e.target.value })} /></div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Steps</Label>
                <Button type="button" size="sm" variant="outline" onClick={addStep} data-testid="button-add-step">
                  <Plus className="w-3 h-3 mr-1" /> Add Step
                </Button>
              </div>
              <div className="space-y-2">
                {form.steps.map((step, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="flex items-center gap-1 text-muted-foreground shrink-0">
                      <GripVertical className="w-4 h-4" />
                      <span className="text-xs font-medium w-5 text-center">{i + 1}</span>
                    </div>
                    <Input
                      value={step}
                      onChange={(e) => updateStep(i, e.target.value)}
                      placeholder={`Step ${i + 1}`}
                      className="flex-1"
                      data-testid={`input-step-${i}`}
                    />
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      onClick={() => removeStep(i)}
                      className="shrink-0 h-8 w-8"
                      data-testid={`button-remove-step-${i}`}
                    >
                      <X className="w-4 h-4 text-muted-foreground" />
                    </Button>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">Add as many steps as needed. Each step will be shown as a numbered instruction.</p>
            </div>

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
      <ConfirmDialog {...dialogProps} />
    </div>
  );
}
