
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
  DialogDescription,
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
import { PlusCircle, Edit, Trash2, Search, UserCog, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type AdminRole = "Administrator" | "Editor" | "Support";

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  lastLogin: string; // ISO date string or formatted
  avatarFallback: string;
  avatarUrl?: string;
}

const mockAdminUsers: AdminUser[] = [
  { id: "admin001", name: "Super Admin", email: "super.admin@espressoedge.com", role: "Administrator", lastLogin: "2023-10-26T10:00:00Z", avatarFallback: "SA" },
  { id: "admin002", name: "Content Editor", email: "editor@espressoedge.com", role: "Editor", lastLogin: "2023-10-25T14:30:00Z", avatarFallback: "CE", avatarUrl: "https://placehold.co/40x40.png" },
  { id: "admin003", name: "Support Staff", email: "support@espressoedge.com", role: "Support", lastLogin: "2023-10-26T09:15:00Z", avatarFallback: "SS" },
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

  // Form state
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [role, setRole] = React.useState<AdminRole>("Support");
  const [password, setPassword] = React.useState(""); // For new users or password reset

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
    setPassword(""); // Don't prefill password for editing
    setIsFormOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!userToDelete) return;
    setIsSubmitting(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setAdminUsers(prev => prev.filter(user => user.id !== userToDelete.id));
    toast({
      title: "User Deleted",
      description: `${userToDelete.name} has been successfully deleted.`,
    });
    setUserToDelete(null);
    setIsSubmitting(false);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const avatarFallback = name.split(" ").map(n => n[0]).join("").toUpperCase() || "AU";
    
    if (editingUser) {
      setAdminUsers(prev => prev.map(user =>
        user.id === editingUser.id ? { ...editingUser, name, email, role, avatarFallback } : user
      ));
      toast({ title: "User Updated", description: `${name} has been updated.` });
      if (password) console.log(`Password reset for ${email}`); // Handle password change
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
      toast({ title: "User Added", description: `${name} has been added.` });
      console.log(`New user created with password: ${password}`); // Handle new user password
    }
    setIsSubmitting(false);
    setIsFormOpen(false);
  };
  
  const getRowActions = (user: AdminUser): ActionItem[] => [
    { label: "Edit User", icon: Edit, onClick: () => handleEditUser(user) },
    { label: "---" },
    { label: "Delete User", icon: Trash2, onClick: () => setUserToDelete(user), isDestructive: true },
  ];
  
  const getRoleBadgeVariant = (role: AdminRole) => {
    if (role === "Administrator") return "default";
    if (role === "Editor") return "secondary";
    return "outline";
  };

  return (
    <>
      <PageHeader
        title="Admin Users Management"
        description="Manage administrator accounts and their roles."
        actions={
          <Button onClick={handleAddNewUser} disabled={isSubmitting}>
            <PlusCircle className="mr-2 h-4 w-4" /> Add New Admin User
          </Button>
        }
      />
      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search users by name or email..."
            className="pl-8 w-full md:w-[300px]"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="rounded-lg border shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Last Login</TableHead>
              <TableHead className="text-right">Actions</TableHead>
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
                <TableCell><Badge variant={getRoleBadgeVariant(user.role)}>{user.role}</Badge></TableCell>
                <TableCell>{new Date(user.lastLogin).toLocaleString()}</TableCell>
                <TableCell className="text-right">
                  <DataTableActions actions={getRowActions(user)} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {filteredAdminUsers.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
            No admin users found.
        </div>
      )}

      <Dialog open={isFormOpen} onOpenChange={(open) => !isSubmitting && setIsFormOpen(open)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingUser ? "Edit Admin User" : "Add New Admin User"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleFormSubmit} className="space-y-4 py-4">
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required disabled={isSubmitting} />
            </div>
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required disabled={isSubmitting} />
            </div>
            <div>
              <Label htmlFor="role">Role</Label>
              <Select value={role} onValueChange={(v) => setRole(v as AdminRole)} disabled={isSubmitting}>
                <SelectTrigger id="role"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {adminRoles.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="password">{editingUser ? "New Password (leave blank to keep current)" : "Password"}</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required={!editingUser} disabled={isSubmitting} />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)} disabled={isSubmitting}>Cancel</Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editingUser ? "Save Changes" : "Add User"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

       {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!userToDelete} onOpenChange={(open) => !open && setUserToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action will permanently delete the admin user {userToDelete?.name}. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setUserToDelete(null)} disabled={isSubmitting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} disabled={isSubmitting} className={buttonVariants({variant: "destructive"})}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete User
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

    