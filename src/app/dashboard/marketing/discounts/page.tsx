
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
import { faIR } from "date-fns/locale"; // For Persian calendar

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

// Mock data translations
const mockDiscounts: DiscountCode[] = [
  { id: "disc001", code: "WELCOME10", type: "Percentage", value: 10, startDate: new Date(2023, 0, 1), endDate: new Date(2024, 11, 31), status: "Active", usageLimit: 1000, timesUsed: 150 },
  { id: "disc002", code: "SUMMER5OFF", type: "Fixed Amount", value: 50000, startDate: new Date(2023, 5, 1), endDate: new Date(2023, 7, 31), status: "Expired", usageLimit: 500, timesUsed: 480 },
  { id: "disc003", code: "HOLIDAYSPECIAL", type: "Percentage", value: 20, startDate: new Date(2023, 10, 15), status: "Inactive", usageLimit: 200, timesUsed: 0 },
];

const discountTypeTranslations: Record<DiscountType, string> = {
  Percentage: "درصدی",
  "Fixed Amount": "مبلغ ثابت",
};
const discountStatusTranslations: Record<DiscountStatus, string> = {
  Active: "فعال",
  Inactive: "غیرفعال",
  Expired: "منقضی شده",
};


export default function DiscountCodesPage() {
  const { toast } = useToast();
  const [discounts, setDiscounts] = React.useState<DiscountCode[]>(mockDiscounts);
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [editingDiscount, setEditingDiscount] = React.useState<DiscountCode | null>(null);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);

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
    if (window.confirm("آیا از حذف این کد تخفیف مطمئن هستید؟")) {
      setDiscounts(prev => prev.filter(d => d.id !== discountId));
      toast({
        title: "کد تخفیف حذف شد",
        description: "کد تخفیف مورد نظر حذف گردید.",
      });
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
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
        title: "تخفیف به‌روزرسانی شد",
        description: `کد تخفیف ${code} با موفقیت به‌روزرسانی شد.`,
      });
    } else {
      setDiscounts(prev => [...prev, { ...newDiscountData, id: `disc${Date.now()}`, status, timesUsed: 0 } as DiscountCode]);
      toast({
        title: "تخفیف ایجاد شد",
        description: `کد تخفیف ${code} با موفقیت ایجاد شد.`,
      });
    }
    setIsLoading(false);
    setIsFormOpen(false);
  };
  
  const getRowActions = (discount: DiscountCode): ActionItem[] => [
    { label: "ویرایش کد", icon: Edit, onClick: () => handleEditDiscount(discount) },
    { label: "---" },
    { label: "حذف کد", icon: Trash2, onClick: () => handleDeleteDiscount(discount.id), isDestructive: true },
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
        title="کدهای تخفیف"
        description="کدهای تخفیف را برای مشتریان خود ایجاد و مدیریت کنید."
        actions={
          <Button onClick={handleAddNewDiscount} disabled={isLoading}>
            <PlusCircle className="ms-2 h-4 w-4" /> ایجاد کد تخفیف
          </Button>
        }
      />
      <div className="mb-4">
        <div className="relative">
          <Search className="absolute right-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="جستجوی کدهای تخفیف..."
            className="pr-8 w-full md:w-[300px]"
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
              <TableHead>کد</TableHead>
              <TableHead>نوع</TableHead>
              <TableHead>مقدار</TableHead>
              <TableHead>بازه تاریخی</TableHead>
              <TableHead>وضعیت</TableHead>
              <TableHead>استفاده</TableHead>
              <TableHead className="text-left">عملیات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredDiscounts.map((discount) => (
              <TableRow key={discount.id}>
                <TableCell className="font-medium">{discount.code}</TableCell>
                <TableCell>{discountTypeTranslations[discount.type]}</TableCell>
                <TableCell>{discount.type === "Percentage" ? `${discount.value}%` : `${discount.value.toLocaleString('fa-IR')} تومان`}</TableCell>
                <TableCell>
                  {format(discount.startDate, "yyyy/MM/dd", { locale: faIR })} - {discount.endDate ? format(discount.endDate, "yyyy/MM/dd", { locale: faIR }) : "بدون انقضا"}
                </TableCell>
                <TableCell><Badge variant={getStatusBadgeVariant(discount.status)}>{discountStatusTranslations[discount.status]}</Badge></TableCell>
                <TableCell>{discount.timesUsed || 0} / {discount.usageLimit || "∞"}</TableCell>
                <TableCell className="text-left">
                  <DataTableActions actions={getRowActions(discount)} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {filteredDiscounts.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
            هیچ کد تخفیفی یافت نشد.
        </div>
      )}

      <Dialog open={isFormOpen} onOpenChange={(open) => !isLoading && setIsFormOpen(open)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader className="text-right">
            <DialogTitle>{editingDiscount ? "ویرایش کد تخفیف" : "ایجاد کد تخفیف جدید"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleFormSubmit} className="space-y-4 py-4">
            <div>
              <Label htmlFor="code">کد تخفیف</Label>
              <Input id="code" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="مثلا SAVE10" required disabled={isLoading} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="type">نوع</Label>
                <Select value={type} onValueChange={(v) => setType(v as DiscountType)} disabled={isLoading}>
                  <SelectTrigger id="type"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(discountTypeTranslations).map(([key, value]) => (
                      <SelectItem key={key} value={key}>{value}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="value">مقدار</Label>
                <Input id="value" type="number" value={value} onChange={(e) => setValue(e.target.value)} placeholder={type === "Percentage" ? "10" : "50000"} step={type === "Percentage" ? "1" : "1000"} required disabled={isLoading} />
              </div>
            </div>
            <div>
              <Label htmlFor="dateRange">بازه تاریخی</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button id="dateRange" variant="outline" className="w-full justify-start text-right font-normal" disabled={isLoading}>
                     {dateRange?.from ? (
                      dateRange.to ? (
                        <>
                          {format(dateRange.from, "PPP", { locale: faIR })} - {format(dateRange.to, "PPP", { locale: faIR })}
                        </>
                      ) : (
                        format(dateRange.from, "PPP", { locale: faIR })
                      )
                    ) : (
                      <span>انتخاب بازه تاریخی</span>
                    )}
                    <CalendarIcon className="me-auto h-4 w-4" /> {/* me-auto for RTL */}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="range" selected={dateRange} onSelect={setDateRange} numberOfMonths={2} disabled={isLoading} locale={faIR} dir="rtl" />
                </PopoverContent>
              </Popover>
            </div>
             <div>
              <Label htmlFor="usageLimit">محدودیت استفاده (اختیاری)</Label>
              <Input id="usageLimit" type="number" value={usageLimit} onChange={(e) => setUsageLimit(e.target.value)} placeholder="مثلا ۱۰۰ (خالی برای نامحدود)" disabled={isLoading} />
            </div>
            <div className="flex items-center space-x-2 space-x-reverse">
              <Switch id="isActive" checked={isActive} onCheckedChange={setIsActive} disabled={isLoading} />
              <Label htmlFor="isActive">فعال</Label>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)} disabled={isLoading}>انصراف</Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="ms-2 h-4 w-4 animate-spin" />}
                {editingDiscount ? "ذخیره تغییرات" : "ایجاد کد"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
