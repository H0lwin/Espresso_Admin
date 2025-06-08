
"use client";

import * as React from "react";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Save, FileText, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

const initialTermsContent = `
# Terms of Service for Espresso Edge

Last Updated: ${new Date().toLocaleDateString()}

## 1. Agreement to Terms
By using our services, you agree to be bound by these Terms of Service. If you do not agree to these Terms, do not use our services.

## 2. Changes to Terms or Services
We may modify the Terms at any time, in our sole discretion. If we do so, we’ll let you know either by posting the modified Terms on the Site or through other communications.

## 3. Who May Use the Services
You may use the Services only if you are 18 years or older and capable of forming a binding contract with Espresso Edge and are not barred from using the Services under applicable law.

## 4. Privacy Policy
Please refer to our Privacy Policy for information on how we collect, use and disclose information from our users.

## 5. Content Ownership
Espresso Edge does not claim any ownership rights in any User Content that you make available through the Services. 

(More sections as needed...)
`;

export default function CmsTermsPage() {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = React.useState(false);

  const [pageTitle, setPageTitle] = React.useState("شرایط خدمات");
  const [content, setContent] = React.useState(initialTermsContent); // محتوای واقعی باید ترجمه شود
  const [lastUpdated, setLastUpdated] = React.useState(new Date().toISOString().split('T')[0]);

  const handleSaveChanges = async () => {
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    console.log("ذخیره شرایط خدمات:", { pageTitle, content, lastUpdated });
    toast({
      title: "شرایط خدمات ذخیره شد",
      description: "محتوای صفحه شرایط خدمات با موفقیت به‌روزرسانی شد.",
    });
    setIsSaving(false);
  };

  return (
    <>
      <PageHeader
        title="CMS: شرایط خدمات"
        description="محتوای صفحه شرایط خدمات خود را مدیریت کنید."
        actions={
          <Button onClick={handleSaveChanges} disabled={isSaving}>
            {isSaving ? <Loader2 className="ml-2 h-4 w-4 animate-spin" /> : <Save className="ml-2 h-4 w-4" />}
            {isSaving ? "در حال ذخیره..." : "ذخیره تغییرات"}
          </Button>
        }
      />

      <Card>
        <CardHeader className="text-right">
          <CardTitle className="flex items-center"><FileText className="ml-2 h-5 w-5" /> ویرایشگر محتوا</CardTitle>
          <CardDescription>
            از ویرایشگر زیر برای به‌روزرسانی شرایط خدمات استفاده کنید. این یک ویرایشگر متن ساده است؛ برای متن غنی، یک کتابخانه مانند TipTap یا Quill را ادغام کنید.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
                <Label htmlFor="pageTitle">عنوان صفحه</Label>
                <Input id="pageTitle" value={pageTitle} onChange={(e) => setPageTitle(e.target.value)} disabled={isSaving}/>
            </div>
            <div className="space-y-2">
                <Label htmlFor="lastUpdated">تاریخ آخرین به‌روزرسانی</Label>
                <Input id="lastUpdated" type="date" value={lastUpdated} onChange={(e) => setLastUpdated(e.target.value)} disabled={isSaving}/>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="termsContent">محتوای شرایط خدمات (پشتیبانی از Markdown یا HTML توسط فرانت‌اند شما)</Label>
            <Textarea
              id="termsContent"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={25}
              className="font-mono text-sm"
              placeholder="محتوای شرایط خدمات خود را اینجا وارد کنید..."
              disabled={isSaving}
              dir="ltr" // Legal text might be LTR even in RTL UI
            />
          </div>
        </CardContent>
      </Card>
    </>
  );
}

    