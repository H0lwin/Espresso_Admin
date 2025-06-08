
"use client";

import * as React from "react";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Save, MapPin, Phone, Mail as MailIcon, Loader2 } from "lucide-react";
import Image from "next/image";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useToast } from "@/hooks/use-toast";
import { getCookie } from "@/lib/utils";

interface ContactPageData {
  form_title: string;
  form_description: string;
  address: string;
  phone: string;
  email: string;
  map_embed_url: string;
}

export default function CmsContactPage() {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = React.useState(false);
  const [isLoadingData, setIsLoadingData] = React.useState(true);

  const [formTitle, setFormTitle] = React.useState("");
  const [formDescription, setFormDescription] = React.useState("");
  const [address, setAddress] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [mapEmbedUrl, setMapEmbedUrl] = React.useState("https://placehold.co/600x400.png"); 

  React.useEffect(() => {
    const fetchData = async () => {
      setIsLoadingData(true);
      try {
        const response = await fetch("/api/v1/cms/contact/"); // Replace with your actual endpoint
        if (!response.ok) throw new Error("Failed to fetch Contact Us page data");
        const data: ContactPageData = await response.json();
        setFormTitle(data.form_title || "در تماس باشید");
        setFormDescription(data.form_description || "سوال یا بازخوردی دارید؟ فرم زیر را پر کنید.");
        setAddress(data.address || "خیابان قهوه ۱۲۳، شهرک دم‌آوری، کالیفرنیا ۹۰۲۱۰");
        setPhone(data.phone || "۴۵۶۷-۱۲۳ (۵۵۵)");
        setEmail(data.email || "contact@espressoedge.com");
        setMapEmbedUrl(data.map_embed_url || "https://placehold.co/600x400.png");
      } catch (error) {
        toast({
          title: "خطا در بارگذاری اطلاعات",
          description: "امکان دریافت اطلاعات صفحه تماس با ما وجود ندارد.",
          variant: "destructive",
        });
      } finally {
        setIsLoadingData(false);
      }
    };
    fetchData();
  }, [toast]);

  const handleSaveChanges = async () => {
    setIsSaving(true);
    const payload: ContactPageData = {
      form_title: formTitle,
      form_description: formDescription,
      address,
      phone,
      email,
      map_embed_url: mapEmbedUrl,
    };

    try {
      const csrfToken = getCookie("csrftoken");
      const response = await fetch("/api/v1/cms/contact/", { // Replace with your actual endpoint
        method: "PATCH", // Or PUT/POST
        headers: {
          "Content-Type": "application/json",
          ...(csrfToken && { "X-CSRFToken": csrfToken }),
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({detail: "خطا در ذخیره اطلاعات"}));
        throw new Error(errorData.detail || "Failed to save Contact Us data");
      }
      // Optionally update state from response if API returns the saved object
      // const savedData: ContactPageData = await response.json();
      // setFormTitle(savedData.form_title); ... etc.

      toast({
        title: "تغییرات ذخیره شد",
        description: "اطلاعات صفحه تماس با ما با موفقیت به‌روزرسانی شد.",
      });
    } catch (error: any) {
      toast({
        title: "خطا در ذخیره‌سازی",
        description: error.message || "امکان ذخیره اطلاعات صفحه تماس با ما وجود نداشت.",
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
        <p className="ms-4 text-lg">در حال بارگذاری اطلاعات صفحه تماس با ما...</p>
      </div>
    );
  }

  return (
    <>
      <PageHeader
        title="CMS: صفحه تماس با ما"
        description="محتوای صفحه تماس با ما خود را مدیریت کنید."
        actions={
          <Button onClick={handleSaveChanges} disabled={isSaving || isLoadingData}>
            {isSaving ? <Loader2 className="ml-2 h-4 w-4 animate-spin" /> : <Save className="ml-2 h-4 w-4" />}
            {isSaving ? "در حال ذخیره..." : "ذخیره تغییرات"}
          </Button>
        }
      />

      <Accordion type="multiple" defaultValue={["form", "details", "map"]} className="w-full space-y-4">
        <AccordionItem value="form">
          <AccordionTrigger className="text-xl font-semibold p-4 bg-card rounded-t-lg hover:no-underline">تنظیمات فرم تماس</AccordionTrigger>
          <AccordionContent className="p-4 border border-t-0 rounded-b-lg bg-card">
            <div className="grid gap-6">
              <div className="space-y-2">
                <Label htmlFor="formTitle">عنوان فرم</Label>
                <Input id="formTitle" value={formTitle} onChange={(e) => setFormTitle(e.target.value)} disabled={isSaving}/>
              </div>
              <div className="space-y-2">
                <Label htmlFor="formDescription">توضیحات/متن مقدماتی فرم</Label>
                <Textarea id="formDescription" value={formDescription} onChange={(e) => setFormDescription(e.target.value)} disabled={isSaving}/>
              </div>
              <Card>
                <CardHeader className="text-right">
                  <CardTitle className="text-base">پیش‌نمایش فرم (فقط ظاهری)</CardTitle>
                  <CardDescription className="text-xs">این یک نمایش بصری است. فیلدهای فرم استاندارد هستند.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Input placeholder="نام شما" disabled />
                  <Input type="email" placeholder="ایمیل شما" disabled />
                  <Textarea placeholder="پیام شما" disabled />
                  <Button disabled>ارسال پیام</Button>
                </CardContent>
              </Card>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="details">
          <AccordionTrigger className="text-xl font-semibold p-4 bg-card rounded-t-lg hover:no-underline">جزئیات تماس</AccordionTrigger>
          <AccordionContent className="p-4 border border-t-0 rounded-b-lg bg-card">
            <div className="grid gap-6">
              <div className="space-y-2">
                <Label htmlFor="address"><MapPin className="inline ml-2 h-4 w-4" />آدرس</Label>
                <Input id="address" value={address} onChange={(e) => setAddress(e.target.value)} disabled={isSaving}/>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone"><Phone className="inline ml-2 h-4 w-4" />شماره تلفن</Label>
                <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} disabled={isSaving}/>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email"><MailIcon className="inline ml-2 h-4 w-4" />آدرس ایمیل</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} disabled={isSaving}/>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="map">
          <AccordionTrigger className="text-xl font-semibold p-4 bg-card rounded-t-lg hover:no-underline">تنظیمات نقشه</AccordionTrigger>
          <AccordionContent className="p-4 border border-t-0 rounded-b-lg bg-card">
            <div className="grid gap-6">
              <div className="space-y-2">
                <Label htmlFor="mapEmbedUrl">URL جاسازی نقشه یا مختصات موقعیت</Label>
                <Input id="mapEmbedUrl" value={mapEmbedUrl} onChange={(e) => setMapEmbedUrl(e.target.value)} placeholder="مثلا لینک جاسازی گوگل مپ یا طول و عرض جغرافیایی" disabled={isSaving}/>
                <p className="text-xs text-muted-foreground">برای نقشه واقعی، از کد iframe جاسازی گوگل مپ استفاده کنید یا یک کتابخانه نقشه را ادغام کنید.</p>
              </div>
              <div>
                <Label>پیش‌نمایش نقشه</Label>
                <Image 
                  src={mapEmbedUrl.startsWith("https://") ? mapEmbedUrl : "https://placehold.co/600x400.png"} 
                  alt="پیش‌نمایش نقشه" 
                  width={600} 
                  height={400} 
                  className="rounded-md border object-cover w-full aspect-video" 
                  data-ai-hint="location map"
                />
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </>
  );
}
