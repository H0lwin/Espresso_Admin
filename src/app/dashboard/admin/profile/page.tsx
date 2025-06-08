
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
  const [name, setName] = React.useState("کاربر ادمین");
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

    if (newPassword && newPassword !== confirmPassword) {
      toast({
        title: "عدم تطابق رمز عبور",
        description: "رمزهای عبور جدید با هم مطابقت ندارند. لطفا دوباره تلاش کنید.",
        variant: "destructive",
      });
      setIsSaving(false);
      return;
    }

    await new Promise(resolve => setTimeout(resolve, 1500));

    console.log("به‌روزرسانی پروفایل:", { name, email, avatarFile: avatarFile?.name });
    if (newPassword) {
      console.log("درخواست تغییر رمز عبور.");
    }
    
    toast({
      title: "پروفایل به‌روزرسانی شد",
      description: "جزئیات پروفایل شما با موفقیت به‌روزرسانی شد.",
    });
    setIsSaving(false);
    setNewPassword("");
    setConfirmPassword("");
    setCurrentPassword("");
  };

  return (
    <>
      <PageHeader
        title="پروفایل من"
        description="جزئیات حساب شخصی و رمز عبور خود را مدیریت کنید."
      />
      <form onSubmit={handleProfileUpdate}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader className="text-right">
              <CardTitle className="flex items-center"><UserCircle2 className="ms-2 h-5 w-5" /> اطلاعات پروفایل</CardTitle>
              <CardDescription>جزئیات شخصی خود را در اینجا به‌روزرسانی کنید.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col items-center sm:flex-row sm:items-start gap-6">
                <div className="flex flex-col items-center space-y-2">
                  <Avatar className="h-32 w-32">
                    <AvatarImage src={avatarPreview} alt={name} data-ai-hint="admin avatar" />
                    <AvatarFallback>{name.split(" ").map(n => n[0]).join("").toUpperCase() || "کا"}</AvatarFallback>
                  </Avatar>
                  <Input id="avatarUpload" type="file" onChange={handleAvatarUpload} accept="image/*" className="hidden" />
                  <Button type="button" variant="outline" size="sm" onClick={() => document.getElementById('avatarUpload')?.click()} disabled={isSaving}>
                    <UploadCloud className="ms-2 h-4 w-4" /> تغییر آواتار
                  </Button>
                </div>
                <div className="flex-1 space-y-4 w-full">
                  <div className="space-y-1">
                    <Label htmlFor="name">نام کامل</Label>
                    <Input id="name" value={name} onChange={(e) => setName(e.target.value)} disabled={isSaving} />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="email">آدرس ایمیل</Label>
                    <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} disabled={isSaving} />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="text-right">
              <CardTitle className="flex items-center"><KeyRound className="ms-2 h-5 w-5" /> تغییر رمز عبور</CardTitle>
              <CardDescription>رمز عبور حساب خود را به‌روزرسانی کنید.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <Label htmlFor="currentPassword">رمز عبور فعلی</Label>
                <Input id="currentPassword" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} disabled={isSaving} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="newPassword">رمز عبور جدید</Label>
                <Input id="newPassword" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} disabled={isSaving} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="confirmPassword">تایید رمز عبور جدید</Label>
                <Input id="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} disabled={isSaving} />
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="mt-6 flex justify-start"> {/* justify-start for RTL */}
          <Button type="submit" disabled={isSaving}>
            {isSaving ? <Loader2 className="ms-2 h-4 w-4 animate-spin" /> : <Save className="ms-2 h-4 w-4" />}
            {isSaving ? "در حال ذخیره..." : "ذخیره تغییرات"}
          </Button>
        </div>
      </form>
    </>
  );
}
