
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
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { DataTableActions, type ActionItem } from "@/components/shared/data-table-actions";
import { PlusCircle, Edit, Trash2, Search, Loader2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Calendar as CalendarIcon } from "lucide-react"
import { format, addDays } from "date-fns";
import { DateRange } from "react-day-picker";
import { useToast } from "@/hooks/use-toast";

type DiscountType = "Percentage" | "Fixed Amount";
type DiscountStatus = "Active" | "Inactive" | "Expired";

interface DiscountCode {
  id: string;
  code: string;
  type: DiscountType;
  value: number;
  startDate: Date;
  endDate?: Date;
  status: DiscountStatus;
  usageLimit?: number;
  timesUsed?: number;
}

const mockDiscounts: DiscountCode[] = [
  { id: "disc001", code: "WELCOME10", type: "Percentage", value: 10, startDate: new Date(2023, 0, 1), endDate: new Date(2024, 11, 31), status: "Active", usageLimit: 1000, timesUsed: 150 },
  { id: "disc002", code: "SUMMER5OFF", type: "Fixed Amount", value: 5, startDate: new Date(2023, 5, 1), endDate: new Date(2023, 7, 31), status: "Expired", usageLimit: 500, timesUsed: 480 },
  { id: "disc003", code: "HOLIDAYSPECIAL", type: "Percentage", value: 20, startDate: new Date(2023, 10, 15), status: "Inactive", usageLimit: 200, timesUsed: 0 },
];

