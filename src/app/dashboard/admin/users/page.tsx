
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
  DialogDescription
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
import { getCookie } from "@/lib/utils";

// Assuming API might send role keys like 'admin', 'editor', 'support'
type ApiAdminRoleKey = "administrator" | "editor" | "support"; 
type FormAdminRole = "Administrator" | "Editor" | "Support"; // For form display

const apiRoleToFormRole: Record<ApiAdminRoleKey, FormAdminRole> = {
  administrator: "Administrator",
  editor: "Editor",
  support: "Support",
};
const formRoleToApiRole: Record<FormAdminRole, ApiAdminRoleKey> = {
  Administrator: "administrator",
  Editor: "editor",
  Support: "support",
};

const adminRoleTranslations: Record<FormAdminRole, string> = {
  Administrator: "مدیر کل",
  Editor: "ویرایشگر",
  Support: "پشتیبان",
};

interface AdminUser {
  id: string | number;
  name: string;
  email: string;
  role: ApiAdminRoleKey; // Role from API
  last_login?: string | null; // snake_case, optional from API
  avatar_url?: string;
  avatar_initials?: string;
}

const formAdminRoles: FormAdminRole[] = ["Administrator", "Editor", "Support"];

export default function AdminUsersPage() {
  const { toast } = useToast();
  const [adminUsers, setAdminUsers] = React.useState<AdminUser[]>([]);
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [editingUser, setEditingUser] = React.useState<AdminUser | null>(null);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [userToDelete, setUserToDelete] = React.useState<AdminUser | null>(null);
  const [isLoadingData, setIsLoadingData] = React.useState(true);

  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [formRole, setFormRole] = React.useState<FormAdminRole>("Support"); // For form
  const [password, setPassword] = React.useState("");

  React.useEffect(() => {
    const fetchAdminUsers = async () => {
      setIsLoadingData(true);
      let url = "/api/v1/admin/users/"; // Replace with your actual endpoint
      if (searchTerm) {
        url += `?search=${encodeURIComponent(searchTerm)}`;
      }
      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error("خطا در دریافت لیست کاربران ادمین");
        }
        const data = await response.json();
        setAdminUsers(data.results || []); // Assuming DRF pagination
      } catch (error) {
        toast({
          title: "خطا",
          description: "امکان بارگذاری لیست کاربران ادمین وجود ندارد.",
          variant: "destructive",
        });
        setAdminUsers([]);
      } finally {
        setIsLoadingData(false);
      }
    };
    fetchAdminUsers();
  }, [searchTerm, toast]);

  const handleAddNewUser = () => {
    setEditingUser(null);
    setName("");
    setEmail("");
    setFormRole("Support");
    setPassword("");
    setIsFormOpen(true);
  };

  const handleEditUser = (user: AdminUser) => {
    setEditingUser(user);
    setName(user.name);
    setEmail(user.email);
    setFormRole(apiRoleToFormRole[user.role]);
    setPassword(""); // Password field is for reset/set, not display
    setIsFormOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!userToDelete) return;
    setIsSubmitting(true);
    const originalUsers = [...adminUsers];
    setAdminUsers(prev => prev.filter(user => user.id !== userToDelete.id)); // Optimistic update

    try {
      const csrfToken = getCookie("csrftoken");
      const response = await fetch(`/api/v1/admin/users/${userToDelete.id}/`, { // Replace endpoint
        method: "DELETE",
        headers: {
         ...(csrfToken && { "X-CSRFToken": csrfToken }),
        },
      });
      if (!response.ok) {
        throw new Error("Failed to delete user");
      }
      toast({
        title: "کاربر حذف شد",
        description: `${userToDelete.name} با موفقیت حذف شد.`,
      });
    } catch (error) {
      setAdminUsers(originalUsers); // Revert optimistic update
      toast({
        title: "خطا در حذف",
        description: "امکان حذف کاربر وجود نداشت.",
        variant: "destructive",
      });
    } finally {
      setUserToDelete(null);
      setIsSubmitting(false);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const payload: any = {
      name,
      email,
      role: formRoleToApiRole[formRole],
    };
    if (password || !editingUser) { // Send password if setting new or creating
      payload.password = password;
    }
    
    const apiEndpoint = editingUser 
      ? `/api/v1/admin/users/${editingUser.id}/` // Replace endpoint
      : "/api/v1/admin/users/";                // Replace endpoint
    const method = editingUser ? "PATCH" : "POST";

    try {
      const csrfToken = getCookie("csrftoken");
      const response = await fetch(apiEndpoint, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          ...(csrfToken && { "X-CSRFToken": csrfToken }),
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({detail: `خطا در ${editingUser ? 'به‌روزرسانی' : 'افزودن'} کاربر`}));
        throw new Error(errorData.detail);
      }
      const savedUser = await response.json();
      
      if (editingUser) {
        setAdminUsers(prev => prev.map(user => user.id === savedUser.id ? savedUser : user));
        toast({ title: "کاربر به‌روزرسانی شد", description: `${name} با موفقیت به‌روزرسانی شد.` });
      } else {
        setAdminUsers(prev => [savedUser, ...prev]);
        toast({ title: "کاربر اضافه شد", description: `${name} با موفقیت اضافه شد.` });
      }
      setIsFormOpen(false);
    } catch (error: any) {
      toast({
        title: `خطا در ${editingUser ? 'به‌روزرسانی' : 'افزودن'} کاربر`,
        description: error.message || "لطفا اطلاعات وارد شده را بررسی کنید.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const getRowActions = (user: AdminUser): ActionItem[] => [
    { label: "ویرایش کاربر", icon: Edit, onClick: () => handleEditUser(user) },
    { label: "---" },
    { label: "حذف کاربر", icon: Trash2, onClick: () => setUserToDelete(user), isDestructive: true },
  ];
  
  const getRoleBadgeVariant = (roleKey: ApiAdminRoleKey) => {
    const role = apiRoleToFormRole[roleKey];
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
          <Button onClick={handleAddNewUser} disabled={isSubmitting || isLoadingData}>
            <PlusCircle className="ms-2 h-4 w-4" /> افزودن کاربر ادمین جدید
          </Button>
        }
      />
      <div className="mb-4">
        <div className="relative w-full md:w-[300px]">
          <Search className="absolute right-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="جستجوی کاربران بر اساس نام یا ایمیل..."
            className="pr-8 w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            disabled={isLoadingData}
          />
        </div>
      </div>
      {isLoadingData ? (
         <div className="flex items-center justify-center h-64">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="ms-3 text-muted-foreground">در حال بارگذاری کاربران ادمین...</p>
        </div>
      ) : (
      <div className="rounded-lg border shadow-sm overflow-x-auto">
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
             {adminUsers.length === 0 && !isLoadingData && (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                  کاربر ادمینی یافت نشد.
                </TableCell>
              </TableRow>
            )}
            {adminUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user.avatar_url || `https://placehold.co/40x40.png?text=${user.avatar_initials || user.name.charAt(0)}`} alt={user.name} data-ai-hint="admin avatar" />
                      <AvatarFallback>{user.avatar_initials || user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{user.name}</span>
                  </div>
                </TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell><Badge variant={getRoleBadgeVariant(user.role)}>{adminRoleTranslations[apiRoleToFormRole[user.role]]}</Badge></TableCell>
                <TableCell>{user.last_login ? new Date(user.last_login).toLocaleString('fa-IR') : "-"}</TableCell>
                <TableCell className="text-left">
                  <DataTableActions actions={getRowActions(user)} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      )}

      <Dialog open={isFormOpen} onOpenChange={(open) => !isSubmitting && setIsFormOpen(open)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="text-right">
            <DialogTitle>{editingUser ? "ویرایش کاربر ادمین" : "افزودن کاربر ادمین جدید"}</DialogTitle>
             <DialogDescription>
              {editingUser ? "مشخصات کاربر را تغییر دهید." : "یک کاربر جدید با نقش مدیریتی ایجاد کنید."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleFormSubmit} className="space-y-4 py-4 text-right">
            <div>
              <Label htmlFor="name">نام کامل</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required disabled={isSubmitting} />
            </div>
            <div>
              <Label htmlFor="email">آدرس ایمیل</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required disabled={isSubmitting} />
            </div>
            <div>
              <Label htmlFor="formRole">نقش</Label>
              <Select value={formRole} onValueChange={(v) => setFormRole(v as FormAdminRole)} disabled={isSubmitting}>
                <SelectTrigger id="formRole"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {formAdminRoles.map(r => <SelectItem key={r} value={r}>{adminRoleTranslations[r]}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="password">{editingUser ? "رمز عبور جدید (برای حفظ رمز فعلی خالی بگذارید)" : "رمز عبور"}</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required={!editingUser} disabled={isSubmitting} />
            </div>
            <DialogFooter className="sm:justify-start">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="ms-2 h-4 w-4 animate-spin" />}
                {editingUser ? "ذخیره تغییرات" : "افزودن کاربر"}
              </Button>
              <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)} disabled={isSubmitting}>انصراف</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!userToDelete} onOpenChange={(open) => !open && setUserToDelete(null)}>
        <AlertDialogContent className="text-right">
          <AlertDialogHeader>
            <AlertDialogTitle>آیا مطمئن هستید؟</AlertDialogTitle>
            <AlertDialogDescription>
              این اقدام کاربر ادمین {userToDelete?.name} را برای همیشه حذف خواهد کرد. این عمل قابل بازگشت نیست.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="sm:justify-start">
            <AlertDialogAction onClick={handleDeleteConfirm} disabled={isSubmitting} className={buttonVariants({variant: "destructive"})}>
              {isSubmitting && <Loader2 className="ms-2 h-4 w-4 animate-spin" />}
              حذف کاربر
            </AlertDialogAction>
            <AlertDialogCancel onClick={() => setUserToDelete(null)} disabled={isSubmitting}>انصراف</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
