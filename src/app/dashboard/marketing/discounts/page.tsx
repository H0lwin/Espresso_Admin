
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
  DialogDescription
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { DataTableActions, type ActionItem } from "@/components/shared/data-table-actions";
import { PlusCircle, Edit, Trash2, Search, Loader2, Calendar as CalendarIcon } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format, addDays, isValid } from "date-fns";
import { DateRange } from "react-day-picker";
import { useToast } from "@/hooks/use-toast";
import { faIR } from "date-fns/locale"; 
import { getCookie } from "@/lib/utils";

type DiscountType = "Percentage" | "Fixed Amount";
type DiscountStatus = "Active" | "Inactive" | "Expired"; // From frontend logic
type ApiDiscountType = "percentage" | "fixed_amount"; // From API

interface DiscountCode {
  id: string | number;
  code: string;
  type: ApiDiscountType; // Store API representation
  value: number;
  start_date: string; // ISO string from API
  end_date?: string | null; // ISO string from API
  is_active: boolean; // From API
  usage_limit?: number | null;
  times_used?: number;
}

const discountTypeDisplayMap: Record<ApiDiscountType, string> = {
  percentage: "درصدی",
  fixed_amount: "مبلغ ثابت",
};

// Mapping for form select and submission
const formDiscountTypeMap: Record<DiscountType, ApiDiscountType> = {
  Percentage: "percentage",
  "Fixed Amount": "fixed_amount",
};
const apiDiscountTypeToForm: Record<ApiDiscountType, DiscountType> = {
  percentage: "Percentage",
  fixed_amount: "Fixed Amount",
};


const getDiscountStatus = (discount: DiscountCode): DiscountStatus => {
  if (!discount.is_active) return "Inactive";
  if (discount.end_date && new Date(discount.end_date) < new Date()) return "Expired";
  return "Active";
};

const discountStatusTranslations: Record<DiscountStatus, string> = {
  Active: "فعال",
  Inactive: "غیرفعال",
  Expired: "منقضی شده",
};


