
"use client";

import * as React from "react";
// import type { Metadata } from 'next'; // Removed
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
import { FileDown, Search, Trash2 } from "lucide-react";

// Removed metadata export:
// export const metadata: Metadata = {
//   title: 'مشترکین خبرنامه - پنل مدیریت اسپرسو اِج',
// };

interface Subscriber {
  id: string;
  email: string;
  subscriptionDate: string;
  source: string;
}

const mockSubscribers: Subscriber[] = [
  { id: "sub001", email: "subscriber1@example.com", subscriptionDate: "2023-09-15", source: "فوتر وب‌سایت" },
  { id: "sub002", email: "coffee.lover@example.net", subscriptionDate: "2023-10-01", source: "انتخاب در پرداخت" },
  { id: "sub003", email: "testuser@example.org", subscriptionDate: "2023-08-20", source: "فرم پاپ‌آپ" },
  { id: "sub004", email: "another.email@example.com", subscriptionDate: "2023-10-10", source: "فوتر وب‌سایت" },
  { id: "sub005", email: "earlybird@example.io", subscriptionDate: "2023-07-01", source: "ثبت‌نام رویداد" },
];

export default function NewsletterPage() {
  const [subscribers, setSubscribers] = React.useState<Subscriber[]>(mockSubscribers);
  const [searchTerm, setSearchTerm] = React.useState("");

  const filteredSubscribers = subscribers.filter(subscriber =>
    subscriber.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleExportCsv = () => {
    const headers = "شناسه,ایمیل,تاریخ اشتراک,منبع\n";
    const csvContent = filteredSubscribers.map(s =>
      `${s.id},${s.email},${s.subscriptionDate},${s.source}`
    ).join("\n");
    const blob = new Blob(["\uFEFF" + headers + csvContent], { type: 'text/csv;charset=utf-8;' }); 
    const link = document.createElement("a");
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", "newsletter_subscribers.csv");
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
    alert("خروجی CSV شروع شد (آزمایشی).");
  };
  
  const handleDeleteSubscriber = (subscriberId: string) => {
     if (window.confirm("آیا از حذف این مشترک مطمئن هستید؟")) {
      setSubscribers(prev => prev.filter(s => s.id !== subscriberId));
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
          <Button onClick={handleExportCsv}>
            <FileDown className="ms-2 h-4 w-4" /> خروجی CSV
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
          />
        </div>
      </div>

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
            {filteredSubscribers.map((subscriber) => (
              <TableRow key={subscriber.id}>
                <TableCell className="font-medium">{subscriber.email}</TableCell>
                <TableCell>{new Date(subscriber.subscriptionDate).toLocaleDateString('fa-IR')}</TableCell>
                <TableCell>{subscriber.source}</TableCell>
                <TableCell className="text-left">
                  <DataTableActions actions={getRowActions(subscriber)} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {filteredSubscribers.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
            هیچ مشترکی یافت نشد.
        </div>
      )}
    </>
  );
}
