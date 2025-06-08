"use client";

import * as React from "react";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Save, Clock, Link as LinkIcon, Palette, Trash2 } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

interface WorkingHour {
  day: string;
  open: string;
  close: string;
  isClosed: boolean;
}

interface SocialLink {
  id: string;
  platform: string;
  url: string;
}

export default function SettingsPage() {
  const [workingHours, setWorkingHours] = React.useState<WorkingHour[]>([
    { day: "Monday", open: "08:00", close: "18:00", isClosed: false },
    { day: "Tuesday", open: "08:00", close: "18:00", isClosed: false },
    { day: "Wednesday", open: "08:00", close: "18:00", isClosed: false },
    { day: "Thursday", open: "08:00", close: "18:00", isClosed: false },
    { day: "Friday", open: "08:00", close: "20:00", isClosed: false },
    { day: "Saturday", open: "09:00", close: "20:00", isClosed: false },
    { day: "Sunday", open: "09:00", close: "16:00", isClosed: true },
  ]);

  const [socialLinks, setSocialLinks] = React.useState<SocialLink[]>([
    { id: "sl1", platform: "Facebook", url: "https://facebook.com/espressoedge" },
    { id: "sl2", platform: "Instagram", url: "https://instagram.com/espressoedge" },
    { id: "sl3", platform: "Twitter", url: "https://twitter.com/espressoedge" },
  ]);
  
  // Theme colors (display only) - fetch from CSS vars
  const [themeColors, setThemeColors] = React.useState({
    primary: "", background: "", accent: "", secondary: ""
  });

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const styles = getComputedStyle(document.documentElement);
      setThemeColors({
        primary: styles.getPropertyValue('--primary').trim(),
        background: styles.getPropertyValue('--background').trim(),
        accent: styles.getPropertyValue('--accent').trim(),
        secondary: styles.getPropertyValue('--secondary').trim(),
      });
    }
  }, []);


  const handleWorkingHourChange = (index: number, field: keyof WorkingHour, value: string | boolean) => {
    const newHours = [...workingHours];
    (newHours[index] as any)[field] = value;
    setWorkingHours(newHours);
  };

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

  const handleSaveChanges = () => {
    console.log("Saving Settings:", { workingHours, socialLinks });
    alert("Settings saved (check console)!");
  };

  return (
    <>
      <PageHeader
        title="Site Settings"
        description="Configure general settings for your website and store."
        actions={
          <Button onClick={handleSaveChanges}>
            <Save className="mr-2 h-4 w-4" /> Save All Changes
          </Button>
        }
      />

      <Accordion type="multiple" defaultValue={["hours", "social", "theme"]} className="w-full space-y-4">
        {/* Working Hours Section */}
        <AccordionItem value="hours">
          <AccordionTrigger className="text-xl font-semibold p-4 bg-card rounded-t-lg hover:no-underline"><Clock className="inline mr-2 h-5 w-5" /> Working Hours</AccordionTrigger>
          <AccordionContent className="p-4 border border-t-0 rounded-b-lg bg-card">
            <div className="space-y-4">
              {workingHours.map((wh, index) => (
                <div key={wh.day} className="grid grid-cols-1 md:grid-cols-4 items-center gap-2 p-3 border rounded-md bg-muted/30">
                  <Label className="md:col-span-1 font-medium">{wh.day}</Label>
                  <div className="flex items-center gap-2 md:col-span-1">
                    <Input 
                      type="time" 
                      value={wh.open} 
                      onChange={(e) => handleWorkingHourChange(index, 'open', e.target.value)} 
                      disabled={wh.isClosed}
                      className="w-full"
                    />
                     <span className="text-muted-foreground">-</span>
                    <Input 
                      type="time" 
                      value={wh.close} 
                      onChange={(e) => handleWorkingHourChange(index, 'close', e.target.value)} 
                      disabled={wh.isClosed}
                      className="w-full"
                    />
                  </div>
                  <div className="flex items-center space-x-2 md:col-span-1 md:justify-end">
                    <input
                      type="checkbox"
                      id={`closed-${wh.day}`}
                      checked={wh.isClosed}
                      onChange={(e) => handleWorkingHourChange(index, 'isClosed', e.target.checked)}
                      className="form-checkbox h-4 w-4 text-primary rounded focus:ring-primary"
                    />
                    <Label htmlFor={`closed-${wh.day}`} className="text-sm">Closed</Label>
                  </div>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

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
                    />
                    <Button type="button" variant="ghost" size="icon" onClick={() => removeSocialLink(link.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                        <span className="sr-only">Remove link</span>
                    </Button>
                    </div>
                  </div>
                </div>
              ))}
              <Button type="button" variant="outline" onClick={addSocialLink}>Add Social Link</Button>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Theme Colors Section */}
        <AccordionItem value="theme">
          <AccordionTrigger className="text-xl font-semibold p-4 bg-card rounded-t-lg hover:no-underline"><Palette className="inline mr-2 h-5 w-5" /> Theme Colors (Display Only)</AccordionTrigger>
          <AccordionContent className="p-4 border border-t-0 rounded-b-lg bg-card">
            <p className="text-sm text-muted-foreground mb-4">
              These colors are defined in your global CSS. This section is for display purposes. To change them, edit your CSS variables.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(themeColors).map(([name, value]) => (
                <div key={name} className="space-y-1">
                  <Label className="capitalize">{name}</Label>
                  <div className="flex items-center gap-2 p-2 border rounded-md">
                    <div className="w-6 h-6 rounded border" style={{ backgroundColor: `hsl(${value})` }}></div>
                    <span className="text-sm font-mono">{value}</span>
                  </div>
                </div>
              ))}
            </div>
            {/* Placeholder for actual color pickers if functionality were to be added */}
            {/* <Button variant="outline" className="mt-4" disabled>Customize Theme (Not Implemented)</Button> */}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </>
  );
}