export default function DiscountCodesPage() {
  const { toast } = useToast();
  const [discounts, setDiscounts] = React.useState<DiscountCode[]>([]);
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [editingDiscount, setEditingDiscount] = React.useState<DiscountCode | null>(null);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isLoadingData, setIsLoadingData] = React.useState(true);

  const [code, setCode] = React.useState("");
  const [formType, setFormType] = React.useState<DiscountType>("Percentage");
  const [value, setValue] = React.useState("");
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>({ 
    from: new Date(), 
    to: addDays(new Date(), 30) 
  });
  const [formIsActive, setFormIsActive] = React.useState(true);
  const [usageLimit, setUsageLimit] = React.useState("");

  React.useEffect(() => {
    const fetchDiscounts = async () => {
      setIsLoadingData(true);
      let url = "/api/v1/discounts/"; // Replace with your actual endpoint
      if (searchTerm) {
        url += `?search=${encodeURIComponent(searchTerm)}`;
      }
      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error("خطا در دریافت لیست کدهای تخفیف");
        }
        const data = await response.json();
        setDiscounts(data.results || []); // Assuming DRF pagination
      } catch (error) {
        toast({
          title: "خطا",
          description: "امکان بارگذاری لیست کدهای تخفیف وجود ندارد.",
          variant: "destructive",
        });
        setDiscounts([]);
      } finally {
        setIsLoadingData(false);
      }
    };
    fetchDiscounts();
  }, [searchTerm, toast]);


  const handleAddNewDiscount = () => {
    setEditingDiscount(null);
    setCode("");
    setFormType("Percentage");
    setValue("");
    setDateRange({ from: new Date(), to: addDays(new Date(), 30) });
    setFormIsActive(true);
    setUsageLimit("");
    setIsFormOpen(true);
  };

  const handleEditDiscount = (discount: DiscountCode) => {
    setEditingDiscount(discount);
    setCode(discount.code);
    setFormType(apiDiscountTypeToForm[discount.type]);
    setValue(discount.value.toString());
    setDateRange({ 
      from: discount.start_date ? new Date(discount.start_date) : undefined, 
      to: discount.end_date ? new Date(discount.end_date) : undefined 
    });
    setFormIsActive(discount.is_active);
    setUsageLimit(discount.usage_limit?.toString() || "");
    setIsFormOpen(true);
  };

  const handleDeleteDiscount = async (discountId: string | number) => {
    if (!window.confirm("آیا از حذف این کد تخفیف مطمئن هستید؟")) return;

    const originalDiscounts = [...discounts];
    setDiscounts(prev => prev.filter(d => d.id !== discountId));

    try {
      const csrfToken = getCookie("csrftoken");
      const response = await fetch(`/api/v1/discounts/${discountId}/`, { // Replace with your actual endpoint
        method: "DELETE",
         headers: {
          ...(csrfToken && { "X-CSRFToken": csrfToken }),
        },
      });
      if (!response.ok) {
        throw new Error("Failed to delete discount");
      }
      toast({
        title: "کد تخفیف حذف شد",
        description: "کد تخفیف مورد نظر حذف گردید.",
      });
    } catch (error) {
      setDiscounts(originalDiscounts);
      toast({
        title: "خطا در حذف",
        description: "امکان حذف کد تخفیف وجود نداشت.",
        variant: "destructive",
      });
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const payload: any = {
      code: code,
      type: formDiscountTypeMap[formType],
      value: parseFloat(value) || 0,
      start_date: dateRange?.from ? dateRange.from.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      end_date: dateRange?.to ? dateRange.to.toISOString().split('T')[0] : null,
      is_active: formIsActive,
      usage_limit: usageLimit ? parseInt(usageLimit) : null,
    };
    
    const apiEndpoint = editingDiscount 
      ? `/api/v1/discounts/${editingDiscount.id}/` // Replace with your actual endpoint
      : "/api/v1/discounts/";                 // Replace with your actual endpoint
    const method = editingDiscount ? "PATCH" : "POST";

    try {
      const csrfToken = getCookie("csrftoken");
      const response = await fetch(apiEndpoint, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          ...(csrfToken && { "X-CSRFToken": csrfToken }),
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
         const errorData = await response.json().catch(() => ({detail: "خطا در پردازش درخواست"}));
        throw new Error(errorData.detail || `Failed to ${editingDiscount ? 'update' : 'create'} discount`);
      }
      const savedDiscount = await response.json();

      if (editingDiscount) {
        setDiscounts(prev => prev.map(d => d.id === savedDiscount.id ? savedDiscount : d));
        toast({
          title: "تخفیف به‌روزرسانی شد",
          description: `کد تخفیف ${code} با موفقیت به‌روزرسانی شد.`,
        });
      } else {
        setDiscounts(prev => [savedDiscount, ...prev]);
        toast({
          title: "تخفیف ایجاد شد",
          description: `کد تخفیف ${code} با موفقیت ایجاد شد.`,
        });
      }
      setIsFormOpen(false);
    } catch (error: any) {
      toast({
        title: `خطا در ${editingDiscount ? 'به‌روزرسانی' : 'ایجاد'} کد تخفیف`,
        description: error.message || "لطفا اطلاعات وارد شده را بررسی کنید.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
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
          <Button onClick={handleAddNewDiscount} disabled={isSubmitting || isLoadingData}>
            <PlusCircle className="ms-2 h-4 w-4" /> ایجاد کد تخفیف
          </Button>
        }
      />
      <div className="mb-4">
        <div className="relative w-full md:w-[300px]">
          <Search className="absolute right-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="جستجوی کدهای تخفیف..."
            className="pr-8 w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            disabled={isLoadingData}
          />
        </div>
      </div>
      {isLoadingData ? (
         <div className="flex items-center justify-center h-64">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="ms-3 text-muted-foreground">در حال بارگذاری کدهای تخفیف...</p>
        </div>
      ) : (
      <div className="rounded-lg border shadow-sm overflow-x-auto">
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
            {discounts.length === 0 && !isLoadingData && (
               <TableRow>
                <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                  کد تخفیفی یافت نشد.
                </TableCell>
              </TableRow>
            )}
            {discounts.map((discount) => {
              const displayStatus = getDiscountStatus(discount);
              return (
              <TableRow key={discount.id}>
                <TableCell className="font-medium">{discount.code}</TableCell>
                <TableCell>{discountTypeDisplayMap[discount.type]}</TableCell>
                <TableCell>{discount.type === "percentage" ? `${discount.value}%` : `${discount.value.toLocaleString('fa-IR')} تومان`}</TableCell>
                <TableCell>
                  {format(new Date(discount.start_date), "yyyy/MM/dd", { locale: faIR })} - {discount.end_date ? format(new Date(discount.end_date), "yyyy/MM/dd", { locale: faIR }) : "بدون انقضا"}
                </TableCell>
                <TableCell><Badge variant={getStatusBadgeVariant(displayStatus)}>{discountStatusTranslations[displayStatus]}</Badge></TableCell>
                <TableCell>{discount.times_used || 0} / {discount.usage_limit || "∞"}</TableCell>
                <TableCell className="text-left">
                  <DataTableActions actions={getRowActions(discount)} />
                </TableCell>
              </TableRow>
             );
            })}
          </TableBody>
        </Table>
      </div>
      )}

      <Dialog open={isFormOpen} onOpenChange={(open) => !isSubmitting && setIsFormOpen(open)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader className="text-right">
            <DialogTitle>{editingDiscount ? "ویرایش کد تخفیف" : "ایجاد کد تخفیف جدید"}</DialogTitle>
            <DialogDescription>
              {editingDiscount ? "جزئیات این کد تخفیف را به‌روزرسانی کنید." : "یک کد تخفیف جدید برای مشتریان خود تعریف کنید."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleFormSubmit} className="space-y-4 py-4 text-right">
            <div>
              <Label htmlFor="code">کد تخفیف</Label>
              <Input id="code" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="مثلا SAVE10" required disabled={isSubmitting} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="formType">نوع</Label>
                <Select value={formType} onValueChange={(v) => setFormType(v as DiscountType)} disabled={isSubmitting}>
                  <SelectTrigger id="formType"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(discountTypeDisplayMap).map(([apiKey, displayValue]) => (
                      <SelectItem key={apiKey} value={apiDiscountTypeToForm[apiKey as ApiDiscountType]}>{displayValue}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="value">مقدار</Label>
                <Input id="value" type="number" value={value} onChange={(e) => setValue(e.target.value)} placeholder={formType === "Percentage" ? "10" : "50000"} step={formType === "Percentage" ? "1" : "1000"} required disabled={isSubmitting} />
              </div>
            </div>
            <div>
              <Label htmlFor="dateRange">بازه تاریخی</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button id="dateRange" variant="outline" className="w-full justify-start text-right font-normal" disabled={isSubmitting}>
                     {dateRange?.from && isValid(dateRange.from) ? (
                      dateRange.to && isValid(dateRange.to) ? (
                        <>
                          {format(dateRange.from, "PPP", { locale: faIR })} - {format(dateRange.to, "PPP", { locale: faIR })}
                        </>
                      ) : (
                        format(dateRange.from, "PPP", { locale: faIR })
                      )
                    ) : (
                      <span>انتخاب بازه تاریخی</span>
                    )}
                    <CalendarIcon className="me-auto h-4 w-4" /> 
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="range" selected={dateRange} onSelect={setDateRange} numberOfMonths={2} disabled={isSubmitting} locale={faIR} dir="rtl" />
                </PopoverContent>
              </Popover>
            </div>
             <div>
              <Label htmlFor="usageLimit">محدودیت استفاده (اختیاری)</Label>
              <Input id="usageLimit" type="number" value={usageLimit} onChange={(e) => setUsageLimit(e.target.value)} placeholder="مثلا ۱۰۰ (خالی برای نامحدود)" disabled={isSubmitting} />
            </div>
            <div className="flex items-center space-x-2 space-x-reverse">
              <Switch id="formIsActive" checked={formIsActive} onCheckedChange={setFormIsActive} disabled={isSubmitting} />
              <Label htmlFor="formIsActive">فعال</Label>
            </div>
            <DialogFooter className="sm:justify-start">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="ms-2 h-4 w-4 animate-spin" />}
                {editingDiscount ? "ذخیره تغییرات" : "ایجاد کد"}
              </Button>
              <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)} disabled={isSubmitting}>انصراف</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
