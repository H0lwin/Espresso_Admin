
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
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DataTableActions, type ActionItem } from "@/components/shared/data-table-actions";
import { Search, Eye, Edit, UserX, PlusCircle, Loader2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface Customer {
  id: string;
  name: string;
  email: string;
  joinDate: string;
  orderCount: number;
  totalSpent: number;
  avatarFallback: string;
  avatarUrl?: string;
  recentOrders?: {id: string; date: string; total: number; status: string}[];
  isActive?: boolean;
}

// Mock data translations
const mockCustomers: Customer[] = [
  { id: "cust001", name: "آلیس اسمیت", email: "alice.s@example.com", joinDate: "2023-01-15", orderCount: 12, totalSpent: 345000, avatarFallback: "آا", recentOrders: [{id: "سف۱۰۱", date: "2023-10-20", total: 45000, status: "تحویل شده"}], isActive: true },
  { id: "cust002", name: "باب جانسون", email: "b.johnson@example.net", joinDate: "2022-11-20", orderCount: 5, totalSpent: 120000, avatarFallback: "ب‌ج", avatarUrl: "https://placehold.co/40x40.png", recentOrders: [{id: "سف۱۰۲", date: "2023-10-15", total: 22500, status: "در حال پردازش"}], isActive: true },
  { id: "cust003", name: "کارول ویلیامز", email: "carol.w@example.org", joinDate: "2023-05-01", orderCount: 25, totalSpent: 870250, avatarFallback: "ک‌و", recentOrders: [{id: "سف۱۰۳", date: "2023-10-25", total: 78000, status: "ارسال شده"}], isActive: true },
  { id: "cust004", name: "دیوید براون", email: "david.brown@example.com", joinDate: "2021-08-10", orderCount: 3, totalSpent: 65700, avatarFallback: "دب", isActive: false },
  { id: "cust005", name: "ایو دیویس", email: "eve.d@example.io", joinDate: "2023-08-30", orderCount: 8, totalSpent: 210000, avatarFallback: "اد", recentOrders: [{id: "سف۱۰۴", date: "2023-09-30", total: 33200, status: "تحویل شده"}], isActive: true},
];

export default function CustomersPage() {
  const { toast } = useToast();
  const [customers, setCustomers] = React.useState<Customer[]>(mockCustomers);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [selectedCustomer, setSelectedCustomer] = React.useState<Customer | null>(null);
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [editingCustomer, setEditingCustomer] = React.useState<Customer | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [customerToDeactivate, setCustomerToDeactivate] = React.useState<Customer | null>(null);

  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleViewDetails = (customer: Customer) => {
    setSelectedCustomer(customer);
  };
  
  const handleOpenAddForm = () => {
    setEditingCustomer(null);
    setName("");
    setEmail("");
    setIsFormOpen(true);
  };

  const handleOpenEditForm = (customer: Customer) => {
    setEditingCustomer(customer);
    setName(customer.name);
    setEmail(customer.email);
    setIsFormOpen(true);
    if (selectedCustomer) setSelectedCustomer(null);
  };
  
  const handleDeactivateConfirm = async () => {
    if (!customerToDeactivate) return;
    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setCustomers(prev => prev.map(c => c.id === customerToDeactivate.id ? {...c, isActive: false} : c));
    toast({
      title: "مشتری غیرفعال شد",
      description: `${customerToDeactivate.name} غیرفعال شد.`,
    });
    setSelectedCustomer(prev => prev && prev.id === customerToDeactivate.id ? {...prev, isActive: false} : prev);
    setCustomerToDeactivate(null);
    setIsSubmitting(false);
  };

  const handleActivateConfirm = async (customer: Customer) => {
    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setCustomers(prev => prev.map(c => c.id === customer.id ? {...c, isActive: true} : c));
    toast({ title: "مشتری فعال شد", description: `${customer.name} فعال شد.`});
    setSelectedCustomer(prev => prev && prev.id === customer.id ? {...prev, isActive: true} : prev);
    setIsSubmitting(false);
  }

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 1000));

    const customerData = { 
      name, 
      email, 
      avatarFallback: name.split(" ").map(n => n[0]).join("").toUpperCase() || "XX" 
    };

    if (editingCustomer) {
      setCustomers(prev => prev.map(c => c.id === editingCustomer.id ? {...editingCustomer, ...customerData} : c));
      toast({ title: "مشتری به‌روزرسانی شد", description: `${name} به‌روزرسانی شد.`});
    } else {
      const newCustomer: Customer = {
        id: `cust${Date.now()}`,
        ...customerData,
        joinDate: new Date().toISOString().split("T")[0],
        orderCount: 0,
        totalSpent: 0,
        isActive: true,
      };
      setCustomers(prev => [newCustomer, ...prev]);
      toast({ title: "مشتری اضافه شد", description: `${name} اضافه شد.`});
    }
    setIsSubmitting(false);
    setIsFormOpen(false);
  };

  const getRowActions = (customer: Customer): ActionItem[] => [
    { label: "مشاهده جزئیات", icon: Eye, onClick: () => handleViewDetails(customer) },
    { label: "ویرایش مشتری", icon: Edit, onClick: () => handleOpenEditForm(customer) },
    { label: "---" },
    { 
      label: customer.isActive ? "غیرفعال کردن حساب" : "فعال کردن حساب", 
      icon: UserX, 
      onClick: () => {
        if (customer.isActive) {
          setCustomerToDeactivate(customer);
        } else {
          handleActivateConfirm(customer);
        }
      },
      isDestructive: !!customer.isActive 
    },
  ];

  return (
    <>
      <PageHeader
        title="مدیریت مشتریان"
        description="مشاهده و مدیریت پایگاه مشتریان خود."
         actions={
          <Button onClick={handleOpenAddForm} disabled={isSubmitting}>
            <PlusCircle className="ms-2 h-4 w-4" /> افزودن مشتری جدید
          </Button>
        }
      />

      <div className="mb-4 flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute right-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="جستجوی مشتریان بر اساس نام یا ایمیل..."
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
              <TableHead>مشتری</TableHead>
              <TableHead>ایمیل</TableHead>
              <TableHead>تاریخ عضویت</TableHead>
              <TableHead>سفارشات</TableHead>
              <TableHead className="text-left">مجموع خرید</TableHead>
              <TableHead>وضعیت</TableHead>
              <TableHead className="text-left">عملیات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCustomers.map((customer) => (
              <TableRow key={customer.id} className={!customer.isActive ? "opacity-60" : ""}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={customer.avatarUrl || `https://placehold.co/40x40.png?text=${customer.avatarFallback}`} alt={customer.name} data-ai-hint="customer avatar" />
                      <AvatarFallback>{customer.avatarFallback}</AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{customer.name}</span>
                  </div>
                </TableCell>
                <TableCell>{customer.email}</TableCell>
                <TableCell>{new Date(customer.joinDate).toLocaleDateString('fa-IR')}</TableCell>
                <TableCell>{customer.orderCount}</TableCell>
                <TableCell className="text-left">{customer.totalSpent.toLocaleString('fa-IR')} تومان</TableCell>
                <TableCell>
                  <Badge variant={customer.isActive ? "default" : "outline"}>
                    {customer.isActive ? "فعال" : "غیرفعال"}
                  </Badge>
                </TableCell>
                <TableCell className="text-left">
                  <DataTableActions actions={getRowActions(customer)} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {filteredCustomers.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
            مشتری با معیارهای شما یافت نشد.
        </div>
      )}

      <Sheet open={!!selectedCustomer} onOpenChange={(open) => !open && setSelectedCustomer(null)}>
        <SheetContent side="left" className="sm:max-w-lg w-[90vw] p-0"> {/* side="left" for RTL */}
          {selectedCustomer && (
            <>
              <SheetHeader className="p-6 border-b">
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={selectedCustomer.avatarUrl || `https://placehold.co/64x64.png?text=${selectedCustomer.avatarFallback}`} alt={selectedCustomer.name} data-ai-hint="user avatar" />
                    <AvatarFallback className="text-2xl">{selectedCustomer.avatarFallback}</AvatarFallback>
                  </Avatar>
                  <div>
                    <SheetTitle className="text-2xl">{selectedCustomer.name}</SheetTitle>
                    <SheetDescription>{selectedCustomer.email}</SheetDescription>
                    <Badge variant={selectedCustomer.isActive ? "default" : "outline"} className="mt-1">
                      {selectedCustomer.isActive ? "فعال" : "غیرفعال"}
                    </Badge>
                  </div>
                </div>
              </SheetHeader>
              <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(100vh-280px)]">
                <div>
                  <h3 className="text-lg font-semibold mb-2">جزئیات حساب</h3>
                  <div className="space-y-1 text-sm">
                    <p><strong>عضویت:</strong> {new Date(selectedCustomer.joinDate).toLocaleDateString('fa-IR')}</p>
                    <p><strong>تعداد سفارشات:</strong> {selectedCustomer.orderCount}</p>
                    <p><strong>مجموع خرید:</strong> {selectedCustomer.totalSpent.toLocaleString('fa-IR')} تومان</p>
                  </div>
                </div>
                <Separator />
                <div>
                  <h3 className="text-lg font-semibold mb-2">تاریخچه سفارشات اخیر</h3>
                  {selectedCustomer.recentOrders && selectedCustomer.recentOrders.length > 0 ? (
                    <ul className="space-y-3">
                      {selectedCustomer.recentOrders.map(order => (
                        <li key={order.id} className="text-sm p-3 rounded-md border bg-muted/50">
                          <div className="flex justify-between items-center">
                            <span className="font-medium">سفارش {order.id}</span>
                            <Badge variant={order.status === "تحویل شده" ? "default" : "secondary"}>{order.status}</Badge>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(order.date).toLocaleDateString('fa-IR')} - {order.total.toLocaleString('fa-IR')} تومان
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-muted-foreground">سفارش اخیری یافت نشد.</p>
                  )}
                </div>
              </div>
              <SheetFooter className="p-6 border-t flex flex-col sm:flex-row sm:justify-end sm:space-x-reverse sm:space-x-2">
                 <Button variant="outline" onClick={() => setSelectedCustomer(null)}>بستن</Button>
                 {selectedCustomer.isActive && (
                    <Button variant="destructive" onClick={() => { setCustomerToDeactivate(selectedCustomer); setSelectedCustomer(null); }} disabled={isSubmitting}>
                        <UserX className="ms-2 h-4 w-4" /> غیرفعال کردن
                    </Button>
                 )}
                  {!selectedCustomer.isActive && (
                    <Button onClick={() => handleActivateConfirm(selectedCustomer)} disabled={isSubmitting}>
                       {isSubmitting && <Loader2 className="ms-2 h-4 w-4 animate-spin" />} فعال کردن
                    </Button>
                  )}
                 <Button onClick={() => handleOpenEditForm(selectedCustomer)} disabled={isSubmitting}>
                   <Edit className="ms-2 h-4 w-4" /> ویرایش مشتری
                 </Button>
              </SheetFooter>
            </>
          )}
        </SheetContent>
      </Sheet>

      <Dialog open={isFormOpen} onOpenChange={(open) => !isSubmitting && setIsFormOpen(open)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="text-right">
            <DialogTitle>{editingCustomer ? "ویرایش مشتری" : "افزودن مشتری جدید"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleFormSubmit} className="space-y-4 py-4">
            <div>
              <Label htmlFor="customerName">نام کامل</Label>
              <Input id="customerName" value={name} onChange={(e) => setName(e.target.value)} required disabled={isSubmitting} />
            </div>
            <div>
              <Label htmlFor="customerEmail">آدرس ایمیل</Label>
              <Input id="customerEmail" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required disabled={isSubmitting} />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)} disabled={isSubmitting}>انصراف</Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="ms-2 h-4 w-4 animate-spin" />}
                {editingCustomer ? "ذخیره تغییرات" : "افزودن مشتری"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!customerToDeactivate} onOpenChange={(open) => !open && setCustomerToDeactivate(null)}>
        <AlertDialogContent>
          <AlertDialogHeader className="text-right">
            <AlertDialogTitle>آیا مطمئن هستید؟</AlertDialogTitle>
            <AlertDialogDescription>
              این اقدام کاربر {customerToDeactivate?.name} را غیرفعال خواهد کرد. او ممکن است دسترسی به برخی ویژگی‌ها را از دست بدهد.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setCustomerToDeactivate(null)} disabled={isSubmitting}>انصراف</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeactivateConfirm} disabled={isSubmitting} className={buttonVariants({variant: "destructive"})}>
              {isSubmitting && <Loader2 className="ms-2 h-4 w-4 animate-spin" />}
              غیرفعال کردن
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
