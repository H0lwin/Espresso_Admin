
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
import { DataTableActions, type ActionItem } from "@/components/shared/data-table-actions";
import { FileDown, Search, Trash2, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getCookie } from "@/lib/utils";

interface Subscriber {
  id: string | number;
  email: string;
  subscription_date: string; // snake_case from API
  source?: string; // Optional
}

export default function NewsletterPage() {
  const { toast } = useToast();
  const [subscribers, setSubscribers] = React.useState<Subscriber[]>([]);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [isLoadingData, setIsLoadingData] = React.useState(true);
  const [isExporting, setIsExporting] = React.useState(false);

  React.useEffect(() => {
    const fetchSubscribers = async () => {
      setIsLoadingData(true);
      let url = "/api/v1/newsletter-subscribers/"; // Replace with your actual endpoint
      if (searchTerm) {
        url += `?search=${encodeURIComponent(searchTerm)}`;
      }
      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error("خطا در دریافت لیست مشترکین");
        }
        const data = await response.json();
        setSubscribers(data.results || []); // Assuming DRF pagination
      } catch (error) {
        toast({
          title: "خطا",
          description: "امکان بارگذاری لیست مشترکین خبرنامه وجود ندارد.",
          variant: "destructive",
        });
        setSubscribers([]);
      } finally {
        setIsLoadingData(false);
      }
    };
    fetchSubscribers();
  }, [searchTerm, toast]);


  const handleExportCsv = async () => {
    setIsExporting(true);
    try {
      const response = await fetch("/api/v1/newsletter-subscribers/export-csv/"); // Replace with your actual export endpoint
      if (!response.ok) {
        throw new Error("خطا در خروجی گرفتن از اطلاعات");
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "newsletter_subscribers.csv";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      toast({title: "موفق", description: "خروجی CSV با موفقیت دانلود شد."});
    } catch (error) {
      toast({
        title: "خطا در خروجی CSV",
        description: "امکان تولید فایل CSV وجود نداشت. لطفا دوباره تلاش کنید.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };
  
  const handleDeleteSubscriber = async (subscriberId: string | number) => {
     if (!window.confirm("آیا از حذف این مشترک مطمئن هستید؟")) return;

     const originalSubscribers = [...subscribers];
     setSubscribers(prev => prev.filter(s => s.id !== subscriberId));

     try {
        const csrfToken = getCookie("csrftoken");
        const response = await fetch(`/api/v1/newsletter-subscribers/${subscriberId}/`, { // Replace with your actual endpoint
            method: 'DELETE',
            headers: {
             ...(csrfToken && { "X-CSRFToken": csrfToken }),
            },
        });
        if (!response.ok) {
            throw new Error("Failed to delete subscriber");
        }
        toast({title: "مشترک حذف شد"});
     } catch (error) {
        setSubscribers(originalSubscribers);
        toast({
            title: "خطا در حذف",
            description: "امکان حذف مشترک وجود نداشت.",
            variant: "destructive",
        });
     }
  };

  const getRowActions = (subscriber: Subscriber): ActionItem[] => [
    { label: "حذف مشترک", icon: Trash2, onClick: () => handleDeleteSubscriber(subscriber.id), isDestructive: true },
  ];

  return (
    <>
      <PageHeader
        title="مشترکین خبرنامه"
        description="لیست مشترکین خبرنامه خود را مدیریت و صادر کنید."
        actions={
          <Button onClick={handleExportCsv} disabled={isExporting || isLoadingData}>
            {isExporting ? <Loader2 className="ms-2 h-4 w-4 animate-spin" /> : <FileDown className="ms-2 h-4 w-4" />}
            {isExporting ? "در حال تولید..." : "خروجی CSV"}
          </Button>
        }
      />
      <div className="mb-4">
        <div className="relative w-full md:w-[300px]">
          <Search className="absolute right-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="جستجو بر اساس ایمیل..."
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
          <p className="ms-3 text-muted-foreground">در حال بارگذاری مشترکین...</p>
        </div>
      ) : (
      <div className="rounded-lg border shadow-sm overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>آدرس ایمیل</TableHead>
              <TableHead>تاریخ اشتراک</TableHead>
              <TableHead>منبع</TableHead>
              <TableHead className="text-left">عملیات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {subscribers.length === 0 && !isLoadingData && (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                  هیچ مشترکی یافت نشد.
                </TableCell>
              </TableRow>
            )}
            {subscribers.map((subscriber) => (
              <TableRow key={subscriber.id}>
                <TableCell className="font-medium">{subscriber.email}</TableCell>
                <TableCell>{new Date(subscriber.subscription_date).toLocaleDateString('fa-IR')}</TableCell>
                <TableCell>{subscriber.source || "-"}</TableCell>
                <TableCell className="text-left">
                  <DataTableActions actions={getRowActions(subscriber)} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      )}
    </>
  );
}
