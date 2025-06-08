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
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DataTableActions, type ActionItem } from "@/components/shared/data-table-actions";
import { Search, Eye, Edit, Trash2, UserX, PlusCircle } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

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
}

const mockCustomers: Customer[] = [
  { id: "cust001", name: "Alice Smith", email: "alice.s@example.com", joinDate: "2023-01-15", orderCount: 12, totalSpent: 345.50, avatarFallback: "AS", recentOrders: [{id: "ORD101", date: "2023-10-20", total: 45.00, status: "Delivered"}] },
  { id: "cust002", name: "Bob Johnson", email: "b.johnson@example.net", joinDate: "2022-11-20", orderCount: 5, totalSpent: 120.00, avatarFallback: "BJ", avatarUrl: "https://placehold.co/40x40.png", recentOrders: [{id: "ORD102", date: "2023-10-15", total: 22.50, status: "Processing"}] },
  { id: "cust003", name: "Carol Williams", email: "carol.w@example.org", joinDate: "2023-05-01", orderCount: 25, totalSpent: 870.25, avatarFallback: "CW", recentOrders: [{id: "ORD103", date: "2023-10-25", total: 78.00, status: "Shipped"}] },
  { id: "cust004", name: "David Brown", email: "david.brown@example.com", joinDate: "2021-08-10", orderCount: 3, totalSpent: 65.70, avatarFallback: "DB" },
  { id: "cust005", name: "Eve Davis", email: "eve.d@example.io", joinDate: "2023-08-30", orderCount: 8, totalSpent: 210.00, avatarFallback: "ED", recentOrders: [{id: "ORD104", date: "2023-09-30", total: 33.20, status: "Delivered"}]},
];

export default function CustomersPage() {
  const [searchTerm, setSearchTerm] = React.useState("");
  const [selectedCustomer, setSelectedCustomer] = React.useState<Customer | null>(null);

  const filteredCustomers = mockCustomers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleViewDetails = (customer: Customer) => {
    setSelectedCustomer(customer);
  };
  
  const handleDeactivateCustomer = (customerId: string) => {
    // Placeholder for deactivation logic
    alert(`Deactivate customer ${customerId}`);
  };

  const getRowActions = (customer: Customer): ActionItem[] => [
    { label: "View Details", icon: Eye, onClick: () => handleViewDetails(customer) },
    { label: "Edit Customer", icon: Edit, onClick: () => alert(`Edit ${customer.name}`) /* Placeholder */ },
    { label: "---" },
    { label: "Deactivate Account", icon: UserX, onClick: () => handleDeactivateCustomer(customer.id), isDestructive: true },
  ];

  return (
    <>
      <PageHeader
        title="Customer Management"
        description="View and manage your customer base."
         actions={
          <Button >
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
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCustomers.map((customer) => (
              <TableRow key={customer.id}>
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
                {/* Placeholder for other sections like Addresses, Payment Methods etc. */}
              </div>
              <SheetFooter className="p-6 border-t flex flex-col sm:flex-row sm:justify-end sm:space-x-2">
                 <Button variant="outline" onClick={() => setSelectedCustomer(null)}>Close</Button>
                 <Button variant="destructive" onClick={() => handleDeactivateCustomer(selectedCustomer.id)}>
                   <UserX className="mr-2 h-4 w-4" /> Deactivate
                 </Button>
                 <Button onClick={() => alert(`Edit ${selectedCustomer.name}`)}>
                   <Edit className="mr-2 h-4 w-4" /> Edit Customer
                 </Button>
              </SheetFooter>
            </>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}
