
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

type OrderStatus = "Pending" | "Processing" | "Shipped" | "Delivered" | "Cancelled";
type PaymentStatus = "Paid" | "Unpaid" | "Refunded";

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  image: string;
}
interface Order {
  id: string;
  customer: { name: string; email: string; avatar: string };
  date: string;
  status: OrderStatus;
  total: number;
  paymentStatus: PaymentStatus;
  items: OrderItem[];
}

// Mock data (translation of names)
const mockOrders: Order[] = [
  {
    id: "سف001", // ORD001
    customer: { name: "آلیس نادری", email: "alice@example.com", avatar: "آن" },
    date: "2023-10-26",
    status: "Delivered", // تحویل شده
    total: 75.50,
    paymentStatus: "Paid", // پرداخت شده
    items: [
      { id: "item01", name: "قهوه اسپرسو (۱ کیلوگرم)", quantity: 1, price: 25.00, image: "https://placehold.co/100x100.png" },
      { id: "item02", name: "ماگ اسپرسو اج", quantity: 2, price: 15.00, image: "https://placehold.co/100x100.png" },
      { id: "item03", name: "کروسان مخصوص", quantity: 3, price: 6.8333, image: "https://placehold.co/100x100.png" },
    ],
  },
  {
    id: "سف002", // ORD002
    customer: { name: "باب احمدی", email: "bob@example.com", avatar: "با" },
    date: "2023-10-25",
    status: "Processing", // در حال پردازش
    total: 42.00,
    paymentStatus: "Paid", // پرداخت شده
    items: [
      { id: "item04", name: "عصاره کلد برو", quantity: 1, price: 18.00, image: "https://placehold.co/100x100.png" },
      { id: "item05", name: "لیوان مسافرتی", quantity: 1, price: 24.00, image: "https://placehold.co/100x100.png" },
    ],
  },
];

