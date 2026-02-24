import { useState, useEffect } from "react";
import { Save, Key, Mail, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function AdminProfile() {
  const { toast } = useToast();
  const { data: admin } = useQuery({ queryKey: ["/api/admin/me"] });
  const [profileForm, setProfileForm] = useState({ name: "", newEmail: "" });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });

  useEffect(() => {
    if (admin) {
      setProfileForm({ name: (admin as any).name || "", newEmail: (admin as any).email || "" });
    }
  }, [admin]);

  const updateProfile = useMutation({
    mutationFn: async () => {
      await apiRequest("PATCH", "/api/admin/profile", {
        name: profileForm.name,
        newEmail: profileForm.newEmail !== (admin as any)?.email ? profileForm.newEmail : undefined,
      });
    },
    onSuccess: () => {
      toast({ title: "Profile Updated" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/me"] });
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const updatePassword = useMutation({
    mutationFn: async () => {
      if (passwordForm.newPassword !== passwordForm.confirmPassword) {
        throw new Error("New passwords do not match");
      }
      if (passwordForm.newPassword.length < 6) {
        throw new Error("Password must be at least 6 characters");
      }
      await apiRequest("PATCH", "/api/admin/profile", {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
    },
    onSuccess: () => {
      toast({ title: "Password Changed" });
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold" data-testid="text-profile-title">My Profile</h1>
        <p className="text-muted-foreground text-sm">Update your account details</p>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-lg flex items-center gap-2"><User className="w-5 h-5" /> Profile Details</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={(e) => { e.preventDefault(); updateProfile.mutate(); }} className="space-y-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input value={profileForm.name} onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })} data-testid="input-profile-name" />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" value={profileForm.newEmail} onChange={(e) => setProfileForm({ ...profileForm, newEmail: e.target.value })} data-testid="input-profile-email" />
            </div>
            <Button type="submit" disabled={updateProfile.isPending} data-testid="button-save-profile">
              <Save className="w-4 h-4 mr-2" /> {updateProfile.isPending ? "Saving..." : "Save Profile"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Key className="w-5 h-5" /> Change Password</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={(e) => { e.preventDefault(); updatePassword.mutate(); }} className="space-y-4">
            <div className="space-y-2">
              <Label>Current Password</Label>
              <Input type="password" value={passwordForm.currentPassword} onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })} required data-testid="input-current-password" />
            </div>
            <div className="space-y-2">
              <Label>New Password</Label>
              <Input type="password" value={passwordForm.newPassword} onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })} required data-testid="input-new-password" />
            </div>
            <div className="space-y-2">
              <Label>Confirm New Password</Label>
              <Input type="password" value={passwordForm.confirmPassword} onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })} required data-testid="input-confirm-password" />
            </div>
            <Button type="submit" disabled={updatePassword.isPending} data-testid="button-change-password">
              <Key className="w-4 h-4 mr-2" /> {updatePassword.isPending ? "Changing..." : "Change Password"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
