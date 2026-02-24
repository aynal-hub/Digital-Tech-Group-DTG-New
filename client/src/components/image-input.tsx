import { useState, useRef } from "react";
import { Upload, Link, X, Image as ImageIcon, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ImageInputProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
}

export function ImageInput({ value, onChange, label = "Image" }: ImageInputProps) {
  const [tab, setTab] = useState<string>("url");
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (file: File) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      onChange(data.url);
    } catch {
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Tabs value={tab} onValueChange={setTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 h-8">
          <TabsTrigger value="url" className="text-xs gap-1" data-testid="tab-image-url"><Link className="w-3 h-3" /> URL</TabsTrigger>
          <TabsTrigger value="upload" className="text-xs gap-1" data-testid="tab-image-upload"><Upload className="w-3 h-3" /> Upload</TabsTrigger>
        </TabsList>
        <TabsContent value="url" className="mt-2">
          <Input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="https://example.com/image.jpg"
            data-testid="input-image-url"
          />
        </TabsContent>
        <TabsContent value="upload" className="mt-2">
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleUpload(file);
            }}
          />
          <Button
            type="button"
            variant="outline"
            className="w-full h-20 border-dashed flex flex-col gap-1"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            data-testid="button-upload-image"
          >
            {uploading ? (
              <><Loader2 className="w-5 h-5 animate-spin" /><span className="text-xs">Uploading...</span></>
            ) : (
              <><Upload className="w-5 h-5" /><span className="text-xs">Click to upload</span></>
            )}
          </Button>
        </TabsContent>
      </Tabs>
      {value && (
        <div className="relative inline-block mt-2">
          <img src={value} alt="Preview" className="w-16 h-16 rounded-md object-cover border" />
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center text-xs"
            data-testid="button-remove-image"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      )}
    </div>
  );
}
