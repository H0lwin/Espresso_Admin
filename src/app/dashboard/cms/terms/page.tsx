
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
import { getCookie } from "@/lib/utils";

interface TermsPageData {
  title: string;
  content: string;
  last_updated: string; // ISO date string
}

export default function CmsTermsPage() {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = React.useState(false);
  const [isLoadingData, setIsLoadingData] = React.useState(true);

  const [pageTitle, setPageTitle] = React.useState("");
  const [content, setContent] = React.useState("");
  const [lastUpdated, setLastUpdated] = React.useState(new Date().toISOString().split('T')[0]);

  React.useEffect(() => {
    const fetchData = async () => {
      setIsLoadingData(true);
      try {
        const response = await fetch("/api/v1/cms/terms-of-service/"); // Replace with your actual endpoint
        if (!response.ok) throw new Error("Failed to fetch Terms of Service data");
        const data: TermsPageData = await response.json();
        setPageTitle(data.title || "شرایط خدمات");
        setContent(data.content || "محتوای پیش‌فرض شرایط خدمات..."); // Provide a translated default if API returns empty
        setLastUpdated(data.last_updated ? data.last_updated.split('T')[0] : new Date().toISOString().split('T')[0]);
      } catch (error) {
        toast({
          title: "خطا در بارگذاری اطلاعات",
          description: "امکان دریافت اطلاعات صفحه شرایط خدمات وجود ندارد.",
          variant: "destructive",
        });
        setPageTitle("شرایط خدمات");
        setContent("محتوای پیش‌فرض شرایط خدمات...");
      } finally {
        setIsLoadingData(false);
      }
    };
    fetchData();
  }, [toast]);

  const handleSaveChanges = async () => {
    setIsSaving(true);
    const payload: TermsPageData = {
      title: pageTitle,
      content: content,
      last_updated: lastUpdated,
    };

    try {
      const csrfToken = getCookie("csrftoken");
      const response = await fetch("/api/v1/cms/terms-of-service/", { // Replace with your actual endpoint
        method: "PATCH", // Or PUT/POST
        headers: {
          "Content-Type": "application/json",
          ...(csrfToken && { "X-CSRFToken": csrfToken }),
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
         const errorData = await response.json().catch(() => ({detail: "خطا در ذخیره اطلاعات"}));
        throw new Error(errorData.detail || "Failed to save Terms of Service");
      }
      
      toast({
        title: "شرایط خدمات ذخیره شد",
        description: "محتوای صفحه شرایط خدمات با موفقیت به‌روزرسانی شد.",
      });
    } catch (error: any) {
      toast({
        title: "خطا در ذخیره‌سازی",
        description: error.message || "امکان ذخیره شرایط خدمات وجود نداشت.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoadingData) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
        <p className="ms-4 text-lg">در حال بارگذاری شرایط خدمات...</p>
      </div>
    );
  }

  return (
    <>
      <PageHeader
        title="CMS: شرایط خدمات"
        description="محتوای صفحه شرایط خدمات خود را مدیریت کنید."
        actions={
          <Button onClick={handleSaveChanges} disabled={isSaving || isLoadingData}>
            {isSaving ? <Loader2 className="ml-2 h-4 w-4 animate-spin" /> : <Save className="ml-2 h-4 w-4" />}
            {isSaving ? "در حال ذخیره..." : "ذخیره تغییرات"}
          </Button>
        }
      />

      <Card>
        <CardHeader className="text-right">
          <CardTitle className="flex items-center justify-end"><FileText className="ms-2 h-5 w-5" /> ویرایشگر محتوا</CardTitle>
          <CardDescription>
            از ویرایشگر زیر برای به‌روزرسانی شرایط خدمات استفاده کنید. (محتوای حقوقی باید به دقت ترجمه شود)
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
              dir="ltr" 
            />
          </div>
        </CardContent>
      </Card>
    </>
  );
}
