
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

export default function CmsContactPage() {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = React.useState(false);

  const [formTitle, setFormTitle] = React.useState("در تماس باشید");
  const [formDescription, setFormDescription] = React.useState("سوال یا بازخوردی دارید؟ فرم زیر را پر کنید.");
  
  const [address, setAddress] = React.useState("خیابان قهوه ۱۲۳، شهرک دم‌آوری، کالیفرنیا ۹۰۲۱۰");
  const [phone, setPhone] = React.useState("۴۵۶۷-۱۲۳ (۵۵۵)");
  const [email, setEmail] = React.useState("contact@espressoedge.com");
  const [mapEmbedUrl, setMapEmbedUrl] = React.useState("https://placehold.co/600x400.png"); 

  const handleSaveChanges = async () => {
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    console.log("ذخیره اطلاعات صفحه تماس:", {
      formTitle, formDescription, address, phone, email, mapEmbedUrl
    });
    toast({
      title: "تغییرات ذخیره شد",
      description: "اطلاعات صفحه تماس با ما با موفقیت به‌روزرسانی شد.",
    });
    setIsSaving(false);
  };

  return (
    <>
      <PageHeader
        title="CMS: صفحه تماس با ما"
        description="محتوای صفحه تماس با ما خود را مدیریت کنید."
        actions={
          <Button onClick={handleSaveChanges} disabled={isSaving}>
            {isSaving ? <Loader2 className="ml-2 h-4 w-4 animate-spin" /> : <Save className="ml-2 h-4 w-4" />}
            {isSaving ? "در حال ذخیره..." : "ذخیره تغییرات"}
          </Button>
        }
      />

      <Accordion type="multiple" defaultValue={["form", "details", "map"]} className="w-full space-y-4">
        {/* بخش فرم تماس */}
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

        {/* بخش جزئیات تماس */}
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

        {/* بخش نقشه */}
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

    