
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
import { Label } from "@/components/ui/label";
import { DataTableActions, type ActionItem } from "@/components/shared/data-table-actions";
import { PlusCircle, Search, Edit, Trash2, UploadCloud, Loader2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  imageUrl: string;
  category: string;
  description?: string;
  imageFile?: File | null;
}

// Mock data translations
const mockProducts: Product[] = [
  { id: "prod001", name: "ماگ اسپرسو اج", price: 150000, stock: 120, imageUrl: "https://placehold.co/80x80.png", category: "ظروف نوشیدنی", description: "ماگ سرامیکی ۱۲ انسی با لوگوی اسپرسو اج." },
  { id: "prod002", name: "دانه قهوه کامل (۱ کیلوگرم)", price: 250000, stock: 75, imageUrl: "https://placehold.co/80x80.png", category: "دانه‌های قهوه", description: "رست اسپرسوی ویژه ما، دانه‌های کامل." },
  { id: "prod003", name: "لیوان مسافرتی", price: 225000, stock: 50, imageUrl: "https://placehold.co/80x80.png", category: "ظروف نوشیدنی", description: "لیوان مسافرتی عایق‌دار، ۱۶ انس." },
  { id: "prod004", name: "پیشبند باریستا", price: 300000, stock: 30, imageUrl: "https://placehold.co/80x80.png", category: "پوشاک", description: "پیشبند باریستای کنفی مقاوم با جیب." },
  { id: "prod005", name: "کارت هدیه - ۲۵۰٬۰۰۰ تومان", price: 250000, stock: 999, imageUrl: "https://placehold.co/80x80.png", category: "کارت‌های هدیه", description: "کارت هدیه ۲۵۰٬۰۰۰ تومانی، قابل استفاده در فروشگاه یا آنلاین." },
];

const productCategories = ["همه", "ظروف نوشیدنی", "دانه‌های قهوه", "پوشاک", "لوازم جانبی", "کارت‌های هدیه"];

