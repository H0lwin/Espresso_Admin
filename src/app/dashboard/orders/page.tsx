
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

const mockOrders: Order[] = [
  {
    id: "ORD001",
    customer: { name: "Alice Wonderland", email: "alice@example.com", avatar: "AW" },
    date: "2023-10-26",
    status: "Delivered",
    total: 75.50,
    paymentStatus: "Paid",
    items: [
      { id: "item01", name: "Espresso Roast (1kg)", quantity: 1, price: 25.00, image: "https://placehold.co/100x100.png" },
      { id: "item02", name: "Espresso Edge Mug", quantity: 2, price: 15.00, image: "https://placehold.co/100x100.png" },
      { id: "item03", name: "Artisan Croissant", quantity: 3, price: 6.8333, image: "https://placehold.co/100x100.png" },
    ],
  },
  {
    id: "ORD002",
    customer: { name: "Bob The Builder", email: "bob@example.com", avatar: "BB" },
    date: "2023-10-25",
    status: "Processing",
    total: 42.00,
    paymentStatus: "Paid",
    items: [
      { id: "item04", name: "Cold Brew Concentrate", quantity: 1, price: 18.00, image: "https://placehold.co/100x100.png" },
      { id: "item05", name: "Travel Tumbler", quantity: 1, price: 24.00, image: "https://placehold.co/100x100.png" },
    ],
  },
];

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

  // New Order Form State
  const [newOrderCustomerName, setNewOrderCustomerName] = React.useState("");
  const [newOrderCustomerEmail, setNewOrderCustomerEmail] = React.useState("");
  const [newOrderItems, setNewOrderItems] = React.useState(""); // Simple text for now
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
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    const newOrder: Order = {
      id: `ORD${Date.now().toString().slice(-4)}`,
      customer: { 
        name: newOrderCustomerName, 
        email: newOrderCustomerEmail, 
        avatar: newOrderCustomerName.split(" ").map(n => n[0]).join("").toUpperCase() || "XX" 
      },
      date: new Date().toISOString().split("T")[0],
      status: "Pending",
      total: parseFloat(newOrderTotal) || 0,
      paymentStatus: "Unpaid",
      items: [{ id: "item-custom", name: newOrderItems.split('\n')[0] || "Custom Item", quantity: 1, price: parseFloat(newOrderTotal) || 0, image: "https://placehold.co/100x100.png" }], // Simplified
    };
    setOrders(prevOrders => [newOrder, ...prevOrders]);
    
    toast({
      title: "Order Created",
      description: `New order ${newOrder.id} has been successfully created.`,
    });
    setIsSubmittingNewOrder(false);
    setIsNewOrderFormOpen(false);
  };


  return (
    <>
      <PageHeader
        title="Orders Management"
        description="View, track, and manage all customer orders."
        actions={
          <div className="flex gap-2">
            <Button variant="outline">
              <FileDown className="mr-2 h-4 w-4" /> Export CSV
            </Button>
            <Button onClick={handleOpenNewOrderForm}>
              <PlusCircle className="mr-2 h-4 w-4" /> Add New Order
            </Button>
          </div>
        }
      />

      <div className="mb-4 flex flex-col md:flex-row items-center gap-4">
        <div className="relative flex-1 w-full md:w-auto">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search orders by ID, customer..."
            className="pl-8 w-full md:w-[300px]"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as OrderStatus | "all")}>
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="Pending">Pending</SelectItem>
            <SelectItem value="Processing">Processing</SelectItem>
            <SelectItem value="Shipped">Shipped</SelectItem>
            <SelectItem value="Delivered">Delivered</SelectItem>
            <SelectItem value="Cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-lg border shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead className="text-right">Actions</TableHead>
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
                <TableCell>{new Date(order.date).toLocaleDateString()}</TableCell>
                <TableCell>
                  <Badge variant={getStatusBadgeVariant(order.status)}>{order.status}</Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={getPaymentBadgeVariant(order.paymentStatus)}>{order.paymentStatus}</Badge>
                </TableCell>
                <TableCell className="text-right">${order.total.toFixed(2)}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" onClick={() => handleViewDetails(order)}>
                    <Eye className="h-4 w-4" />
                     <span className="sr-only">View Details</span>
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">More actions</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => handleViewDetails(order)}>
                        <Eye className="mr-2 h-4 w-4" /> View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Edit className="mr-2 h-4 w-4" /> Edit Order
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>
                        <Truck className="mr-2 h-4 w-4" /> Mark as Shipped
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <CheckCircle className="mr-2 h-4 w-4" /> Mark as Delivered
                      </DropdownMenuItem>
                       <DropdownMenuItem>
                        <RefreshCcw className="mr-2 h-4 w-4" /> Change Status
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-destructive">
                        <XCircle className="mr-2 h-4 w-4" /> Cancel Order
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
            No orders found matching your criteria.
        </div>
      )}

      {/* View Order Details Sheet */}
      <Sheet open={!!selectedOrder} onOpenChange={(open) => !open && setSelectedOrder(null)}>
        <SheetContent className="sm:max-w-lg w-[90vw] p-0">
          {selectedOrder && (
            <>
              <SheetHeader className="p-6 border-b">
                <SheetTitle className="text-2xl">Order Details: {selectedOrder.id}</SheetTitle>
                <SheetDescription>
                  Placed on {new Date(selectedOrder.date).toLocaleDateString()} by {selectedOrder.customer.name}
                </SheetDescription>
              </SheetHeader>
              <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(100vh-200px)]">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Customer Information</h3>
                  <div className="space-y-1 text-sm">
                    <p><strong>Name:</strong> {selectedOrder.customer.name}</p>
                    <p><strong>Email:</strong> {selectedOrder.customer.email}</p>
                  </div>
                </div>
                <Separator />
                <div>
                  <h3 className="text-lg font-semibold mb-2">Order Items</h3>
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
                          <p className="text-xs text-muted-foreground">Qty: {item.quantity} &bull; Price: ${item.price.toFixed(2)}</p>
                        </div>
                        <p className="font-medium">${(item.quantity * item.price).toFixed(2)}</p>
                      </li>
                    ))}
                  </ul>
                </div>
                <Separator />
                <div>
                  <h3 className="text-lg font-semibold mb-2">Price Breakdown</h3>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between"><span>Subtotal:</span> <span>${selectedOrder.total.toFixed(2)}</span></div>
                    <div className="flex justify-between"><span>Shipping:</span> <span>$0.00</span></div>
                    <div className="flex justify-between"><span>Tax:</span> <span>$0.00</span></div>
                    <Separator className="my-2"/>
                    <div className="flex justify-between font-semibold text-base"><span>Total:</span> <span>${selectedOrder.total.toFixed(2)}</span></div>
                  </div>
                </div>
                 <Separator />
                <div>
                  <h3 className="text-lg font-semibold mb-2">Status</h3>
                  <div className="flex items-center gap-4">
                    <Badge variant={getStatusBadgeVariant(selectedOrder.status)} className="text-sm px-3 py-1">{selectedOrder.status}</Badge>
                    <Badge variant={getPaymentBadgeVariant(selectedOrder.paymentStatus)} className="text-sm px-3 py-1">{selectedOrder.paymentStatus}</Badge>
                  </div>
                </div>
              </div>
              <SheetFooter className="p-6 border-t">
                <Button variant="outline" onClick={() => setSelectedOrder(null)}>Close</Button>
                <Button>Update Order</Button>
              </SheetFooter>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Add New Order Dialog */}
      <Dialog open={isNewOrderFormOpen} onOpenChange={setIsNewOrderFormOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Add New Order</DialogTitle>
            <DialogDescription>Manually create a new order. Specify customer details and items.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddNewOrderSubmit} className="space-y-4 py-4">
            <div>
              <Label htmlFor="newOrderCustomerName">Customer Name</Label>
              <Input 
                id="newOrderCustomerName" 
                value={newOrderCustomerName} 
                onChange={(e) => setNewOrderCustomerName(e.target.value)} 
                placeholder="John Doe" 
                required 
                disabled={isSubmittingNewOrder}
              />
            </div>
            <div>
              <Label htmlFor="newOrderCustomerEmail">Customer Email</Label>
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
              <Label htmlFor="newOrderItems">Items (Name, Qty, Price per line - simplified)</Label>
              <Textarea 
                id="newOrderItems" 
                value={newOrderItems} 
                onChange={(e) => setNewOrderItems(e.target.value)} 
                placeholder="Example: Espresso, 2, 3.50\nLatte, 1, 4.00" 
                rows={4}
                disabled={isSubmittingNewOrder}
              />
              <p className="text-xs text-muted-foreground mt-1">For now, please calculate total manually.</p>
            </div>
            <div>
              <Label htmlFor="newOrderTotal">Order Total ($)</Label>
              <Input 
                id="newOrderTotal" 
                type="number" 
                value={newOrderTotal} 
                onChange={(e) => setNewOrderTotal(e.target.value)} 
                placeholder="7.50" 
                step="0.01" 
                required 
                disabled={isSubmittingNewOrder}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsNewOrderFormOpen(false)} disabled={isSubmittingNewOrder}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmittingNewOrder}>
                {isSubmittingNewOrder && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isSubmittingNewOrder ? "Creating..." : "Create Order"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
