
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
import { getCookie } from "@/lib/utils";

interface AdminProfile {
  name: string;
  email: string;
  avatar_url?: string;
}

export default function AdminProfilePage() {
  const { toast } = useToast();
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [currentPassword, setCurrentPassword] = React.useState("");
  const [newPassword, setNewPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [avatarPreview, setAvatarPreview] = React.useState("https://placehold.co/128x128.png");
  const [avatarFile, setAvatarFile] = React.useState<File | null>(null);
  
  const [isSavingProfile, setIsSavingProfile] = React.useState(false);
  const [isSavingPassword, setIsSavingPassword] = React.useState(false);
  const [isLoadingData, setIsLoadingData] = React.useState(true);

  React.useEffect(() => {
    const fetchProfile = async () => {
      setIsLoadingData(true);
      try {
        const response = await fetch("/api/v1/admin/profile/"); // Replace with your actual endpoint
        if (!response.ok) throw new Error("Failed to fetch profile");
        const data: AdminProfile = await response.json();
        setName(data.name);
        setEmail(data.email);
        if (data.avatar_url) {
          setAvatarPreview(data.avatar_url);
        }
      } catch (error) {
        toast({
          title: "خطا در بارگذاری پروفایل",
          description: "امکان دریافت اطلاعات پروفایل وجود نداشت.",
          variant: "destructive",
        });
      } finally {
        setIsLoadingData(false);
      }
    };
    fetchProfile();
  }, [toast]);

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
    setIsSavingProfile(true);

    const formData = new FormData();
    formData.append("name", name);
    formData.append("email", email);
    if (avatarFile) {
      formData.append("avatar", avatarFile); // API field name for avatar
    }

    try {
      const csrfToken = getCookie("csrftoken");
      const response = await fetch("/api/v1/admin/profile/", { // Replace with your actual endpoint
        method: "PATCH", // Or PUT
        headers: {
          ...(csrfToken && { "X-CSRFToken": csrfToken }),
          // FormData sets Content-Type automatically
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({detail: "خطا در به‌روزرسانی پروفایل"}));
        throw new Error(errorData.detail || "Failed to update profile");
      }
      
      const updatedProfile: AdminProfile = await response.json();
      setName(updatedProfile.name);
      setEmail(updatedProfile.email);
      if (updatedProfile.avatar_url) setAvatarPreview(updatedProfile.avatar_url);
      setAvatarFile(null); // Clear file after successful upload

      toast({
        title: "پروفایل به‌روزرسانی شد",
        description: "جزئیات پروفایل شما با موفقیت به‌روزرسانی شد.",
      });
    } catch (error: any) {
      toast({
        title: "خطا در به‌روزرسانی",
        description: error.message || "امکان به‌روزرسانی پروفایل وجود نداشت.",
        variant: "destructive",
      });
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast({
        title: "عدم تطابق رمز عبور",
        description: "رمزهای عبور جدید با هم مطابقت ندارند. لطفا دوباره تلاش کنید.",
        variant: "destructive",
      });
      return;
    }
    if (!currentPassword || !newPassword) {
      toast({
        title: "فیلدهای ضروری",
        description: "لطفا تمام فیلدهای رمز عبور را پر کنید.",
        variant: "destructive",
      });
      return;
    }

    setIsSavingPassword(true);
    try {
      const csrfToken = getCookie("csrftoken");
      const response = await fetch("/api/v1/admin/profile/change-password/", { // Replace endpoint
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(csrfToken && { "X-CSRFToken": csrfToken }),
        },
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword,
          confirm_password: confirmPassword,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({detail: "خطا در تغییر رمز عبور"}));
        throw new Error(errorData.detail || "Failed to change password");
      }
      toast({
        title: "رمز عبور تغییر کرد",
        description: "رمز عبور شما با موفقیت به‌روزرسانی شد.",
      });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
       toast({
        title: "خطا در تغییر رمز عبور",
        description: error.message || "امکان تغییر رمز عبور وجود نداشت.",
        variant: "destructive",
      });
    } finally {
      setIsSavingPassword(false);
    }
  };

  if (isLoadingData) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
        <p className="ms-4 text-lg">در حال بارگذاری پروفایل...</p>
      </div>
    );
  }

  return (
    <>
      <PageHeader
        title="پروفایل من"
        description="جزئیات حساب شخصی و رمز عبور خود را مدیریت کنید."
      />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <form onSubmit={handleProfileUpdate}>
            <CardHeader className="text-right">
              <CardTitle className="flex items-center justify-end"><UserCircle2 className="ms-2 h-5 w-5" /> اطلاعات پروفایل</CardTitle>
              <CardDescription>جزئیات شخصی خود را در اینجا به‌روزرسانی کنید.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col items-center sm:flex-row-reverse sm:items-start gap-6">
                <div className="flex flex-col items-center space-y-2">
                  <Avatar className="h-32 w-32">
                    <AvatarImage src={avatarPreview} alt={name} data-ai-hint="admin avatar" />
                    <AvatarFallback>{name ? name.split(" ").map(n => n[0]).join("").toUpperCase() : "کا"}</AvatarFallback>
                  </Avatar>
                  <Input id="avatarUpload" type="file" onChange={handleAvatarUpload} accept="image/*" className="hidden" />
                  <Button type="button" variant="outline" size="sm" onClick={() => document.getElementById('avatarUpload')?.click()} disabled={isSavingProfile}>
                    <UploadCloud className="ms-2 h-4 w-4" /> تغییر آواتار
                  </Button>
                </div>
                <div className="flex-1 space-y-4 w-full">
                  <div className="space-y-1">
                    <Label htmlFor="name">نام کامل</Label>
                    <Input id="name" value={name} onChange={(e) => setName(e.target.value)} disabled={isSavingProfile} />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="email">آدرس ایمیل</Label>
                    <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} disabled={isSavingProfile} />
                  </div>
                </div>
              </div>
              <div className="mt-6 flex justify-start"> 
                <Button type="submit" disabled={isSavingProfile}>
                  {isSavingProfile ? <Loader2 className="ms-2 h-4 w-4 animate-spin" /> : <Save className="ms-2 h-4 w-4" />}
                  {isSavingProfile ? "در حال ذخیره..." : "ذخیره پروفایل"}
                </Button>
              </div>
            </CardContent>
          </form>
        </Card>

        <Card>
          <form onSubmit={handlePasswordUpdate}>
            <CardHeader className="text-right">
              <CardTitle className="flex items-center justify-end"><KeyRound className="ms-2 h-5 w-5" /> تغییر رمز عبور</CardTitle>
              <CardDescription>رمز عبور حساب خود را به‌روزرسانی کنید.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <Label htmlFor="currentPassword">رمز عبور فعلی</Label>
                <Input id="currentPassword" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} disabled={isSavingPassword} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="newPassword">رمز عبور جدید</Label>
                <Input id="newPassword" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} disabled={isSavingPassword} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="confirmPassword">تایید رمز عبور جدید</Label>
                <Input id="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} disabled={isSavingPassword} />
              </div>
              <div className="mt-6 flex justify-start"> 
                <Button type="submit" disabled={isSavingPassword}>
                  {isSavingPassword ? <Loader2 className="ms-2 h-4 w-4 animate-spin" /> : <Save className="ms-2 h-4 w-4" />}
                  {isSavingPassword ? "در حال ذخیره..." : "تغییر رمز عبور"}
                </Button>
              </div>
            </CardContent>
          </form>
        </Card>
      </div>
    </>
  );
}
