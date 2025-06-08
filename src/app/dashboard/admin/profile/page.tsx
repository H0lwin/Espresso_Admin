
"use client";

import * as React from "react";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Save, UploadCloud, KeyRound, UserCircle2, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AdminProfilePage() {
  const { toast } = useToast();
  const [name, setName] = React.useState("Admin User");
  const [email, setEmail] = React.useState("admin@espressoedge.com");
  const [currentPassword, setCurrentPassword] = React.useState("");
  const [newPassword, setNewPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [avatarPreview, setAvatarPreview] = React.useState("https://placehold.co/128x128.png");
  const [avatarFile, setAvatarFile] = React.useState<File | null>(null);
  const [isSaving, setIsSaving] = React.useState(false);

  const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    // Validation for passwords if fields are filled
    if (newPassword && newPassword !== confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "New passwords do not match. Please try again.",
        variant: "destructive",
      });
      setIsSaving(false);
      return;
    }

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    console.log("Updating profile:", { name, email, avatarFile: avatarFile?.name });
    if (newPassword) {
      console.log("Password change requested."); // Handle securely in a real app
    }
    
    toast({
      title: "Profile Updated",
      description: "Your profile details have been successfully updated.",
    });
    setIsSaving(false);
    // Optionally clear password fields
    setNewPassword("");
    setConfirmPassword("");
    setCurrentPassword("");
  };

  return (
    <>
      <PageHeader
        title="My Profile"
        description="Manage your personal account details and password."
      />
      <form onSubmit={handleProfileUpdate}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Details Card */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center"><UserCircle2 className="mr-2 h-5 w-5" /> Profile Information</CardTitle>
              <CardDescription>Update your personal details here.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col items-center sm:flex-row sm:items-start gap-6">
                <div className="flex flex-col items-center space-y-2">
                  <Avatar className="h-32 w-32">
                    <AvatarImage src={avatarPreview} alt={name} data-ai-hint="admin avatar" />
                    <AvatarFallback>{name.split(" ").map(n => n[0]).join("").toUpperCase() || "AD"}</AvatarFallback>
                  </Avatar>
                  <Input id="avatarUpload" type="file" onChange={handleAvatarUpload} accept="image/*" className="hidden" />
                  <Button type="button" variant="outline" size="sm" onClick={() => document.getElementById('avatarUpload')?.click()} disabled={isSaving}>
                    <UploadCloud className="mr-2 h-4 w-4" /> Change Avatar
                  </Button>
                </div>
                <div className="flex-1 space-y-4 w-full">
                  <div className="space-y-1">
                    <Label htmlFor="name">Full Name</Label>
                    <Input id="name" value={name} onChange={(e) => setName(e.target.value)} disabled={isSaving} />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="email">Email Address</Label>
                    <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} disabled={isSaving} />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Change Password Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center"><KeyRound className="mr-2 h-5 w-5" /> Change Password</CardTitle>
              <CardDescription>Update your account password.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input id="currentPassword" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} disabled={isSaving} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="newPassword">New Password</Label>
                <Input id="newPassword" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} disabled={isSaving} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input id="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} disabled={isSaving} />
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="mt-6 flex justify-end">
          <Button type="submit" disabled={isSaving}>
            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </>
  );
}
