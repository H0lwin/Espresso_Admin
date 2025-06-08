
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

const initialPrivacyPolicyContent = `
# Privacy Policy for Espresso Edge

Last Updated: ${new Date().toLocaleDateString()}

## 1. Introduction
Welcome to Espresso Edge. We are committed to protecting your personal information and your right to privacy. If you have any questions or concerns about this privacy notice, or our practices with regards to your personal information, please contact us at privacy@espressoedge.com.

## 2. Information We Collect
We collect personal information that you voluntarily provide to us when you register on the Espresso Edge, express an interest in obtaining information about us or our products and Services, when you participate in activities on the Espresso Edge or otherwise when you contact us.

The personal information that we collect depends on the context of your interactions with us and the Espresso Edge, the choices you make and the products and features you use. The personal information we collect may include the following:
- Name and Contact Data.
- Credentials.
- Payment Data.

## 3. How We Use Your Information
We use personal information collected via our Espresso Edge for a variety of business purposes described below. 
- To facilitate account creation and logon process.
- To post testimonials.
- Request feedback.
- To enable user-to-user communications.
- To manage user accounts. 
- To send administrative information to you. 
- To protect our Services. 
- To enforce our terms, conditions and policies for business purposes, to comply with legal and regulatory requirements or in connection with our contract.

(More sections as needed...)
`;


export default function CmsPrivacyPage() {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = React.useState(false);

  const [pageTitle, setPageTitle] = React.useState("سیاست حفظ حریم خصوصی");
  const [content, setContent] = React.useState(initialPrivacyPolicyContent); // محتوای واقعی باید ترجمه شود
  const [lastUpdated, setLastUpdated] = React.useState(new Date().toISOString().split('T')[0]);


  const handleSaveChanges = async () => {
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    console.log("ذخیره سیاست حفظ حریم خصوصی:", { pageTitle, content, lastUpdated });
    toast({
      title: "سیاست حفظ حریم خصوصی ذخیره شد",
      description: "محتوای صفحه سیاست حفظ حریم خصوصی با موفقیت به‌روزرسانی شد.",
    });
    setIsSaving(false);
  };

  return (
    <>
      <PageHeader
        title="CMS: سیاست حفظ حریم خصوصی"
        description="محتوای صفحه سیاست حفظ حریم خصوصی خود را مدیریت کنید."
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
            از ویرایشگر زیر برای به‌روزرسانی سیاست حفظ حریم خصوصی استفاده کنید. این یک ویرایشگر متن ساده است؛ برای متن غنی، یک کتابخانه مانند TipTap یا Quill را ادغام کنید.
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
            <Label htmlFor="privacyContent">محتوای سیاست حفظ حریم خصوصی (پشتیبانی از Markdown یا HTML توسط فرانت‌اند شما)</Label>
            <Textarea
              id="privacyContent"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={25}
              className="font-mono text-sm"
              placeholder="محتوای سیاست حفظ حریم خصوصی خود را اینجا وارد کنید..."
              disabled={isSaving}
              dir="ltr" // Legal text might be LTR even in RTL UI
            />
          </div>
        </CardContent>
      </Card>
    </>
  );
}

    