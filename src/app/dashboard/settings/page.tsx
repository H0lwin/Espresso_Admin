
"use client";

import * as React from "react";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Save, Link as LinkIcon, Trash2, Loader2, PlusCircle } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useToast } from "@/hooks/use-toast";
import { getCookie } from "@/lib/utils";

interface SocialLink {
  id: string | number; // Can be number if DB uses auto-increment PK
  platform: string;
  url: string;
}

interface SiteSettings {
  social_links: SocialLink[];
  // Add other settings groups here, e.g., store_settings, general_settings
}

export default function SettingsPage() {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = React.useState(false);
  const [isLoadingData, setIsLoadingData] = React.useState(true);

  const [socialLinks, setSocialLinks] = React.useState<SocialLink[]>([]);
  
  React.useEffect(() => {
    const fetchSettings = async () => {
      setIsLoadingData(true);
      try {
        const response = await fetch("/api/v1/settings/site/"); // Replace with your actual endpoint
        if (!response.ok) {
          throw new Error("خطا در دریافت تنظیمات سایت");
        }
        const data: SiteSettings = await response.json();
        setSocialLinks(data.social_links || []);
        // Set other settings groups here
      } catch (error) {
        toast({
          title: "خطا",
          description: "امکان بارگذاری تنظیمات سایت وجود ندارد.",
          variant: "destructive",
        });
        setSocialLinks([]);
      } finally {
        setIsLoadingData(false);
      }
    };
    fetchSettings();
  }, [toast]);


  const handleSocialLinkChange = (index: number, field: keyof Omit<SocialLink, 'id'>, value: string) => {
    const newLinks = [...socialLinks];
    (newLinks[index] as any)[field] = value;
    setSocialLinks(newLinks);
  };
  
  const addSocialLink = () => {
    // For new links, use a temporary client-side ID like `new-${Date.now()}`
    // The backend will assign a proper ID upon saving.
    setSocialLinks([...socialLinks, {id: `new-${Date.now()}`, platform: "", url: ""}]);
  };

  const removeSocialLink = (idToRemove: string | number) => {
    setSocialLinks(socialLinks.filter(link => link.id !== idToRemove));
    // If the link has a persistent ID (not `new-`), you might want to mark it for deletion
    // or make a DELETE request immediately if your API supports it.
    // For simplicity here, we'll handle deletions in the main save operation.
  };

  const handleSaveChanges = async () => {
    setIsSaving(true);
    
    // Prepare payload for API. Distinguish new links from existing ones.
    const payload = {
      social_links: socialLinks.map(link => ({
        id: typeof link.id === 'string' && link.id.startsWith('new-') ? undefined : link.id, // Send ID only for existing
        platform: link.platform,
        url: link.url,
      })),
      // include other settings groups
    };

    try {
      const csrfToken = getCookie("csrftoken");
      const response = await fetch("/api/v1/settings/site/", { // Replace with your actual endpoint
        method: "PATCH", // Or PUT
        headers: {
          "Content-Type": "application/json",
          ...(csrfToken && { "X-CSRFToken": csrfToken }),
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({detail: "خطا در ذخیره تنظیمات"}));
        throw new Error(errorData.detail || "Failed to save settings");
      }
      
      const updatedSettings: SiteSettings = await response.json();
      setSocialLinks(updatedSettings.social_links || []);
      // Update other settings groups from response

      toast({
        title: "تنظیمات ذخیره شد",
        description: "تنظیمات سایت شما با موفقیت به‌روزرسانی شد.",
      });
    } catch (error: any) {
       toast({
        title: "خطا در ذخیره‌سازی",
        description: error.message || "امکان ذخیره تنظیمات وجود نداشت.",
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
        <p className="ms-4 text-lg">در حال بارگذاری تنظیمات...</p>
      </div>
    );
  }

  return (
    <>
      <PageHeader
        title="تنظیمات سایت"
        description="تنظیمات عمومی وب‌سایت و فروشگاه خود را پیکربندی کنید."
        actions={
          <Button onClick={handleSaveChanges} disabled={isSaving || isLoadingData}>
            {isSaving ? <Loader2 className="ms-2 h-4 w-4 animate-spin" /> : <Save className="ms-2 h-4 w-4" />}
            {isSaving ? "در حال ذخیره..." : "ذخیره تمام تغییرات"}
          </Button>
        }
      />

      <Accordion type="multiple" defaultValue={["social"]} className="w-full space-y-4">
        <AccordionItem value="social">
          <AccordionTrigger className="text-xl font-semibold p-4 bg-card rounded-t-lg hover:no-underline"><LinkIcon className="inline ms-2 h-5 w-5" /> لینک‌های شبکه‌های اجتماعی</AccordionTrigger>
          <AccordionContent className="p-4 border border-t-0 rounded-b-lg bg-card">
            <div className="space-y-4">
              {socialLinks.map((link, index) => (
                <div key={link.id} className="grid grid-cols-1 md:grid-cols-3 items-end gap-2 p-3 border rounded-md bg-muted/30">
                  <div className="space-y-1">
                    <Label htmlFor={`platform-${link.id}`}>پلتفرم</Label>
                    <Input 
                      id={`platform-${link.id}`} 
                      value={link.platform} 
                      onChange={(e) => handleSocialLinkChange(index, 'platform', e.target.value)}
                      placeholder="مثلا فیسبوک"
                      disabled={isSaving}
                    />
                  </div>
                  <div className="space-y-1 md:col-span-2">
                    <Label htmlFor={`url-${link.id}`}>URL</Label>
                    <div className="flex items-center gap-2">
                    <Input 
                      id={`url-${link.id}`} 
                      type="url" 
                      value={link.url} 
                      onChange={(e) => handleSocialLinkChange(index, 'url', e.target.value)}
                      placeholder="https://..."
                      disabled={isSaving}
                    />
                    <Button type="button" variant="ghost" size="icon" onClick={() => removeSocialLink(link.id)} disabled={isSaving}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                        <span className="sr-only">حذف لینک</span>
                    </Button>
                    </div>
                  </div>
                </div>
              ))}
              <Button type="button" variant="outline" onClick={addSocialLink} disabled={isSaving}>
                <PlusCircle className="ms-2 h-4 w-4" /> افزودن لینک شبکه اجتماعی
              </Button>
            </div>
             {socialLinks.length === 0 && !isLoadingData && (
              <p className="text-sm text-muted-foreground text-center py-4">
                هیچ لینک شبکه اجتماعی تعریف نشده است.
              </p>
            )}
          </AccordionContent>
        </AccordionItem>
        {/* Add other AccordionItems for more settings groups here */}
      </Accordion>
    </>
  );
}
