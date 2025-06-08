
"use client";

import * as React from "react";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Save, Link as LinkIcon, Trash2, Loader2 } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useToast } from "@/hooks/use-toast";

interface SocialLink {
  id: string;
  platform: string;
  url: string;
}

export default function SettingsPage() {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = React.useState(false);

  const [socialLinks, setSocialLinks] = React.useState<SocialLink[]>([
    { id: "sl1", platform: "Facebook", url: "https://facebook.com/espressoedge" },
    { id: "sl2", platform: "Instagram", url: "https://instagram.com/espressoedge" },
    { id: "sl3", platform: "Twitter", url: "https://twitter.com/espressoedge" },
  ]);
  
  const handleSocialLinkChange = (index: number, field: keyof SocialLink, value: string) => {
    const newLinks = [...socialLinks];
    (newLinks[index] as any)[field] = value;
    setSocialLinks(newLinks);
  };
  
  const addSocialLink = () => {
    setSocialLinks([...socialLinks, {id: `sl${Date.now()}`, platform: "", url: ""}]);
  };

  const removeSocialLink = (id: string) => {
    setSocialLinks(socialLinks.filter(link => link.id !== id));
  };

  const handleSaveChanges = async () => {
    setIsSaving(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    console.log("Saving Settings:", { socialLinks });
    toast({
      title: "Settings Saved",
      description: "Your site settings have been successfully updated.",
    });
    setIsSaving(false);
  };

  return (
    <>
      <PageHeader
        title="Site Settings"
        description="Configure general settings for your website and store."
        actions={
          <Button onClick={handleSaveChanges} disabled={isSaving}>
            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            {isSaving ? "Saving..." : "Save All Changes"}
          </Button>
        }
      />

      <Accordion type="multiple" defaultValue={["social"]} className="w-full space-y-4">
        {/* Social Links Section */}
        <AccordionItem value="social">
          <AccordionTrigger className="text-xl font-semibold p-4 bg-card rounded-t-lg hover:no-underline"><LinkIcon className="inline mr-2 h-5 w-5" /> Social Media Links</AccordionTrigger>
          <AccordionContent className="p-4 border border-t-0 rounded-b-lg bg-card">
            <div className="space-y-4">
              {socialLinks.map((link, index) => (
                <div key={link.id} className="grid grid-cols-1 md:grid-cols-3 items-end gap-2 p-3 border rounded-md bg-muted/30">
                  <div className="space-y-1">
                    <Label htmlFor={`platform-${link.id}`}>Platform</Label>
                    <Input 
                      id={`platform-${link.id}`} 
                      value={link.platform} 
                      onChange={(e) => handleSocialLinkChange(index, 'platform', e.target.value)}
                      placeholder="e.g., Facebook"
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
                        <span className="sr-only">Remove link</span>
                    </Button>
                    </div>
                  </div>
                </div>
              ))}
              <Button type="button" variant="outline" onClick={addSocialLink} disabled={isSaving}>Add Social Link</Button>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </>
  );
}
