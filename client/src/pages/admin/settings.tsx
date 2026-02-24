import { useState, useEffect } from "react";
import { Save, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { SiteSetting } from "@shared/schema";

const settingGroups = [
  { label: "General", keys: [
    { key: "site_name", label: "Site Name", type: "text" },
    { key: "site_tagline", label: "Tagline", type: "text" },
    { key: "site_description", label: "Description", type: "textarea" },
    { key: "contact_email", label: "Contact Email", type: "text" },
    { key: "contact_phone", label: "Contact Phone", type: "text" },
    { key: "contact_address", label: "Address", type: "textarea" },
  ]},
  { label: "Social Media", keys: [
    { key: "social_facebook", label: "Facebook URL", type: "text" },
    { key: "social_twitter", label: "Twitter URL", type: "text" },
    { key: "social_linkedin", label: "LinkedIn URL", type: "text" },
    { key: "social_instagram", label: "Instagram URL", type: "text" },
    { key: "social_youtube", label: "YouTube URL", type: "text" },
    { key: "social_whatsapp", label: "WhatsApp Number", type: "text" },
    { key: "social_telegram", label: "Telegram URL", type: "text" },
  ]},
  { label: "SEO", keys: [
    { key: "meta_title", label: "Default Meta Title", type: "text" },
    { key: "meta_description", label: "Default Meta Description", type: "textarea" },
    { key: "meta_keywords", label: "Meta Keywords", type: "text" },
    { key: "founder_name", label: "Founder Name", type: "text" },
    { key: "founder_title", label: "Founder Title", type: "text" },
  ]},
];

export default function AdminSettings() {
  const { toast } = useToast();
  const { data: settings, isLoading } = useQuery<SiteSetting[]>({ queryKey: ["/api/admin/settings"] });
  const [values, setValues] = useState<Record<string, string>>({});
  const [customKey, setCustomKey] = useState("");
  const [customValue, setCustomValue] = useState("");

  useEffect(() => {
    if (settings) {
      const v: Record<string, string> = {};
      settings.forEach((s) => { v[s.key] = s.value; });
      setValues(v);
    }
  }, [settings]);

  const save = useMutation({
    mutationFn: async () => { await apiRequest("POST", "/api/admin/settings", { settings: values }); },
    onSuccess: () => { toast({ title: "Settings Saved" }); queryClient.invalidateQueries({ queryKey: ["/api/admin/settings"] }); queryClient.invalidateQueries({ queryKey: ["/api/settings"] }); },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const addCustom = () => {
    if (customKey.trim()) {
      setValues({ ...values, [customKey.trim()]: customValue });
      setCustomKey("");
      setCustomValue("");
    }
  };

  const allDefinedKeys = settingGroups.flatMap((g) => g.keys.map((k) => k.key));
  const customSettings = Object.entries(values).filter(([k]) => !allDefinedKeys.includes(k));

  if (isLoading) return <div className="text-center py-10 text-muted-foreground">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div><h1 className="text-2xl font-bold">Site Settings</h1><p className="text-muted-foreground text-sm">Manage your website settings</p></div>
        <Button onClick={() => save.mutate()} disabled={save.isPending} data-testid="button-save-settings"><Save className="w-4 h-4 mr-2" /> {save.isPending ? "Saving..." : "Save All"}</Button>
      </div>

      {settingGroups.map((group) => (
        <Card key={group.label}>
          <CardHeader><CardTitle className="text-lg">{group.label}</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {group.keys.map((setting) => (
              <div key={setting.key} className="space-y-2">
                <Label>{setting.label}</Label>
                {setting.type === "textarea" ? (
                  <Textarea value={values[setting.key] || ""} onChange={(e) => setValues({ ...values, [setting.key]: e.target.value })} rows={2} />
                ) : (
                  <Input value={values[setting.key] || ""} onChange={(e) => setValues({ ...values, [setting.key]: e.target.value })} />
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      ))}

      <Card>
        <CardHeader><CardTitle className="text-lg">Custom Settings</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {customSettings.map(([key, val]) => (
            <div key={key} className="flex items-center gap-2">
              <Input value={key} readOnly className="max-w-[200px] bg-muted" />
              <Input value={val} onChange={(e) => setValues({ ...values, [key]: e.target.value })} className="flex-1" />
              <Button size="icon" variant="ghost" onClick={() => { const v = { ...values }; delete v[key]; setValues(v); }}><Trash2 className="w-4 h-4" /></Button>
            </div>
          ))}
          <div className="flex items-end gap-2">
            <div className="space-y-2"><Label>Key</Label><Input value={customKey} onChange={(e) => setCustomKey(e.target.value)} placeholder="setting_key" /></div>
            <div className="space-y-2 flex-1"><Label>Value</Label><Input value={customValue} onChange={(e) => setCustomValue(e.target.value)} placeholder="Setting value" /></div>
            <Button variant="outline" onClick={addCustom}><Plus className="w-4 h-4 mr-1" /> Add</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
