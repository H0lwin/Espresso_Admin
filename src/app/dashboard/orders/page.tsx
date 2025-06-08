
"use client";

import * as React from "react";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MoreHorizontal, Search, PlusCircle, FileDown, Eye, Edit, Truck, CheckCircle, XCircle, RefreshCcw, Loader2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { getCookie } from "@/lib/utils";

type OrderStatus = "Pending" | "Processing" | "Shipped" | "Delivered" | "Cancelled";
type PaymentStatus = "Paid" | "Unpaid" | "Refunded";

interface OrderItem {
  id: string | number;
  name: string;
  quantity: number;
  price: number;
  image: string;
}
interface OrderCustomer {
  name: string;
  email: string;
  avatar?: string; // API might send full URL or just initials
  avatar_initials?: string; // Or just initials
}
interface Order {
  id: string | number;
  customer: OrderCustomer;
  date: string; // Should be ISO string from API
  status: OrderStatus;
  total: number;
  payment_status: PaymentStatus; // Django often uses snake_case
  items: OrderItem[];
}

const orderStatusTranslations: Record<OrderStatus, string> = {
  Pending: "در انتظار",
  Processing: "در حال پردازش",
  Shipped: "ارسال شده",
  Delivered: "تحویل شده",
  Cancelled: "لغو شده",
};

const paymentStatusTranslations: Record<PaymentStatus, string> = {
  Paid: "پرداخت شده",
  Unpaid: "پرداخت نشده",
  Refunded: "مسترد شده",
};

const getStatusBadgeVariant = (status: OrderStatus) => {
  switch (status) {
    case "Delivered": return "default"; 
    case "Processing": return "secondary"; 
    case "Shipped": return "outline"; 
    case "Pending": return "destructive"; 
    case "Cancelled": return "outline"; 
    default: return "outline";
  }
};

const getPaymentBadgeVariant = (status: PaymentStatus) => {
  switch (status) {
    case "Paid": return "default";
    case "Unpaid": return "destructive";
    case "Refunded": return "secondary";
    default: return "outline";
  }
};

