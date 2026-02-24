import { useState } from "react";
import { Plus, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { ConfirmDialog, useConfirmDialog } from "@/components/confirm-dialog";
import { ImageInput } from "@/components/image-input";
import type { TeamMember } from "@shared/schema";

export default function AdminTeam() {
  const { toast } = useToast();
  const { confirm, dialogProps } = useConfirmDialog();
  const { data: members, isLoading } = useQuery<TeamMember[]>({ queryKey: ["/api/team"] });
  const [editing, setEditing] = useState<TeamMember | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState({ name: "", designation: "", bio: "", avatarUrl: "", isFounder: false, socialLinks: "", orderIndex: 0, isActive: true });

  const openNew = () => { setEditing(null); setForm({ name: "", designation: "", bio: "", avatarUrl: "", isFounder: false, socialLinks: "", orderIndex: 0, isActive: true }); setIsOpen(true); };
  const openEdit = (m: TeamMember) => { setEditing(m); setForm({ name: m.name, designation: m.designation, bio: m.bio || "", avatarUrl: m.avatarUrl || "", isFounder: m.isFounder || false, socialLinks: m.socialLinks || "", orderIndex: m.orderIndex || 0, isActive: m.isActive !== false }); setIsOpen(true); };

  const save = useMutation({
    mutationFn: async () => {
      if (editing) await apiRequest("PATCH", `/api/admin/team/${editing.id}`, form);
      else await apiRequest("POST", "/api/admin/team", form);
    },
    onSuccess: () => { toast({ title: editing ? "Updated" : "Created" }); queryClient.invalidateQueries({ queryKey: ["/api/team"] }); setIsOpen(false); },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const del = useMutation({
    mutationFn: async (id: number) => { await apiRequest("DELETE", `/api/admin/team/${id}`); },
    onSuccess: () => { toast({ title: "Deleted" }); queryClient.invalidateQueries({ queryKey: ["/api/team"] }); },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div><h1 className="text-2xl font-bold">Team Members</h1><p className="text-muted-foreground text-sm">Manage team members</p></div>
        <Button onClick={openNew}><Plus className="w-4 h-4 mr-2" /> Add Member</Button>
      </div>

      {isLoading ? <div className="text-center py-10 text-muted-foreground">Loading...</div> : !members?.length ? <div className="text-center py-10 text-muted-foreground">No team members.</div> : (
        <div className="space-y-3">
          {members.map((m) => (
            <Card key={m.id}>
              <CardContent className="p-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <Avatar className="w-10 h-10">
                    {m.avatarUrl && <img src={m.avatarUrl} alt={m.name} className="w-full h-full object-cover" />}
                    <AvatarFallback>{m.name.split(" ").map((n) => n[0]).join("")}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">{m.name}</p>
                    <div className="flex items-center gap-2 flex-wrap mt-1">
                      <span className="text-xs text-muted-foreground">{m.designation}</span>
                      {m.isFounder && <Badge className="text-xs">Founder</Badge>}
                      <Badge variant={m.isActive ? "default" : "secondary"} className="text-xs">{m.isActive ? "Active" : "Inactive"}</Badge>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Button size="icon" variant="ghost" onClick={() => openEdit(m)}><Edit className="w-4 h-4" /></Button>
                  <Button size="icon" variant="ghost" onClick={() => confirm(() => del.mutate(m.id), "Delete Member?", "This action cannot be undone.")}><Trash2 className="w-4 h-4" /></Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? "Edit Member" : "New Member"}</DialogTitle></DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); save.mutate(); }} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></div>
              <div className="space-y-2"><Label>Designation</Label><Input value={form.designation} onChange={(e) => setForm({ ...form, designation: e.target.value })} required /></div>
            </div>
            <div className="space-y-2"><Label>Bio</Label><Textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} rows={3} /></div>
            <ImageInput value={form.avatarUrl} onChange={(url) => setForm({ ...form, avatarUrl: url })} label="Avatar" />
            <div className="space-y-2"><Label>Social Links (JSON)</Label><Input value={form.socialLinks} onChange={(e) => setForm({ ...form, socialLinks: e.target.value })} placeholder='{"linkedin":"..."}' /></div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Order Index</Label><Input type="number" value={form.orderIndex} onChange={(e) => setForm({ ...form, orderIndex: parseInt(e.target.value) || 0 })} /></div>
              <div className="space-y-2 flex items-end gap-4">
                <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.isFounder} onChange={(e) => setForm({ ...form, isFounder: e.target.checked })} className="w-4 h-4" /> Founder</label>
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
