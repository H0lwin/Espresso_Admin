
"use client";

import * as React from "react";
// import type { Metadata } from 'next'; // Removed
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
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { DataTableActions, type ActionItem } from "@/components/shared/data-table-actions";
import { PlusCircle, Search, Edit, Trash2, UploadCloud, Loader2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

// Removed metadata export:
// export const metadata: Metadata = {
//   title: 'مدیریت منو - پنل مدیریت اسپرسو اِج',
// };

type ItemStatus = "Available" | "Unavailable" | "Draft";
interface MenuItem {
  id: string;
  name: string;
  category: string;
  price: number;
  imageUrl: string;
  status: ItemStatus;
  description?: string;
  imageFile?: File | null;
}

const mockMenuItems: MenuItem[] = [
  { id: "menu001", name: "اسپرسو", category: "قهوه", price: 35000, imageUrl: "https://placehold.co/80x80.png", status: "Available", description: "اسپرسو تک شات غنی و قوی." },
  { id: "menu002", name: "کارامل ماکیاتو", category: "قهوه", price: 52500, imageUrl: "https://placehold.co/80x80.png", status: "Available", description: "اسپرسو با سیروپ وانیل، شیر بخار داده شده و سس کارامل." },
  { id: "menu003", name: "کروسان", category: "شیرینی‌جات", price: 30000, imageUrl: "https://placehold.co/80x80.png", status: "Available", description: "کروسان فرانسوی کره‌ای و لایه‌ای." },
  { id: "menu004", name: "تست آووکادو", category: "غذا", price: 85000, imageUrl: "https://placehold.co/80x80.png", status: "Unavailable", description: "آووکادو له شده روی نان تست سبوس‌دار با چاشنی." },
  { id: "menu005", name: "تارت میوه فصل", category: "دسرها", price: 60000, imageUrl: "https://placehold.co/80x80.png", status: "Draft", description: "خمیر شیرینی شیرین با کاستارد خامه‌ای و میوه‌های تازه فصل." },
];

const categories = ["همه", "قهوه", "چای", "شیرینی‌جات", "غذا", "دسرها", "نوشیدنی‌ها"];
const itemStatusTranslations: Record<ItemStatus, string> = {
  Available: "موجود",
  Unavailable: "ناموجود",
  Draft: "پیش‌نویس",
};

export default function MenuPage() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = React.useState("");
  const [categoryFilter, setCategoryFilter] = React.useState("همه");
  const [menuItems, setMenuItems] = React.useState<MenuItem[]>(mockMenuItems);
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [editingItem, setEditingItem] = React.useState<MenuItem | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);

  const [itemName, setItemName] = React.useState("");
  const [itemCategory, setItemCategory] = React.useState("");
  const [itemPrice, setItemPrice] = React.useState("");
  const [itemStatus, setItemStatus] = React.useState<ItemStatus>("Available");
  const [itemDescription, setItemDescription] = React.useState("");
  const [itemImagePreview, setItemImagePreview] = React.useState<string | null>(null);
  const [itemImageFile, setItemImageFile] = React.useState<File | null>(null);

  const filteredMenuItems = menuItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "همه" || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleAddNewItem = () => {
    setEditingItem(null);
    setItemName("");
    setItemCategory(categories[1]); 
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
    setItemImagePreview(item.imageUrl);
    setItemImageFile(null);
    setIsFormOpen(true);
  };

  const handleDeleteItem = (itemId: string) => {
    if (window.confirm("آیا از حذف این آیتم مطمئن هستید؟")) {
      setMenuItems(prevItems => prevItems.filter(item => item.id !== itemId));
      toast({
        title: "آیتم حذف شد",
        description: "آیتم منو حذف گردید.",
      });
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));

    const newItemData: Omit<MenuItem, 'id' | 'imageUrl'> & { id?: string, imageUrl?: string, imageFile?: File | null } = {
      name: itemName,
      category: itemCategory,
      price: parseFloat(itemPrice) || 0,
      status: itemStatus,
      description: itemDescription,
      imageUrl: itemImagePreview || "https://placehold.co/80x80.png",
      imageFile: itemImageFile,
    };

    if (editingItem) {
      setMenuItems(prevItems => 
        prevItems.map(item => item.id === editingItem.id ? { ...editingItem, ...newItemData, id: editingItem.id, imageUrl: itemImagePreview || editingItem.imageUrl } : item)
      );
      toast({
        title: "آیتم به‌روزرسانی شد",
        description: `${itemName} با موفقیت به‌روزرسانی شد.`,
      });
    } else {
      setMenuItems(prevItems => [
        ...prevItems,
        { ...newItemData, id: `menu${Date.now()}`, imageUrl: itemImagePreview || "https://placehold.co/80x80.png" } as MenuItem,
      ]);
      toast({
        title: "آیتم اضافه شد",
        description: `${itemName} با موفقیت به منو اضافه شد.`,
      });
    }
    setIsLoading(false);
    setIsFormOpen(false);
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
          <Button onClick={handleAddNewItem} disabled={isLoading}>
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
            disabled={isLoading}
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter} disabled={isLoading}>
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
            {filteredMenuItems.map((item) => (
              <TableRow key={item.id}>
                <TableCell>
                  <Image
                    src={item.imageUrl}
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
       {filteredMenuItems.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
            هیچ آیتم منویی با معیارهای شما یافت نشد.
        </div>
      )}

      <Dialog open={isFormOpen} onOpenChange={(open) => !isLoading && setIsFormOpen(open)}>
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
                <Input id="itemName" value={itemName} onChange={(e) => setItemName(e.target.value)} placeholder="مثلا کلاسیک لاته" required disabled={isLoading} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="itemCategory">دسته‌بندی</Label>
                <Select value={itemCategory} onValueChange={setItemCategory} required disabled={isLoading}>
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
                <Input id="itemPrice" type="number" value={itemPrice} onChange={(e) => setItemPrice(e.target.value)} placeholder="مثلا ۴۵۰۰۰" step="1000" required disabled={isLoading} />
              </div>
               <div className="space-y-2">
                <Label htmlFor="itemStatus">وضعیت</Label>
                <Select value={itemStatus} onValueChange={(val) => setItemStatus(val as ItemStatus)} required disabled={isLoading}>
                  <SelectTrigger id="itemStatus">
                    <SelectValue placeholder="انتخاب وضعیت" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(itemStatusTranslations).map(([key, value]) => (
                        <SelectItem key={key} value={key}>{value}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="itemDescription">توضیحات (اختیاری)</Label>
              <Textarea id="itemDescription" value={itemDescription} onChange={(e) => setItemDescription(e.target.value)} placeholder="توضیح مختصری از آیتم..." disabled={isLoading} />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="itemImage">تصویر</Label>
              <div className="flex items-center gap-4">
                {itemImagePreview && (
                  <Image src={itemImagePreview} alt="پیش‌نمایش" width={80} height={80} className="rounded-md object-cover" data-ai-hint="item preview" />
                )}
                <Input id="itemImageUploadInput" type="file" onChange={handleImageUpload} accept="image/*" className="hidden" disabled={isLoading} />
                <Button type="button" variant="outline" onClick={() => document.getElementById('itemImageUploadInput')?.click()} disabled={isLoading}>
                  <UploadCloud className="ms-2 h-4 w-4" /> {itemImagePreview && !itemImageFile ? "تغییر تصویر" : "بارگذاری تصویر"}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">اندازه پیشنهادی: ۲۰۰×۲۰۰ پیکسل. حداکثر ۱ مگابایت.</p>
            </div>

            <DialogFooter className="sm:justify-start">
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="ms-2 h-4 w-4 animate-spin" />}
                {editingItem ? "ذخیره تغییرات" : "افزودن آیتم"}
              </Button>
              <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)} disabled={isLoading}>انصراف</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