export default function OrdersPage() {
  const { toast } = useToast();
  const [orders, setOrders] = React.useState<Order[]>([]);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<OrderStatus | "all">("all");
  const [selectedOrder, setSelectedOrder] = React.useState<Order | null>(null);
  const [isNewOrderFormOpen, setIsNewOrderFormOpen] = React.useState(false);
  const [isSubmittingNewOrder, setIsSubmittingNewOrder] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);

  const [newOrderCustomerName, setNewOrderCustomerName] = React.useState("");
  const [newOrderCustomerEmail, setNewOrderCustomerEmail] = React.useState("");
  const [newOrderItemsText, setNewOrderItemsText] = React.useState(""); // For simplified text input
  const [newOrderTotal, setNewOrderTotal] = React.useState("");

  React.useEffect(() => {
    const fetchOrders = async () => {
      setIsLoading(true);
      let url = "/api/v1/orders/"; // Replace with your actual endpoint
      const params = new URLSearchParams();
      if (searchTerm) params.append("search", searchTerm);
      if (statusFilter !== "all") params.append("status", statusFilter);
      
      const queryString = params.toString();
      if (queryString) url += `?${queryString}`;

      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error("خطا در دریافت لیست سفارشات");
        }
        const data = await response.json();
        setOrders(data.results || []); // Assuming Django Rest Framework pagination
      } catch (error) {
        toast({
          title: "خطا",
          description: "امکان بارگذاری لیست سفارشات وجود ندارد.",
          variant: "destructive",
        });
        setOrders([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrders();
  }, [searchTerm, statusFilter, toast]);

  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order);
  };

  const handleOpenNewOrderForm = () => {
    setNewOrderCustomerName("");
    setNewOrderCustomerEmail("");
    setNewOrderItemsText("");
    setNewOrderTotal("");
    setIsNewOrderFormOpen(true);
  };

  const handleAddNewOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingNewOrder(true);

    // Basic parsing for simplified item entry, in a real scenario this would be more robust
    const items = newOrderItemsText.split('\n').map(line => {
      const parts = line.split(',');
      return {
        name: parts[0]?.trim() || "آیتم سفارشی",
        quantity: parseInt(parts[1]?.trim()) || 1,
        price: parseFloat(parts[2]?.trim()) || parseFloat(newOrderTotal) || 0,
        image: "https://placehold.co/100x100.png" // Placeholder
      };
    }).filter(item => item.name);

    const newOrderPayload = {
      customer: { 
        name: newOrderCustomerName, 
        email: newOrderCustomerEmail, 
      },
      status: "Pending", // Default status
      total: parseFloat(newOrderTotal) || 0,
      payment_status: "Unpaid", // Default payment status
      items: items.length > 0 ? items : [{ id: "item-custom", name: "آیتم سفارشی", quantity: 1, price: parseFloat(newOrderTotal) || 0, image: "https://placehold.co/100x100.png" }],
    };

    try {
      const csrfToken = getCookie("csrftoken");
      const response = await fetch("/api/v1/orders/", { // Replace with your actual endpoint
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(csrfToken && { "X-CSRFToken": csrfToken }),
        },
        body: JSON.stringify(newOrderPayload),
      });

      if (response.ok) {
        const createdOrder = await response.json();
        setOrders(prevOrders => [createdOrder, ...prevOrders]);
        toast({
          title: "سفارش ایجاد شد",
          description: `سفارش جدید ${createdOrder.id} با موفقیت ایجاد شد.`,
        });
        setIsNewOrderFormOpen(false);
      } else {
        const errorData = await response.json().catch(() => ({detail: "خطا در ایجاد سفارش"}));
        toast({
          title: "خطا در ایجاد سفارش",
          description: errorData.detail || "لطفا اطلاعات وارد شده را بررسی کنید.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "خطا در ارتباط",
        description: "مشکلی در اتصال به سرور رخ داده است.",
        variant: "destructive",
      });
    } finally {
      setIsSubmittingNewOrder(false);
    }
  };
  
  // Placeholder for updateStatus - this would call your API
  const handleChangeOrderStatus = async (orderId: string | number, newStatus: OrderStatus) => {
    // Find the order to update its UI optimistically or refetch
    const originalOrders = [...orders];
    setOrders(prevOrders => 
      prevOrders.map(o => o.id === orderId ? {...o, status: newStatus} : o)
    );

    try {
      const csrfToken = getCookie("csrftoken");
      const response = await fetch(`/api/v1/orders/${orderId}/change-status/`, { // Replace with your actual endpoint
        method: 'PATCH', // or PUT
        headers: {
          'Content-Type': 'application/json',
          ...(csrfToken && { "X-CSRFToken": csrfToken }),
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to update order status');
      }
      const updatedOrder = await response.json();
      setOrders(prevOrders => 
        prevOrders.map(o => o.id === orderId ? updatedOrder : o)
      );
      toast({ title: "وضعیت سفارش به‌روز شد", description: `وضعیت سفارش ${orderId} به ${orderStatusTranslations[newStatus]} تغییر کرد.` });
    } catch (error) {
      setOrders(originalOrders); // Revert optimistic update
      toast({ title: "خطا", description: "عدم موفقیت در به‌روزرسانی وضعیت سفارش.", variant: "destructive" });
    }
  };


  return (
    <>
      <PageHeader
        title="مدیریت سفارشات"
        description="مشاهده، پیگیری و مدیریت تمام سفارشات مشتریان."
        actions={
          <div className="flex flex-col sm:flex-row gap-2">
            <Button variant="outline">
              <FileDown className="ms-2 h-4 w-4" /> خروجی CSV
            </Button>
            <Button onClick={handleOpenNewOrderForm} disabled={isLoading}>
              <PlusCircle className="ms-2 h-4 w-4" /> افزودن سفارش جدید
            </Button>
          </div>
        }
      />

      <div className="mb-4 flex flex-col md:flex-row items-center gap-4">
        <div className="relative flex-1 w-full md:w-auto">
          <Search className="absolute right-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="جستجوی سفارش بر اساس شناسه، مشتری..."
            className="pr-8 w-full md:w-[300px]"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as OrderStatus | "all")}>
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="فیلتر بر اساس وضعیت" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">همه وضعیت‌ها</SelectItem>
            {Object.entries(orderStatusTranslations).map(([key, value]) => (
              <SelectItem key={key} value={key}>{value}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="ms-3 text-muted-foreground">در حال بارگذاری سفارشات...</p>
        </div>
      ) : (
      <div className="rounded-lg border shadow-sm overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>شناسه سفارش</TableHead>
              <TableHead>مشتری</TableHead>
              <TableHead>تاریخ</TableHead>
              <TableHead>وضعیت</TableHead>
              <TableHead>پرداخت</TableHead>
              <TableHead className="text-left">مجموع</TableHead>
              <TableHead className="text-left">عملیات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.length === 0 && !isLoading && (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                  سفارشی یافت نشد.
                </TableCell>
              </TableRow>
            )}
            {orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-medium">{order.id}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={order.customer.avatar || `https://placehold.co/40x40.png?text=${order.customer.avatar_initials || order.customer.name.charAt(0)}`} data-ai-hint="customer avatar" />
                      <AvatarFallback>{order.customer.avatar_initials || order.customer.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div>{order.customer.name}</div>
                      <div className="text-xs text-muted-foreground">{order.customer.email}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>{new Date(order.date).toLocaleDateString('fa-IR')}</TableCell>
                <TableCell>
                  <Badge variant={getStatusBadgeVariant(order.status)}>{orderStatusTranslations[order.status]}</Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={getPaymentBadgeVariant(order.payment_status)}>{paymentStatusTranslations[order.payment_status]}</Badge>
                </TableCell>
                <TableCell className="text-left">{order.total.toLocaleString('fa-IR')} تومان</TableCell>
                <TableCell className="text-left">
                   <Button variant="ghost" size="icon" onClick={() => handleViewDetails(order)}>
                    <Eye className="h-4 w-4" />
                     <span className="sr-only">مشاهده جزئیات</span>
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">عملیات بیشتر</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                      <DropdownMenuLabel>عملیات</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => handleViewDetails(order)} className="flex items-center">
                        <Eye className="ms-2 h-4 w-4" /> مشاهده جزئیات
                      </DropdownMenuItem>
                      {/* <DropdownMenuItem className="flex items-center">
                        <Edit className="ms-2 h-4 w-4" /> ویرایش سفارش
                      </DropdownMenuItem> */}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleChangeOrderStatus(order.id, "Shipped")} className="flex items-center" disabled={order.status === "Shipped" || order.status === "Delivered" || order.status === "Cancelled"}>
                        <Truck className="ms-2 h-4 w-4" /> علامت‌گذاری به عنوان ارسال شده
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleChangeOrderStatus(order.id, "Delivered")} className="flex items-center" disabled={order.status === "Delivered" || order.status === "Cancelled"}>
                        <CheckCircle className="ms-2 h-4 w-4" /> علامت‌گذاری به عنوان تحویل شده
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleChangeOrderStatus(order.id, "Cancelled")} className="text-destructive flex items-center" disabled={order.status === "Cancelled" || order.status === "Delivered"}>
                        <XCircle className="ms-2 h-4 w-4" /> لغو سفارش
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      )}

      <Sheet open={!!selectedOrder} onOpenChange={(open) => !open && setSelectedOrder(null)}>
        <SheetContent side="left" className="sm:max-w-lg w-[90vw] p-0"> 
          {selectedOrder && (
            <>
              <SheetHeader className="p-6 border-b text-right">
                <SheetTitle className="text-2xl">جزئیات سفارش: {selectedOrder.id}</SheetTitle>
                <SheetDescription>
                  ثبت شده در {new Date(selectedOrder.date).toLocaleDateString('fa-IR')} توسط {selectedOrder.customer.name}
                </SheetDescription>
              </SheetHeader>
              <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(100vh-200px)] text-right">
                <div>
                  <h3 className="text-lg font-semibold mb-2">اطلاعات مشتری</h3>
                  <div className="space-y-1 text-sm">
                    <p><strong>نام:</strong> {selectedOrder.customer.name}</p>
                    <p><strong>ایمیل:</strong> {selectedOrder.customer.email}</p>
                  </div>
                </div>
                <Separator />
                <div>
                  <h3 className="text-lg font-semibold mb-2">آیتم‌های سفارش</h3>
                  <ul className="space-y-3">
                    {selectedOrder.items.map(item => (
                      <li key={item.id} className="flex items-center gap-4">
                        <img 
                          src={item.image || "https://placehold.co/64x64.png"} 
                          alt={item.name} 
                          className="h-16 w-16 rounded object-cover"
                          data-ai-hint="product item" 
                        />
                        <div className="flex-1">
                          <p className="font-medium">{item.name}</p>
                          <p className="text-xs text-muted-foreground">تعداد: {item.quantity} &bull; قیمت واحد: {item.price.toLocaleString('fa-IR')} تومان</p>
                        </div>
                        <p className="font-medium">{(item.quantity * item.price).toLocaleString('fa-IR')} تومان</p>
                      </li>
                    ))}
                  </ul>
                </div>
                <Separator />
                <div>
                  <h3 className="text-lg font-semibold mb-2">جزئیات قیمت</h3>
                  <div className="space-y-1 text-sm">
                    {/* Assuming API provides subtotal, shipping, tax if needed, or frontend calculates */}
                    <div className="flex justify-between"><span>جمع فرعی:</span> <span>{selectedOrder.total.toLocaleString('fa-IR')} تومان</span></div>
                    <div className="flex justify-between"><span>هزینه ارسال:</span> <span>۰ تومان</span></div>
                    <div className="flex justify-between"><span>مالیات:</span> <span>۰ تومان</span></div>
                    <Separator className="my-2"/>
                    <div className="flex justify-between font-semibold text-base"><span>مجموع کل:</span> <span>{selectedOrder.total.toLocaleString('fa-IR')} تومان</span></div>
                  </div>
                </div>
                 <Separator />
                <div>
                  <h3 className="text-lg font-semibold mb-2">وضعیت</h3>
                  <div className="flex items-center gap-4">
                    <Badge variant={getStatusBadgeVariant(selectedOrder.status)} className="text-sm px-3 py-1">{orderStatusTranslations[selectedOrder.status]}</Badge>
                    <Badge variant={getPaymentBadgeVariant(selectedOrder.payment_status)} className="text-sm px-3 py-1">{paymentStatusTranslations[selectedOrder.payment_status]}</Badge>
                  </div>
                </div>
              </div>
              <SheetFooter className="p-6 border-t flex-col sm:flex-row sm:justify-start gap-2">
                {/* <Button>به‌روزرسانی سفارش</Button> */}
                <Button variant="outline" onClick={() => setSelectedOrder(null)}>بستن</Button>
              </SheetFooter>
            </>
          )}
        </SheetContent>
      </Sheet>

      <Dialog open={isNewOrderFormOpen} onOpenChange={setIsNewOrderFormOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader className="text-right">
            <DialogTitle>افزودن سفارش جدید</DialogTitle>
            <DialogDescription>سفارش جدید را به صورت دستی ایجاد کنید. جزئیات مشتری و آیتم‌ها را مشخص کنید.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddNewOrderSubmit} className="space-y-4 py-4 text-right">
            <div>
              <Label htmlFor="newOrderCustomerName">نام مشتری</Label>
              <Input 
                id="newOrderCustomerName" 
                value={newOrderCustomerName} 
                onChange={(e) => setNewOrderCustomerName(e.target.value)} 
                placeholder="مثلا: جان دو" 
                required 
                disabled={isSubmittingNewOrder}
              />
            </div>
            <div>
              <Label htmlFor="newOrderCustomerEmail">ایمیل مشتری</Label>
              <Input 
                id="newOrderCustomerEmail" 
                type="email" 
                value={newOrderCustomerEmail} 
                onChange={(e) => setNewOrderCustomerEmail(e.target.value)} 
                placeholder="john.doe@example.com" 
                required 
                disabled={isSubmittingNewOrder}
              />
            </div>
            <div>
              <Label htmlFor="newOrderItemsText">آیتم‌ها (نام،تعداد،قیمت واحد در هر خط، با ویرگول جدا شود)</Label>
              <Textarea 
                id="newOrderItemsText" 
                value={newOrderItemsText} 
                onChange={(e) => setNewOrderItemsText(e.target.value)} 
                placeholder="مثال: اسپرسو, ۲, ۳۵۰۰۰\nلاته, ۱, ۴۰۰۰۰" 
                rows={3}
                disabled={isSubmittingNewOrder}
              />
            </div>
            <div>
              <Label htmlFor="newOrderTotal">مجموع سفارش (تومان)</Label>
              <Input 
                id="newOrderTotal" 
                type="number" 
                value={newOrderTotal} 
                onChange={(e) => setNewOrderTotal(e.target.value)} 
                placeholder="مثلا ۷۵۰۰۰" 
                step="1000" 
                required 
                disabled={isSubmittingNewOrder}
              />
               <p className="text-xs text-muted-foreground mt-1">توجه: برای این فرم ساده شده، مجموع را دستی محاسبه و وارد کنید.</p>
            </div>
            <DialogFooter className="sm:justify-start">
              <Button type="submit" disabled={isSubmittingNewOrder}>
                {isSubmittingNewOrder && <Loader2 className="ms-2 h-4 w-4 animate-spin" />}
                {isSubmittingNewOrder ? "در حال ایجاد..." : "ایجاد سفارش"}
              </Button>
              <Button type="button" variant="outline" onClick={() => setIsNewOrderFormOpen(false)} disabled={isSubmittingNewOrder}>
                انصراف
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
