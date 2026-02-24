import { useState } from "react";
import { Plus, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { PaymentVideo, PaymentPlatform } from "@shared/schema";

export default function AdminPaymentVideos() {
  const { toast } = useToast();
  const { data: videos, isLoading } = useQuery<PaymentVideo[]>({ queryKey: ["/api/payment-videos"] });
  const { data: platforms } = useQuery<PaymentPlatform[]>({ queryKey: ["/api/payment-platforms"] });
  const [editing, setEditing] = useState<PaymentVideo | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState({ title: "", platformId: 0, videoUrl: "", thumbnailUrl: "", description: "", isActive: true, orderIndex: 0 });

  const openNew = () => { setEditing(null); setForm({ title: "", platformId: 0, videoUrl: "", thumbnailUrl: "", description: "", isActive: true, orderIndex: 0 }); setIsOpen(true); };
  const openEdit = (v: PaymentVideo) => { setEditing(v); setForm({ title: v.title, platformId: v.platformId || 0, videoUrl: v.videoUrl, thumbnailUrl: v.thumbnailUrl || "", description: v.description || "", isActive: v.isActive !== false, orderIndex: v.orderIndex || 0 }); setIsOpen(true); };

  const getPlatformName = (id: number | null) => platforms?.find((p) => p.id === id)?.name || "";

  const save = useMutation({
    mutationFn: async () => {
      const body = { ...form, platformId: form.platformId || null };
      if (editing) await apiRequest("PATCH", `/api/admin/payment-videos/${editing.id}`, body);
      else await apiRequest("POST", "/api/admin/payment-videos", body);
    },
    onSuccess: () => { toast({ title: editing ? "Updated" : "Created" }); queryClient.invalidateQueries({ queryKey: ["/api/payment-videos"] }); setIsOpen(false); },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const del = useMutation({
    mutationFn: async (id: number) => { await apiRequest("DELETE", `/api/admin/payment-videos/${id}`); },
    onSuccess: () => { toast({ title: "Deleted" }); queryClient.invalidateQueries({ queryKey: ["/api/payment-videos"] }); },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div><h1 className="text-2xl font-bold">Payment Videos</h1><p className="text-muted-foreground text-sm">Manage tutorial videos</p></div>
        <Button onClick={openNew}><Plus className="w-4 h-4 mr-2" /> Add Video</Button>
      </div>

      {isLoading ? <div className="text-center py-10 text-muted-foreground">Loading...</div> : !videos?.length ? <div className="text-center py-10 text-muted-foreground">No videos.</div> : (
        <div className="space-y-3">
          {videos.map((v) => (
            <Card key={v.id}>
              <CardContent className="p-4 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="font-semibold truncate">{v.title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    {v.platformId && <Badge variant="outline" className="text-xs">{getPlatformName(v.platformId)}</Badge>}
                    <Badge variant={v.isActive ? "default" : "secondary"} className="text-xs">{v.isActive ? "Active" : "Inactive"}</Badge>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Button size="icon" variant="ghost" onClick={() => openEdit(v)}><Edit className="w-4 h-4" /></Button>
                  <Button size="icon" variant="ghost" onClick={() => { if (confirm("Delete?")) del.mutate(v.id); }}><Trash2 className="w-4 h-4" /></Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? "Edit Video" : "New Video"}</DialogTitle></DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); save.mutate(); }} className="space-y-4">
            <div className="space-y-2"><Label>Title</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required /></div>
            <div className="space-y-2">
              <Label>Platform</Label>
              <Select value={form.platformId?.toString() || ""} onValueChange={(v) => setForm({ ...form, platformId: parseInt(v) || 0 })}>
                <SelectTrigger><SelectValue placeholder="Select platform" /></SelectTrigger>
                <SelectContent>
                  {platforms?.map((p) => <SelectItem key={p.id} value={p.id.toString()}>{p.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2"><Label>Video URL</Label><Input value={form.videoUrl} onChange={(e) => setForm({ ...form, videoUrl: e.target.value })} required /></div>
            <div className="space-y-2"><Label>Thumbnail URL</Label><Input value={form.thumbnailUrl} onChange={(e) => setForm({ ...form, thumbnailUrl: e.target.value })} /></div>
            <div className="space-y-2"><Label>Description</Label><Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
            <div className="grid sm:grid-cols-2 gap-4">
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
