
"use client";

import * as React from "react";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Save, UploadCloud, UserPlus, Loader2, Edit, Trash2 } from "lucide-react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useToast } from "@/hooks/use-toast";
import { getCookie } from "@/lib/utils";

// Removed TimelineEvent interface

interface TeamMember {
  id: string | number;
  name: string;
  role: string;
  bio: string;
  image_url: string;
  _imageFile?: File | null; // For frontend handling only
}

interface AboutPageData {
  // timeline_events: TimelineEvent[]; // Removed
  team_members: TeamMember[];
}

export default function CmsAboutPage() {
  const { toast } = useToast();
  const [isSavingAll, setIsSavingAll] = React.useState(false); 
  const [isLoadingData, setIsLoadingData] = React.useState(true);

  // Removed Timeline State
  // const [timelineEvents, setTimelineEvents] = React.useState<TimelineEvent[]>([]);
  // const [isTimelineFormOpen, setIsTimelineFormOpen] = React.useState(false);
  // const [editingTimelineEvent, setEditingTimelineEvent] = React.useState<TimelineEvent | null>(null);
  // const [timelineYear, setTimelineYear] = React.useState("");
  // const [timelineTitle, setTimelineTitle] = React.useState("");
  // const [timelineDescription, setTimelineDescription] = React.useState("");
  // const [isTimelineFormSaving, setIsTimelineFormSaving] = React.useState(false);

  // Team Members State
  const [teamMembers, setTeamMembers] = React.useState<TeamMember[]>([]);
  const [isTeamFormOpen, setIsTeamFormOpen] = React.useState(false);
  const [editingTeamMember, setEditingTeamMember] = React.useState<TeamMember | null>(null);
  const [memberName, setMemberName] = React.useState("");
  const [memberRole, setMemberRole] = React.useState("");
  const [memberBio, setMemberBio] = React.useState("");
  const [memberImagePreview, setMemberImagePreview] = React.useState<string | null>("https://placehold.co/150x150.png");
  const [memberImageFile, setMemberImageFile] = React.useState<File | null>(null);
  const [isTeamFormSaving, setIsTeamFormSaving] = React.useState(false); // This can be removed if team form submits to local state only


  React.useEffect(() => {
    const fetchData = async () => {
      setIsLoadingData(true);
      try {
        const response = await fetch("/api/v1/cms/about/"); 
        if (!response.ok) throw new Error("Failed to fetch About Us page data");
        const data: AboutPageData = await response.json();
        // setTimelineEvents(data.timeline_events || []); // Removed
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

  // Removed Timeline Event Handlers

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
  const handleDeleteTeamMember = (memberId: string | number) => {
    setTeamMembers(prev => prev.filter(member => member.id !== memberId));
  };

  const handleTeamFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const memberData: Omit<TeamMember, '_imageFile'> & { _imageFile?: File | null } = { 
      id: editingTeamMember ? editingTeamMember.id : `temp-m-${Date.now()}`,
      name: memberName, role: memberRole, bio: memberBio, 
      image_url: memberImagePreview || "https://placehold.co/150x150.png",
    };
    
    const memberWithFile = { ...memberData, _imageFile: memberImageFile };

    if (editingTeamMember) {
      setTeamMembers(prev => prev.map(member => member.id === editingTeamMember.id ? memberWithFile : member));
    } else {
      setTeamMembers(prev => [...prev, memberWithFile]);
    }
    setIsTeamFormOpen(false);
    setMemberImageFile(null); 
  };
  
  const handleSaveAllChanges = async () => {
    setIsSavingAll(true);
    
    // This part needs careful handling for image uploads.
    // Option 1: Upload images individually, then send URLs.
    // Option 2: Send FormData with all data and files. This requires backend to parse mixed data.
    // For simplicity, this example will assume you are sending JSON for data and will
    // need a separate mechanism or more complex FormData structure if new images are involved.

    const formData = new FormData();

    // Append team members data
    // If _imageFile exists, it needs to be uploaded. The ID might be temp or existing.
    teamMembers.forEach((member, index) => {
        formData.append(`team_members[${index}][name]`, member.name);
        formData.append(`team_members[${index}][role]`, member.role);
        formData.append(`team_members[${index}][bio]`, member.bio);
        if (typeof member.id === 'number' || (typeof member.id === 'string' && !member.id.startsWith('temp-'))) {
            formData.append(`team_members[${index}][id]`, String(member.id));
        }
        if (member._imageFile) {
            formData.append(`team_member_images[${index}]`, member._imageFile, member._imageFile.name);
            // The backend needs to associate this image with the correct team member using the index or a temporary ID.
            // If member.id is new, the backend should handle creating the member and then associating the image.
        } else if (member.image_url && !member.image_url.startsWith('data:')) { // If no new file, but existing URL
             formData.append(`team_members[${index}][image_url]`, member.image_url);
        }
    });

    // Removed timeline_events from payload

    try {
      const csrfToken = getCookie("csrftoken");
      const response = await fetch("/api/v1/cms/about/", { 
        method: "PATCH", 
        headers: {
          // "Content-Type": "application/json", // Not for FormData
          ...(csrfToken && { "X-CSRFToken": csrfToken }),
        },
        body: formData, // Send FormData
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({detail: "خطا در ذخیره اطلاعات"}));
        throw new Error(errorData.detail || "Failed to save About Us data");
      }
      
      const updatedData: AboutPageData = await response.json();
      // setTimelineEvents(updatedData.timeline_events || []); // Removed
      setTeamMembers(updatedData.team_members.map(tm => ({...tm, _imageFile: null})) || []); // Reset _imageFile

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
        description="محتوای صفحه درباره ما، شامل اعضای تیم را مدیریت کنید."
        actions={
          <Button onClick={handleSaveAllChanges} disabled={isSavingAll || isTeamFormSaving || isLoadingData}>
            {isSavingAll ? <Loader2 className="ml-2 h-4 w-4 animate-spin" /> : <Save className="ml-2 h-4 w-4" />}
            {isSavingAll ? "در حال ذخیره..." : "ذخیره تمام تغییرات"}
          </Button>
        }
      />

      <Accordion type="multiple" defaultValue={["team"]} className="w-full space-y-4">
        {/* Removed Timeline Accordion Item */}

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

      {/* Removed Timeline Dialog */}

      <Dialog open={isTeamFormOpen} onOpenChange={(open) => !isTeamFormSaving && setIsTeamFormOpen(open)}>
        <DialogContent className="sm:max-w-lg text-right">
          <DialogHeader>
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
            <DialogFooter className="sm:justify-start">
              <Button type="button" variant="outline" onClick={() => setIsTeamFormOpen(false)} disabled={isTeamFormSaving}>انصراف</Button>
              <Button type="submit" disabled={isTeamFormSaving}>
                {editingTeamMember ? "ذخیره تغییرات محلی" : "افزودن محلی"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
