
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
import { PlusCircle, Search, Edit, Trash2, Eye, UploadCloud, Loader2 } from "lucide-react";
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

const mockProducts: Product[] = [
  { id: "prod001", name: "Espresso Edge Mug", price: 15.00, stock: 120, imageUrl: "https://placehold.co/80x80.png", category: "Drinkware", description: "Signature 12oz ceramic mug with Espresso Edge logo." },
  { id: "prod002", name: "Whole Bean Coffee (1kg)", price: 25.00, stock: 75, imageUrl: "https://placehold.co/80x80.png", category: "Coffee Beans", description: "Our signature espresso roast, whole beans." },
  { id: "prod003", name: "Travel Tumbler", price: 22.50, stock: 50, imageUrl: "https://placehold.co/80x80.png", category: "Drinkware", description: "Insulated travel tumbler, 16oz." },
  { id: "prod004", name: "Barista Apron", price: 30.00, stock: 30, imageUrl: "https://placehold.co/80x80.png", category: "Apparel", description: "Durable canvas barista apron with pockets." },
  { id: "prod005", name: "Gift Card - $25", price: 25.00, stock: 999, imageUrl: "https://placehold.co/80x80.png", category: "Gift Cards", description: "$25 gift card, redeemable in-store or online." },
];

const productCategories = ["All", "Drinkware", "Coffee Beans", "Apparel", "Accessories", "Gift Cards"];

export default function MerchandisePage() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = React.useState("");
  const [categoryFilter, setCategoryFilter] = React.useState("All");
  const [products, setProducts] = React.useState<Product[]>(mockProducts);
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [editingProduct, setEditingProduct] = React.useState<Product | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);

  // Form state
  const [productName, setProductName] = React.useState("");
  const [productCategory, setProductCategory] = React.useState("");
  const [productPrice, setProductPrice] = React.useState("");
  const [productStock, setProductStock] = React.useState("");
  const [productDescription, setProductDescription] = React.useState("");
  const [productImagePreview, setProductImagePreview] = React.useState<string | null>(null);
  const [productImageFile, setProductImageFile] = React.useState<File | null>(null);


  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "All" || product.category === categoryFilter;
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
    if (window.confirm("Are you sure you want to delete this product?")) {
      setProducts(prevProducts => prevProducts.filter(product => product.id !== productId));
      toast({
        title: "Product Deleted",
        description: "The product has been removed from merchandise.",
      });
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate API call
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
        title: "Product Updated",
        description: `${productName} has been successfully updated.`,
      });
    } else {
      setProducts(prevProducts => [
        ...prevProducts,
        { ...newProductData, id: `prod${Date.now()}`, imageUrl: productImagePreview || "https://placehold.co/80x80.png" } as Product,
      ]);
      toast({
        title: "Product Added",
        description: `${productName} has been successfully added to merchandise.`,
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
    { label: "Edit Product", icon: Edit, onClick: () => handleEditProduct(product) },
    { label: "---" },
    { label: "Delete Product", icon: Trash2, onClick: () => handleDeleteProduct(product.id), isDestructive: true },
  ];

  return (
    <>
      <PageHeader
        title="Merchandise Products"
        description="Manage your store's merchandise items."
        actions={
          <Button onClick={handleAddNewProduct} disabled={isLoading}>
            <PlusCircle className="mr-2 h-4 w-4" /> Add New Product
          </Button>
        }
      />

      <div className="mb-4 flex flex-col md:flex-row items-center gap-4">
        <div className="relative flex-1 w-full md:w-auto">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search products..."
            className="pl-8 w-full md:w-[300px]"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            disabled={isLoading}
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter} disabled={isLoading}>
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="Filter by category" />
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
              <TableHead className="w-[80px]">Image</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead className="text-right">Actions</TableHead>
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
                <TableCell>${product.price.toFixed(2)}</TableCell>
                <TableCell>{product.stock}</TableCell>
                <TableCell className="text-right">
                  <DataTableActions actions={getRowActions(product)} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {filteredProducts.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
            No products found matching your criteria.
        </div>
      )}

      <Dialog open={isFormOpen} onOpenChange={(open) => !isLoading && setIsFormOpen(open)}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingProduct ? "Edit Product" : "Add New Product"}</DialogTitle>
            <DialogDescription>
              {editingProduct ? "Update product details." : "Fill in new product details."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleFormSubmit} className="grid gap-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <Label htmlFor="productName">Product Name</Label>
                    <Input id="productName" value={productName} onChange={(e) => setProductName(e.target.value)} placeholder="e.g., Signature Mug" required disabled={isLoading} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="productCategory">Category</Label>
                    <Select value={productCategory} onValueChange={setProductCategory} required disabled={isLoading}>
                    <SelectTrigger id="productCategory">
                        <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                        {productCategories.filter(c => c !== "All").map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                    </SelectContent>
                    </Select>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <Label htmlFor="productPrice">Price</Label>
                    <Input id="productPrice" type="number" value={productPrice} onChange={(e) => setProductPrice(e.target.value)} placeholder="e.g., 15.00" step="0.01" required disabled={isLoading} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="productStock">Stock Quantity</Label>
                    <Input id="productStock" type="number" value={productStock} onChange={(e) => setProductStock(e.target.value)} placeholder="e.g., 100" step="1" required disabled={isLoading} />
                </div>
            </div>
            <div className="space-y-2">
                <Label htmlFor="productDescription">Description (Optional)</Label>
                <Textarea id="productDescription" value={productDescription} onChange={(e) => setProductDescription(e.target.value)} placeholder="Short description of the product..." disabled={isLoading} />
            </div>
             <div className="space-y-2">
              <Label htmlFor="productImage">Image</Label>
              <div className="flex items-center gap-4">
                {productImagePreview && (
                  <Image src={productImagePreview} alt="Preview" width={80} height={80} className="rounded-md object-cover" data-ai-hint="product preview" />
                )}
                <Input id="productImage" type="file" onChange={handleImageUpload} accept="image/*" className="hidden" disabled={isLoading} />
                <Button type="button" variant="outline" onClick={() => document.getElementById('productImage')?.click()} disabled={isLoading}>
                  <UploadCloud className="mr-2 h-4 w-4" /> {productImagePreview && !productImageFile ? "Change Image" : "Upload Image"}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">Recommended size: 400x400px. Max 2MB.</p>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)} disabled={isLoading}>Cancel</Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editingProduct ? "Save Changes" : "Add Product"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

    