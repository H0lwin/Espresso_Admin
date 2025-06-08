
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
} from "@/components/ui/dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useToast } from "@/hooks/use-toast";

interface TimelineEvent {
  id: string;
  year: string;
  title: string;
  description: string;
}

interface TeamMember {
  id: string;
  name: string;
  role: string;
  bio: string;
  imageUrl: string;
  imageFile?: File | null;
}

export default function CmsAboutPage() {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = React.useState(false);
  const [isTimelineFormSaving, setIsTimelineFormSaving] = React.useState(false);
  const [isTeamFormSaving, setIsTeamFormSaving] = React.useState(false);


  // وضعیت تایم‌لاین
  const [timelineEvents, setTimelineEvents] = React.useState<TimelineEvent[]>([
    { id: "t1", year: "۲۰۱۸", title: "تاسیس اسپرسو اِج", description: "سفر ما با اشتیاق به قهوه بی‌نقص آغاز شد." },
    { id: "t2", year: "۲۰۲۰", title: "افتتاح اولین فروشگاه اصلی", description: "گسترش به اولین مکان فیزیکی، خدمت‌رسانی به جامعه محلی." },
    { id: "t3", year: "۲۰۲۲", title: "راه‌اندازی فروشگاه آنلاین", description: "عرضه ترکیبات و محصولات ویژه به مشتریان سراسر کشور." },
  ]);
  const [isTimelineFormOpen, setIsTimelineFormOpen] = React.useState(false);
  const [editingTimelineEvent, setEditingTimelineEvent] = React.useState<TimelineEvent | null>(null);
  const [timelineYear, setTimelineYear] = React.useState("");
  const [timelineTitle, setTimelineTitle] = React.useState("");
  const [timelineDescription, setTimelineDescription] = React.useState("");

  // وضعیت اعضای تیم
  const [teamMembers, setTeamMembers] = React.useState<TeamMember[]>([
    { id: "tm1", name: "سارا احمدی", role: "موسس و مدیرعامل", bio: "سارا اسپرسو اِج را با چشم‌اندازی برای کیفیت و جامعه رهبری می‌کند.", imageUrl: "https://placehold.co/150x150.png" },
    { id: "tm2", name: "علی رضایی", role: "باریستای ارشد", bio: "علی استاد پشت ترکیبات ویژه ماست و تیم ما را به کمال آموزش می‌دهد.", imageUrl: "https://placehold.co/150x150.png" },
  ]);
  const [isTeamFormOpen, setIsTeamFormOpen] = React.useState(false);
  const [editingTeamMember, setEditingTeamMember] = React.useState<TeamMember | null>(null);
  const [memberName, setMemberName] = React.useState("");
  const [memberRole, setMemberRole] = React.useState("");
  const [memberBio, setMemberBio] = React.useState("");
  const [memberImagePreview, setMemberImagePreview] = React.useState<string | null>(null);
  const [memberImageFile, setMemberImageFile] = React.useState<File | null>(null);


  // مدیریت تایم‌لاین
  const handleAddTimelineEvent = () => {
    setEditingTimelineEvent(null);
    setTimelineYear("");
    setTimelineTitle("");
    setTimelineDescription("");
    setIsTimelineFormOpen(true);
  };

  const handleEditTimelineEvent = (event: TimelineEvent) => {
    setEditingTimelineEvent(event);
    setTimelineYear(event.year);
    setTimelineTitle(event.title);
    setTimelineDescription(event.description);
    setIsTimelineFormOpen(true);
  };

  const handleDeleteTimelineEvent = (eventId: string) => {
    setTimelineEvents(prev => prev.filter(event => event.id !== eventId));
    toast({ title: "رویداد تایم‌لاین حذف شد" });
  };

  const handleTimelineFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsTimelineFormSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    if (editingTimelineEvent) {
      setTimelineEvents(prev => prev.map(event => event.id === editingTimelineEvent.id ? { ...editingTimelineEvent, year: timelineYear, title: timelineTitle, description: timelineDescription } : event));
      toast({ title: "رویداد تایم‌لاین به‌روزرسانی شد" });
    } else {
      setTimelineEvents(prev => [...prev, { id: `t${Date.now()}`, year: timelineYear, title: timelineTitle, description: timelineDescription }]);
      toast({ title: "رویداد تایم‌لاین اضافه شد" });
    }
    setIsTimelineFormSaving(false);
    setIsTimelineFormOpen(false);
  };

  // مدیریت اعضای تیم
  const handleAddTeamMember = () => {
    setEditingTeamMember(null);
    setMemberName("");
    setMemberRole("");
    setMemberBio("");
    setMemberImagePreview("https://placehold.co/150x150.png");
    setMemberImageFile(null);
    setIsTeamFormOpen(true);
  };

  const handleEditTeamMember = (member: TeamMember) => {
    setEditingTeamMember(member);
    setMemberName(member.name);
    setMemberRole(member.role);
    setMemberBio(member.bio);
    setMemberImagePreview(member.imageUrl);
    setMemberImageFile(null);
    setIsTeamFormOpen(true);
  };

  const handleDeleteTeamMember = (memberId: string) => {
    setTeamMembers(prev => prev.filter(member => member.id !== memberId));
    toast({ title: "عضو تیم حذف شد" });
  };

  const handleTeamMemberImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setMemberImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setMemberImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleTeamFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsTeamFormSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    const memberData = { 
      name: memberName, 
      role: memberRole, 
      bio: memberBio, 
      imageUrl: memberImagePreview || "https://placehold.co/150x150.png",
      imageFile: memberImageFile
    };
    if (editingTeamMember) {
      setTeamMembers(prev => prev.map(member => member.id === editingTeamMember.id ? { ...editingTeamMember, ...memberData } : member));
      toast({ title: "عضو تیم به‌روزرسانی شد" });
    } else {
      setTeamMembers(prev => [...prev, { id: `tm${Date.now()}`, ...memberData }]);
      toast({ title: "عضو تیم اضافه شد" });
    }
    setIsTeamFormSaving(false);
    setIsTeamFormOpen(false);
  };
  
  const handleSaveChanges = async () => {
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    console.log("ذخیره اطلاعات صفحه درباره ما:", { timelineEvents, teamMembers });
    toast({
      title: "تغییرات ذخیره شد",
      description: "اطلاعات صفحه درباره ما با موفقیت ذخیره شد.",
    });
    setIsSaving(false);
  };


  return (
    <>
      <PageHeader
        title="CMS: صفحه درباره ما"
        description="محتوای صفحه درباره ما، شامل تایم‌لاین شرکت و اعضای تیم را مدیریت کنید."
        actions={
          <Button onClick={handleSaveChanges} disabled={isSaving || isTimelineFormSaving || isTeamFormSaving}>
            {isSaving ? <Loader2 className="ml-2 h-4 w-4 animate-spin" /> : <Save className="ml-2 h-4 w-4" />}
            {isSaving ? "در حال ذخیره..." : "ذخیره تمام تغییرات"}
          </Button>
        }
      />

      <Accordion type="multiple" defaultValue={["timeline", "team"]} className="w-full space-y-4">
        {/* بخش تایم‌لاین شرکت */}
        <AccordionItem value="timeline">
          <AccordionTrigger className="text-xl font-semibold p-4 bg-card rounded-t-lg hover:no-underline">تایم‌لاین شرکت</AccordionTrigger>
          <AccordionContent className="p-4 border border-t-0 rounded-b-lg bg-card">
            <div className="mb-4">
              <Button onClick={handleAddTimelineEvent} disabled={isSaving || isTimelineFormSaving || isTeamFormSaving}>
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
                        <Button variant="ghost" size="icon" onClick={() => handleEditTimelineEvent(event)} disabled={isSaving || isTimelineFormSaving || isTeamFormSaving}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteTimelineEvent(event.id)} disabled={isSaving || isTimelineFormSaving || isTeamFormSaving}>
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

        {/* بخش اعضای تیم */}
        <AccordionItem value="team">
          <AccordionTrigger className="text-xl font-semibold p-4 bg-card rounded-t-lg hover:no-underline">اعضای تیم</AccordionTrigger>
          <AccordionContent className="p-4 border border-t-0 rounded-b-lg bg-card">
            <div className="mb-4">
              <Button onClick={handleAddTeamMember} disabled={isSaving || isTimelineFormSaving || isTeamFormSaving}>
                <UserPlus className="ml-2 h-4 w-4" /> افزودن عضو تیم
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {teamMembers.map(member => (
                <Card key={member.id} className="shadow">
                  <CardHeader className="items-center text-center">
                    <Image src={member.imageUrl} alt={member.name} width={100} height={100} className="rounded-full mb-2 border" data-ai-hint="team member" />
                    <CardTitle>{member.name}</CardTitle>
                    <CardDescription>{member.role}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground text-center mb-4">{member.bio}</p>
                    <div className="flex justify-center space-x-2 space-x-reverse">
                      <Button variant="outline" size="sm" onClick={() => handleEditTeamMember(member)} disabled={isSaving || isTimelineFormSaving || isTeamFormSaving}>
                        <Edit className="ml-1 h-3 w-3" /> ویرایش
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => handleDeleteTeamMember(member.id)} disabled={isSaving || isTimelineFormSaving || isTeamFormSaving}>
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


      {/* دیالوگ فرم رویداد تایم‌لاین */}
      <Dialog open={isTimelineFormOpen} onOpenChange={setIsTimelineFormOpen}>
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
                {isTimelineFormSaving && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
                {editingTimelineEvent ? "ذخیره تغییرات" : "افزودن رویداد"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* دیالوگ فرم عضو تیم */}
      <Dialog open={isTeamFormOpen} onOpenChange={setIsTeamFormOpen}>
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
              <Label htmlFor="memberImageUpload">تصویر پروفایل</Label>
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
                {isTeamFormSaving && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
                {editingTeamMember ? "ذخیره تغییرات" : "افزودن عضو"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

    