export default function MerchandisePage() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = React.useState("");
  const [categoryFilter, setCategoryFilter] = React.useState("همه");
  const [products, setProducts] = React.useState<Product[]>(mockProducts);
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [editingProduct, setEditingProduct] = React.useState<Product | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);

  const [productName, setProductName] = React.useState("");
  const [productCategory, setProductCategory] = React.useState("");
  const [productPrice, setProductPrice] = React.useState("");
  const [productStock, setProductStock] = React.useState("");
  const [productDescription, setProductDescription] = React.useState("");
  const [productImagePreview, setProductImagePreview] = React.useState<string | null>(null);
  const [productImageFile, setProductImageFile] = React.useState<File | null>(null);

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "همه" || product.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleAddNewProduct = () => {
    setEditingProduct(null);
    setProductName("");
    setProductCategory(productCategories[1]);
    setProductPrice("");
    setProductStock("");
    setProductDescription("");
    setProductImagePreview("https://placehold.co/80x80.png");
    setProductImageFile(null);
    setIsFormOpen(true);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setProductName(product.name);
    setProductCategory(product.category);
    setProductPrice(product.price.toString());
    setProductStock(product.stock.toString());
    setProductDescription(product.description || "");
    setProductImagePreview(product.imageUrl);
    setProductImageFile(null);
    setIsFormOpen(true);
  };

  const handleDeleteProduct = (productId: string) => {
    if (window.confirm("آیا از حذف این محصول مطمئن هستید؟")) {
      setProducts(prevProducts => prevProducts.filter(product => product.id !== productId));
      toast({
        title: "محصول حذف شد",
        description: "محصول از لیست کالاها حذف گردید.",
      });
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));

    const newProductData: Omit<Product, 'id' | 'imageUrl'> & { id?: string, imageUrl?: string, imageFile?: File | null } = {
      name: productName,
      category: productCategory,
      price: parseFloat(productPrice) || 0,
      stock: parseInt(productStock) || 0,
      description: productDescription,
      imageUrl: productImagePreview || "https://placehold.co/80x80.png",
      imageFile: productImageFile,
    };

    if (editingProduct) {
      setProducts(prevProducts =>
        prevProducts.map(prod => prod.id === editingProduct.id ? { ...editingProduct, ...newProductData, id: editingProduct.id, imageUrl: productImagePreview || editingProduct.imageUrl } : prod)
      );
      toast({
        title: "محصول به‌روزرسانی شد",
        description: `${productName} با موفقیت به‌روزرسانی شد.`,
      });
    } else {
      setProducts(prevProducts => [
        ...prevProducts,
        { ...newProductData, id: `prod${Date.now()}`, imageUrl: productImagePreview || "https://placehold.co/80x80.png" } as Product,
      ]);
      toast({
        title: "محصول اضافه شد",
        description: `${productName} با موفقیت به لیست کالاها اضافه شد.`,
      });
    }
    setIsLoading(false);
    setIsFormOpen(false);
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setProductImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProductImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const getRowActions = (product: Product): ActionItem[] => [
    { label: "ویرایش محصول", icon: Edit, onClick: () => handleEditProduct(product) },
    { label: "---" },
    { label: "حذف محصول", icon: Trash2, onClick: () => handleDeleteProduct(product.id), isDestructive: true },
  ];

  return (
    <>
      <PageHeader
        title="کالاهای فروشگاه"
        description="کالاهای فروشگاه خود را مدیریت کنید."
        actions={
          <Button onClick={handleAddNewProduct} disabled={isLoading}>
            <PlusCircle className="ms-2 h-4 w-4" /> افزودن محصول جدید
          </Button>
        }
      />

      <div className="mb-4 flex flex-col md:flex-row items-center gap-4">
        <div className="relative flex-1 w-full md:w-auto">
          <Search className="absolute right-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="جستجوی محصولات..."
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
            {productCategories.map(cat => (
              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-lg border shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">تصویر</TableHead>
              <TableHead>نام</TableHead>
              <TableHead>دسته‌بندی</TableHead>
              <TableHead>قیمت</TableHead>
              <TableHead>موجودی</TableHead>
              <TableHead className="text-left">عملیات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProducts.map((product) => (
              <TableRow key={product.id}>
                <TableCell>
                  <Image
                    src={product.imageUrl}
                    alt={product.name}
                    width={60}
                    height={60}
                    className="rounded-md object-cover"
                    data-ai-hint="product merchandise"
                  />
                </TableCell>
                <TableCell className="font-medium">{product.name}</TableCell>
                <TableCell>{product.category}</TableCell>
                <TableCell>{product.price.toLocaleString('fa-IR')} تومان</TableCell>
                <TableCell>{product.stock}</TableCell>
                <TableCell className="text-left">
                  <DataTableActions actions={getRowActions(product)} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {filteredProducts.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
            محصولی با معیارهای شما یافت نشد.
        </div>
      )}

      <Dialog open={isFormOpen} onOpenChange={(open) => !isLoading && setIsFormOpen(open)}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="text-right">
            <DialogTitle>{editingProduct ? "ویرایش محصول" : "افزودن محصول جدید"}</DialogTitle>
            <DialogDescription>
              {editingProduct ? "جزئیات محصول را به‌روزرسانی کنید." : "جزئیات محصول جدید را پر کنید."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleFormSubmit} className="grid gap-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <Label htmlFor="productName">نام محصول</Label>
                    <Input id="productName" value={productName} onChange={(e) => setProductName(e.target.value)} placeholder="مثلا ماگ ویژه" required disabled={isLoading} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="productCategory">دسته‌بندی</Label>
                    <Select value={productCategory} onValueChange={setProductCategory} required disabled={isLoading}>
                    <SelectTrigger id="productCategory">
                        <SelectValue placeholder="انتخاب دسته‌بندی" />
                    </SelectTrigger>
                    <SelectContent>
                        {productCategories.filter(c => c !== "همه").map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                    </SelectContent>
                    </Select>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <Label htmlFor="productPrice">قیمت (تومان)</Label>
                    <Input id="productPrice" type="number" value={productPrice} onChange={(e) => setProductPrice(e.target.value)} placeholder="مثلا ۱۵۰۰۰۰" step="1000" required disabled={isLoading} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="productStock">تعداد موجودی</Label>
                    <Input id="productStock" type="number" value={productStock} onChange={(e) => setProductStock(e.target.value)} placeholder="مثلا ۱۰۰" step="1" required disabled={isLoading} />
                </div>
            </div>
            <div className="space-y-2">
                <Label htmlFor="productDescription">توضیحات (اختیاری)</Label>
                <Textarea id="productDescription" value={productDescription} onChange={(e) => setProductDescription(e.target.value)} placeholder="توضیح مختصری از محصول..." disabled={isLoading} />
            </div>
             <div className="space-y-2">
              <Label htmlFor="productImage">تصویر</Label>
              <div className="flex items-center gap-4">
                {productImagePreview && (
                  <Image src={productImagePreview} alt="پیش‌نمایش" width={80} height={80} className="rounded-md object-cover" data-ai-hint="product preview" />
                )}
                <Input id="productImage" type="file" onChange={handleImageUpload} accept="image/*" className="hidden" disabled={isLoading} />
                <Button type="button" variant="outline" onClick={() => document.getElementById('productImage')?.click()} disabled={isLoading}>
                  <UploadCloud className="ms-2 h-4 w-4" /> {productImagePreview && !productImageFile ? "تغییر تصویر" : "بارگذاری تصویر"}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">اندازه پیشنهادی: ۴۰۰×۴۰۰ پیکسل. حداکثر ۲ مگابایت.</p>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)} disabled={isLoading}>انصراف</Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="ms-2 h-4 w-4 animate-spin" />}
                {editingProduct ? "ذخیره تغییرات" : "افزودن محصول"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
