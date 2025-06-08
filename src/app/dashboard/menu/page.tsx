
"use client";

import * as React from "react";
import Image from "next/image";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
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
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DataTableActions, type ActionItem } from "@/components/shared/data-table-actions";
import { PlusCircle, Search, Edit, Trash2, UploadCloud, Loader2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { getCookie } from "@/lib/utils";

type ItemDisplayStatus = "Available" | "Unavailable" | "Draft"; 
type ApiItemStatus = "available" | "unavailable" | "draft";

interface MenuItem {
  id: string | number;
  name: string;
  category_name: string;
  price: number;
  image_url?: string; 
  status: ApiItemStatus;
  description?: string;
}

interface MenuCategory {
    id: string | number;
    name: string;
}

const itemStatusApiToDisplay: Record<ApiItemStatus, ItemDisplayStatus> = {
  available: "Available",
  unavailable: "Unavailable",
  draft: "Draft",
};
const itemStatusDisplayToApi: Record<ItemDisplayStatus, ApiItemStatus> = {
  Available: "available",
  Unavailable: "unavailable",
  Draft: "draft",
};
const itemStatusTranslations: Record<ItemDisplayStatus, string> = {
  Available: "موجود",
  Unavailable: "ناموجود",
  Draft: "پیش‌نویس",
};

export default function MenuPage() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = React.useState("");
  const [categoryFilter, setCategoryFilter] = React.useState("همه");
  const [menuItems, setMenuItems] = React.useState<MenuItem[]>([]);
  const [categories, setCategories] = React.useState<MenuCategory[]>([]); 
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [editingItem, setEditingItem] = React.useState<MenuItem | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false); 
  const [isLoadingData, setIsLoadingData] = React.useState(true);

  const [itemName, setItemName] = React.useState("");
  const [itemCategoryName, setItemCategoryName] = React.useState("");
  const [itemPrice, setItemPrice] = React.useState("");
  const [itemDisplayStatus, setItemDisplayStatus] = React.useState<ItemDisplayStatus>("Available");
  const [itemDescription, setItemDescription] = React.useState("");
  const [itemImagePreview, setItemImagePreview] = React.useState<string | null>("https://placehold.co/80x80.png");
  const [itemImageFile, setItemImageFile] = React.useState<File | null>(null);

  React.useEffect(() => {
    const fetchData = async () => {
      setIsLoadingData(true);
      let fetchedMenuCategories: MenuCategory[] = [];
      try {
        // Fetch categories
        const catResponse = await fetch("/api/v1/menu-categories/"); 
        if (!catResponse.ok) {
          let errorDetail = "Failed to fetch categories"; // Default English error
          try {
            const errorData = await catResponse.json();
            errorDetail = errorData.detail || errorData.message || errorDetail;
          } catch (e) { /* Suppress error if response body isn't JSON or if .json() fails */ }
          throw new Error(errorDetail); // This will be caught by the catch block
        }
        const catData = await catResponse.json();
        fetchedMenuCategories = catData.results || [];
        setCategories(fetchedMenuCategories);

        if (fetchedMenuCategories.length > 0) {
          if (!itemCategoryName || !fetchedMenuCategories.find(c => c.name === itemCategoryName)) {
            setItemCategoryName(fetchedMenuCategories[0].name); 
          }
        } else {
          setItemCategoryName(""); 
        }

        // Fetch menu items
        let url = "/api/v1/menu-items/"; 
        const params = new URLSearchParams();
        if (searchTerm) params.append("search", searchTerm);
        if (categoryFilter !== "همه") params.append("category_name", categoryFilter); 
        
        const queryString = params.toString();
        if (queryString) url += `?${queryString}`;

        const itemsResponse = await fetch(url);
        if (!itemsResponse.ok) {
          let errorDetail = "Failed to fetch menu items";
          try {
            const errorData = await itemsResponse.json();
            errorDetail = errorData.detail || errorData.message || errorDetail;
          } catch (e) { /* Suppress error */ }
          throw new Error(errorDetail);
        }
        const itemsData = await itemsResponse.json();
        setMenuItems(itemsData.results || []);

      } catch (error: any) { 
        console.error("Fetch error in MenuPage:", error); 
        toast({
          title: "خطا در بارگذاری اطلاعات منو", 
          description: error.message || "امکان بارگذاری اطلاعات وجود ندارد. لطفاً بعداً دوباره امتحان کنید.",
          variant: "destructive",
        });
        setMenuItems([]);
        // If error message indicates category fetch failure, reset category related states
        if (error.message && (error.message.toLowerCase().includes("categories") || error.message.toLowerCase().includes("دسته‌بندی‌ها"))) {
            setCategories([]);
            setItemCategoryName("");
            if (categoryFilter !== "همه") setCategoryFilter("همه"); // Reset filter only if it wasn't already "همه"
        }
      } finally {
        setIsLoadingData(false);
      }
    };
    fetchData();
  }, [searchTerm, categoryFilter, toast]); // itemCategoryName is intentionally not in deps as it's set by this effect

  const handleAddNewItem = () => {
    setEditingItem(null);
    setItemName("");
    setItemCategoryName(categories.length > 0 ? categories[0].name : ""); 
    setItemPrice("");
    setItemDisplayStatus("Available");
    setItemDescription("");
    setItemImagePreview("https://placehold.co/80x80.png");
    setItemImageFile(null);
    setIsFormOpen(true);
  };

  const handleEditItem = (item: MenuItem) => {
    setEditingItem(item);
    setItemName(item.name);
    setItemCategoryName(item.category_name);
    setItemPrice(item.price.toString());
    setItemDisplayStatus(itemStatusApiToDisplay[item.status]);
    setItemDescription(item.description || "");
    setItemImagePreview(item.image_url || "https://placehold.co/80x80.png");
    setItemImageFile(null);
    setIsFormOpen(true);
  };

  const handleDeleteItem = async (itemId: string | number) => {
    if (!window.confirm("آیا از حذف این آیتم مطمئن هستید؟")) return;
    
    const originalItems = [...menuItems];
    setMenuItems(prevItems => prevItems.filter(item => item.id !== itemId));
    setIsSubmitting(true);

    try {
      const csrfToken = getCookie("csrftoken");
      const response = await fetch(`/api/v1/menu-items/${itemId}/`, { 
        method: "DELETE",
        headers: {
         ...(csrfToken && { "X-CSRFToken": csrfToken }),
        },
      });
      if (!response.ok) {
        let errorDetail = "خطا در حذف آیتم";
        try {
            const errorData = await response.json();
            errorDetail = errorData.detail || errorData.message || "خطا در حذف آیتم";
        } catch(e) {/* suppress */}
        throw new Error(errorDetail);
      }
      toast({
        title: "آیتم حذف شد",
        description: "آیتم منو با موفقیت حذف گردید.",
      });
    } catch (error: any) {
      setMenuItems(originalItems);
      toast({
        title: "خطا در حذف",
        description: error.message || "امکان حذف آیتم وجود نداشت. لطفا دوباره تلاش کنید.",
        variant: "destructive",
      });
    } finally {
        setIsSubmitting(false);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemCategoryName && categories.length > 0) {
      toast({ title: "خطا", description: "لطفاً یک دسته‌بندی انتخاب کنید.", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);

    const formData = new FormData();
    formData.append("name", itemName);
    formData.append("category_name", itemCategoryName); 
    formData.append("price", itemPrice);
    formData.append("status", itemStatusDisplayToApi[itemDisplayStatus]); 
    if (itemDescription) formData.append("description", itemDescription);
    if (itemImageFile) {
      formData.append("image", itemImageFile); 
    }
    
    const apiEndpoint = editingItem 
      ? `/api/v1/menu-items/${editingItem.id}/` 
      : "/api/v1/menu-items/";                 
    const method = editingItem ? "PATCH" : "POST"; 

    try {
      const csrfToken = getCookie("csrftoken");
      const response = await fetch(apiEndpoint, {
        method: method,
        headers: {
          ...(csrfToken && { "X-CSRFToken": csrfToken }),
        },
        body: formData,
      });

      if (!response.ok) {
        let errorDetail = "خطا در ذخیره آیتم";
        try {
            const errorData = await response.json();
            errorDetail = errorData.detail || errorData.message || "خطا در ذخیره آیتم";
        } catch(e) {/* suppress */}
        throw new Error(errorDetail);
      }
      const savedItem = await response.json();

      if (editingItem) {
        setMenuItems(prevItems => 
          prevItems.map(item => item.id === savedItem.id ? savedItem : item)
        );
        toast({
          title: "آیتم به‌روزرسانی شد",
          description: `${itemName} با موفقیت به‌روزرسانی شد.`,
        });
      } else {
        setMenuItems(prevItems => [savedItem, ...prevItems]);
        toast({
          title: "آیتم اضافه شد",
          description: `${itemName} با موفقیت به منو اضافه شد.`,
        });
      }
      setIsFormOpen(false);
    } catch (error: any) {
       toast({
        title: `خطا در ${editingItem ? 'به‌روزرسانی' : 'افزودن'} آیتم`,
        description: error.message || "لطفا اطلاعات وارد شده را بررسی کنید.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setItemImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setItemImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const getRowActions = (item: MenuItem): ActionItem[] => [
    { label: "ویرایش آیتم", icon: Edit, onClick: () => handleEditItem(item) },
    { label: "---" },
    { label: "حذف آیتم", icon: Trash2, onClick: () => handleDeleteItem(item.id), isDestructive: true },
  ];

  const getStatusBadgeVariant = (status: ApiItemStatus) => {
    switch (status) {
      case "available": return "default";
      case "unavailable": return "destructive";
      case "draft": return "secondary";
      default: return "outline";
    }
  };

  return (
    <>
      <PageHeader
        title="مدیریت منو"
        description="پیشنهادات غذایی و نوشیدنی خود را مدیریت کنید."
        actions={
          <Button onClick={handleAddNewItem} disabled={isSubmitting || isLoadingData}>
            <PlusCircle className="ms-2 h-4 w-4" /> افزودن آیتم جدید
          </Button>
        }
      />

      <div className="mb-4 flex flex-col md:flex-row items-center gap-4">
        <div className="relative flex-1 w-full md:w-auto">
          <Search className="absolute right-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="جستجوی آیتم‌های منو..."
            className="pr-8 w-full md:w-[300px]"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            disabled={isLoadingData || isSubmitting}
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter} disabled={isLoadingData || isSubmitting || categories.length === 0}>
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="فیلتر بر اساس دسته‌بندی" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={"همه"}>همه</SelectItem>
            {categories.map(cat => (
              <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {isLoadingData ? (
         <div className="flex items-center justify-center h-64">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="ms-3 text-muted-foreground">در حال بارگذاری آیتم‌های منو...</p>
        </div>
      ) : (
      <div className="rounded-lg border shadow-sm overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">تصویر</TableHead>
              <TableHead>نام</TableHead>
              <TableHead>دسته‌بندی</TableHead>
              <TableHead>قیمت</TableHead>
              <TableHead>وضعیت</TableHead>
              <TableHead className="text-left">عملیات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {menuItems.length === 0 && !isLoadingData && (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                  آیتم منویی یافت نشد {categoryFilter !== "همه" || searchTerm ? "با فیلترهای فعلی." : "."}
                </TableCell>
              </TableRow>
            )}
            {menuItems.map((item) => (
              <TableRow key={item.id}>
                <TableCell>
                  <Image
                    src={item.image_url || "https://placehold.co/60x60.png"}
                    alt={item.name}
                    width={60}
                    height={60}
                    className="rounded-md object-cover"
                    data-ai-hint="menu item"
                  />
                </TableCell>
                <TableCell className="font-medium">{item.name}</TableCell>
                <TableCell>{item.category_name}</TableCell>
                <TableCell>{item.price.toLocaleString('fa-IR')} تومان</TableCell>
                <TableCell>
                  <Badge variant={getStatusBadgeVariant(item.status)}>{itemStatusTranslations[itemStatusApiToDisplay[item.status]]}</Badge>
                </TableCell>
                <TableCell className="text-left">
                  <DataTableActions actions={getRowActions(item)} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      )}
      <Dialog open={isFormOpen} onOpenChange={(open) => !isSubmitting && setIsFormOpen(open)}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="text-right">
            <DialogTitle>{editingItem ? "ویرایش آیتم منو" : "افزودن آیتم جدید به منو"}</DialogTitle>
            <DialogDescription>
              {editingItem ? "جزئیات این آیتم منو را به‌روزرسانی کنید." : "جزئیات آیتم جدید منو را پر کنید."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleFormSubmit} className="grid gap-6 py-4 text-right">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="itemName">نام</Label>
                <Input id="itemName" value={itemName} onChange={(e) => setItemName(e.target.value)} placeholder="مثلا کلاسیک لاته" required disabled={isSubmitting} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="itemCategoryName">دسته‌بندی</Label>
                <Select value={itemCategoryName} onValueChange={setItemCategoryName} required disabled={isSubmitting || categories.length === 0}>
                  <SelectTrigger id="itemCategoryName">
                    <SelectValue placeholder={categories.length === 0 ? "دسته‌بندی‌ای یافت نشد" : "انتخاب دسته‌بندی"} />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => (
                      <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                 {categories.length === 0 && <p className="text-xs text-muted-foreground">ابتدا یک دسته‌بندی اضافه کنید.</p>}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="itemPrice">قیمت (تومان)</Label>
                <Input id="itemPrice" type="number" value={itemPrice} onChange={(e) => setItemPrice(e.target.value)} placeholder="مثلا ۴۵۰۰۰" step="1000" required disabled={isSubmitting} />
              </div>
               <div className="space-y-2">
                <Label htmlFor="itemDisplayStatus">وضعیت</Label>
                <Select value={itemDisplayStatus} onValueChange={(val) => setItemDisplayStatus(val as ItemDisplayStatus)} required disabled={isSubmitting}>
                  <SelectTrigger id="itemDisplayStatus">
                    <SelectValue placeholder="انتخاب وضعیت" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(itemStatusTranslations).map(([key, value]) => (
                        <SelectItem key={key} value={key as ItemDisplayStatus}>{value}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="itemDescription">توضیحات (اختیاری)</Label>
              <Textarea id="itemDescription" value={itemDescription} onChange={(e) => setItemDescription(e.target.value)} placeholder="توضیح مختصری از آیتم..." disabled={isSubmitting} />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="itemImageUploadInput">تصویر</Label>
              <div className="flex items-center gap-4">
                {itemImagePreview && (
                  <Image src={itemImagePreview} alt="پیش‌نمایش" width={80} height={80} className="rounded-md object-cover" data-ai-hint="item preview" />
                )}
                <Input id="itemImageUploadInput" type="file" onChange={handleImageUpload} accept="image/*" className="hidden" disabled={isSubmitting} />
                <Button type="button" variant="outline" onClick={() => document.getElementById('itemImageUploadInput')?.click()} disabled={isSubmitting}>
                  <UploadCloud className="ms-2 h-4 w-4" /> {itemImageFile || (editingItem && editingItem.image_url && editingItem.image_url !== "https://placehold.co/80x80.png") ? "تغییر تصویر" : "بارگذاری تصویر"}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">اندازه پیشنهادی: ۲۰۰×۲۰۰ پیکسل. حداکثر ۱ مگابایت.</p>
            </div>

            <DialogFooter className="sm:justify-start">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="ms-2 h-4 w-4 animate-spin" />}
                {editingItem ? "ذخیره تغییرات" : "افزودن آیتم"}
              </Button>
              <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)} disabled={isSubmitting}>انصراف</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