// Translated statuses
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
  const [orders, setOrders] = React.useState<Order[]>(mockOrders);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<OrderStatus | "all">("all");
  const [selectedOrder, setSelectedOrder] = React.useState<Order | null>(null);
  const [isNewOrderFormOpen, setIsNewOrderFormOpen] = React.useState(false);
  const [isSubmittingNewOrder, setIsSubmittingNewOrder] = React.useState(false);

  const [newOrderCustomerName, setNewOrderCustomerName] = React.useState("");
  const [newOrderCustomerEmail, setNewOrderCustomerEmail] = React.useState("");
  const [newOrderItems, setNewOrderItems] = React.useState("");
  const [newOrderTotal, setNewOrderTotal] = React.useState("");


  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          order.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          order.customer.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order);
  };

  const handleOpenNewOrderForm = () => {
    setNewOrderCustomerName("");
    setNewOrderCustomerEmail("");
    setNewOrderItems("");
    setNewOrderTotal("");
    setIsNewOrderFormOpen(true);
  };

  const handleAddNewOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingNewOrder(true);
    await new Promise(resolve => setTimeout(resolve, 1500));

    const newOrder: Order = {
      id: `سف${Date.now().toString().slice(-4)}`,
      customer: { 
        name: newOrderCustomerName, 
        email: newOrderCustomerEmail, 
        avatar: newOrderCustomerName.split(" ").map(n => n[0]).join("").toUpperCase() || "XX" 
      },
      date: new Date().toISOString().split("T")[0],
      status: "Pending",
      total: parseFloat(newOrderTotal) || 0,
      paymentStatus: "Unpaid",
      items: [{ id: "item-custom", name: newOrderItems.split('\n')[0] || "آیتم سفارشی", quantity: 1, price: parseFloat(newOrderTotal) || 0, image: "https://placehold.co/100x100.png" }],
    };
    setOrders(prevOrders => [newOrder, ...prevOrders]);
    
    toast({
      title: "سفارش ایجاد شد",
      description: `سفارش جدید ${newOrder.id} با موفقیت ایجاد شد.`,
    });
    setIsSubmittingNewOrder(false);
    setIsNewOrderFormOpen(false);
  };


  return (
    <>
      <PageHeader
        title="مدیریت سفارشات"
        description="مشاهده، پیگیری و مدیریت تمام سفارشات مشتریان."
        actions={
          <div className="flex gap-2">
            <Button variant="outline">
              <FileDown className="ms-2 h-4 w-4" /> خروجی CSV
            </Button>
            <Button onClick={handleOpenNewOrderForm}>
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

      <div className="rounded-lg border shadow-sm">
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
            {filteredOrders.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-medium">{order.id}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={`https://placehold.co/40x40.png?text=${order.customer.avatar}`} data-ai-hint="customer avatar" />
                      <AvatarFallback>{order.customer.avatar}</AvatarFallback>
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
                  <Badge variant={getPaymentBadgeVariant(order.paymentStatus)}>{paymentStatusTranslations[order.paymentStatus]}</Badge>
                </TableCell>
                <TableCell className="text-left">{order.total.toLocaleString('fa-IR', { style: 'currency', currency: 'IRR' }).replace("ریال", "تومان")}</TableCell>
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
                      <DropdownMenuItem className="flex items-center">
                        <Edit className="ms-2 h-4 w-4" /> ویرایش سفارش
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="flex items-center">
                        <Truck className="ms-2 h-4 w-4" /> علامت‌گذاری به عنوان ارسال شده
                      </DropdownMenuItem>
                      <DropdownMenuItem className="flex items-center">
                        <CheckCircle className="ms-2 h-4 w-4" /> علامت‌گذاری به عنوان تحویل شده
                      </DropdownMenuItem>
                       <DropdownMenuItem className="flex items-center">
                        <RefreshCcw className="ms-2 h-4 w-4" /> تغییر وضعیت
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-destructive flex items-center">
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
      {filteredOrders.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
            سفارشی با معیارهای شما یافت نشد.
        </div>
      )}

      <Sheet open={!!selectedOrder} onOpenChange={(open) => !open && setSelectedOrder(null)}>
        <SheetContent side="left" className="sm:max-w-lg w-[90vw] p-0"> {/* side="left" for RTL */}
          {selectedOrder && (
            <>
              <SheetHeader className="p-6 border-b">
                <SheetTitle className="text-2xl">جزئیات سفارش: {selectedOrder.id}</SheetTitle>
                <SheetDescription>
                  ثبت شده در {new Date(selectedOrder.date).toLocaleDateString('fa-IR')} توسط {selectedOrder.customer.name}
                </SheetDescription>
              </SheetHeader>
              <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(100vh-200px)]">
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
                          src={item.image} 
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
                    <Badge variant={getPaymentBadgeVariant(selectedOrder.paymentStatus)} className="text-sm px-3 py-1">{paymentStatusTranslations[selectedOrder.paymentStatus]}</Badge>
                  </div>
                </div>
              </div>
              <SheetFooter className="p-6 border-t">
                <Button variant="outline" onClick={() => setSelectedOrder(null)}>بستن</Button>
                <Button>به‌روزرسانی سفارش</Button>
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
          <form onSubmit={handleAddNewOrderSubmit} className="space-y-4 py-4">
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
              <Label htmlFor="newOrderItems">آیتم‌ها (نام، تعداد، قیمت در هر خط - ساده شده)</Label>
              <Textarea 
                id="newOrderItems" 
                value={newOrderItems} 
                onChange={(e) => setNewOrderItems(e.target.value)} 
                placeholder="مثال: اسپرسو، ۲، ۳۵۰۰۰ تومان\nلاته، ۱، ۴۰۰۰۰ تومان" 
                rows={4}
                disabled={isSubmittingNewOrder}
              />
              <p className="text-xs text-muted-foreground mt-1">فعلا لطفا مجموع را دستی محاسبه کنید.</p>
            </div>
            <div>
              <Label htmlFor="newOrderTotal">مجموع سفارش (تومان)</Label>
              <Input 
                id="newOrderTotal" 
                type="number" 
                value={newOrderTotal} 
                onChange={(e) => setNewOrderTotal(e.target.value)} 
                placeholder="۷۵۰۰۰" 
                step="1000" 
                required 
                disabled={isSubmittingNewOrder}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsNewOrderFormOpen(false)} disabled={isSubmittingNewOrder}>
                انصراف
              </Button>
              <Button type="submit" disabled={isSubmittingNewOrder}>
                {isSubmittingNewOrder && <Loader2 className="ms-2 h-4 w-4 animate-spin" />}
                {isSubmittingNewOrder ? "در حال ایجاد..." : "ایجاد سفارش"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
