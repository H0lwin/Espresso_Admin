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
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { DataTableActions, type ActionItem } from "@/components/shared/data-table-actions";
import { PlusCircle, Search, Edit, Trash2, Eye, UploadCloud } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type ItemStatus = "Available" | "Unavailable" | "Draft";
interface MenuItem {
  id: string;
  name: string;
  category: string;
  price: number;
  imageUrl: string;
  status: ItemStatus;
  description?: string;
}

const mockMenuItems: MenuItem[] = [
  { id: "menu001", name: "Espresso", category: "Coffee", price: 3.50, imageUrl: "https://placehold.co/80x80.png", status: "Available", description: "Rich and intense single shot espresso." },
  { id: "menu002", name: "Caramel Macchiato", category: "Coffee", price: 5.25, imageUrl: "https://placehold.co/80x80.png", status: "Available", description: "Espresso with vanilla syrup, steamed milk, and caramel sauce." },
  { id: "menu003", name: "Croissant", category: "Pastries", price: 3.00, imageUrl: "https://placehold.co/80x80.png", status: "Available", description: "Buttery and flaky French croissant." },
  { id: "menu004", name: "Avocado Toast", category: "Food", price: 8.50, imageUrl: "https://placehold.co/80x80.png", status: "Unavailable", description: "Smashed avocado on toasted sourdough with seasoning." },
  { id: "menu005", name: "Seasonal Fruit Tart", category: "Desserts", price: 6.00, imageUrl: "https://placehold.co/80x80.png", status: "Draft", description: "Sweet pastry crust with creamy custard and fresh seasonal fruits." },
];

const categories = ["All", "Coffee", "Tea", "Pastries", "Food", "Desserts", "Drinks"];

export default function MenuPage() {
  const [searchTerm, setSearchTerm] = React.useState("");
  const [categoryFilter, setCategoryFilter] = React.useState("All");
  const [menuItems, setMenuItems] = React.useState<MenuItem[]>(mockMenuItems);
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [editingItem, setEditingItem] = React.useState<MenuItem | null>(null);

  // Form state (could use react-hook-form for more complex forms)
  const [itemName, setItemName] = React.useState("");
  const [itemCategory, setItemCategory] = React.useState("");
  const [itemPrice, setItemPrice] = React.useState("");
  const [itemStatus, setItemStatus] = React.useState<ItemStatus>("Available");
  const [itemDescription, setItemDescription] = React.useState("");
  const [itemImagePreview, setItemImagePreview] = React.useState<string | null>(null);


  const filteredMenuItems = menuItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "All" || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleAddNewItem = () => {
    setEditingItem(null);
    setItemName("");
    setItemCategory(categories[1]); // Default to first actual category
    setItemPrice("");
    setItemStatus("Available");
    setItemDescription("");
    setItemImagePreview(null);
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
    setIsFormOpen(true);
  };

  const handleDeleteItem = (itemId: string) => {
    // Confirm deletion
    if (window.confirm("Are you sure you want to delete this item?")) {
      setMenuItems(prevItems => prevItems.filter(item => item.id !== itemId));
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newItemData: Omit<MenuItem, 'id' | 'imageUrl'> & { id?: string, imageUrl?: string } = {
      name: itemName,
      category: itemCategory,
      price: parseFloat(itemPrice) || 0,
      status: itemStatus,
      description: itemDescription,
      imageUrl: itemImagePreview || "https://placehold.co/80x80.png", // Use placeholder if no image
    };

    if (editingItem) {
      setMenuItems(prevItems => 
        prevItems.map(item => item.id === editingItem.id ? { ...editingItem, ...newItemData, id: editingItem.id, imageUrl: itemImagePreview || editingItem.imageUrl } : item)
      );
    } else {
      setMenuItems(prevItems => [
        ...prevItems,
        { ...newItemData, id: `menu${Date.now()}`, imageUrl: itemImagePreview || "https://placehold.co/80x80.png" } as MenuItem,
      ]);
    }
    setIsFormOpen(false);
  };
  
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setItemImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const getRowActions = (item: MenuItem): ActionItem[] => [
    { label: "View Details", icon: Eye, onClick: () => handleEditItem(item) /* For now, edit acts as view */ },
    { label: "Edit Item", icon: Edit, onClick: () => handleEditItem(item) },
    { label: "---" },
    { label: "Delete Item", icon: Trash2, onClick: () => handleDeleteItem(item.id), isDestructive: true },
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
        title="Menu Management"
        description="Manage your food and drink offerings."
        actions={
          <Button onClick={handleAddNewItem}>
            <PlusCircle className="mr-2 h-4 w-4" /> Add New Item
          </Button>
        }
      />

      <div className="mb-4 flex flex-col md:flex-row items-center gap-4">
        <div className="relative flex-1 w-full md:w-auto">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search menu items..."
            className="pl-8 w-full md:w-[300px]"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map(cat => (
              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {/* Optional: Category CRUD button */}
        {/* <Button variant="outline">Manage Categories</Button> */}
      </div>

      <div className="rounded-lg border shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">Image</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
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
                <TableCell>${item.price.toFixed(2)}</TableCell>
                <TableCell>
                  <Badge variant={getStatusBadgeVariant(item.status)}>{item.status}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <DataTableActions actions={getRowActions(item)} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
       {filteredMenuItems.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
            No menu items found matching your criteria.
        </div>
      )}

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingItem ? "Edit Menu Item" : "Add New Menu Item"}</DialogTitle>
            <DialogDescription>
              {editingItem ? "Update the details of this menu item." : "Fill in the details for the new menu item."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleFormSubmit} className="grid gap-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="itemName">Name</Label>
                <Input id="itemName" value={itemName} onChange={(e) => setItemName(e.target.value)} placeholder="e.g., Classic Latte" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="itemCategory">Category</Label>
                <Select value={itemCategory} onValueChange={setItemCategory} required>
                  <SelectTrigger id="itemCategory">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.filter(c => c !== "All").map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="itemPrice">Price</Label>
                <Input id="itemPrice" type="number" value={itemPrice} onChange={(e) => setItemPrice(e.target.value)} placeholder="e.g., 4.50" step="0.01" required />
              </div>
               <div className="space-y-2">
                <Label htmlFor="itemStatus">Status</Label>
                <Select value={itemStatus} onValueChange={(val) => setItemStatus(val as ItemStatus)} required>
                  <SelectTrigger id="itemStatus">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Available">Available</SelectItem>
                    <SelectItem value="Unavailable">Unavailable</SelectItem>
                    <SelectItem value="Draft">Draft</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="itemDescription">Description (Optional)</Label>
              <Textarea id="itemDescription" value={itemDescription} onChange={(e) => setItemDescription(e.target.value)} placeholder="Short description of the item..." />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="itemImage">Image</Label>
              <div className="flex items-center gap-4">
                {itemImagePreview && (
                  <Image src={itemImagePreview} alt="Preview" width={80} height={80} className="rounded-md object-cover" data-ai-hint="item preview" />
                )}
                <Input id="itemImage" type="file" onChange={handleImageUpload} accept="image/*" className="hidden" />
                <Button type="button" variant="outline" onClick={() => document.getElementById('itemImage')?.click()}>
                  <UploadCloud className="mr-2 h-4 w-4" /> {itemImagePreview ? "Change Image" : "Upload Image"}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">Recommended size: 200x200px. Max 1MB.</p>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>Cancel</Button>
              <Button type="submit">{editingItem ? "Save Changes" : "Add Item"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
