import { useState } from "react";
import { Trash2, Mail, MailOpen, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { ConfirmDialog, useConfirmDialog } from "@/components/confirm-dialog";
import type { ContactMessage } from "@shared/schema";

export default function AdminMessages() {
  const { toast } = useToast();
  const { confirm, dialogProps } = useConfirmDialog();
  const { data: messages, isLoading } = useQuery<ContactMessage[]>({ queryKey: ["/api/admin/messages"] });
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<ContactMessage | null>(null);

  const filtered = messages?.filter((m) => !search || m.name.toLowerCase().includes(search.toLowerCase()) || m.subject.toLowerCase().includes(search.toLowerCase())) || [];

  const markRead = useMutation({
    mutationFn: async (id: number) => { await apiRequest("PATCH", `/api/admin/messages/${id}`, { isRead: true }); },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/admin/messages"] }),
  });

  const del = useMutation({
    mutationFn: async (id: number) => { await apiRequest("DELETE", `/api/admin/messages/${id}`); },
    onSuccess: () => { toast({ title: "Deleted" }); queryClient.invalidateQueries({ queryKey: ["/api/admin/messages"] }); setSelected(null); },
  });

  const openMessage = (m: ContactMessage) => {
    setSelected(m);
    if (!m.isRead) markRead.mutate(m.id);
  };

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold">Contact Messages</h1><p className="text-muted-foreground text-sm">{messages?.filter((m) => !m.isRead).length || 0} unread messages</p></div>
      <div className="relative max-w-sm"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" /><Input placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" /></div>

      {isLoading ? <div className="text-center py-10 text-muted-foreground">Loading...</div> : filtered.length === 0 ? <div className="text-center py-10 text-muted-foreground">No messages.</div> : (
        <div className="space-y-3">
          {filtered.map((m) => (
            <Card key={m.id} className={`cursor-pointer ${!m.isRead ? "border-primary/30 bg-primary/5" : ""}`} onClick={() => openMessage(m)} data-testid={`card-message-${m.id}`}>
              <CardContent className="p-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  {m.isRead ? <MailOpen className="w-5 h-5 text-muted-foreground shrink-0" /> : <Mail className="w-5 h-5 text-primary shrink-0" />}
                  <div className="min-w-0">
                    <p className={`truncate ${!m.isRead ? "font-bold" : "font-medium"}`}>{m.subject}</p>
                    <p className="text-sm text-muted-foreground truncate">{m.name} &middot; {m.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs text-muted-foreground hidden sm:inline">{m.createdAt}</span>
                  {!m.isRead && <Badge className="text-xs">New</Badge>}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={!!selected} onOpenChange={(v) => !v && setSelected(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{selected?.subject}</DialogTitle></DialogHeader>
          {selected && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><p className="text-muted-foreground">From</p><p className="font-medium">{selected.name}</p></div>
                <div><p className="text-muted-foreground">Email</p><p className="font-medium">{selected.email}</p></div>
              </div>
              <div><p className="text-muted-foreground text-sm mb-1">Message</p><p className="text-sm whitespace-pre-wrap bg-muted/50 p-4 rounded-lg">{selected.message}</p></div>
              <p className="text-xs text-muted-foreground">Received: {selected.createdAt}</p>
              <div className="flex justify-end">
                <Button size="sm" variant="destructive" onClick={() => confirm(() => del.mutate(selected.id), "Delete Message?", "This action cannot be undone.")}>
                  <Trash2 className="w-4 h-4 mr-2" /> Delete
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      <ConfirmDialog {...dialogProps} />
    </div>
  );
}
