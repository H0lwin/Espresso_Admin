
"use client";

import * as React from "react";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Save, Loader2 } from "lucide-react";
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
  // hero_headline: string; // Removed
  // hero_subheadline: string; // Removed
  // hero_cta_text: string; // Removed
  // hero_image_url: string; // Removed
  featured_product_ids: (string | number)[];
  // custom_cta_title: string; // Removed
  // custom_cta_description: string; // Removed
  // custom_cta_button_text: string; // Removed
  // custom_cta_image_url: string; // Removed
}

export default function CmsHomePage() {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = React.useState(false);
  const [isLoadingData, setIsLoadingData] = React.useState(true);

  // Removed Hero states
  // const [heroHeadline, setHeroHeadline] = React.useState("");
  // const [heroSubheadline, setHeroSubheadline] = React.useState("");
  // const [heroCtaText, setHeroCtaText] = React.useState("");
  // const [heroImageUrl, setHeroImageUrl] = React.useState("https://placehold.co/1200x600.png");
  // const [heroImageFile, setHeroImageFile] = React.useState<File | null>(null);

  const [allProducts, setAllProducts] = React.useState<ProductSummary[]>([]);
  const [featuredProductIds, setFeaturedProductIds] = React.useState<(string | number)[]>([]);

  // Removed Custom CTA states
  // const [customCtaTitle, setCustomCtaTitle] = React.useState("");
  // const [customCtaDescription, setCustomCtaDescription] = React.useState("");
  // const [customCtaButtonText, setCustomCtaButtonText] = React.useState("");
  // const [customCtaImageUrl, setCustomCtaImageUrl] = React.useState("https://placehold.co/600x400.png");
  // const [customCtaImageFile, setCustomCtaImageFile] = React.useState<File | null>(null);

  React.useEffect(() => {
    const fetchData = async () => {
      setIsLoadingData(true);
      try {
        const [cmsDataRes, productsRes] = await Promise.all([
          fetch("/api/v1/cms/home/"), 
          fetch("/api/v1/products-summary/") 
        ]);

        if (!cmsDataRes.ok) throw new Error("Failed to fetch CMS home data");
        const cmsData: HomePageData = await cmsDataRes.json();
        // Removed Hero and CTA data loading
        setFeaturedProductIds(cmsData.featured_product_ids || []);

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


  // Removed handleImageUpload as it was only used for Hero and CTA images

  const handleFeaturedProductToggle = (productId: string | number) => {
    setFeaturedProductIds(prev =>
      prev.includes(productId) ? prev.filter(id => id !== productId) : [...prev, productId]
    );
  };
  
  const handleSaveChanges = async () => {
    setIsSaving(true);
    const formData = new FormData();
    // Removed Hero and CTA data appending
    
    featuredProductIds.forEach(id => formData.append("featured_product_ids", String(id)));

    try {
      const csrfToken = getCookie("csrftoken");
      const response = await fetch("/api/v1/cms/home/", { 
        method: "PATCH", 
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
      // Removed Hero and CTA image URL updates
      setFeaturedProductIds(updatedData.featured_product_ids || []);


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

      <Accordion type="multiple" defaultValue={["featured"]} className="w-full space-y-4">
        {/* Removed Hero Section AccordionItem */}
        {/* Removed Custom CTA Section AccordionItem */}

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
      </Accordion>
    </>
  );
}