export default function DiscountCodesPage() {
  const { toast } = useToast();
  const [discounts, setDiscounts] = React.useState<DiscountCode[]>(mockDiscounts);
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [editingDiscount, setEditingDiscount] = React.useState<DiscountCode | null>(null);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);

  // Form state
  const [code, setCode] = React.useState("");
  const [type, setType] = React.useState<DiscountType>("Percentage");
  const [value, setValue] = React.useState("");
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>({ from: new Date(), to: addDays(new Date(), 30) });
  const [isActive, setIsActive] = React.useState(true);
  const [usageLimit, setUsageLimit] = React.useState("");

  const filteredDiscounts = discounts.filter(discount =>
    discount.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddNewDiscount = () => {
    setEditingDiscount(null);
    setCode("");
    setType("Percentage");
    setValue("");
    setDateRange({ from: new Date(), to: addDays(new Date(), 30) });
    setIsActive(true);
    setUsageLimit("");
    setIsFormOpen(true);
  };

  const handleEditDiscount = (discount: DiscountCode) => {
    setEditingDiscount(discount);
    setCode(discount.code);
    setType(discount.type);
    setValue(discount.value.toString());
    setDateRange({ from: discount.startDate, to: discount.endDate });
    setIsActive(discount.status === "Active");
    setUsageLimit(discount.usageLimit?.toString() || "");
    setIsFormOpen(true);
  };

  const handleDeleteDiscount = (discountId: string) => {
    if (window.confirm("Are you sure you want to delete this discount code?")) {
      setDiscounts(prev => prev.filter(d => d.id !== discountId));
      toast({
        title: "Discount Deleted",
        description: "The discount code has been removed.",
      });
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    const newDiscountData: Omit<DiscountCode, 'id' | 'status' | 'timesUsed'> & { id?: string, status?: DiscountStatus, timesUsed?: number } = {
      code,
      type,
      value: parseFloat(value) || 0,
      startDate: dateRange?.from || new Date(),
      endDate: dateRange?.to,
      usageLimit: usageLimit ? parseInt(usageLimit) : undefined,
    };

    let status: DiscountStatus = isActive ? "Active" : "Inactive";
    if (newDiscountData.endDate && newDiscountData.endDate < new Date() && isActive) {
      status = "Expired";
    }
    
    if (editingDiscount) {
      setDiscounts(prev => prev.map(d => d.id === editingDiscount.id ? { ...editingDiscount, ...newDiscountData, status } : d));
      toast({
        title: "Discount Updated",
        description: `Discount code ${code} has been successfully updated.`,
      });
    } else {
      setDiscounts(prev => [...prev, { ...newDiscountData, id: `disc${Date.now()}`, status, timesUsed: 0 } as DiscountCode]);
      toast({
        title: "Discount Created",
        description: `Discount code ${code} has been successfully created.`,
      });
    }
    setIsLoading(false);
    setIsFormOpen(false);
  };
  
  const getRowActions = (discount: DiscountCode): ActionItem[] => [
    { label: "Edit Code", icon: Edit, onClick: () => handleEditDiscount(discount) },
    { label: "---" },
    { label: "Delete Code", icon: Trash2, onClick: () => handleDeleteDiscount(discount.id), isDestructive: true },
  ];

  const getStatusBadgeVariant = (status: DiscountStatus) => {
    if (status === "Active") return "default";
    if (status === "Inactive") return "secondary";
    if (status === "Expired") return "outline";
    return "outline";
  };

  return (
    <>
      <PageHeader
        title="Discount Codes"
        description="Create and manage discount codes for your customers."
        actions={
          <Button onClick={handleAddNewDiscount} disabled={isLoading}>
            <PlusCircle className="mr-2 h-4 w-4" /> Create Discount Code
          </Button>
        }
      />
      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search discount codes..."
            className="pl-8 w-full md:w-[300px]"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            disabled={isLoading}
          />
        </div>
      </div>

      <div className="rounded-lg border shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Value</TableHead>
              <TableHead>Date Range</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Usage</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredDiscounts.map((discount) => (
              <TableRow key={discount.id}>
                <TableCell className="font-medium">{discount.code}</TableCell>
                <TableCell>{discount.type}</TableCell>
                <TableCell>{discount.type === "Percentage" ? `${discount.value}%` : `$${discount.value.toFixed(2)}`}</TableCell>
                <TableCell>
                  {format(discount.startDate, "LLL dd, y")} - {discount.endDate ? format(discount.endDate, "LLL dd, y") : "No Expiry"}
                </TableCell>
                <TableCell><Badge variant={getStatusBadgeVariant(discount.status)}>{discount.status}</Badge></TableCell>
                <TableCell>{discount.timesUsed || 0} / {discount.usageLimit || "∞"}</TableCell>
                <TableCell className="text-right">
                  <DataTableActions actions={getRowActions(discount)} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {filteredDiscounts.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
            No discount codes found.
        </div>
      )}

      <Dialog open={isFormOpen} onOpenChange={(open) => !isLoading && setIsFormOpen(open)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingDiscount ? "Edit Discount Code" : "Create New Discount Code"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleFormSubmit} className="space-y-4 py-4">
            <div>
              <Label htmlFor="code">Discount Code</Label>
              <Input id="code" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="E.g., SAVE10" required disabled={isLoading} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="type">Type</Label>
                <Select value={type} onValueChange={(v) => setType(v as DiscountType)} disabled={isLoading}>
                  <SelectTrigger id="type"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Percentage">Percentage</SelectItem>
                    <SelectItem value="Fixed Amount">Fixed Amount</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="value">Value</Label>
                <Input id="value" type="number" value={value} onChange={(e) => setValue(e.target.value)} placeholder={type === "Percentage" ? "10" : "5.00"} step={type === "Percentage" ? "1" : "0.01"} required disabled={isLoading} />
              </div>
            </div>
            <div>
              <Label htmlFor="dateRange">Date Range</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button id="dateRange" variant="outline" className="w-full justify-start text-left font-normal" disabled={isLoading}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange?.from ? (
                      dateRange.to ? (
                        <>
                          {format(dateRange.from, "LLL dd, y")} - {format(dateRange.to, "LLL dd, y")}
                        </>
                      ) : (
                        format(dateRange.from, "LLL dd, y")
                      )
                    ) : (
                      <span>Pick a date range</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="range" selected={dateRange} onSelect={setDateRange} numberOfMonths={2} disabled={isLoading} />
                </PopoverContent>
              </Popover>
            </div>
             <div>
              <Label htmlFor="usageLimit">Usage Limit (Optional)</Label>
              <Input id="usageLimit" type="number" value={usageLimit} onChange={(e) => setUsageLimit(e.target.value)} placeholder="E.g., 100 (leave blank for unlimited)" disabled={isLoading} />
            </div>
            <div className="flex items-center space-x-2">
              <Switch id="isActive" checked={isActive} onCheckedChange={setIsActive} disabled={isLoading} />
              <Label htmlFor="isActive">Active</Label>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)} disabled={isLoading}>Cancel</Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editingDiscount ? "Save Changes" : "Create Code"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

    