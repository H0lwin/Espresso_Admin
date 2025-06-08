
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

const recentActivities = [
  { id: 1, user: "آلیس اسمیت", avatar: "آا", action: "سفارش جدید #۱۲۳۴۵ را ثبت کرد", time: "۵ دقیقه پیش", type: "order" },
  { id: 2, user: "باب جانسون", avatar: "ب‌ج", action: "در خبرنامه مشترک شد", time: "۱۵ دقیقه پیش", type: "user" },
  { id: 3, user: "ادمین", avatar: "اد", action: "آیتم منوی 'اسپرسو بلند' را به‌روزرسانی کرد", time: "۳۰ دقیقه پیش", type: "menu" },
  { id: 4, user: "کارول وایت", avatar: "ک‌و", action: "یک نقد ۵ ستاره برای 'کلد برو' ثبت کرد", time: "۱ ساعت پیش", type: "review" },
  { id: 5, user: "دیوید گرین", avatar: "دگ", action: "حساب کاربری جدیدی ایجاد کرد", time: "۲ ساعت پیش", type: "user" },
];

const topItems = [
  { id: 1, name: "کارامل ماکیاتو", category: "نوشیدنی‌ها", sales: 120, revenue: "۷۲۰٬۰۰۰ تومان" },
  { id: 2, name: "ماگ اسپرسو اج", category: "کالاها", sales: 85, revenue: "۱٬۲۷۵٬۰۰۰ تومان" },
  { id: 3, name: "کروسان", category: "خوراکی", sales: 250, revenue: "۸۷۵٬۰۰۰ تومان" },
  { id: 4, name: "دانه قهوه (۱ کیلوگرم)", category: "کالاها", sales: 60, revenue: "۱٬۵۰۰٬۰۰۰ تومان" },
  { id: 5, name: "آیس لاته", category: "نوشیدنی‌ها", sales: 150, revenue: "۷۵۰٬۰۰۰ تومان" },
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
      <PageHeader title="نمای کلی داشبورد" description="خوش آمدید ادمین! آخرین وضعیت به شرح زیر است." />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 mb-6">
        <StatCard title="کل فروش" value="۱۲٬۳۴۵٬۰۰۰ تومان" icon={DollarSign} change="۵.۲٪+ از ماه گذشته" changeType="positive" />
        <StatCard title="کل سفارشات" value="۸۶۷" icon={ShoppingCart} change="۲.۱٪+ از ماه گذشته" changeType="positive" />
        <StatCard title="کاربران جدید" value="۴۵" icon={Users} change="۱.۵٪- از ماه گذشته" changeType="negative" />
        <StatCard title="مشترکین" value="۱٬۲۰۴" icon={Mail} change="۱۰۰+ در این هفته" changeType="positive" />
        <StatCard title="آیتم برتر" value="کارامل ماکیاتو" icon={TrendingUp} change="فروش ۱۲۰ واحد" />
      </div>

      <div className="mb-6 flex space-x-2 flex-wrap gap-2">
        <Button variant="default"><PlusCircle className="ms-2 h-4 w-4" /> سفارش جدید</Button>
        <Button variant="outline"><Coffee className="ms-2 h-4 w-4" /> افزودن آیتم منو</Button>
        <Button variant="outline"><Package className="ms-2 h-4 w-4" /> افزودن محصول</Button>
        <Button variant="outline"><Settings className="ms-2 h-4 w-4" /> تنظیمات سایت</Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>فعالیت‌های اخیر</CardTitle>
            <CardDescription>آخرین به‌روزرسانی‌ها و اقدامات در سراسر پلتفرم.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              {recentActivities.map((activity) => (
                <li key={activity.id} className="flex items-start space-x-reverse space-x-3">
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
            <CardTitle>آیتم‌های پرفروش</CardTitle>
            <CardDescription>محبوب‌ترین آیتم‌ها بر اساس فروش یا درآمد.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>آیتم</TableHead>
                  <TableHead>فروش</TableHead>
                  <TableHead className="text-left">درآمد</TableHead>
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
                    <TableCell className="text-left">{item.revenue}</TableCell>
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
