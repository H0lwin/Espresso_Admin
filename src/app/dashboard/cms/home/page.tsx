
"use client";

import * as React from "react";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UploadCloud, Save, Loader2 } from "lucide-react";
import Image from "next/image";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useToast } from "@/hooks/use-toast";

// اطلاعات محصولات نمونه (بعداً با UI انتخاب محصول واقعی جایگزین شود)
const allProducts = [
  { id: "prod001", name: "ماگ اسپرسو اِج" },
  { id: "prod002", name: "دانه قهوه کامل (۱ کیلوگرم)" },
  { id: "menu002", name: "کارامل ماکیاتو" },
  { id: "menu003", name: "کروسان" },
];


export default function CmsHomePage() {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = React.useState(false);

  const [heroHeadline, setHeroHeadline] = React.useState("نوشیدنی بی‌نظیر خود را کشف کنید");
  const [heroSubheadline, setHeroSubheadline] = React.useState("بهترین قهوه‌ها، دست‌چین شده برای شما.");
  const [heroCtaText, setHeroCtaText] = React.useState("مشاهده قهوه‌ها");
  const [heroImageUrl, setHeroImageUrl] = React.useState("https://placehold.co/1200x600.png");
  const [heroImageFile, setHeroImageFile] = React.useState<File | null>(null);

  const [featuredProductIds, setFeaturedProductIds] = React.useState<string[]>(["prod002", "menu002"]);

  const [customCtaTitle, setCustomCtaTitle] = React.useState("به باشگاه قهوه ما بپیوندید");
  const [customCtaDescription, setCustomCtaDescription] = React.useState("از تخفیف‌های ویژه و دسترسی زودهنگام به رست‌های جدید بهره‌مند شوید.");
  const [customCtaButtonText, setCustomCtaButtonText] = React.useState("اکنون عضو شوید");
  const [customCtaImageUrl, setCustomCtaImageUrl] = React.useState("https://placehold.co/600x400.png");
  const [customCtaImageFile, setCustomCtaImageFile] = React.useState<File | null>(null);

  const handleImageUpload = (
    event: React.ChangeEvent<HTMLInputElement>,
    setImageUrl: React.Dispatch<React.SetStateAction<string>>,
    setFile: React.Dispatch<React.SetStateAction<File | null>>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      setFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFeaturedProductToggle = (productId: string) => {
    setFeaturedProductIds(prev =>
      prev.includes(productId) ? prev.filter(id => id !== productId) : [...prev, productId]
    );
  };
  
  const handleSaveChanges = async () => {
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    console.log("ذخیره اطلاعات صفحه اصلی CMS:", {
      heroHeadline, heroSubheadline, heroCtaText, heroImageFile: heroImageFile?.name,
      featuredProductIds,
      customCtaTitle, customCtaDescription, customCtaButtonText, customCtaImageFile: customCtaImageFile?.name
    });
    toast({
      title: "تغییرات ذخیره شد",
      description: "اطلاعات صفحه اصلی با موفقیت به‌روزرسانی شد.",
    });
    setIsSaving(false);
  };


  return (
    <>
      <PageHeader
        title="CMS: صفحه اصلی"
        description="محتوای صفحه اصلی وب‌سایت خود را مدیریت کنید."
        actions={
          <Button onClick={handleSaveChanges} disabled={isSaving}>
            {isSaving ? <Loader2 className="ml-2 h-4 w-4 animate-spin" /> : <Save className="ml-2 h-4 w-4" />}
            {isSaving ? "در حال ذخیره..." : "ذخیره تغییرات"}
          </Button>
        }
      />

      <Accordion type="multiple" defaultValue={["hero", "featured", "cta"]} className="w-full space-y-4">
        {/* بخش هیرو */}
        <AccordionItem value="hero">
          <AccordionTrigger className="text-xl font-semibold p-4 bg-card rounded-t-lg hover:no-underline">بخش هیرو</AccordionTrigger>
          <AccordionContent className="p-4 border border-t-0 rounded-b-lg bg-card">
            <div className="grid gap-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="heroHeadline">عنوان اصلی</Label>
                  <Input id="heroHeadline" value={heroHeadline} onChange={(e) => setHeroHeadline(e.target.value)} disabled={isSaving}/>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="heroCtaText">متن دکمه فراخوان</Label>
                  <Input id="heroCtaText" value={heroCtaText} onChange={(e) => setHeroCtaText(e.target.value)} disabled={isSaving}/>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="heroSubheadline">زیرعنوان</Label>
                <Textarea id="heroSubheadline" value={heroSubheadline} onChange={(e) => setHeroSubheadline(e.target.value)} disabled={isSaving}/>
              </div>
              <div className="space-y-2">
                <Label htmlFor="heroImage">تصویر هیرو</Label>
                <div className="flex items-center gap-4">
                  <Image src={heroImageUrl} alt="پیش‌نمایش هیرو" width={200} height={100} className="rounded-md object-cover border" data-ai-hint="hero banner" />
                  <Input id="heroImageUpload" type="file" onChange={(e) => handleImageUpload(e, setHeroImageUrl, setHeroImageFile)} accept="image/*" className="hidden" />
                  <Button type="button" variant="outline" onClick={() => document.getElementById('heroImageUpload')?.click()} disabled={isSaving}>
                    <UploadCloud className="ml-2 h-4 w-4" /> بارگذاری تصویر
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">اندازه پیشنهادی: ۱۲۰۰×۶۰۰ پیکسل.</p>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* بخش محصولات ویژه */}
        <AccordionItem value="featured">
          <AccordionTrigger className="text-xl font-semibold p-4 bg-card rounded-t-lg hover:no-underline">محصولات ویژه</AccordionTrigger>
          <AccordionContent className="p-4 border border-t-0 rounded-b-lg bg-card">
            <div className="space-y-2">
              <Label>انتخاب محصولات ویژه</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-h-60 overflow-y-auto p-2 border rounded-md">
                {allProducts.map(product => (
                  <div key={product.id} className="flex items-center space-x-2 space-x-reverse p-2 rounded-md hover:bg-muted">
                    <input
                      type="checkbox"
                      id={`featured-${product.id}`}
                      checked={featuredProductIds.includes(product.id)}
                      onChange={() => handleFeaturedProductToggle(product.id)}
                      className="form-checkbox h-4 w-4 text-primary rounded focus:ring-primary"
                      disabled={isSaving}
                    />
                    <label htmlFor={`featured-${product.id}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      {product.name}
                    </label>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">محصولاتی را که می‌خواهید در صفحه اصلی برجسته شوند، انتخاب کنید.</p>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* بخش فراخوان سفارشی */}
        <AccordionItem value="cta">
          <AccordionTrigger className="text-xl font-semibold p-4 bg-card rounded-t-lg hover:no-underline">بلوک فراخوان سفارشی</AccordionTrigger>
          <AccordionContent className="p-4 border border-t-0 rounded-b-lg bg-card">
            <div className="grid gap-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="customCtaTitle">عنوان</Label>
                  <Input id="customCtaTitle" value={customCtaTitle} onChange={(e) => setCustomCtaTitle(e.target.value)} disabled={isSaving}/>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="customCtaButtonText">متن دکمه</Label>
                  <Input id="customCtaButtonText" value={customCtaButtonText} onChange={(e) => setCustomCtaButtonText(e.target.value)} disabled={isSaving}/>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="customCtaDescription">توضیحات</Label>
                <Textarea id="customCtaDescription" value={customCtaDescription} onChange={(e) => setCustomCtaDescription(e.target.value)} disabled={isSaving}/>
              </div>
              <div className="space-y-2">
                <Label htmlFor="customCtaImage">تصویر پس‌زمینه</Label>
                 <div className="flex items-center gap-4">
                  <Image src={customCtaImageUrl} alt="پیش‌نمایش فراخوان" width={200} height={100} className="rounded-md object-cover border" data-ai-hint="cta background" />
                  <Input id="customCtaImageUpload" type="file" onChange={(e) => handleImageUpload(e, setCustomCtaImageUrl, setCustomCtaImageFile)} accept="image/*" className="hidden" />
                  <Button type="button" variant="outline" onClick={() => document.getElementById('customCtaImageUpload')?.click()} disabled={isSaving}>
                    <UploadCloud className="ml-2 h-4 w-4" /> بارگذاری تصویر
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">اندازه پیشنهادی: ۶۰۰×۴۰۰ پیکسل.</p>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </>
  );
}

    