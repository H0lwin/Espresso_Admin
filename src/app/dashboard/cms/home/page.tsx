
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
import { getCookie } from "@/lib/utils";

interface ProductSummary {
  id: string | number;
  name: string;
}

interface HomePageData {
  hero_headline: string;
  hero_subheadline: string;
  hero_cta_text: string;
  hero_image_url: string;
  featured_product_ids: (string | number)[];
  custom_cta_title: string;
  custom_cta_description: string;
  custom_cta_button_text: string;
  custom_cta_image_url: string;
}

export default function CmsHomePage() {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = React.useState(false);
  const [isLoadingData, setIsLoadingData] = React.useState(true);

  const [heroHeadline, setHeroHeadline] = React.useState("");
  const [heroSubheadline, setHeroSubheadline] = React.useState("");
  const [heroCtaText, setHeroCtaText] = React.useState("");
  const [heroImageUrl, setHeroImageUrl] = React.useState("https://placehold.co/1200x600.png");
  const [heroImageFile, setHeroImageFile] = React.useState<File | null>(null);

  const [allProducts, setAllProducts] = React.useState<ProductSummary[]>([]);
  const [featuredProductIds, setFeaturedProductIds] = React.useState<(string | number)[]>([]);

  const [customCtaTitle, setCustomCtaTitle] = React.useState("");
  const [customCtaDescription, setCustomCtaDescription] = React.useState("");
  const [customCtaButtonText, setCustomCtaButtonText] = React.useState("");
  const [customCtaImageUrl, setCustomCtaImageUrl] = React.useState("https://placehold.co/600x400.png");
  const [customCtaImageFile, setCustomCtaImageFile] = React.useState<File | null>(null);

  React.useEffect(() => {
    const fetchData = async () => {
      setIsLoadingData(true);
      try {
        const [cmsDataRes, productsRes] = await Promise.all([
          fetch("/api/v1/cms/home/"), // Replace with your actual endpoint
          fetch("/api/v1/products-summary/") // Replace with your endpoint for product summaries
        ]);

        if (!cmsDataRes.ok) throw new Error("Failed to fetch CMS home data");
        const cmsData: HomePageData = await cmsDataRes.json();
        setHeroHeadline(cmsData.hero_headline || "نوشیدنی بی‌نظیر خود را کشف کنید");
        setHeroSubheadline(cmsData.hero_subheadline || "بهترین قهوه‌ها، دست‌چین شده برای شما.");
        setHeroCtaText(cmsData.hero_cta_text || "مشاهده قهوه‌ها");
        setHeroImageUrl(cmsData.hero_image_url || "https://placehold.co/1200x600.png");
        setFeaturedProductIds(cmsData.featured_product_ids || []);
        setCustomCtaTitle(cmsData.custom_cta_title || "به باشگاه قهوه ما بپیوندید");
        setCustomCtaDescription(cmsData.custom_cta_description || "از تخفیف‌های ویژه و دسترسی زودهنگام به رست‌های جدید بهره‌مند شوید.");
        setCustomCtaButtonText(cmsData.custom_cta_button_text || "اکنون عضو شوید");
        setCustomCtaImageUrl(cmsData.custom_cta_image_url || "https://placehold.co/600x400.png");

        if (productsRes.ok) {
          const productsData = await productsRes.json();
          setAllProducts(productsData.results || []);
        } else {
          console.warn("Failed to fetch product summaries for selection.");
          setAllProducts([]);
        }

      } catch (error) {
        toast({
          title: "خطا در بارگذاری اطلاعات",
          description: "امکان دریافت اطلاعات صفحه اصلی CMS وجود ندارد.",
          variant: "destructive",
        });
      } finally {
        setIsLoadingData(false);
      }
    };
    fetchData();
  }, [toast]);


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

  const handleFeaturedProductToggle = (productId: string | number) => {
    setFeaturedProductIds(prev =>
      prev.includes(productId) ? prev.filter(id => id !== productId) : [...prev, productId]
    );
  };
  
  const handleSaveChanges = async () => {
    setIsSaving(true);
    const formData = new FormData();
    formData.append("hero_headline", heroHeadline);
    formData.append("hero_subheadline", heroSubheadline);
    formData.append("hero_cta_text", heroCtaText);
    if (heroImageFile) formData.append("hero_image", heroImageFile);
    
    featuredProductIds.forEach(id => formData.append("featured_product_ids", String(id)));

    formData.append("custom_cta_title", customCtaTitle);
    formData.append("custom_cta_description", customCtaDescription);
    formData.append("custom_cta_button_text", customCtaButtonText);
    if (customCtaImageFile) formData.append("custom_cta_image", customCtaImageFile);

    try {
      const csrfToken = getCookie("csrftoken");
      const response = await fetch("/api/v1/cms/home/", { // Replace with your actual endpoint
        method: "PATCH", // Or POST if creating for the first time / PUT for full replacement
        headers: {
          ...(csrfToken && { "X-CSRFToken": csrfToken }),
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({detail: "خطا در ذخیره اطلاعات"}));
        throw new Error(errorData.detail || "Failed to save CMS home data");
      }
      const updatedData: HomePageData = await response.json();
      // Update state with response data, especially image URLs if backend returns new ones
      setHeroImageUrl(updatedData.hero_image_url || heroImageUrl);
      setCustomCtaImageUrl(updatedData.custom_cta_image_url || customCtaImageUrl);
      setHeroImageFile(null);
      setCustomCtaImageFile(null);

      toast({
        title: "تغییرات ذخیره شد",
        description: "اطلاعات صفحه اصلی با موفقیت به‌روزرسانی شد.",
      });
    } catch (error: any) {
      toast({
        title: "خطا در ذخیره‌سازی",
        description: error.message || "امکان ذخیره اطلاعات صفحه اصلی CMS وجود نداشت.",
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
        <p className="ms-4 text-lg">در حال بارگذاری اطلاعات صفحه اصلی...</p>
      </div>
    );
  }

  return (
    <>
      <PageHeader
        title="CMS: صفحه اصلی"
        description="محتوای صفحه اصلی وب‌سایت خود را مدیریت کنید."
        actions={
          <Button onClick={handleSaveChanges} disabled={isSaving || isLoadingData}>
            {isSaving ? <Loader2 className="ml-2 h-4 w-4 animate-spin" /> : <Save className="ml-2 h-4 w-4" />}
            {isSaving ? "در حال ذخیره..." : "ذخیره تغییرات"}
          </Button>
        }
      />

      <Accordion type="multiple" defaultValue={["hero", "featured", "cta"]} className="w-full space-y-4">
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
                <Label htmlFor="heroImageUpload">تصویر هیرو</Label>
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

        <AccordionItem value="featured">
          <AccordionTrigger className="text-xl font-semibold p-4 bg-card rounded-t-lg hover:no-underline">محصولات ویژه</AccordionTrigger>
          <AccordionContent className="p-4 border border-t-0 rounded-b-lg bg-card">
             {allProducts.length > 0 ? (
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
             ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  محصولی برای انتخاب یافت نشد. ابتدا محصولات را در بخش مربوطه اضافه کنید.
                </p>
             )}
          </AccordionContent>
        </AccordionItem>

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
                <Label htmlFor="customCtaImageUpload">تصویر پس‌زمینه</Label>
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
