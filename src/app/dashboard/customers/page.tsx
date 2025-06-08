
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
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
import { Search, Eye, Edit, Trash2, UserX, PlusCircle, Loader2 } from "lucide-react";
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

const mockCustomers: Customer[] = [
  { id: "cust001", name: "Alice Smith", email: "alice.s@example.com", joinDate: "2023-01-15", orderCount: 12, totalSpent: 345.50, avatarFallback: "AS", recentOrders: [{id: "ORD101", date: "2023-10-20", total: 45.00, status: "Delivered"}], isActive: true },
  { id: "cust002", name: "Bob Johnson", email: "b.johnson@example.net", joinDate: "2022-11-20", orderCount: 5, totalSpent: 120.00, avatarFallback: "BJ", avatarUrl: "https://placehold.co/40x40.png", recentOrders: [{id: "ORD102", date: "2023-10-15", total: 22.50, status: "Processing"}], isActive: true },
  { id: "cust003", name: "Carol Williams", email: "carol.w@example.org", joinDate: "2023-05-01", orderCount: 25, totalSpent: 870.25, avatarFallback: "CW", recentOrders: [{id: "ORD103", date: "2023-10-25", total: 78.00, status: "Shipped"}], isActive: true },
  { id: "cust004", name: "David Brown", email: "david.brown@example.com", joinDate: "2021-08-10", orderCount: 3, totalSpent: 65.70, avatarFallback: "DB", isActive: false },
  { id: "cust005", name: "Eve Davis", email: "eve.d@example.io", joinDate: "2023-08-30", orderCount: 8, totalSpent: 210.00, avatarFallback: "ED", recentOrders: [{id: "ORD104", date: "2023-09-30", total: 33.20, status: "Delivered"}], isActive: true},
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

  // Form state
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
    if (selectedCustomer) setSelectedCustomer(null); // Close sheet if open
  };
  
  const handleDeactivateConfirm = async () => {
    if (!customerToDeactivate) return;
    setIsSubmitting(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setCustomers(prev => prev.map(c => c.id === customerToDeactivate.id ? {...c, isActive: false} : c));
    toast({
      title: "Customer Deactivated",
      description: `${customerToDeactivate.name} has been deactivated.`,
    });
    setSelectedCustomer(prev => prev && prev.id === customerToDeactivate.id ? {...prev, isActive: false} : prev);
    setCustomerToDeactivate(null);
    setIsSubmitting(false);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    const customerData = { 
      name, 
      email, 
      avatarFallback: name.split(" ").map(n => n[0]).join("").toUpperCase() || "XX" 
    };

    if (editingCustomer) {
      setCustomers(prev => prev.map(c => c.id === editingCustomer.id ? {...editingCustomer, ...customerData} : c));
      toast({ title: "Customer Updated", description: `${name} has been updated.`});
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
      toast({ title: "Customer Added", description: `${name} has been added.`});
    }
    setIsSubmitting(false);
    setIsFormOpen(false);
  };


  const getRowActions = (customer: Customer): ActionItem[] => [
    { label: "View Details", icon: Eye, onClick: () => handleViewDetails(customer) },
    { label: "Edit Customer", icon: Edit, onClick: () => handleOpenEditForm(customer) },
    { label: "---" },
    { 
      label: customer.isActive ? "Deactivate Account" : "Activate Account", 
      icon: UserX, 
      onClick: () => {
        if (customer.isActive) {
          setCustomerToDeactivate(customer);
        } else {
          // Placeholder for activate logic
          setIsSubmitting(true);
          new Promise(resolve => setTimeout(resolve, 1000)).then(() => {
            setCustomers(prev => prev.map(c => c.id === customer.id ? {...c, isActive: true} : c));
            toast({ title: "Customer Activated", description: `${customer.name} has been activated.`});
            setSelectedCustomer(prev => prev && prev.id === customer.id ? {...prev, isActive: true} : prev);
            setIsSubmitting(false);
          });
        }
      },
      isDestructive: !!customer.isActive 
    },
  ];

  return (
    <>
      <PageHeader
        title="Customer Management"
        description="View and manage your customer base."
         actions={
          <Button onClick={handleOpenAddForm} disabled={isSubmitting}>
            <PlusCircle className="mr-2 h-4 w-4" /> Add New Customer
          </Button>
        }
      />

      <div className="mb-4 flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search customers by name or email..."
            className="pl-8 w-full md:w-[300px]"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="rounded-lg border shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Join Date</TableHead>
              <TableHead>Orders</TableHead>
              <TableHead className="text-right">Total Spent</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
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
                <TableCell>{new Date(customer.joinDate).toLocaleDateString()}</TableCell>
                <TableCell>{customer.orderCount}</TableCell>
                <TableCell className="text-right">${customer.totalSpent.toFixed(2)}</TableCell>
                <TableCell>
                  <Badge variant={customer.isActive ? "default" : "outline"}>
                    {customer.isActive ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <DataTableActions actions={getRowActions(customer)} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {filteredCustomers.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
            No customers found matching your criteria.
        </div>
      )}

      <Sheet open={!!selectedCustomer} onOpenChange={(open) => !open && setSelectedCustomer(null)}>
        <SheetContent className="sm:max-w-lg w-[90vw] p-0">
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
                      {selectedCustomer.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </div>
              </SheetHeader>
              <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(100vh-280px)]">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Account Details</h3>
                  <div className="space-y-1 text-sm">
                    <p><strong>Joined:</strong> {new Date(selectedCustomer.joinDate).toLocaleDateString()}</p>
                    <p><strong>Total Orders:</strong> {selectedCustomer.orderCount}</p>
                    <p><strong>Total Spent:</strong> ${selectedCustomer.totalSpent.toFixed(2)}</p>
                  </div>
                </div>
                <Separator />
                <div>
                  <h3 className="text-lg font-semibold mb-2">Recent Order History</h3>
                  {selectedCustomer.recentOrders && selectedCustomer.recentOrders.length > 0 ? (
                    <ul className="space-y-3">
                      {selectedCustomer.recentOrders.map(order => (
                        <li key={order.id} className="text-sm p-3 rounded-md border bg-muted/50">
                          <div className="flex justify-between items-center">
                            <span className="font-medium">Order {order.id}</span>
                            <Badge variant={order.status === "Delivered" ? "default" : "secondary"}>{order.status}</Badge>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(order.date).toLocaleDateString()} - ${order.total.toFixed(2)}
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-muted-foreground">No recent orders found.</p>
                  )}
                </div>
              </div>
              <SheetFooter className="p-6 border-t flex flex-col sm:flex-row sm:justify-end sm:space-x-2">
                 <Button variant="outline" onClick={() => setSelectedCustomer(null)}>Close</Button>
                 {selectedCustomer.isActive && (
                    <Button variant="destructive" onClick={() => { setCustomerToDeactivate(selectedCustomer); setSelectedCustomer(null); }} disabled={isSubmitting}>
                        <UserX className="mr-2 h-4 w-4" /> Deactivate
                    </Button>
                 )}
                  {!selectedCustomer.isActive && (
                    <Button onClick={() => {
                        setIsSubmitting(true);
                        new Promise(resolve => setTimeout(resolve, 1000)).then(() => {
                          setCustomers(prev => prev.map(c => c.id === selectedCustomer.id ? {...c, isActive: true} : c));
                          toast({ title: "Customer Activated", description: `${selectedCustomer.name} has been activated.`});
                          setSelectedCustomer(prev => prev && prev.id === selectedCustomer.id ? {...prev, isActive: true} : prev);
                          setIsSubmitting(false);
                        });
                     }} disabled={isSubmitting}>
                       {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Activate
                    </Button>
                  )}
                 <Button onClick={() => handleOpenEditForm(selectedCustomer)} disabled={isSubmitting}>
                   <Edit className="mr-2 h-4 w-4" /> Edit Customer
                 </Button>
              </SheetFooter>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Add/Edit Customer Dialog */}
      <Dialog open={isFormOpen} onOpenChange={(open) => !isSubmitting && setIsFormOpen(open)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingCustomer ? "Edit Customer" : "Add New Customer"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleFormSubmit} className="space-y-4 py-4">
            <div>
              <Label htmlFor="customerName">Full Name</Label>
              <Input id="customerName" value={name} onChange={(e) => setName(e.target.value)} required disabled={isSubmitting} />
            </div>
            <div>
              <Label htmlFor="customerEmail">Email Address</Label>
              <Input id="customerEmail" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required disabled={isSubmitting} />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)} disabled={isSubmitting}>Cancel</Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editingCustomer ? "Save Changes" : "Add Customer"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Deactivate Confirmation Dialog */}
      <AlertDialog open={!!customerToDeactivate} onOpenChange={(open) => !open && setCustomerToDeactivate(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action will deactivate {customerToDeactivate?.name}. They may lose access to certain features.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setCustomerToDeactivate(null)} disabled={isSubmitting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeactivateConfirm} disabled={isSubmitting} className={buttonVariants({variant: "destructive"})}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Deactivate
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

    