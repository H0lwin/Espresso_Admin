"use client";

import * as React from "react";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UploadCloud, Image as ImageIcon, Settings, Save } from "lucide-react";
import Image from "next/image";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

// Mock data for featured products (replace with actual product selection UI later)
const allProducts = [
  { id: "prod001", name: "Espresso Edge Mug" },
  { id: "prod002", name: "Whole Bean Coffee (1kg)" },
  { id: "menu002", name: "Caramel Macchiato" },
  { id: "menu003", name: "Croissant" },
];


export default function CmsHomePage() {
  const [heroHeadline, setHeroHeadline] = React.useState("Discover Your Perfect Brew");
  const [heroSubheadline, setHeroSubheadline] = React.useState("Experience the finest coffee, curated for you.");
  const [heroCtaText, setHeroCtaText] = React.useState("Shop Coffee");
  const [heroImageUrl, setHeroImageUrl] = React.useState("https://placehold.co/1200x600.png");
  const [heroImageFile, setHeroImageFile] = React.useState<File | null>(null);

  const [featuredProductIds, setFeaturedProductIds] = React.useState<string[]>(["prod002", "menu002"]);

  const [customCtaTitle, setCustomCtaTitle] = React.useState("Join Our Coffee Club");
  const [customCtaDescription, setCustomCtaDescription] = React.useState("Get exclusive deals and early access to new roasts.");
  const [customCtaButtonText, setCustomCtaButtonText] = React.useState("Subscribe Now");
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
  
  const handleSaveChanges = () => {
    // In a real app, this would send data to a backend
    console.log("Saving CMS Home Page data:", {
      heroHeadline, heroSubheadline, heroCtaText, heroImageFile: heroImageFile?.name,
      featuredProductIds,
      customCtaTitle, customCtaDescription, customCtaButtonText, customCtaImageFile: customCtaImageFile?.name
    });
    alert("Changes saved (check console)!");
  };


  return (
    <>
      <PageHeader
        title="CMS: Home Page"
        description="Manage the content of your website's home page."
        actions={
          <Button onClick={handleSaveChanges}>
            <Save className="mr-2 h-4 w-4" /> Save Changes
          </Button>
        }
      />

      <Accordion type="multiple" defaultValue={["hero", "featured", "cta"]} className="w-full space-y-4">
        {/* Hero Section */}
        <AccordionItem value="hero">
          <AccordionTrigger className="text-xl font-semibold p-4 bg-card rounded-t-lg hover:no-underline">Hero Section</AccordionTrigger>
          <AccordionContent className="p-4 border border-t-0 rounded-b-lg bg-card">
            <div className="grid gap-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="heroHeadline">Headline</Label>
                  <Input id="heroHeadline" value={heroHeadline} onChange={(e) => setHeroHeadline(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="heroCtaText">CTA Button Text</Label>
                  <Input id="heroCtaText" value={heroCtaText} onChange={(e) => setHeroCtaText(e.target.value)} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="heroSubheadline">Sub-headline</Label>
                <Textarea id="heroSubheadline" value={heroSubheadline} onChange={(e) => setHeroSubheadline(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="heroImage">Hero Image</Label>
                <div className="flex items-center gap-4">
                  <Image src={heroImageUrl} alt="Hero Preview" width={200} height={100} className="rounded-md object-cover border" data-ai-hint="hero banner" />
                  <Input id="heroImage" type="file" onChange={(e) => handleImageUpload(e, setHeroImageUrl, setHeroImageFile)} accept="image/*" className="hidden" />
                  <Button type="button" variant="outline" onClick={() => document.getElementById('heroImage')?.click()}>
                    <UploadCloud className="mr-2 h-4 w-4" /> Upload Image
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">Recommended size: 1200x600px.</p>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Featured Products Section */}
        <AccordionItem value="featured">
          <AccordionTrigger className="text-xl font-semibold p-4 bg-card rounded-t-lg hover:no-underline">Featured Products</AccordionTrigger>
          <AccordionContent className="p-4 border border-t-0 rounded-b-lg bg-card">
            <div className="space-y-2">
              <Label>Select Featured Products</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-h-60 overflow-y-auto p-2 border rounded-md">
                {allProducts.map(product => (
                  <div key={product.id} className="flex items-center space-x-2 p-2 rounded-md hover:bg-muted">
                    <input
                      type="checkbox"
                      id={`featured-${product.id}`}
                      checked={featuredProductIds.includes(product.id)}
                      onChange={() => handleFeaturedProductToggle(product.id)}
                      className="form-checkbox h-4 w-4 text-primary rounded focus:ring-primary"
                    />
                    <label htmlFor={`featured-${product.id}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      {product.name}
                    </label>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">Choose which products to highlight on the home page.</p>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Custom CTA Block Section */}
        <AccordionItem value="cta">
          <AccordionTrigger className="text-xl font-semibold p-4 bg-card rounded-t-lg hover:no-underline">Custom Call-to-Action Block</AccordionTrigger>
          <AccordionContent className="p-4 border border-t-0 rounded-b-lg bg-card">
            <div className="grid gap-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="customCtaTitle">Title</Label>
                  <Input id="customCtaTitle" value={customCtaTitle} onChange={(e) => setCustomCtaTitle(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="customCtaButtonText">Button Text</Label>
                  <Input id="customCtaButtonText" value={customCtaButtonText} onChange={(e) => setCustomCtaButtonText(e.target.value)} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="customCtaDescription">Description</Label>
                <Textarea id="customCtaDescription" value={customCtaDescription} onChange={(e) => setCustomCtaDescription(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="customCtaImage">Background Image</Label>
                 <div className="flex items-center gap-4">
                  <Image src={customCtaImageUrl} alt="CTA Preview" width={200} height={100} className="rounded-md object-cover border" data-ai-hint="cta background" />
                  <Input id="customCtaImage" type="file" onChange={(e) => handleImageUpload(e, setCustomCtaImageUrl, setCustomCtaImageFile)} accept="image/*" className="hidden" />
                  <Button type="button" variant="outline" onClick={() => document.getElementById('customCtaImage')?.click()}>
                    <UploadCloud className="mr-2 h-4 w-4" /> Upload Image
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">Recommended size: 600x400px.</p>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </>
  );
}
