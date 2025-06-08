
"use client";

import * as React from "react";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, Edit, Trash2, Save, UploadCloud, UserPlus, Loader2 } from "lucide-react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useToast } from "@/hooks/use-toast";
import { getCookie } from "@/lib/utils";

interface TimelineEvent {
  id: string | number; // Can be string for temp client-side IDs
  year: string;
  title: string;
  description: string;
}

interface TeamMember {
  id: string | number;
  name: string;
  role: string;
  bio: string;
  image_url: string;
  // imageFile for frontend handling only
}

interface AboutPageData {
  timeline_events: TimelineEvent[];
  team_members: TeamMember[];
  // Potentially other sections like "Our Mission", "Our Vision"
  // our_mission?: string;
  // page_intro_text?: string;
}

export default function CmsAboutPage() {
  const { toast } = useToast();
  const [isSavingAll, setIsSavingAll] = React.useState(false); // For the main save button
  const [isLoadingData, setIsLoadingData] = React.useState(true);

  // Timeline State
  const [timelineEvents, setTimelineEvents] = React.useState<TimelineEvent[]>([]);
  const [isTimelineFormOpen, setIsTimelineFormOpen] = React.useState(false);
  const [editingTimelineEvent, setEditingTimelineEvent] = React.useState<TimelineEvent | null>(null);
  const [timelineYear, setTimelineYear] = React.useState("");
  const [timelineTitle, setTimelineTitle] = React.useState("");
  const [timelineDescription, setTimelineDescription] = React.useState("");
  const [isTimelineFormSaving, setIsTimelineFormSaving] = React.useState(false);

  // Team Members State
  const [teamMembers, setTeamMembers] = React.useState<TeamMember[]>([]);
  const [isTeamFormOpen, setIsTeamFormOpen] = React.useState(false);
  const [editingTeamMember, setEditingTeamMember] = React.useState<TeamMember | null>(null);
  const [memberName, setMemberName] = React.useState("");
  const [memberRole, setMemberRole] = React.useState("");
  const [memberBio, setMemberBio] = React.useState("");
  const [memberImagePreview, setMemberImagePreview] = React.useState<string | null>("https://placehold.co/150x150.png");
  const [memberImageFile, setMemberImageFile] = React.useState<File | null>(null);
  const [isTeamFormSaving, setIsTeamFormSaving] = React.useState(false);


  React.useEffect(() => {
    const fetchData = async () => {
      setIsLoadingData(true);
      try {
        const response = await fetch("/api/v1/cms/about/"); // Replace with your actual endpoint
        if (!response.ok) throw new Error("Failed to fetch About Us page data");
        const data: AboutPageData = await response.json();
        setTimelineEvents(data.timeline_events || []);
        setTeamMembers(data.team_members || []);
      } catch (error) {
        toast({
          title: "خطا در بارگذاری اطلاعات",
          description: "امکان دریافت اطلاعات صفحه درباره ما وجود ندارد.",
          variant: "destructive",
        });
      } finally {
        setIsLoadingData(false);
      }
    };
    fetchData();
  }, [toast]);

  // Timeline Event Handlers
  const handleAddTimelineEvent = () => {
    setEditingTimelineEvent(null); setTimelineYear(""); setTimelineTitle(""); setTimelineDescription("");
    setIsTimelineFormOpen(true);
  };
  const handleEditTimelineEvent = (event: TimelineEvent) => {
    setEditingTimelineEvent(event); setTimelineYear(event.year); setTimelineTitle(event.title); setTimelineDescription(event.description);
    setIsTimelineFormOpen(true);
  };
  // Note: Individual delete will be part of the main save. If immediate delete is needed, it requires an API call.
  const handleDeleteTimelineEvent = (eventId: string | number) => {
    setTimelineEvents(prev => prev.filter(event => event.id !== eventId));
    // No toast here, changes saved with main button
  };
  const handleTimelineFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // This form now just updates local state. Actual save happens with "Save All Changes" button.
    const newEvent = { id: editingTimelineEvent ? editingTimelineEvent.id : `temp-t-${Date.now()}`, year: timelineYear, title: timelineTitle, description: timelineDescription };
    if (editingTimelineEvent) {
      setTimelineEvents(prev => prev.map(event => event.id === editingTimelineEvent.id ? newEvent : event));
    } else {
      setTimelineEvents(prev => [...prev, newEvent]);
    }
    setIsTimelineFormOpen(false);
    // No toast, as this is local state update
  };


  // Team Member Handlers
  const handleAddTeamMember = () => {
    setEditingTeamMember(null); setMemberName(""); setMemberRole(""); setMemberBio(""); 
    setMemberImagePreview("https://placehold.co/150x150.png"); setMemberImageFile(null);
    setIsTeamFormOpen(true);
  };
  const handleEditTeamMember = (member: TeamMember) => {
    setEditingTeamMember(member); setMemberName(member.name); setMemberRole(member.role); setMemberBio(member.bio);
    setMemberImagePreview(member.image_url); setMemberImageFile(null);
    setIsTeamFormOpen(true);
  };
  const handleTeamMemberImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) { setMemberImageFile(file); const reader = new FileReader(); reader.onloadend = () => setMemberImagePreview(reader.result as string); reader.readAsDataURL(file); }
  };
  // Note: Individual delete will be part of the main save.
  const handleDeleteTeamMember = (memberId: string | number) => {
    setTeamMembers(prev => prev.filter(member => member.id !== memberId));
  };

  const handleTeamFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // This form now just updates local state. Actual save happens with "Save All Changes" button.
    const memberData = { 
      id: editingTeamMember ? editingTeamMember.id : `temp-m-${Date.now()}`,
      name: memberName, role: memberRole, bio: memberBio, 
      image_url: memberImagePreview || "https://placehold.co/150x150.png",
      // We will handle imageFile separately during the main save
    };
    
    // Store the file with the member object if it's a new image
    const memberWithFile = { ...memberData, _imageFile: memberImageFile };


    if (editingTeamMember) {
      setTeamMembers(prev => prev.map(member => member.id === editingTeamMember.id ? memberWithFile : member));
    } else {
      setTeamMembers(prev => [...prev, memberWithFile]);
    }
    setIsTeamFormOpen(false);
    setMemberImageFile(null); // Reset file after adding to local state
  };
  
  const handleSaveAllChanges = async () => {
    setIsSavingAll(true);
    
    const payload = {
        timeline_events: timelineEvents.map(e => ({...e, id: typeof e.id === 'string' && e.id.startsWith('temp-') ? undefined : e.id })),
        team_members_data: teamMembers.map(m => {
            const memberPayload: any = { name: m.name, role: m.role, bio: m.bio };
            if (typeof m.id === 'number' || (typeof m.id === 'string' && !m.id.startsWith('temp-'))) {
                memberPayload.id = m.id;
            }
            // The image file will be handled separately if your API supports it in the same request,
            // or you might need separate endpoints for image uploads per team member.
            // For simplicity, this example assumes image URLs are updated if new image file is not present,
            // and new images are uploaded. This part is highly dependent on API design.
            return memberPayload;
        }),
        // This is simplified. For actual file uploads with items, you'd typically use FormData for the whole request,
        // or upload images individually and then send their URLs.
    };

    // This example assumes you're sending JSON and image URLs.
    // If you need to upload files within this save, the entire request should be FormData.
    // This would require restructuring how team_members_data is built.
    // For now, let's assume image URLs are handled by direct input or previous uploads.

    try {
      const csrfToken = getCookie("csrftoken");
      const response = await fetch("/api/v1/cms/about/", { // Replace with your actual endpoint
        method: "PATCH", // Or PUT/POST
        headers: {
          "Content-Type": "application/json",
          ...(csrfToken && { "X-CSRFToken": csrfToken }),
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({detail: "خطا در ذخیره اطلاعات"}));
        throw new Error(errorData.detail || "Failed to save About Us data");
      }
      
      const updatedData: AboutPageData = await response.json();
      setTimelineEvents(updatedData.timeline_events || []);
      setTeamMembers(updatedData.team_members || []); // Assuming API returns updated list with IDs

      toast({
        title: "تغییرات ذخیره شد",
        description: "اطلاعات صفحه درباره ما با موفقیت ذخیره شد.",
      });
    } catch (error: any) {
      toast({
        title: "خطا در ذخیره‌سازی",
        description: error.message || "امکان ذخیره اطلاعات صفحه درباره ما وجود نداشت.",
        variant: "destructive",
      });
    } finally {
      setIsSavingAll(false);
    }
  };

  if (isLoadingData) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
        <p className="ms-4 text-lg">در حال بارگذاری اطلاعات صفحه درباره ما...</p>
      </div>
    );
  }

  return (
    <>
      <PageHeader
        title="CMS: صفحه درباره ما"
        description="محتوای صفحه درباره ما، شامل تایم‌لاین شرکت و اعضای تیم را مدیریت کنید."
        actions={
          <Button onClick={handleSaveAllChanges} disabled={isSavingAll || isTimelineFormSaving || isTeamFormSaving || isLoadingData}>
            {isSavingAll ? <Loader2 className="ml-2 h-4 w-4 animate-spin" /> : <Save className="ml-2 h-4 w-4" />}
            {isSavingAll ? "در حال ذخیره..." : "ذخیره تمام تغییرات"}
          </Button>
        }
      />

      <Accordion type="multiple" defaultValue={["timeline", "team"]} className="w-full space-y-4">
        <AccordionItem value="timeline">
          <AccordionTrigger className="text-xl font-semibold p-4 bg-card rounded-t-lg hover:no-underline">تایم‌لاین شرکت</AccordionTrigger>
          <AccordionContent className="p-4 border border-t-0 rounded-b-lg bg-card">
            <div className="mb-4">
              <Button onClick={handleAddTimelineEvent} disabled={isSavingAll || isLoadingData}>
                <PlusCircle className="ml-2 h-4 w-4" /> افزودن رویداد تایم‌لاین
              </Button>
            </div>
            <div className="space-y-4">
              {timelineEvents.map(event => (
                <Card key={event.id} className="shadow">
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle>{event.year} - {event.title}</CardTitle>
                      <div className="space-x-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEditTimelineEvent(event)} disabled={isSavingAll || isLoadingData}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteTimelineEvent(event.id)} disabled={isSavingAll || isLoadingData}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p>{event.description}</p>
                  </CardContent>
                </Card>
              ))}
              {timelineEvents.length === 0 && <p className="text-muted-foreground text-center">هنوز هیچ رویدادی در تایم‌لاین اضافه نشده است.</p>}
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="team">
          <AccordionTrigger className="text-xl font-semibold p-4 bg-card rounded-t-lg hover:no-underline">اعضای تیم</AccordionTrigger>
          <AccordionContent className="p-4 border border-t-0 rounded-b-lg bg-card">
            <div className="mb-4">
              <Button onClick={handleAddTeamMember} disabled={isSavingAll || isLoadingData}>
                <UserPlus className="ml-2 h-4 w-4" /> افزودن عضو تیم
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {teamMembers.map(member => (
                <Card key={member.id} className="shadow">
                  <CardHeader className="items-center text-center">
                    <Image src={member.image_url || "https://placehold.co/100x100.png"} alt={member.name} width={100} height={100} className="rounded-full mb-2 border" data-ai-hint="team member" />
                    <CardTitle>{member.name}</CardTitle>
                    <CardDescription>{member.role}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground text-center mb-4">{member.bio}</p>
                    <div className="flex justify-center space-x-2 space-x-reverse">
                      <Button variant="outline" size="sm" onClick={() => handleEditTeamMember(member)} disabled={isSavingAll || isLoadingData}>
                        <Edit className="ml-1 h-3 w-3" /> ویرایش
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => handleDeleteTeamMember(member.id)} disabled={isSavingAll || isLoadingData}>
                        <Trash2 className="ml-1 h-3 w-3" /> حذف
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
               {teamMembers.length === 0 && <p className="text-muted-foreground md:col-span-2 lg:col-span-3 text-center">هنوز هیچ عضو تیمی اضافه نشده است.</p>}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <Dialog open={isTimelineFormOpen} onOpenChange={(open) => !isTimelineFormSaving && setIsTimelineFormOpen(open)}>
        <DialogContent>
          <DialogHeader className="text-right">
            <DialogTitle>{editingTimelineEvent ? "ویرایش رویداد تایم‌لاین" : "افزودن رویداد جدید به تایم‌لاین"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleTimelineFormSubmit} className="space-y-4 py-4">
            <div>
              <Label htmlFor="timelineYear">سال</Label>
              <Input id="timelineYear" value={timelineYear} onChange={(e) => setTimelineYear(e.target.value)} placeholder="مثلا ۱۳۹۹" required disabled={isTimelineFormSaving}/>
            </div>
            <div>
              <Label htmlFor="timelineTitle">عنوان</Label>
              <Input id="timelineTitle" value={timelineTitle} onChange={(e) => setTimelineTitle(e.target.value)} placeholder="مثلا دستیابی به نقطه عطف" required disabled={isTimelineFormSaving}/>
            </div>
            <div>
              <Label htmlFor="timelineDescription">توضیحات</Label>
              <Textarea id="timelineDescription" value={timelineDescription} onChange={(e) => setTimelineDescription(e.target.value)} placeholder="رویداد را توصیف کنید..." required disabled={isTimelineFormSaving}/>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsTimelineFormOpen(false)} disabled={isTimelineFormSaving}>انصراف</Button>
              <Button type="submit" disabled={isTimelineFormSaving}>
                {/* No spinner here as it's local state update */}
                {editingTimelineEvent ? "ذخیره تغییرات محلی" : "افزودن محلی"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isTeamFormOpen} onOpenChange={(open) => !isTeamFormSaving && setIsTeamFormOpen(open)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader className="text-right">
            <DialogTitle>{editingTeamMember ? "ویرایش عضو تیم" : "افزودن عضو جدید به تیم"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleTeamFormSubmit} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="memberName">نام</Label>
              <Input id="memberName" value={memberName} onChange={(e) => setMemberName(e.target.value)} required disabled={isTeamFormSaving}/>
            </div>
            <div className="space-y-2">
              <Label htmlFor="memberRole">نقش</Label>
              <Input id="memberRole" value={memberRole} onChange={(e) => setMemberRole(e.target.value)} required disabled={isTeamFormSaving}/>
            </div>
            <div className="space-y-2">
              <Label htmlFor="memberBio">بیوگرافی</Label>
              <Textarea id="memberBio" value={memberBio} onChange={(e) => setMemberBio(e.target.value)} required disabled={isTeamFormSaving}/>
            </div>
            <div className="space-y-2">
              <Label htmlFor="memberImageUploadInput">تصویر پروفایل</Label>
               <div className="flex items-center gap-4">
                {memberImagePreview && <Image src={memberImagePreview} alt="پیش‌نمایش" width={80} height={80} className="rounded-full object-cover border" data-ai-hint="profile image" />}
                <Input id="memberImageUploadInput" type="file" onChange={handleTeamMemberImageUpload} accept="image/*" className="hidden" />
                 <Button type="button" variant="outline" onClick={() => document.getElementById('memberImageUploadInput')?.click()} disabled={isTeamFormSaving}>
                  <UploadCloud className="ml-2 h-4 w-4" /> بارگذاری تصویر
                </Button>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsTeamFormOpen(false)} disabled={isTeamFormSaving}>انصراف</Button>
              <Button type="submit" disabled={isTeamFormSaving}>
                 {/* No spinner here as it's local state update */}
                {editingTeamMember ? "ذخیره تغییرات محلی" : "افزودن محلی"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
