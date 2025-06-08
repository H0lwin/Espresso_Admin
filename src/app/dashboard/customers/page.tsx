
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
import { Search, Eye, Edit, UserX, PlusCircle, Loader2, UserCheck } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { getCookie } from "@/lib/utils";

interface OrderHistoryItem {
  id: string;
  date: string;
  total: number;
  status: string;
}

interface Customer {
  id: string | number;
  name: string;
  email: string;
  join_date: string; // snake_case from API
  order_count: number;
  total_spent: number;
  avatar_url?: string;
  avatar_initials?: string;
  recent_orders?: OrderHistoryItem[];
  is_active: boolean;
}

export default function CustomersPage() {
  const { toast } = useToast();
  const [customers, setCustomers] = React.useState<Customer[]>([]);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [selectedCustomer, setSelectedCustomer] = React.useState<Customer | null>(null);
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [editingCustomer, setEditingCustomer] = React.useState<Customer | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [customerToToggleActive, setCustomerToToggleActive] = React.useState<Customer | null>(null);
  const [isLoadingData, setIsLoadingData] = React.useState(true);

  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");

  React.useEffect(() => {
    const fetchCustomers = async () => {
      setIsLoadingData(true);
      let url = "/api/v1/customers/"; // Replace with your actual endpoint
      if (searchTerm) {
        url += `?search=${encodeURIComponent(searchTerm)}`;
      }
      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error("خطا در دریافت لیست مشتریان");
        }
        const data = await response.json();
        setCustomers(data.results || []); // Assuming DRF pagination
      } catch (error) {
        toast({
          title: "خطا",
          description: "امکان بارگذاری لیست مشتریان وجود ندارد.",
          variant: "destructive",
        });
        setCustomers([]);
      } finally {
        setIsLoadingData(false);
      }
    };
    fetchCustomers();
  }, [searchTerm, toast]);

  const handleViewDetails = async (customer: Customer) => {
     // Optionally fetch detailed customer data if needed
    if (customer && !customer.recent_orders) {
        try {
            const response = await fetch(`/api/v1/customers/${customer.id}/`); // Detail endpoint
            if(response.ok) {
                const detailedCustomerData = await response.json();
                setSelectedCustomer(detailedCustomerData);
                return;
            }
        } catch (error) {
            console.error("Failed to fetch customer details", error);
        }
    }
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
    if (selectedCustomer && selectedCustomer.id === customer.id) setSelectedCustomer(null);
  };
  
  const handleToggleActiveConfirm = async () => {
    if (!customerToToggleActive) return;
    setIsSubmitting(true);
    const originalCustomers = [...customers];
    const targetStatus = !customerToToggleActive.is_active;

    // Optimistic update
    setCustomers(prev => prev.map(c => c.id === customerToToggleActive.id ? {...c, is_active: targetStatus} : c));
    if(selectedCustomer && selectedCustomer.id === customerToToggleActive.id) {
        setSelectedCustomer(prev => prev ? {...prev, is_active: targetStatus} : null);
    }

    try {
      const csrfToken = getCookie("csrftoken");
      const response = await fetch(`/api/v1/customers/${customerToToggleActive.id}/toggle-active/`, { // Replace with your actual endpoint
        method: "PATCH", // Or POST, depending on API design
        headers: {
          "Content-Type": "application/json",
          ...(csrfToken && { "X-CSRFToken": csrfToken }),
        },
        body: JSON.stringify({ is_active: targetStatus }),
      });

      if (!response.ok) {
        throw new Error(`Failed to ${targetStatus ? 'activate' : 'deactivate'} customer`);
      }
      const updatedCustomer = await response.json();
      setCustomers(prev => prev.map(c => c.id === updatedCustomer.id ? updatedCustomer : c));
       if(selectedCustomer && selectedCustomer.id === updatedCustomer.id) {
         setSelectedCustomer(updatedCustomer);
       }
      toast({
        title: `مشتری ${targetStatus ? 'فعال' : 'غیرفعال'} شد`,
        description: `${customerToToggleActive.name} با موفقیت ${targetStatus ? 'فعال' : 'غیرفعال'} شد.`,
      });
    } catch (error) {
      setCustomers(originalCustomers); // Revert optimistic update
      if(selectedCustomer && selectedCustomer.id === customerToToggleActive.id) {
          const originalSelected = originalCustomers.find(c => c.id === customerToToggleActive.id);
          setSelectedCustomer(originalSelected || null);
      }
      toast({
        title: "خطا",
        description: `عدم موفقیت در ${targetStatus ? 'فعال' : 'غیرفعال'} کردن مشتری.`,
        variant: "destructive",
      });
    } finally {
      setCustomerToToggleActive(null);
      setIsSubmitting(false);
    }
  };


  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const customerPayload = { 
      name, 
      email,
    };
    
    const apiEndpoint = editingCustomer 
      ? `/api/v1/customers/${editingCustomer.id}/` // Replace with your actual endpoint
      : "/api/v1/customers/";                   // Replace with your actual endpoint
    const method = editingCustomer ? "PATCH" : "POST";


    try {
      const csrfToken = getCookie("csrftoken");
      const response = await fetch(apiEndpoint, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          ...(csrfToken && { "X-CSRFToken": csrfToken }),
        },
        body: JSON.stringify(customerPayload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({detail: `خطا در ${editingCustomer ? 'به‌روزرسانی' : 'افزودن'} مشتری`}));
        throw new Error(errorData.detail);
      }
      const savedCustomer = await response.json();

      if (editingCustomer) {
        setCustomers(prev => prev.map(c => c.id === savedCustomer.id ? savedCustomer : c));
        toast({ title: "مشتری به‌روزرسانی شد", description: `${name} با موفقیت به‌روزرسانی شد.`});
      } else {
        setCustomers(prev => [savedCustomer, ...prev]);
        toast({ title: "مشتری اضافه شد", description: `${name} با موفقیت اضافه شد.`});
      }
      setIsFormOpen(false);
    } catch (error: any) {
      toast({
        title: `خطا در ${editingCustomer ? 'به‌روزرسانی' : 'افزودن'} مشتری`,
        description: error.message || "لطفا اطلاعات وارد شده را بررسی کنید.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRowActions = (customer: Customer): ActionItem[] => [
    { label: "مشاهده جزئیات", icon: Eye, onClick: () => handleViewDetails(customer) },
    { label: "ویرایش مشتری", icon: Edit, onClick: () => handleOpenEditForm(customer) },
    { label: "---" },
    { 
      label: customer.is_active ? "غیرفعال کردن حساب" : "فعال کردن حساب", 
      icon: customer.is_active ? UserX : UserCheck, 
      onClick: () => setCustomerToToggleActive(customer),
      isDestructive: !!customer.is_active 
    },
  ];

  return (
    <>
      <PageHeader
        title="مدیریت مشتریان"
        description="مشاهده و مدیریت پایگاه مشتریان خود."
         actions={
          <Button onClick={handleOpenAddForm} disabled={isSubmitting || isLoadingData}>
            <PlusCircle className="ms-2 h-4 w-4" /> افزودن مشتری جدید
          </Button>
        }
      />

      <div className="mb-4 flex flex-col md:flex-row items-center gap-4">
        <div className="relative flex-1 w-full md:w-auto">
          <Search className="absolute right-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="جستجوی مشتریان بر اساس نام یا ایمیل..."
            className="pr-8 w-full md:w-[300px]"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            disabled={isLoadingData}
          />
        </div>
      </div>
      {isLoadingData ? (
         <div className="flex items-center justify-center h-64">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="ms-3 text-muted-foreground">در حال بارگذاری مشتریان...</p>
        </div>
      ) : (
      <div className="rounded-lg border shadow-sm overflow-x-auto">
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
            {customers.length === 0 && !isLoadingData && (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                  مشتری یافت نشد.
                </TableCell>
              </TableRow>
            )}
            {customers.map((customer) => (
              <TableRow key={customer.id} className={!customer.is_active ? "opacity-60" : ""}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={customer.avatar_url || `https://placehold.co/40x40.png?text=${customer.avatar_initials || customer.name.charAt(0)}`} alt={customer.name} data-ai-hint="customer avatar" />
                      <AvatarFallback>{customer.avatar_initials || customer.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{customer.name}</span>
                  </div>
                </TableCell>
                <TableCell>{customer.email}</TableCell>
                <TableCell>{new Date(customer.join_date).toLocaleDateString('fa-IR')}</TableCell>
                <TableCell>{customer.order_count}</TableCell>
                <TableCell className="text-left">{customer.total_spent.toLocaleString('fa-IR')} تومان</TableCell>
                <TableCell>
                  <Badge variant={customer.is_active ? "default" : "outline"}>
                    {customer.is_active ? "فعال" : "غیرفعال"}
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
      )}

      <Sheet open={!!selectedCustomer} onOpenChange={(open) => !open && setSelectedCustomer(null)}>
        <SheetContent side="left" className="sm:max-w-lg w-[90vw] p-0 text-right"> 
          {selectedCustomer && (
            <>
              <SheetHeader className="p-6 border-b text-right">
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={selectedCustomer.avatar_url || `https://placehold.co/64x64.png?text=${selectedCustomer.avatar_initials || selectedCustomer.name.charAt(0)}`} alt={selectedCustomer.name} data-ai-hint="user avatar" />
                    <AvatarFallback className="text-2xl">{selectedCustomer.avatar_initials || selectedCustomer.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <SheetTitle className="text-2xl">{selectedCustomer.name}</SheetTitle>
                    <SheetDescription>{selectedCustomer.email}</SheetDescription>
                    <Badge variant={selectedCustomer.is_active ? "default" : "outline"} className="mt-1">
                      {selectedCustomer.is_active ? "فعال" : "غیرفعال"}
                    </Badge>
                  </div>
                </div>
              </SheetHeader>
              <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(100vh-280px)]">
                <div>
                  <h3 className="text-lg font-semibold mb-2">جزئیات حساب</h3>
                  <div className="space-y-1 text-sm">
                    <p><strong>عضویت:</strong> {new Date(selectedCustomer.join_date).toLocaleDateString('fa-IR')}</p>
                    <p><strong>تعداد سفارشات:</strong> {selectedCustomer.order_count}</p>
                    <p><strong>مجموع خرید:</strong> {selectedCustomer.total_spent.toLocaleString('fa-IR')} تومان</p>
                  </div>
                </div>
                <Separator />
                <div>
                  <h3 className="text-lg font-semibold mb-2">تاریخچه سفارشات اخیر</h3>
                  {selectedCustomer.recent_orders && selectedCustomer.recent_orders.length > 0 ? (
                    <ul className="space-y-3">
                      {selectedCustomer.recent_orders.map(order => (
                        <li key={order.id} className="text-sm p-3 rounded-md border bg-muted/50">
                          <div className="flex justify-between items-center">
                            <span className="font-medium">سفارش {order.id}</span>
                            <Badge variant={order.status === "Delivered" || order.status === "تحویل شده" ? "default" : "secondary"}>{order.status}</Badge>
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
              <SheetFooter className="p-6 border-t flex flex-col sm:flex-row sm:justify-start sm:space-x-2 sm:space-x-reverse gap-2">
                 <Button onClick={() => handleOpenEditForm(selectedCustomer)} disabled={isSubmitting}>
                   <Edit className="ms-2 h-4 w-4" /> ویرایش مشتری
                 </Button>
                 <Button 
                    variant={selectedCustomer.is_active ? "destructive" : "default"} 
                    onClick={() => { setCustomerToToggleActive(selectedCustomer); }} 
                    disabled={isSubmitting}
                  >
                    {selectedCustomer.is_active ? <UserX className="ms-2 h-4 w-4" /> : <UserCheck className="ms-2 h-4 w-4" />}
                    {selectedCustomer.is_active ? "غیرفعال کردن" : "فعال کردن"}
                  </Button>
                 <Button variant="outline" onClick={() => setSelectedCustomer(null)}>بستن</Button>
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
          <form onSubmit={handleFormSubmit} className="space-y-4 py-4 text-right">
            <div>
              <Label htmlFor="customerName">نام کامل</Label>
              <Input id="customerName" value={name} onChange={(e) => setName(e.target.value)} required disabled={isSubmitting} />
            </div>
            <div>
              <Label htmlFor="customerEmail">آدرس ایمیل</Label>
              <Input id="customerEmail" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required disabled={isSubmitting} />
            </div>
            <DialogFooter className="sm:justify-start">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="ms-2 h-4 w-4 animate-spin" />}
                {editingCustomer ? "ذخیره تغییرات" : "افزودن مشتری"}
              </Button>
              <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)} disabled={isSubmitting}>انصراف</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!customerToToggleActive} onOpenChange={(open) => !open && setCustomerToToggleActive(null)}>
        <AlertDialogContent className="text-right">
          <AlertDialogHeader>
            <AlertDialogTitle>آیا مطمئن هستید؟</AlertDialogTitle>
            <AlertDialogDescription>
              این اقدام کاربر {customerToToggleActive?.name} را {customerToToggleActive?.is_active ? "غیرفعال" : "فعال"} خواهد کرد.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="sm:justify-start">
            <AlertDialogAction 
              onClick={handleToggleActiveConfirm} 
              disabled={isSubmitting} 
              className={buttonVariants({variant: customerToToggleActive?.is_active ? "destructive" : "default"})}
            >
              {isSubmitting && <Loader2 className="ms-2 h-4 w-4 animate-spin" />}
              {customerToToggleActive?.is_active ? "غیرفعال کردن" : "فعال کردن"}
            </AlertDialogAction>
            <AlertDialogCancel onClick={() => setCustomerToToggleActive(null)} disabled={isSubmitting}>انصراف</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
