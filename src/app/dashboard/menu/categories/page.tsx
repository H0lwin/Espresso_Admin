
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
  DialogDescription,
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
import { Label } from "@/components/ui/label";
import { DataTableActions, type ActionItem } from "@/components/shared/data-table-actions";
import { PlusCircle, Edit, Trash2, Search, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getCookie } from "@/lib/utils";

interface MenuCategory {
  id: string | number;
  name: string;
  item_count?: number; // Optional: Number of menu items using this category
}

export default function MenuCategoriesPage() {
  const { toast } = useToast();
  const [categories, setCategories] = React.useState<MenuCategory[]>([]);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [editingCategory, setEditingCategory] = React.useState<MenuCategory | null>(null);
  const [categoryToDelete, setCategoryToDelete] = React.useState<MenuCategory | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isLoadingData, setIsLoadingData] = React.useState(true);

  const [categoryName, setCategoryName] = React.useState("");

  React.useEffect(() => {
    const fetchCategories = async () => {
      setIsLoadingData(true);
      let url = "/api/v1/menu-categories/"; // Replace with your actual endpoint
      if (searchTerm) {
        url += `?search=${encodeURIComponent(searchTerm)}`;
      }
      try {
        const response = await fetch(url);
        if (!response.ok) {
          let errorDetail = "خطا در دریافت لیست دسته‌بندی‌ها";
          try {
            const errorData = await response.json();
            errorDetail = errorData.detail || errorData.message || errorDetail;
          } catch (e) { /* Suppress error */ }
          throw new Error(errorDetail);
        }
        const data = await response.json();
        setCategories(data.results || []);
      } catch (error: any) {
        toast({
          title: "خطا",
          description: error.message || "امکان بارگذاری لیست دسته‌بندی‌ها وجود ندارد.",
          variant: "destructive",
        });
        setCategories([]);
      } finally {
        setIsLoadingData(false);
      }
    };
    fetchCategories();
  }, [searchTerm, toast]);

  const handleAddNewCategory = () => {
    setEditingCategory(null);
    setCategoryName("");
    setIsFormOpen(true);
  };

  const handleEditCategory = (category: MenuCategory) => {
    setEditingCategory(category);
    setCategoryName(category.name);
    setIsFormOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!categoryToDelete) return;
    setIsSubmitting(true);
    const originalCategories = [...categories];
    setCategories(prev => prev.filter(cat => cat.id !== categoryToDelete.id)); // Optimistic update

    try {
      const csrfToken = getCookie("csrftoken");
      const response = await fetch(`/api/v1/menu-categories/${categoryToDelete.id}/`, { // Replace endpoint
        method: "DELETE",
        headers: {
          ...(csrfToken && { "X-CSRFToken": csrfToken }),
        },
      });
      if (!response.ok) {
        let errorDetail = "خطا در حذف دسته‌بندی";
        try {
            const errorData = await response.json();
            errorDetail = errorData.detail || errorData.message || errorDetail;
        } catch(e) {/* suppress */}
        throw new Error(errorDetail);
      }
      toast({
        title: "دسته‌بندی حذف شد",
        description: `دسته‌بندی "${categoryToDelete.name}" با موفقیت حذف شد.`,
      });
    } catch (error: any) {
      setCategories(originalCategories); // Revert optimistic update
      toast({
        title: "خطا در حذف",
        description: error.message || "امکان حذف دسته‌بندی وجود نداشت.",
        variant: "destructive",
      });
    } finally {
      setCategoryToDelete(null);
      setIsSubmitting(false);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const payload = { name: categoryName };
    
    const apiEndpoint = editingCategory 
      ? `/api/v1/menu-categories/${editingCategory.id}/` // Replace endpoint
      : "/api/v1/menu-categories/";                     // Replace endpoint
    const method = editingCategory ? "PATCH" : "POST";

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
        let errorDetail = `خطا در ${editingCategory ? 'به‌روزرسانی' : 'افزودن'} دسته‌بندی`;
        try {
            const errorData = await response.json();
            errorDetail = errorData.detail || errorData.message || errorDetail;
        } catch(e) {/* suppress */}
        throw new Error(errorDetail);
      }
      const savedCategory = await response.json();
      
      if (editingCategory) {
        setCategories(prev => prev.map(cat => cat.id === savedCategory.id ? savedCategory : cat));
        toast({ title: "دسته‌بندی به‌روزرسانی شد", description: `دسته‌بندی "${categoryName}" با موفقیت به‌روزرسانی شد.` });
      } else {
        setCategories(prev => [savedCategory, ...prev]);
        toast({ title: "دسته‌بندی اضافه شد", description: `دسته‌بندی "${categoryName}" با موفقیت اضافه شد.` });
      }
      setIsFormOpen(false);
    } catch (error: any) {
      toast({
        title: `خطا در ${editingCategory ? 'به‌روزرسانی' : 'افزودن'} دسته‌بندی`,
        description: error.message || "لطفا اطلاعات وارد شده را بررسی کنید.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const getRowActions = (category: MenuCategory): ActionItem[] => [
    { label: "ویرایش دسته‌بندی", icon: Edit, onClick: () => handleEditCategory(category) },
    { label: "---" },
    { label: "حذف دسته‌بندی", icon: Trash2, onClick: () => setCategoryToDelete(category), isDestructive: true },
  ];
  
  return (
    <>
      <PageHeader
        title="مدیریت دسته‌بندی‌های منو"
        description="دسته‌بندی‌های آیتم‌های منو را اضافه، ویرایش یا حذف کنید."
        actions={
          <Button onClick={handleAddNewCategory} disabled={isSubmitting || isLoadingData}>
            <PlusCircle className="ms-2 h-4 w-4" /> افزودن دسته‌بندی جدید
          </Button>
        }
      />
      <div className="mb-4">
        <div className="relative w-full md:w-[300px]">
          <Search className="absolute right-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="جستجوی دسته‌بندی‌ها..."
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
          <p className="ms-3 text-muted-foreground">در حال بارگذاری دسته‌بندی‌ها...</p>
        </div>
      ) : (
      <div className="rounded-lg border shadow-sm overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>نام دسته‌بندی</TableHead>
              <TableHead>تعداد آیتم‌ها</TableHead>
              <TableHead className="text-left">عملیات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
             {categories.length === 0 && !isLoadingData && (
              <TableRow>
                <TableCell colSpan={3} className="h-24 text-center text-muted-foreground">
                  دسته‌بندی‌ای یافت نشد.
                </TableCell>
              </TableRow>
            )}
            {categories.map((category) => (
              <TableRow key={category.id}>
                <TableCell className="font-medium">{category.name}</TableCell>
                <TableCell>{category.item_count !== undefined ? category.item_count.toLocaleString('fa-IR') : '-'}</TableCell>
                <TableCell className="text-left">
                  <DataTableActions actions={getRowActions(category)} />
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
            <DialogTitle>{editingCategory ? "ویرایش دسته‌بندی" : "افزودن دسته‌بندی جدید"}</DialogTitle>
             <DialogDescription>
              {editingCategory ? "نام دسته‌بندی را تغییر دهید." : "یک دسته‌بندی جدید برای آیتم‌های منو ایجاد کنید."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleFormSubmit} className="space-y-4 py-4 text-right">
            <div>
              <Label htmlFor="categoryName">نام دسته‌بندی</Label>
              <Input 
                id="categoryName" 
                value={categoryName} 
                onChange={(e) => setCategoryName(e.target.value)} 
                required 
                disabled={isSubmitting} 
                placeholder="مثلا: نوشیدنی‌های گرم"
              />
            </div>
            <DialogFooter className="sm:justify-start">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="ms-2 h-4 w-4 animate-spin" />}
                {editingCategory ? "ذخیره تغییرات" : "افزودن دسته‌بندی"}
              </Button>
              <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)} disabled={isSubmitting}>انصراف</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!categoryToDelete} onOpenChange={(open) => !open && setCategoryToDelete(null)}>
        <AlertDialogContent className="text-right">
          <AlertDialogHeader>
            <AlertDialogTitle>آیا مطمئن هستید؟</AlertDialogTitle>
            <AlertDialogDescription>
              این اقدام دسته‌بندی "{categoryToDelete?.name}" را برای همیشه حذف خواهد کرد. این عمل قابل بازگشت نیست.
              اگر آیتم‌هایی از منو به این دسته‌بندی اختصاص داده شده باشند، ممکن است نیاز به به‌روزرسانی آن‌ها باشد.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="sm:justify-start">
            <AlertDialogAction onClick={handleDeleteConfirm} disabled={isSubmitting} className={buttonVariants({variant: "destructive"})}>
              {isSubmitting && <Loader2 className="ms-2 h-4 w-4 animate-spin" />}
              حذف دسته‌بندی
            </AlertDialogAction>
            <AlertDialogCancel onClick={() => setCategoryToDelete(null)} disabled={isSubmitting}>انصراف</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

