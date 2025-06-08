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
import { FileDown, Search, Trash2 } from "lucide-react";

interface Subscriber {
  id: string;
  email: string;
  subscriptionDate: string;
  source: string; // e.g., 'Website Footer', 'Checkout Opt-in'
}

const mockSubscribers: Subscriber[] = [
  { id: "sub001", email: "subscriber1@example.com", subscriptionDate: "2023-09-15", source: "Website Footer" },
  { id: "sub002", email: "coffee.lover@example.net", subscriptionDate: "2023-10-01", source: "Checkout Opt-in" },
  { id: "sub003", email: "testuser@example.org", subscriptionDate: "2023-08-20", source: "Popup Form" },
  { id: "sub004", email: "another.email@example.com", subscriptionDate: "2023-10-10", source: "Website Footer" },
  { id: "sub005", email: "earlybird@example.io", subscriptionDate: "2023-07-01", source: "Event Signup" },
];

export default function NewsletterPage() {
  const [subscribers, setSubscribers] = React.useState<Subscriber[]>(mockSubscribers);
  const [searchTerm, setSearchTerm] = React.useState("");

  const filteredSubscribers = subscribers.filter(subscriber =>
    subscriber.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleExportCsv = () => {
    // Mock CSV export
    const headers = "ID,Email,Subscription Date,Source\n";
    const csvContent = filteredSubscribers.map(s =>
      `${s.id},${s.email},${s.subscriptionDate},${s.source}`
    ).join("\n");
    const blob = new Blob([headers + csvContent], { type: 'text/csv;charset=utf-8;' });
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
    alert("CSV export initiated (mock).");
  };
  
  const handleDeleteSubscriber = (subscriberId: string) => {
     if (window.confirm("Are you sure you want to remove this subscriber?")) {
      setSubscribers(prev => prev.filter(s => s.id !== subscriberId));
    }
  };

  const getRowActions = (subscriber: Subscriber): ActionItem[] => [
    { label: "Remove Subscriber", icon: Trash2, onClick: () => handleDeleteSubscriber(subscriber.id), isDestructive: true },
  ];


  return (
    <>
      <PageHeader
        title="Newsletter Subscribers"
        description="Manage and export your newsletter subscriber list."
        actions={
          <Button onClick={handleExportCsv}>
            <FileDown className="mr-2 h-4 w-4" /> Export CSV
          </Button>
        }
      />
      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search by email..."
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
              <TableHead>Email Address</TableHead>
              <TableHead>Subscription Date</TableHead>
              <TableHead>Source</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredSubscribers.map((subscriber) => (
              <TableRow key={subscriber.id}>
                <TableCell className="font-medium">{subscriber.email}</TableCell>
                <TableCell>{new Date(subscriber.subscriptionDate).toLocaleDateString()}</TableCell>
                <TableCell>{subscriber.source}</TableCell>
                <TableCell className="text-right">
                  <DataTableActions actions={getRowActions(subscriber)} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {filteredSubscribers.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
            No subscribers found.
        </div>
      )}
    </>
  );
}
