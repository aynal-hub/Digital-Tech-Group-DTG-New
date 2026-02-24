import { useState } from "react";
import { Trash2, Search, Clock, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { ConfirmDialog, useConfirmDialog } from "@/components/confirm-dialog";
import type { SampleRequest, Service } from "@shared/schema";

export default function AdminSampleRequests() {
  const { toast } = useToast();
  const { confirm, dialogProps } = useConfirmDialog();
  const { data: requests, isLoading } = useQuery<SampleRequest[]>({ queryKey: ["/api/admin/sample-requests"] });
  const { data: services } = useQuery<Service[]>({ queryKey: ["/api/services"] });
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<SampleRequest | null>(null);

  const filtered = requests?.filter((r) => !search || r.fullName.toLowerCase().includes(search.toLowerCase())) || [];
  const getServiceName = (id: number | null) => services?.find((s) => s.id === id)?.title || "N/A";

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => { await apiRequest("PATCH", `/api/admin/sample-requests/${id}`, { status }); },
    onSuccess: () => { toast({ title: "Updated" }); queryClient.invalidateQueries({ queryKey: ["/api/admin/sample-requests"] }); },
  });

  const del = useMutation({
    mutationFn: async (id: number) => { await apiRequest("DELETE", `/api/admin/sample-requests/${id}`); },
    onSuccess: () => { toast({ title: "Deleted" }); queryClient.invalidateQueries({ queryKey: ["/api/admin/sample-requests"] }); setSelected(null); },
  });

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold">Sample Requests</h1><p className="text-muted-foreground text-sm">{requests?.filter((r) => r.status === "pending").length || 0} pending requests</p></div>
      <div className="relative max-w-sm"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" /><Input placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" /></div>

      {isLoading ? <div className="text-center py-10 text-muted-foreground">Loading...</div> : filtered.length === 0 ? <div className="text-center py-10 text-muted-foreground">No requests.</div> : (
        <div className="space-y-3">
          {filtered.map((r) => (
            <Card key={r.id} className="cursor-pointer" onClick={() => setSelected(r)}>
              <CardContent className="p-4 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="font-semibold">{r.fullName}</p>
                  <div className="flex items-center gap-2 flex-wrap mt-1">
                    <span className="text-xs text-muted-foreground">{r.country}</span>
                    {r.serviceId && <Badge variant="outline" className="text-xs">{getServiceName(r.serviceId)}</Badge>}
                    <Badge variant={r.status === "pending" ? "secondary" : "default"} className="text-xs">{r.status}</Badge>
                  </div>
                </div>
                <span className="text-xs text-muted-foreground shrink-0">{r.createdAt}</span>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={!!selected} onOpenChange={(v) => !v && setSelected(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Sample Request</DialogTitle></DialogHeader>
          {selected && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><p className="text-muted-foreground">Name</p><p className="font-medium">{selected.fullName}</p></div>
                <div><p className="text-muted-foreground">Phone</p><p className="font-medium">{selected.phone}</p></div>
                <div><p className="text-muted-foreground">Country</p><p className="font-medium">{selected.country}</p></div>
                <div><p className="text-muted-foreground">Service</p><p className="font-medium">{selected.serviceId ? getServiceName(selected.serviceId) : "N/A"}</p></div>
              </div>
              <div><p className="text-muted-foreground text-sm mb-1">Requirements</p><p className="text-sm whitespace-pre-wrap bg-muted/50 p-4 rounded-lg">{selected.requirements}</p></div>
              <div className="flex items-center justify-between gap-2">
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => updateStatus.mutate({ id: selected.id, status: "reviewed" })}><CheckCircle className="w-4 h-4 mr-1" /> Mark Reviewed</Button>
                  <Button size="sm" variant="outline" onClick={() => updateStatus.mutate({ id: selected.id, status: "completed" })}>Complete</Button>
                </div>
                <Button size="sm" variant="destructive" onClick={() => confirm(() => del.mutate(selected.id), "Delete Request?", "This action cannot be undone.")}><Trash2 className="w-4 h-4" /></Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      <ConfirmDialog {...dialogProps} />
    </div>
  );
}
