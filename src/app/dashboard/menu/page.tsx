
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

type ItemStatus = "Available" | "Unavailable" | "Draft"; // API might use different keys e.g. 'available'
interface MenuItem {
  id: string | number;
  name: string;
  category: string; // Assuming category is a string name, could be an ID if normalized
  price: number;
  image_url: string; // Django often uses snake_case for URLs from serializers
  status: ItemStatus;
  description?: string;
  // imageFile is for frontend handling only, not part of API response typically
}

const categoriesFromAPI: string[] = []; // Will be fetched
const itemStatusTranslations: Record<ItemStatus, string> = {
  Available: "موجود",
  Unavailable: "ناموجود",
  Draft: "پیش‌نویس",
};
// Map frontend status to potential API status keys if different
const itemStatusToApi: Record<ItemStatus, string> = {
  Available: "available",
  Unavailable: "unavailable",
  Draft: "draft",
};


export default function MenuPage() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = React.useState("");
  const [categoryFilter, setCategoryFilter] = React.useState("همه");
  const [menuItems, setMenuItems] = React.useState<MenuItem[]>([]);
  const [categories, setCategories] = React.useState<string[]>(["همه"]);
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [editingItem, setEditingItem] = React.useState<MenuItem | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false); // Renamed from isLoading for clarity
  const [isLoadingData, setIsLoadingData] = React.useState(true);


  const [itemName, setItemName] = React.useState("");
  const [itemCategory, setItemCategory] = React.useState("");
  const [itemPrice, setItemPrice] = React.useState("");
  const [itemStatus, setItemStatus] = React.useState<ItemStatus>("Available");
  const [itemDescription, setItemDescription] = React.useState("");
  const [itemImagePreview, setItemImagePreview] = React.useState<string | null>(null);
  const [itemImageFile, setItemImageFile] = React.useState<File | null>(null);

  React.useEffect(() => {
    const fetchData = async () => {
      setIsLoadingData(true);
      try {
        // Fetch categories
        const catResponse = await fetch("/api/v1/menu-categories/"); // Replace with your actual endpoint
        if (!catResponse.ok) throw new Error("Failed to fetch categories");
        const catData = await catResponse.json();
        const fetchedCategories = catData.results ? catData.results.map((c: {name: string}) => c.name) : [];
        setCategories(["همه", ...fetchedCategories]);
        if (fetchedCategories.length > 0 && !itemCategory) {
          setItemCategory(fetchedCategories[0]); // Default to first category if creating new
        }


        // Fetch menu items
        let url = "/api/v1/menu-items/"; // Replace with your actual endpoint
        const params = new URLSearchParams();
        if (searchTerm) params.append("search", searchTerm);
        if (categoryFilter !== "همه") params.append("category_name", categoryFilter); // Or category_id if using IDs
        
        const queryString = params.toString();
        if (queryString) url += `?${queryString}`;

        const itemsResponse = await fetch(url);
        if (!itemsResponse.ok) throw new Error("Failed to fetch menu items");
        const itemsData = await itemsResponse.json();
        setMenuItems(itemsData.results || []);

      } catch (error) {
        console.error("Fetch error:", error);
        toast({
          title: "خطا",
          description: "امکان بارگذاری اطلاعات منو وجود ندارد.",
          variant: "destructive",
        });
        setMenuItems([]);
        setCategories(["همه"]);
      } finally {
        setIsLoadingData(false);
      }
    };
    fetchData();
  }, [searchTerm, categoryFilter, toast, itemCategory]);

  const handleAddNewItem = () => {
    setEditingItem(null);
    setItemName("");
    setItemCategory(categories.length > 1 ? categories[1] : ""); 
    setItemPrice("");
    setItemStatus("Available");
    setItemDescription("");
    setItemImagePreview("https://placehold.co/80x80.png");
    setItemImageFile(null);
    setIsFormOpen(true);
  };

  const handleEditItem = (item: MenuItem) => {
    setEditingItem(item);
    setItemName(item.name);
    setItemCategory(item.category);
    setItemPrice(item.price.toString());
    setItemStatus(item.status);
    setItemDescription(item.description || "");
    setItemImagePreview(item.image_url);
    setItemImageFile(null);
    setIsFormOpen(true);
  };

  const handleDeleteItem = async (itemId: string | number) => {
    if (!window.confirm("آیا از حذف این آیتم مطمئن هستید؟")) return;
    
    const originalItems = [...menuItems];
    setMenuItems(prevItems => prevItems.filter(item => item.id !== itemId));

    try {
      const csrfToken = getCookie("csrftoken");
      const response = await fetch(`/api/v1/menu-items/${itemId}/`, { // Replace with your actual endpoint
        method: "DELETE",
        headers: {
         ...(csrfToken && { "X-CSRFToken": csrfToken }),
        },
      });
      if (!response.ok) {
        throw new Error("Failed to delete item");
      }
      toast({
        title: "آیتم حذف شد",
        description: "آیتم منو با موفقیت حذف گردید.",
      });
    } catch (error) {
      setMenuItems(originalItems);
      toast({
        title: "خطا در حذف",
        description: "امکان حذف آیتم وجود نداشت. لطفا دوباره تلاش کنید.",
        variant: "destructive",
      });
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData();
    formData.append("name", itemName);
    formData.append("category_name", itemCategory); // Adjust if API expects category_id
    formData.append("price", itemPrice);
    formData.append("status", itemStatusToApi[itemStatus]); // Map to API status value
    if (itemDescription) formData.append("description", itemDescription);
    if (itemImageFile) {
      formData.append("image", itemImageFile); // API field name for image file
    }
    
    const apiEndpoint = editingItem 
      ? `/api/v1/menu-items/${editingItem.id}/` // Replace with your actual endpoint
      : "/api/v1/menu-items/";                 // Replace with your actual endpoint
    const method = editingItem ? "PATCH" : "POST"; // Use PATCH for partial updates or PUT for full replacement

    try {
      const csrfToken = getCookie("csrftoken");
      const response = await fetch(apiEndpoint, {
        method: method,
        headers: {
          ...(csrfToken && { "X-CSRFToken": csrfToken }),
          // Do NOT set Content-Type for FormData, browser does it with boundary
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({detail: "خطا در پردازش درخواست"}));
        throw new Error(errorData.detail || "Failed to save item");
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

  const getStatusBadgeVariant = (status: ItemStatus) => {
    switch (status) {
      case "Available": return "default";
      case "Unavailable": return "destructive";
      case "Draft": return "secondary";
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
            disabled={isLoadingData}
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter} disabled={isLoadingData}>
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="فیلتر بر اساس دسته‌بندی" />
          </SelectTrigger>
          <SelectContent>
            {categories.map(cat => (
              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
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
                  آیتم منویی یافت نشد.
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
                <TableCell>{item.category}</TableCell>
                <TableCell>{item.price.toLocaleString('fa-IR')} تومان</TableCell>
                <TableCell>
                  <Badge variant={getStatusBadgeVariant(item.status)}>{itemStatusTranslations[item.status]}</Badge>
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
                <Label htmlFor="itemCategory">دسته‌بندی</Label>
                <Select value={itemCategory} onValueChange={setItemCategory} required disabled={isSubmitting}>
                  <SelectTrigger id="itemCategory">
                    <SelectValue placeholder="انتخاب دسته‌بندی" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.filter(c => c !== "همه").map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="itemPrice">قیمت (تومان)</Label>
                <Input id="itemPrice" type="number" value={itemPrice} onChange={(e) => setItemPrice(e.target.value)} placeholder="مثلا ۴۵۰۰۰" step="1000" required disabled={isSubmitting} />
              </div>
               <div className="space-y-2">
                <Label htmlFor="itemStatus">وضعیت</Label>
                <Select value={itemStatus} onValueChange={(val) => setItemStatus(val as ItemStatus)} required disabled={isSubmitting}>
                  <SelectTrigger id="itemStatus">
                    <SelectValue placeholder="انتخاب وضعیت" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(itemStatusTranslations).map(([key, value]) => (
                        <SelectItem key={key} value={key as ItemStatus}>{value}</SelectItem>
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
