"use client";

import * as React from "react";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, Edit, Trash2, Save, UploadCloud, Image as ImageIcon, CalendarIcon, UserPlus } from "lucide-react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

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
  // Timeline state
  const [timelineEvents, setTimelineEvents] = React.useState<TimelineEvent[]>([
    { id: "t1", year: "2018", title: "Espresso Edge Founded", description: "Our journey began with a passion for perfect coffee." },
    { id: "t2", year: "2020", title: "First Flagship Store Opened", description: "Expanded to our first physical location, serving the local community." },
    { id: "t3", year: "2022", title: "Online Store Launch", description: "Brought our signature blends and merchandise to customers nationwide." },
  ]);
  const [isTimelineFormOpen, setIsTimelineFormOpen] = React.useState(false);
  const [editingTimelineEvent, setEditingTimelineEvent] = React.useState<TimelineEvent | null>(null);
  const [timelineYear, setTimelineYear] = React.useState("");
  const [timelineTitle, setTimelineTitle] = React.useState("");
  const [timelineDescription, setTimelineDescription] = React.useState("");

  // Team Members state
  const [teamMembers, setTeamMembers] = React.useState<TeamMember[]>([
    { id: "tm1", name: "Jane Doe", role: "Founder & CEO", bio: "Jane leads Espresso Edge with a vision for quality and community.", imageUrl: "https://placehold.co/150x150.png" },
    { id: "tm2", name: "John Smith", role: "Head Barista", bio: "John is the master behind our signature brews, training our team to perfection.", imageUrl: "https://placehold.co/150x150.png" },
  ]);
  const [isTeamFormOpen, setIsTeamFormOpen] = React.useState(false);
  const [editingTeamMember, setEditingTeamMember] = React.useState<TeamMember | null>(null);
  const [memberName, setMemberName] = React.useState("");
  const [memberRole, setMemberRole] = React.useState("");
  const [memberBio, setMemberBio] = React.useState("");
  const [memberImagePreview, setMemberImagePreview] = React.useState<string | null>(null);
  const [memberImageFile, setMemberImageFile] = React.useState<File | null>(null);


  // Timeline handlers
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
  };

  const handleTimelineFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingTimelineEvent) {
      setTimelineEvents(prev => prev.map(event => event.id === editingTimelineEvent.id ? { ...editingTimelineEvent, year: timelineYear, title: timelineTitle, description: timelineDescription } : event));
    } else {
      setTimelineEvents(prev => [...prev, { id: `t${Date.now()}`, year: timelineYear, title: timelineTitle, description: timelineDescription }]);
    }
    setIsTimelineFormOpen(false);
  };

  // Team Member handlers
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

  const handleTeamFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const memberData = { 
      name: memberName, 
      role: memberRole, 
      bio: memberBio, 
      imageUrl: memberImagePreview || "https://placehold.co/150x150.png",
      imageFile: memberImageFile
    };
    if (editingTeamMember) {
      setTeamMembers(prev => prev.map(member => member.id === editingTeamMember.id ? { ...editingTeamMember, ...memberData } : member));
    } else {
      setTeamMembers(prev => [...prev, { id: `tm${Date.now()}`, ...memberData }]);
    }
    setIsTeamFormOpen(false);
  };
  
  const handleSaveChanges = () => {
    console.log("Saving About Page Data:", { timelineEvents, teamMembers });
    alert("Changes saved (check console)!");
  };


  return (
    <>
      <PageHeader
        title="CMS: About Page"
        description="Manage the content for your About Us page, including company timeline and team members."
        actions={
          <Button onClick={handleSaveChanges}>
            <Save className="mr-2 h-4 w-4" /> Save All Changes
          </Button>
        }
      />

      <Accordion type="multiple" defaultValue={["timeline", "team"]} className="w-full space-y-4">
        {/* Timeline Section */}
        <AccordionItem value="timeline">
          <AccordionTrigger className="text-xl font-semibold p-4 bg-card rounded-t-lg hover:no-underline">Company Timeline</AccordionTrigger>
          <AccordionContent className="p-4 border border-t-0 rounded-b-lg bg-card">
            <div className="mb-4">
              <Button onClick={handleAddTimelineEvent}>
                <PlusCircle className="mr-2 h-4 w-4" /> Add Timeline Event
              </Button>
            </div>
            <div className="space-y-4">
              {timelineEvents.map(event => (
                <Card key={event.id} className="shadow">
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle>{event.year} - {event.title}</CardTitle>
                      <div className="space-x-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEditTimelineEvent(event)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteTimelineEvent(event.id)}>
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
              {timelineEvents.length === 0 && <p className="text-muted-foreground">No timeline events added yet.</p>}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Team Members Section */}
        <AccordionItem value="team">
          <AccordionTrigger className="text-xl font-semibold p-4 bg-card rounded-t-lg hover:no-underline">Team Members</AccordionTrigger>
          <AccordionContent className="p-4 border border-t-0 rounded-b-lg bg-card">
            <div className="mb-4">
              <Button onClick={handleAddTeamMember}>
                <UserPlus className="mr-2 h-4 w-4" /> Add Team Member
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
                    <div className="flex justify-center space-x-2">
                      <Button variant="outline" size="sm" onClick={() => handleEditTeamMember(member)}>
                        <Edit className="mr-1 h-3 w-3" /> Edit
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => handleDeleteTeamMember(member.id)}>
                        <Trash2 className="mr-1 h-3 w-3" /> Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
               {teamMembers.length === 0 && <p className="text-muted-foreground md:col-span-2 lg:col-span-3 text-center">No team members added yet.</p>}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>


      {/* Timeline Event Form Dialog */}
      <Dialog open={isTimelineFormOpen} onOpenChange={setIsTimelineFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingTimelineEvent ? "Edit Timeline Event" : "Add New Timeline Event"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleTimelineFormSubmit} className="space-y-4 py-4">
            <div>
              <Label htmlFor="timelineYear">Year</Label>
              <Input id="timelineYear" value={timelineYear} onChange={(e) => setTimelineYear(e.target.value)} placeholder="e.g., 2023" required />
            </div>
            <div>
              <Label htmlFor="timelineTitle">Title</Label>
              <Input id="timelineTitle" value={timelineTitle} onChange={(e) => setTimelineTitle(e.target.value)} placeholder="e.g., Milestone Achieved" required />
            </div>
            <div>
              <Label htmlFor="timelineDescription">Description</Label>
              <Textarea id="timelineDescription" value={timelineDescription} onChange={(e) => setTimelineDescription(e.target.value)} placeholder="Describe the event..." required />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsTimelineFormOpen(false)}>Cancel</Button>
              <Button type="submit">{editingTimelineEvent ? "Save Changes" : "Add Event"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Team Member Form Dialog */}
      <Dialog open={isTeamFormOpen} onOpenChange={setIsTeamFormOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingTeamMember ? "Edit Team Member" : "Add New Team Member"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleTeamFormSubmit} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="memberName">Name</Label>
              <Input id="memberName" value={memberName} onChange={(e) => setMemberName(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="memberRole">Role</Label>
              <Input id="memberRole" value={memberRole} onChange={(e) => setMemberRole(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="memberBio">Bio</Label>
              <Textarea id="memberBio" value={memberBio} onChange={(e) => setMemberBio(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="memberImage">Profile Image</Label>
               <div className="flex items-center gap-4">
                {memberImagePreview && <Image src={memberImagePreview} alt="Preview" width={80} height={80} className="rounded-full object-cover border" data-ai-hint="profile image" />}
                <Input id="memberImage" type="file" onChange={handleTeamMemberImageUpload} accept="image/*" className="hidden" />
                 <Button type="button" variant="outline" onClick={() => document.getElementById('memberImage')?.click()}>
                  <UploadCloud className="mr-2 h-4 w-4" /> Upload Image
                </Button>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsTeamFormOpen(false)}>Cancel</Button>
              <Button type="submit">{editingTeamMember ? "Save Changes" : "Add Member"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
