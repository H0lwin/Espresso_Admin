"use client";

import * as React from "react";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Save, MapPin, Phone, Mail as MailIcon } from "lucide-react";
import Image from "next/image";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

export default function CmsContactPage() {
  const [formTitle, setFormTitle] = React.useState("Get in Touch");
  const [formDescription, setFormDescription] = React.useState("Have a question or feedback? Fill out the form below.");
  
  const [address, setAddress] = React.useState("123 Coffee Lane, Brewtown, CA 90210");
  const [phone, setPhone] = React.useState("(555) 123-4567");
  const [email, setEmail] = React.useState("contact@espressoedge.com");
  const [mapEmbedUrl, setMapEmbedUrl] = React.useState("https://placehold.co/600x400.png"); // Placeholder, in real scenario this would be an embed code or lat/long for a map component

  const handleSaveChanges = () => {
    console.log("Saving Contact Page Data:", {
      formTitle, formDescription, address, phone, email, mapEmbedUrl
    });
    alert("Changes saved (check console)!");
  };

  return (
    <>
      <PageHeader
        title="CMS: Contact Page"
        description="Manage content for your Contact Us page."
        actions={
          <Button onClick={handleSaveChanges}>
            <Save className="mr-2 h-4 w-4" /> Save Changes
          </Button>
        }
      />

      <Accordion type="multiple" defaultValue={["form", "details", "map"]} className="w-full space-y-4">
        {/* Contact Form Section */}
        <AccordionItem value="form">
          <AccordionTrigger className="text-xl font-semibold p-4 bg-card rounded-t-lg hover:no-underline">Contact Form Settings</AccordionTrigger>
          <AccordionContent className="p-4 border border-t-0 rounded-b-lg bg-card">
            <div className="grid gap-6">
              <div className="space-y-2">
                <Label htmlFor="formTitle">Form Title</Label>
                <Input id="formTitle" value={formTitle} onChange={(e) => setFormTitle(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="formDescription">Form Description/Intro Text</Label>
                <Textarea id="formDescription" value={formDescription} onChange={(e) => setFormDescription(e.target.value)} />
              </div>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Form Preview (UI Only)</CardTitle>
                  <CardDescription className="text-xs">This is a visual representation. Form fields are standard.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Input placeholder="Your Name" disabled />
                  <Input type="email" placeholder="Your Email" disabled />
                  <Textarea placeholder="Your Message" disabled />
                  <Button disabled>Send Message</Button>
                </CardContent>
              </Card>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Contact Details Section */}
        <AccordionItem value="details">
          <AccordionTrigger className="text-xl font-semibold p-4 bg-card rounded-t-lg hover:no-underline">Contact Details</AccordionTrigger>
          <AccordionContent className="p-4 border border-t-0 rounded-b-lg bg-card">
            <div className="grid gap-6">
              <div className="space-y-2">
                <Label htmlFor="address"><MapPin className="inline mr-2 h-4 w-4" />Address</Label>
                <Input id="address" value={address} onChange={(e) => setAddress(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone"><Phone className="inline mr-2 h-4 w-4" />Phone Number</Label>
                <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email"><MailIcon className="inline mr-2 h-4 w-4" />Email Address</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Map Section */}
        <AccordionItem value="map">
          <AccordionTrigger className="text-xl font-semibold p-4 bg-card rounded-t-lg hover:no-underline">Map Settings</AccordionTrigger>
          <AccordionContent className="p-4 border border-t-0 rounded-b-lg bg-card">
            <div className="grid gap-6">
              <div className="space-y-2">
                <Label htmlFor="mapEmbedUrl">Map Embed URL or Location Coordinates</Label>
                <Input id="mapEmbedUrl" value={mapEmbedUrl} onChange={(e) => setMapEmbedUrl(e.target.value)} placeholder="e.g., Google Maps embed link or Lat,Long" />
                <p className="text-xs text-muted-foreground">For a real map, use an iframe embed code from Google Maps or integrate a map library.</p>
              </div>
              <div>
                <Label>Map Preview</Label>
                <Image 
                  src={mapEmbedUrl.startsWith("https://") ? mapEmbedUrl : "https://placehold.co/600x400.png"} 
                  alt="Map Preview" 
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
