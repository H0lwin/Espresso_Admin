
"use client";

import * as React from "react";
import { PageHeader } from "@/components/shared/page-header";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DataTableActions, type ActionItem } from "@/components/shared/data-table-actions";
import { PlusCircle, Edit, Trash2, Search, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type AdminRole = "Administrator" | "Editor" | "Support";
const adminRoleTranslations: Record<AdminRole, string> = {
  Administrator: "مدیر کل",
  Editor: "ویرایشگر",
  Support: "پشتیبان",
};

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  lastLogin: string; 
  avatarFallback: string;
  avatarUrl?: string;
}

// Mock data translations
const mockAdminUsers: AdminUser[] = [
  { id: "admin001", name: "مدیر ارشد", email: "super.admin@espressoedge.com", role: "Administrator", lastLogin: "2023-10-26T10:00:00Z", avatarFallback: "ما" },
  { id: "admin002", name: "ویرایشگر محتوا", email: "editor@espressoedge.com", role: "Editor", lastLogin: "2023-10-25T14:30:00Z", avatarFallback: "وم", avatarUrl: "https://placehold.co/40x40.png" },
  { id: "admin003", name: "کارمند پشتیبانی", email: "support@espressoedge.com", role: "Support", lastLogin: "2023-10-26T09:15:00Z", avatarFallback: "ک‌پ" },
];

const adminRoles: AdminRole[] = ["Administrator", "Editor", "Support"];

export default function AdminUsersPage() {
  const { toast } = useToast();
  const [adminUsers, setAdminUsers] = React.useState<AdminUser[]>(mockAdminUsers);
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [editingUser, setEditingUser] = React.useState<AdminUser | null>(null);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [userToDelete, setUserToDelete] = React.useState<AdminUser | null>(null);

  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [role, setRole] = React.useState<AdminRole>("Support");
  const [password, setPassword] = React.useState("");

  const filteredAdminUsers = adminUsers.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddNewUser = () => {
    setEditingUser(null);
    setName("");
    setEmail("");
    setRole("Support");
    setPassword("");
    setIsFormOpen(true);
  };

  const handleEditUser = (user: AdminUser) => {
    setEditingUser(user);
    setName(user.name);
    setEmail(user.email);
    setRole(user.role);
    setPassword("");
    setIsFormOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!userToDelete) return;
    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setAdminUsers(prev => prev.filter(user => user.id !== userToDelete.id));
    toast({
      title: "کاربر حذف شد",
      description: `${userToDelete.name} با موفقیت حذف شد.`,
    });
    setUserToDelete(null);
    setIsSubmitting(false);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const avatarFallback = name.split(" ").map(n => n[0]).join("").toUpperCase() || "کا";
    
    if (editingUser) {
      setAdminUsers(prev => prev.map(user =>
        user.id === editingUser.id ? { ...editingUser, name, email, role, avatarFallback } : user
      ));
      toast({ title: "کاربر به‌روزرسانی شد", description: `${name} به‌روزرسانی شد.` });
      if (password) console.log(`رمز عبور برای ${email} بازنشانی شد`);
    } else {
      const newUser: AdminUser = {
        id: `admin${Date.now()}`,
        name,
        email,
        role,
        lastLogin: new Date().toISOString(),
        avatarFallback,
      };
      setAdminUsers(prev => [...prev, newUser]);
      toast({ title: "کاربر اضافه شد", description: `${name} اضافه شد.` });
      console.log(`کاربر جدید با رمز عبور ایجاد شد: ${password}`);
    }
    setIsSubmitting(false);
    setIsFormOpen(false);
  };
  
  const getRowActions = (user: AdminUser): ActionItem[] => [
    { label: "ویرایش کاربر", icon: Edit, onClick: () => handleEditUser(user) },
    { label: "---" },
    { label: "حذف کاربر", icon: Trash2, onClick: () => setUserToDelete(user), isDestructive: true },
  ];
  
  const getRoleBadgeVariant = (role: AdminRole) => {
    if (role === "Administrator") return "default";
    if (role === "Editor") return "secondary";
    return "outline";
  };

  return (
    <>
      <PageHeader
        title="مدیریت کاربران ادمین"
        description="حساب‌های مدیران و نقش‌های آن‌ها را مدیریت کنید."
        actions={
          <Button onClick={handleAddNewUser} disabled={isSubmitting}>
            <PlusCircle className="ms-2 h-4 w-4" /> افزودن کاربر ادمین جدید
          </Button>
        }
      />
      <div className="mb-4">
        <div className="relative">
          <Search className="absolute right-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="جستجوی کاربران بر اساس نام یا ایمیل..."
            className="pr-8 w-full md:w-[300px]"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="rounded-lg border shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>کاربر</TableHead>
              <TableHead>ایمیل</TableHead>
              <TableHead>نقش</TableHead>
              <TableHead>آخرین ورود</TableHead>
              <TableHead className="text-left">عملیات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAdminUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user.avatarUrl || `https://placehold.co/40x40.png?text=${user.avatarFallback}`} alt={user.name} data-ai-hint="admin avatar" />
                      <AvatarFallback>{user.avatarFallback}</AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{user.name}</span>
                  </div>
                </TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell><Badge variant={getRoleBadgeVariant(user.role)}>{adminRoleTranslations[user.role]}</Badge></TableCell>
                <TableCell>{new Date(user.lastLogin).toLocaleString('fa-IR')}</TableCell>
                <TableCell className="text-left">
                  <DataTableActions actions={getRowActions(user)} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {filteredAdminUsers.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
            کاربر ادمینی یافت نشد.
        </div>
      )}

      <Dialog open={isFormOpen} onOpenChange={(open) => !isSubmitting && setIsFormOpen(open)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="text-right">
            <DialogTitle>{editingUser ? "ویرایش کاربر ادمین" : "افزودن کاربر ادمین جدید"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleFormSubmit} className="space-y-4 py-4">
            <div>
              <Label htmlFor="name">نام کامل</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required disabled={isSubmitting} />
            </div>
            <div>
              <Label htmlFor="email">آدرس ایمیل</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required disabled={isSubmitting} />
            </div>
            <div>
              <Label htmlFor="role">نقش</Label>
              <Select value={role} onValueChange={(v) => setRole(v as AdminRole)} disabled={isSubmitting}>
                <SelectTrigger id="role"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {adminRoles.map(r => <SelectItem key={r} value={r}>{adminRoleTranslations[r]}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="password">{editingUser ? "رمز عبور جدید (برای حفظ رمز فعلی خالی بگذارید)" : "رمز عبور"}</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required={!editingUser} disabled={isSubmitting} />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)} disabled={isSubmitting}>انصراف</Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="ms-2 h-4 w-4 animate-spin" />}
                {editingUser ? "ذخیره تغییرات" : "افزودن کاربر"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!userToDelete} onOpenChange={(open) => !open && setUserToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader className="text-right">
            <AlertDialogTitle>آیا مطمئن هستید؟</AlertDialogTitle>
            <AlertDialogDescription>
              این اقدام کاربر ادمین {userToDelete?.name} را برای همیشه حذف خواهد کرد. این عمل قابل بازگشت نیست.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setUserToDelete(null)} disabled={isSubmitting}>انصراف</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} disabled={isSubmitting} className={buttonVariants({variant: "destructive"})}>
              {isSubmitting && <Loader2 className="ms-2 h-4 w-4 animate-spin" />}
              حذف کاربر
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
