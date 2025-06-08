"use client";

import * as React from "react";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DollarSign,
  ShoppingCart,
  Users,
  Mail,
  TrendingUp,
  PlusCircle,
  Upload,
  Settings,
  Coffee,
  Truck,
  Package,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const recentActivities = [
  { id: 1, user: "Alice Smith", avatar: "AS", action: "placed a new order #12345", time: "5m ago", type: "order" },
  { id: 2, user: "Bob Johnson", avatar: "BJ", action: "subscribed to the newsletter", time: "15m ago", type: "user" },
  { id: 3, user: "Admin", avatar: "AD", action: "updated 'Espresso Blend' menu item", time: "30m ago", type: "menu" },
  { id: 4, user: "Carol White", avatar: "CW", action: "left a 5-star review for 'Cold Brew'", time: "1h ago", type: "review" },
  { id: 5, user: "David Green", avatar: "DG", action: "registered a new account", time: "2h ago", type: "user" },
];

const topItems = [
  { id: 1, name: "Caramel Macchiato", category: "Drinks", sales: 120, revenue: "$720.00" },
  { id: 2, name: "Espresso Edge Mug", category: "Merchandise", sales: 85, revenue: "$1275.00" },
  { id: 3, name: "Croissant", category: "Food", sales: 250, revenue: "$875.00" },
  { id: 4, name: "Whole Bean Coffee (1kg)", category: "Merchandise", sales: 60, revenue: "$1500.00" },
  { id: 5, name: "Iced Latte", category: "Drinks", sales: 150, revenue: "$750.00" },
];

const getIconForActivity = (type: string) => {
  switch (type) {
    case 'order': return <ShoppingCart className="h-4 w-4 text-primary" />;
    case 'user': return <Users className="h-4 w-4 text-blue-500" />;
    case 'menu': return <Coffee className="h-4 w-4 text-yellow-600" />;
    case 'review': return <TrendingUp className="h-4 w-4 text-green-500" />;
    default: return <Package className="h-4 w-4 text-gray-500" />;
  }
};

export default function DashboardPage() {
  return (
    <>
      <PageHeader title="Dashboard Overview" description="Welcome back, Admin! Here's what's happening." />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 mb-6">
        <StatCard title="Total Sales" value="$12,345" icon={DollarSign} change="+5.2% from last month" changeType="positive" />
        <StatCard title="Total Orders" value="867" icon={ShoppingCart} change="+2.1% from last month" changeType="positive" />
        <StatCard title="New Users" value="45" icon={Users} change="-1.5% from last month" changeType="negative" />
        <StatCard title="Subscribers" value="1,204" icon={Mail} change="+100 this week" changeType="positive" />
        <StatCard title="Top Item" value="Caramel Macchiato" icon={TrendingUp} change="120 units sold" />
      </div>

      <div className="mb-6 flex space-x-2">
        <Button variant="default"><PlusCircle className="mr-2 h-4 w-4" /> New Order</Button>
        <Button variant="outline"><Coffee className="mr-2 h-4 w-4" /> Add Menu Item</Button>
        <Button variant="outline"><Package className="mr-2 h-4 w-4" /> Add Product</Button>
        <Button variant="outline"><Settings className="mr-2 h-4 w-4" /> Site Settings</Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest updates and actions across the platform.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              {recentActivities.map((activity) => (
                <li key={activity.id} className="flex items-start space-x-3">
                  <Avatar className="h-10 w-10 border">
                    <AvatarImage src={`https://placehold.co/40x40.png?text=${activity.avatar}`} alt={activity.user} data-ai-hint="user avatar" />
                    <AvatarFallback>{activity.avatar}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="text-sm">
                      <span className="font-medium text-foreground">{activity.user}</span> {activity.action}.
                    </p>
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                  </div>
                  {getIconForActivity(activity.type)}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Selling Items</CardTitle>
            <CardDescription>Most popular items by sales or revenue.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead>Sales</TableHead>
                  <TableHead className="text-right">Revenue</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topItems.slice(0, 5).map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div className="font-medium">{item.name}</div>
                      <div className="text-xs text-muted-foreground">{item.category}</div>
                    </TableCell>
                    <TableCell>{item.sales}</TableCell>
                    <TableCell className="text-right">{item.revenue}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
